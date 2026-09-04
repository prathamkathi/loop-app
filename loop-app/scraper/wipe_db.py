import os
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()
FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "./serviceAccountKey.json")

if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
    firebase_admin.initialize_app(cred)

db = firestore.client()
print(f"[Firebase] Connected to project: {db.project}")

def wipe_events():
    collection_ref = db.collection("events")
    docs = list(collection_ref.stream())
    total_docs = len(docs)
    print(f"[Purge] Found {total_docs} events in Firestore.")

    if total_docs == 0:
        print("[Purge] Database is already clean (0 events).")
        return

    # Delete in batches of up to 400
    batch = db.batch()
    count = 0
    deleted_total = 0

    for doc in docs:
        batch.delete(doc.reference)
        count += 1
        deleted_total += 1
        if count >= 400:
            batch.commit()
            print(f"  Committed batch deletion of {count} documents...")
            batch = db.batch()
            count = 0

    if count > 0:
        batch.commit()
        print(f"  Committed final batch deletion of {count} documents...")

    # Verification read
    remaining = list(collection_ref.stream())
    print(f"\n[Verification] Events remaining in Firestore: {len(remaining)}")
    assert len(remaining) == 0, f"Expected 0 events, but found {len(remaining)}"
    print("[Success] All events deleted. Database is reset to 0.")

wipe_database = wipe_events

if __name__ == "__main__":
    wipe_events()
