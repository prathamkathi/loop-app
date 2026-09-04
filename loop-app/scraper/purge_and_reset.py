import os
import re
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader

load_dotenv()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

# Configure Firebase
cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "./serviceAccountKey.json")
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()

def extract_cloudinary_public_id(url: str):
    """Extracts the public_id from a Cloudinary secure_url."""
    if not url or "cloudinary.com" not in url:
        return None
    match = re.search(r'/upload/(?:v\d+/)?([^/.]+/[^/.]+)\.', url)
    if match:
        return match.group(1)
    match2 = re.search(r'(loop_events/[^/.]+)', url)
    if match2:
        return match2.group(1)
    return None

def purge_all():
    print("=== STARTING CLOUDINARY & FIRESTORE DATABASE PURGE ===")
    events = list(db.collection('events').stream())
    print(f"Found {len(events)} events in Firestore.")

    cloudinary_destroyed = 0
    for doc in events:
        data = doc.to_dict()
        img_url = data.get("image")
        pub_id = extract_cloudinary_public_id(img_url)
        if pub_id:
            try:
                res = cloudinary.uploader.destroy(pub_id)
                print(f"[Cloudinary] Destroyed asset '{pub_id}': {res.get('result')}")
                cloudinary_destroyed += 1
            except Exception as e:
                print(f"[Cloudinary Warning] Could not destroy '{pub_id}': {e}")
        
        # Delete document from Firestore
        doc.reference.delete()
        print(f"[Firestore] Deleted event document '{doc.id}'")

    print(f"\n[Summary] Purged {len(events)} Firestore documents and {cloudinary_destroyed} Cloudinary assets.")
    remaining = list(db.collection('events').stream())
    print(f"[Verification] Firestore 'events' count is now: {len(remaining)}")

if __name__ == "__main__":
    purge_all()
