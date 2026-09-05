import os
import re
import time
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
MAX_EVENTS = 15 # Cap for safety during staging
MAX_POSTS_PER_HANDLE = 2
POSTS_TIMEFRAME_DAYS = 14 # Look back 14 days maximum

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
def run_apify_pipeline():
    """Runs Apify Instagram Scraper and ingests validated events with status: 'pending' into Staging Queue."""
    if not APIFY_TOKEN:
        print("[Error] APIFY_TOKEN is missing. Set APIFY_TOKEN in loop-scraper/.env.")
        return

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
        return

    dataset_id = getattr(run, "default_dataset_id", None) or (run.get("defaultDatasetId") if isinstance(run, dict) else None)
    print(f"[Apify] Actor finished successfully. Processing dataset '{dataset_id}'...")
    raw_items = apify_client.dataset(dataset_id).iterate_items()

    posts_to_process = []
    for item in raw_items:
        if "latestPosts" in item and isinstance(item["latestPosts"], list):
            profile_handle = item.get("username") or "campus_club"
            for post in item["latestPosts"][:2]:
                if not post.get("ownerUsername"):
                    post["ownerUsername"] = profile_handle
                posts_to_process.append(post)
        else:
            posts_to_process.append(item)

    print(f"[Apify] Extracted {len(posts_to_process)} target posts from dataset.")

    events_queued = 0

    for item in posts_to_process:
        if events_queued >= MAX_EVENTS:
            print(f"[Pipeline] Reached quota ({MAX_EVENTS}). Stopping.")
            break

        ig_post_id = str(item.get("id") or item.get("shortCode") or uuid.uuid4().hex[:10])
        handle = item.get("ownerUsername") or item.get("username") or "campus_club"
        caption = item.get("caption") or item.get("text") or ""
        display_url = item.get("displayUrl") or item.get("imageUrl") or item.get("url")

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

            # 2. Strict Validation Engine
            title = (parsed_data.get("title") or "").strip()
            date = (parsed_data.get("date") or "").strip()
            time_str = (parsed_data.get("startTime") or "TBA").strip()
            venue = (parsed_data.get("venue") or "").strip()
            category = (parsed_data.get("category") or "Cultural & Arts").strip()
            confidence = parsed_data.get("confidenceScore", 0)

            # F-53: Expanded invalid markers to filter out circulars and non-events
            invalid_markers = [
                "not specified", "none", "null", "tbd", "tba", "unknown", "n/a", "",
                "not available", "ongoing", "not provided", "tbc"
            ]
            if not title or title.lower() in invalid_markers:
                print(f"[Validation Skip] Post {ig_post_id} rejected: Invalid title ('{title}').")
                continue

            date_lower = date.lower()
            if not date or date_lower in invalid_markers or any(m in date_lower for m in ["not available", "ongoing", "not specified"]) or len(date) < 3:
                print(f"[Validation Skip] Post {ig_post_id} rejected: Invalid date ('{date}').")
                continue

            if not venue or venue.lower() in invalid_markers:
                print(f"[Validation Skip] Post {ig_post_id} rejected: Invalid venue ('{venue}').")
                continue

            if confidence < 40:
                print(f"[Validation Skip] Post {ig_post_id} rejected: Low confidence ({confidence}%).")
                continue

            # F-52: Secondary deduplication by (host, title) to prevent multiple posts of the same event
            try:
                existing_matches = db.collection('events').where('host', '==', f"@{handle}").where('title', '==', title).limit(1).get()
                if existing_matches:
                    print(f"[Dedupe Skip] Event '{title}' from @{handle} already exists in Firestore.")
                    continue
            except Exception as dedup_err:
                print(f"[Warn] Secondary deduplication check failed: {dedup_err}")

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
            print(f"[Storage] Uploading validated primary cover image to Cloudinary...")
            public_url = upload_image_to_cloudinary(temp_img_path)
            aspect_ratio = get_image_aspect_ratio(temp_img_path)

            if not public_url:
                print(f"[Validation Skip] Post {ig_post_id} rejected: poster upload failed.")
                continue

            # 4. Write to Firestore with status 'pending' (Studio Staging Queue)
            print(f"[Firestore] Queuing event '{title}' into Staging Queue with status 'pending'...")
            try:
                event_doc = {
                    "igPostId": ig_post_id,
                    "title": title,
                    "date": date,
                    "time": time_str,
                    "venue": venue,
                    "blurb": caption or f"{title} organized by @{handle}.",
                    "image": public_url,
                    "category": category,
                    "confidence": confidence / 100,
                    "status": "pending",  # F-59: Queued as pending for coordinator review
                    "host": f"@{handle}",
                    "hostAvatar": get_avatar_for_handle(handle),
                    "aspect": "tall" if aspect_ratio < 0.9 else "wide" if aspect_ratio > 1.2 else "square",
                    "aspectRatio": aspect_ratio,
                    "contacts": clean_contacts,
                    "createdAt": firestore.SERVER_TIMESTAMP,
                }
                # Parse date + time into a sortable timestamp (startsAt)
                try:
                    # Try common formats: "21 Apr", "16 August", "2026-04-21"
                    now = datetime.now()
                    year = now.year
                    date_with_year = f"{date} {year}" if str(year) not in date else date
                    for fmt in ["%d %b %Y", "%d %B %Y", "%Y-%m-%d"]:
                        try:
                            dt = datetime.strptime(date_with_year, fmt)
                            # F-51: Only roll over year if we are in Nov/Dec looking at Jan/Feb
                            if now.month in [11, 12] and dt.month in [1, 2]:
                                dt = dt.replace(year=year + 1)
                            event_doc["startsAt"] = dt
                            break
                        except ValueError:
                            continue
                except Exception:
                    pass  # startsAt stays absent
                doc_ref.set(event_doc)
                print(f"[Success] Queued event '{title}' with {len(clean_contacts)} WhatsApp contact(s)!")
                events_queued += 1
            except Exception as fs_err:
                print(f"[Error] Failed to write to Firestore: {fs_err}")
        finally:
            # Clean up local temporary file
            if temp_img_path and os.path.exists(temp_img_path):
                try:
                    os.remove(temp_img_path)
                except Exception:
                    pass

    print(f"\n[Done] Scraped {len(posts_to_process)} events, queued {events_queued} successfully.")
    print("=" * 60)

    # T-27: Scraper Health Check (Write heartbeat so app knows it's alive)
    try:
        health_ref = db.collection("system").document("scraper_health")
        health_ref.set({
            "lastRunAt": firestore.SERVER_TIMESTAMP,
            "eventsFound": len(posts_to_process),
            "eventsQueued": events_queued,
            "status": "healthy"
        })
        print("[System] Wrote health heartbeat to Firestore.")
    except Exception as e:
        print(f"[System] Failed to write health heartbeat: {e}")


if __name__ == "__main__":
    print("=== LOOP APIFY SCRAPING & STAGING PIPELINE STARTING ===")
    run_apify_pipeline()
