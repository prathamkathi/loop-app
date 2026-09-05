import os
import re
import time
import argparse
from datetime import datetime
import random
import json
import base64
import requests
import uuid
import tempfile
from dotenv import load_dotenv
from apify_client import ApifyClient
from shared import db, parse_with_gemini, upload_image_to_cloudinary, get_image_aspect_ratio
from firebase_admin import credentials, firestore
import cloudinary
import cloudinary.uploader

# Load environment variables
load_dotenv()

APIFY_TOKEN = os.getenv("APIFY_TOKEN")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "./serviceAccountKey.json")

def load_target_handles() -> list:
    """Read handles dynamically from docs/insta_ids.md (F-44)"""
    file_path = os.path.join(os.path.dirname(__file__), '..', 'docs', 'insta_ids.md')
    handles = []
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                match = re.search(r'`@([a-zA-Z0-9_.]+)`', line)
                if match:
                    handles.append(match.group(1))
    else:
        print(f"[Warning] Could not find {file_path}, falling back to defaults.")
        handles = ["brcaiitd", "debsoc_iitd"]
    return handles

# Constants
MAX_EVENTS = 50
MAX_POSTS_PER_HANDLE = 2
POSTS_TIMEFRAME_DAYS = 14 # Look back 14 days maximum

FILLER = {
    "", "not specified", "not available", "none", "null", "tbd", "tba",
    "unknown", "n/a", "not provided", "tbc", "ongoing"
}

ALLOWED_CATEGORIES = {
    "Cultural & Arts",
    "Tech & Innovation",
    "Fests & Major Events",
    "Competitions & Quizzes",
    "Talks & Workshops",
    "Sports & Fitness",
    "Social & Wellness",
    "Campus Notices"
}

def _usable(v) -> bool:
    return bool(v) and str(v).strip().lower() not in FILLER

# Load harvested Cloudinary avatars
AVATARS_MAP = {}
avatars_file = os.path.join(os.path.dirname(__file__), "avatars_map.json")
if os.path.exists(avatars_file):
    try:
        with open(avatars_file, "r") as f:
            AVATARS_MAP = json.load(f)
        print(f"[Avatars] Loaded {len(AVATARS_MAP)} authentic Cloudinary avatars.")
    except Exception as e:
        print(f"[Avatars Warning] Could not load avatars_map.json: {e}")

def get_avatar_for_handle(handle: str) -> str:
    clean = handle.replace("@", "").lower().strip()
    return AVATARS_MAP.get(
        clean,
        "https://res.cloudinary.com/dnse1yvqq/image/upload/v1788420220/loop_avatars/avatar_iitdelhi.jpg"
    )

# Firebase and Cloudinary are initialised once in shared.py, which exports the
# Firestore client used below.
if db is None:
    print("[Error] Firestore is unavailable — check FIREBASE_CREDENTIALS_PATH.")
    exit(1)




