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
from shared import db, parse_with_gemini, upload_image_to_cloudinary
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

# --- 1. FIREBASE INITIALIZATION ---
if not firebase_admin._apps:
    try:
        cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred)
        print("[System] Firebase initialized successfully.")
    except Exception as e:
        print(f"[Error] Failed to initialize Firebase: {e}")
        exit(1)




# --- 3. GEMINI VISION EXTRACTION WITH CONTACTS & REORGANIZED TAXONOMY ---

        # Mandated delay between Gemini calls
        print("[Gemini] Request successful. Waiting 15s batch interval...")
        time.sleep(15)

        content_text = result_json['candidates'][0]['content']['parts'][0]['text']
        return json.loads(content_text)
    except Exception as e:
        print(f"[Gemini Error] Parsing failed: {e}")
        return None

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
            with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as temp_img:
                img_res = requests.get(display_url, timeout=30)
                img_res.raise_for_status()
                temp_img.write(img_res.content)
                temp_img_path = temp_img.name
        except Exception as dl_err:
            print(f"[Error] Failed to download image from {display_url}: {dl_err}")
            if temp_img_path and os.path.exists(temp_img_path):
                os.remove(temp_img_path)
            continue

        # 1. Parse with Gemini Vision
        print(f"[Gemini] Analyzing poster from @{handle}...")
        parsed_data = parse_with_gemini([temp_img_path], caption)

        if not parsed_data:
            print("[Error] Gemini parsing failed, skipping.")
            if temp_img_path and os.path.exists(temp_img_path):
                os.remove(temp_img_path)
            continue

        # 2. Strict Validation Engine
        title = (parsed_data.get("title") or "").strip()
        date = (parsed_data.get("date") or "").strip()
        time_str = (parsed_data.get("startTime") or "TBA").strip()
        venue = (parsed_data.get("venue") or "").strip()
        category = (parsed_data.get("category") or "Cultural & Arts").strip()
        confidence = parsed_data.get("confidenceScore", 0)

        invalid_markers = ["not specified", "none", "null", "tbd", "tba", "unknown", "n/a", ""]
        if not title or title.lower() in invalid_markers:
            print(f"[Validation Skip] Post {ig_post_id} rejected: Invalid title ('{title}').")
            if temp_img_path and os.path.exists(temp_img_path):
                os.remove(temp_img_path)
            continue

        if not date or date.lower() in invalid_markers or len(date) < 3:
            print(f"[Validation Skip] Post {ig_post_id} rejected: Invalid date ('{date}').")
            if temp_img_path and os.path.exists(temp_img_path):
                os.remove(temp_img_path)
            continue

        if not venue or venue.lower() in invalid_markers:
            print(f"[Validation Skip] Post {ig_post_id} rejected: Invalid venue ('{venue}').")
            if temp_img_path and os.path.exists(temp_img_path):
                os.remove(temp_img_path)
            continue

        if confidence < 40:
            print(f"[Validation Skip] Post {ig_post_id} rejected: Low confidence ({confidence}%).")
            if temp_img_path and os.path.exists(temp_img_path):
                os.remove(temp_img_path)
            continue

        # Sanitize WhatsApp contacts
        clean_contacts = []
        for c in parsed_data.get("contacts", []):
            c_name = (c.get("name") or "").strip()
            raw_phone = re.sub(r'[^\d]', '', c.get("phone") or "")
            role = (c.get("role") or "Coordinator").strip()
            if raw_phone and len(raw_phone) >= 10:
                clean_phone = raw_phone[-10:]  # Standard 10-digit
                clean_contacts.append({
                    "name": c_name or "Organizer",
                    "phone": clean_phone,
                    "role": role
                })

        # Calculate Aspect Ratio
        w = item.get("dimensionsWidth")
        h = item.get("dimensionsHeight")
        aspect_ratio = round(w / h, 2) if (w and h) else 1.0

        # 3. Upload the validated poster to Cloudinary
        print("[Storage] Uploading validated primary cover image to Cloudinary...")
        try:
            public_url = upload_image_to_cloudinary(temp_img_path)
        except Exception as cloud_err:
            print(f"[Error] Failed to upload image to Cloudinary: {cloud_err}")
            if temp_img_path and os.path.exists(temp_img_path):
                os.remove(temp_img_path)
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
                "status": "pending",  # Enforced staging queue
                "host": f"@{handle}",
                "hostAvatar": get_avatar_for_handle(handle),
                "aspect": "tall" if aspect_ratio < 0.9 else "wide" if aspect_ratio > 1.2 else "square",
                "aspectRatio": aspect_ratio,
                "contacts": clean_contacts,
                "createdAt": firestore.SERVER_TIMESTAMP,
            }
            # Parse date + time into a sortable timestamp (Phase 2: startsAt)
            try:
                # Try common formats: "21 Apr", "16 August", "2026-04-21"
                year = datetime.now().year
                date_with_year = f"{date} {year}" if str(year) not in date else date
                for fmt in ["%d %b %Y", "%d %B %Y", "%Y-%m-%d"]:
                    try:
                        dt = datetime.strptime(date_with_year, fmt)
                        # If parsed month is behind current month, assume next year
                        if dt.month < datetime.now().month:
                            dt = dt.replace(year=year + 1)
                        event_doc["startsAt"] = dt
                        break
                    except ValueError:
                        continue
            except Exception:
                pass  # startsAt stays absent — backfill script will fix
            doc_ref.set(event_doc)
            print(f"[Success] Queued event '{title}' with {len(clean_contacts)} WhatsApp contact(s)!")
            events_queued += 1
        except Exception as fs_err:
            print(f"[Error] Failed to write to Firestore: {fs_err}")

        # Clean up local temporary file
        if temp_img_path and os.path.exists(temp_img_path):
            os.remove(temp_img_path)

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
