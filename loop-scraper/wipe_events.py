import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("serviceAccountKey.json")
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()

docs = db.collection('events').stream()
deleted = 0
for doc in docs:
    doc.reference.delete()
    deleted += 1

print(f"Wiped {deleted} events from the database!")