# --- 4. APIFY SCRAPING & STAGING QUEUE INGESTION ---
def run_apify_pipeline(dry_run: bool = False, max_events: int = MAX_EVENTS):
    """Runs Apify Instagram Scraper and ingests validated events with deterministic completeness gate into Firestore."""
    if not APIFY_TOKEN:
        print("[Error] APIFY_TOKEN is missing. Set APIFY_TOKEN in loop-scraper/.env.")
        return

    pipeline_status = "healthy"
    error_message = None
    events_queued = 0
    posts_to_process = []

    try:
        target_handles = load_target_handles()
        print(f"[Apify] Initializing ApifyClient for {len(target_handles)} curated handles...")
        apify_client = ApifyClient(APIFY_TOKEN)

        run_input = {
            "usernames": target_handles,
            "resultsLimit": 2,  # 2 newest posts per relevant profile
        }

        print(f"[Apify] Triggering actor 'apify/instagram-profile-scraper'...")
        try:
            run = apify_client.actor("apify/instagram-profile-scraper").call(run_input=run_input)
        except Exception as e:
            print(f"[Apify Error] Actor run failed: {e}")
            raise

        dataset_id = getattr(run, "default_dataset_id", None) or (run.get("defaultDatasetId") if isinstance(run, dict) else None)
        print(f"[Apify] Actor finished successfully. Processing dataset '{dataset_id}'...")
        raw_items = apify_client.dataset(dataset_id).iterate_items()

        for item in raw_items:
            if "latestPosts" in item and isinstance(item["latestPosts"], list):
                profile_handle = item.get("username") or "campus_club"
                for post in item["latestPosts"]:
                    if not post.get("ownerUsername"):
                        post["ownerUsername"] = profile_handle
                    posts_to_process.append(post)
            else:
                posts_to_process.append(item)

        print(f"[Apify] Extracted {len(posts_to_process)} target posts from dataset.")

        handle_counts = {}
        now_ts = datetime.now().timestamp()
        cutoff_ts = now_ts - (POSTS_TIMEFRAME_DAYS * 86400)

        for item in posts_to_process:
            if events_queued >= max_events:
                print(f"[Pipeline] Reached quota ({max_events}). Stopping.")
                break

            ig_post_id = str(item.get("id") or item.get("shortCode") or uuid.uuid4().hex[:10])
            handle = item.get("ownerUsername") or item.get("username") or "campus_club"
            caption = item.get("caption") or item.get("text") or ""
            display_url = item.get("displayUrl") or item.get("imageUrl") or item.get("url")

            # T2.3 (D-4): Enforce MAX_POSTS_PER_HANDLE
            handle_lower = handle.lower().strip()
            if handle_counts.get(handle_lower, 0) >= MAX_POSTS_PER_HANDLE:
                print(f"[Handle Skip] Reached max posts ({MAX_POSTS_PER_HANDLE}) for @{handle}.")
                continue

            # T2.3 (D-4): Enforce POSTS_TIMEFRAME_DAYS
            post_timestamp = None
            if item.get("timestamp"):
                try:
                    ts_str = str(item["timestamp"]).replace("Z", "+00:00")
                    post_timestamp = datetime.fromisoformat(ts_str).timestamp()
                except Exception:
                    pass
            elif item.get("takenAtTimestamp"):
                try:
                    post_timestamp = float(item["takenAtTimestamp"])
                except Exception:
                    pass

            if post_timestamp and post_timestamp < cutoff_ts:
                age_days = (now_ts - post_timestamp) / 86400
                print(f"[Timeframe Skip] Post {ig_post_id} is {age_days:.1f} days old (> {POSTS_TIMEFRAME_DAYS} days cutoff).")
                continue

            if item.get("isVideo") and not display_url:
                continue

            if not display_url:
                continue

            doc_id = f"ig_{ig_post_id}"
            doc_ref = db.collection('events').document(doc_id)

            # Deduplication check
            if doc_ref.get().exists:
                print(f"[Skip] Post {ig_post_id} already exists in Firestore.")
                continue

            print(f"\n[Process] Ingesting new post {ig_post_id} from @{handle}...")

            # Download primary poster to a temporary file
            temp_img_path = None
            try:
                try:
                    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as temp_img:
                        img_res = requests.get(display_url, timeout=30)
                        img_res.raise_for_status()
                        temp_img.write(img_res.content)
                        temp_img_path = temp_img.name
                except Exception as dl_err:
                    print(f"[Error] Failed to download image from {display_url}: {dl_err}")
                    continue

                # 1. Parse with Gemini Vision
                print(f"[Gemini] Analyzing poster from @{handle}...")
                parsed_data = parse_with_gemini([temp_img_path], caption)

                if not parsed_data:
                    print("[Error] Gemini parsing failed, skipping.")
                    continue

                # 2. Strict Validation Engine & Completeness Gate (T2.2)
                title = (parsed_data.get("title") or "").strip()
                date = (parsed_data.get("date") or "").strip()
                time_str = (parsed_data.get("startTime") or "").strip()
                venue = (parsed_data.get("venue") or "").strip()
                category = (parsed_data.get("category") or "").strip()
                confidence = parsed_data.get("confidenceScore", 0)
                is_event = parsed_data.get("isEvent") is True
                post_kind = parsed_data.get("postKind") or ("event" if is_event else "other")

                if not _usable(title) or len(title.strip()) < 3:
                    print(f"[Validation Skip] Post {ig_post_id} rejected: Unusable title ('{title}').")
                    continue

                # Parse date into starts_at timestamp
                starts_at = None
                if _usable(date):
                    try:
                        now = datetime.now()
                        year = now.year
                        date_with_year = f"{date} {year}" if str(year) not in date else date
                        for fmt in ["%d %b %Y", "%d %B %Y", "%Y-%m-%d"]:
                            try:
                                dt = datetime.strptime(date_with_year, fmt)
                                if now.month in [11, 12] and dt.month in [1, 2]:
                                    dt = dt.replace(year=year + 1)
                                starts_at = dt
                                break
                            except ValueError:
                                continue
                    except Exception:
                        starts_at = None

                # Deterministic Completeness Gate (T2.2)
                is_complete = (
                    is_event is True
                    and _usable(title) and len(title.strip()) > 3
                    and _usable(time_str)
                    and _usable(venue)
                    and category in ALLOWED_CATEGORIES
                    and starts_at is not None
                )
                status = "approved" if is_complete else "pending"
                print(f"[Gate] Post {ig_post_id} ('{title}') -> status: '{status}' (is_complete={is_complete}, isEvent={is_event}, category='{category}', starts_at={starts_at})")

                # F-52: Secondary deduplication by (host, title) to prevent multiple posts of the same event
                existing_matches = db.collection('events').where('host', '==', f"@{handle}").where('title', '==', title).limit(1).get()
                if existing_matches:
                    print(f"[Dedupe Skip] Event '{title}' from @{handle} already exists in Firestore.")
                    continue

                # Sanitize WhatsApp contacts
                clean_contacts = []
                for c in parsed_data.get("contacts", []):
                    c_name = (c.get("name") or "").strip()
                    c_phone = (c.get("phone") or "").strip()
                    c_role = (c.get("role") or "").strip()
                    if c_name and c_phone:
                        clean_contacts.append({
                            "name": c_name,
                            "phone": c_phone,
                            "role": c_role
                        })

                # 3. Cloudinary Upload (Optimized Cover Image)
                aspect_ratio = get_image_aspect_ratio(temp_img_path)
                if dry_run:
                    public_url = "https://res.cloudinary.com/dummy/image/upload/sample.jpg"
                    print(f"[Dry Run] Skipped Cloudinary upload. Aspect ratio: {aspect_ratio}")
                else:
                    print(f"[Storage] Uploading validated primary cover image to Cloudinary...")
                    try:
                        public_url = upload_image_to_cloudinary(temp_img_path)
                    except Exception as upload_err:
                        print(f"[Validation Skip] Post {ig_post_id} rejected: poster upload failed: {upload_err}")
                        continue

                # T2.4 (U10): Use Gemini summary for blurb, not raw IG caption
                blurb = (parsed_data.get("summary") or "").strip()
                if not _usable(blurb):
                    blurb = f"{title} organized by @{handle}."

                # 4. Write to Firestore
                print(f"[Firestore] Ingesting event '{title}' into Firestore with status '{status}'...")
                try:
                    event_doc = {
                        "igPostId": ig_post_id,
                        "title": title,
                        "date": date if _usable(date) else "Date not announced",
                        "time": time_str if _usable(time_str) else "Time not announced",
                        "venue": venue if _usable(venue) else "Venue not announced",
                        "blurb": blurb,
                        "image": public_url,
                        "category": category if category in ALLOWED_CATEGORIES else "Campus Notices",
                        "confidence": confidence / 100 if isinstance(confidence, (int, float)) else 0.5,
                        "status": status,
                        "postKind": post_kind,
                        "isEvent": is_event,
                        "host": f"@{handle}",
                        "hostAvatar": get_avatar_for_handle(handle),
                        "aspect": "tall" if aspect_ratio < 0.9 else "wide" if aspect_ratio > 1.2 else "square",
                        "aspectRatio": aspect_ratio,
                        "contacts": clean_contacts,
                        "createdAt": firestore.SERVER_TIMESTAMP,
                    }
                    if starts_at is not None:
                        event_doc["startsAt"] = starts_at

                    if dry_run:
                        print(f"[Dry Run] Would write event '{title}' ({doc_id}) to Firestore:")
                        print(f"         status={event_doc.get('status')}, category={event_doc.get('category')}, startsAt={event_doc.get('startsAt')}")
                    else:
                        doc_ref.set(event_doc)
                        print(f"[Success] Saved event '{title}' with status '{status}' and {len(clean_contacts)} WhatsApp contact(s)!")
                    events_queued += 1
                    handle_counts[handle_lower] = handle_counts.get(handle_lower, 0) + 1
                except Exception as fs_err:
                    print(f"[Error] Failed to write to Firestore: {fs_err}")
            finally:
                # Clean up local temporary file
                if temp_img_path and os.path.exists(temp_img_path):
                    try:
                        os.remove(temp_img_path)
                    except Exception:
                        pass

        print(f"\n[Done] Processed posts, queued/published {events_queued} events successfully.")
        print("=" * 60)
    except Exception as pipe_err:
        pipeline_status = "error"
        error_message = str(pipe_err)
        print(f"[Pipeline Error] Scraping pipeline failed: {pipe_err}")
        raise
    finally:
        # T-27: Scraper Health Check in finally block
        if dry_run:
            print(f"[Dry Run] Skipped health heartbeat write ({events_queued} events, status='{pipeline_status}').")
        else:
            try:
                health_ref = db.collection("system").document("scraper_health")
                heartbeat = {
                    "lastRunAt": firestore.SERVER_TIMESTAMP,
                    "eventsFound": len(posts_to_process),
                    "eventsQueued": events_queued,
                    "status": pipeline_status,
                }
                if error_message:
                    heartbeat["lastError"] = error_message
                health_ref.set(heartbeat, merge=True)
                print(f"[System] Wrote health heartbeat to Firestore (status='{pipeline_status}').")
            except Exception as e:
                print(f"[System] Failed to write health heartbeat: {e}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="LOOP Instagram Event Scraper & Staging Pipeline")
    parser.add_argument("--dry-run", action="store_true", help="Parse and print without writing to Firestore or Cloudinary")
    parser.add_argument("--max-events", type=int, default=MAX_EVENTS, help="Maximum events to queue/process")
    args = parser.parse_args()

    print(f"=== LOOP APIFY SCRAPING & STAGING PIPELINE STARTING (dry_run={args.dry_run}) ===")
    run_apify_pipeline(dry_run=args.dry_run, max_events=args.max_events)
