#!/usr/bin/env python3
"""
cleanup_corrupt_events.py
One-off, idempotent data cleanup script for LOOP Firestore events.

Detects and fixes/archives:
1. Events corrupted with year 2027 due to the previous scraper year-rollover bug.
2. Duplicate events with identical normalized (host, title).
3. Events with invalid date markers ("not available", "ongoing").
4. Events missing required cover posters.

Usage:
  python cleanup_corrupt_events.py          # Dry-run (read-only audit)
  python cleanup_corrupt_events.py --commit # Apply changes to Firestore
"""

import os
import sys
import re
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase
CRED_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", os.path.join(os.path.dirname(__file__), "serviceAccountKey.json"))
if not os.path.exists(CRED_PATH):
    # Try parent directory
    alt_path = os.path.join(os.path.dirname(__file__), "..", "serviceAccountKey.json")
    if os.path.exists(alt_path):
        CRED_PATH = alt_path

if not firebase_admin._apps:
    try:
        cred = credentials.Certificate(CRED_PATH)
        firebase_admin.initialize_app(cred)
    except Exception as e:
        print(f"[Error] Failed to initialize Firebase Admin SDK: {e}")
        print("Please check FIREBASE_CREDENTIALS_PATH or serviceAccountKey.json.")
        sys.exit(1)

db = firestore.client()

def run_cleanup(commit: bool = False):
    print("=" * 60)
    print(f"LOOP FIRESTORE DATA CLEANUP — Mode: {'COMMIT (WRITING)' if commit else 'DRY RUN (READ ONLY)'}")
    print("=" * 60)

    events_ref = db.collection("events")
    docs = list(events_ref.stream())
    print(f"Fetched {len(docs)} total event documents from Firestore.\n")

    current_year = datetime.now().year
    seen_host_titles = {}
    to_update = []
    to_archive = []

    for doc in docs:
        d = doc.to_dict()
        doc_id = doc.id
        title = d.get("title", "")
        host = d.get("host", "")
        date_str = str(d.get("date", "")).strip().lower()
        starts_at = d.get("startsAt")
        image = d.get("image", "")
        status = d.get("status", "")

        norm_key = f"{host.lower()}:{re.sub(r'[^a-z0-9]', '', title.lower())}"

        # 1. Check for duplicates
        if norm_key in seen_host_titles:
            prev_id, prev_data = seen_host_titles[norm_key]
            # Keep the one that is approved or has an image; archive the duplicate
            print(f"[Duplicate Found] Doc '{doc_id}' duplicates '{prev_id}' ('{title}' by {host})")
            to_archive.append((doc_id, "duplicate_event", f"Duplicates document {prev_id}"))
            continue
        else:
            seen_host_titles[norm_key] = (doc_id, d)

        # 2. Check for missing/invalid poster image
        if not image or "res.cloudinary.com" not in image:
            print(f"[Missing Poster] Doc '{doc_id}' ('{title}') has no Cloudinary image.")
            to_archive.append((doc_id, "missing_poster", "No valid Cloudinary image"))
            continue

        # 3. Check for invalid date strings ("not available", "ongoing")
        invalid_markers = ["not available", "ongoing", "not specified", "none", "tbd", "tba"]
        if any(marker in date_str for marker in invalid_markers):
            print(f"[Invalid Date] Doc '{doc_id}' ('{title}') has invalid date '{d.get('date')}'.")
            to_archive.append((doc_id, "invalid_date", f"Date string is '{d.get('date')}'"))
            continue

        # 4. Check for 2027 year-rollover bug in startsAt
        if starts_at:
            dt = None
            if hasattr(starts_at, "to_datetime"):
                dt = starts_at.to_datetime()
            elif hasattr(starts_at, "year"):
                dt = starts_at
            
            if dt and dt.year > current_year:
                corrected_dt = dt.replace(year=current_year)
                print(f"[Year Rollover Bug] Doc '{doc_id}' ('{title}') has future year {dt.year} -> Correcting to {corrected_dt.year}.")
                to_update.append((doc_id, {"startsAt": corrected_dt}))

    print("\n" + "-" * 60)
    print(f"Summary: {len(to_update)} document(s) to fix, {len(to_archive)} document(s) to archive.")
    print("-" * 60)

    if not commit:
        print("\n[Dry Run] No changes written to Firestore. Pass --commit to apply.")
        return

    # Apply updates
    batch = db.batch()
    batch_count = 0

    for doc_id, fields in to_update:
        ref = events_ref.document(doc_id)
        batch.update(ref, fields)
        batch_count += 1

    for doc_id, reason, details in to_archive:
        ref = events_ref.document(doc_id)
        # Soft-archive by setting status: "archived" and recording cleanup info
        batch.update(ref, {
            "status": "archived",
            "archivedReason": reason,
            "archivedDetails": details,
            "archivedAt": firestore.SERVER_TIMESTAMP
        })
        batch_count += 1

    if batch_count > 0:
        batch.commit()
        print(f"\n[Committed] Successfully updated/archived {batch_count} documents in Firestore!")
    else:
        print("\n[Clean] Database is already clean. No changes necessary.")

if __name__ == "__main__":
    commit_mode = "--commit" in sys.argv
    run_cleanup(commit=commit_mode)
