import os
import json
import time
import base64
import requests
import firebase_admin
from firebase_admin import credentials, firestore
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
from PIL import Image

def get_image_aspect_ratio(image_path: str) -> float:
    """Calculate the aspect ratio (width / height) of an image file using Pillow."""
    try:
        with Image.open(image_path) as img:
            w, h = img.size
            if h <= 0:
                return 1.0
            return round(w / h, 2)
    except Exception as e:
        print(f"[Warning] Failed to calculate aspect ratio for {image_path}: {e}")
        return 1.0

load_dotenv()

# Firebase init
FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "./serviceAccountKey.json")

try:
    if not firebase_admin._apps:
        cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred)
    db = firestore.client()
except Exception as e:
    print(f"[Error] Failed to initialize Firebase: {e}")
    db = None

# Cloudinary init
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def upload_image_to_cloudinary(image_path: str) -> str:
    """Upload a poster using signed API credentials and return its secure URL."""
    try:
        response = cloudinary.uploader.upload(
            image_path,
            folder="loop_events",
            resource_type="image",
        )
        url = response.get("secure_url")
        if url:
            return url
        raise RuntimeError("Cloudinary upload did not return a secure_url")
    except Exception as e:
        print(f"[Cloudinary Error] Signed upload failed for {image_path}: {e}")
        raise

def parse_with_gemini(image_paths, caption):
    """Parses poster images and caption using Gemini Vision with structured WhatsApp contact extraction."""
    try:
        prompt_text = (
            "Extract the following event details from the poster image(s) and caption.\n"
            "CRITICAL: If there are organizer/coordinator names and phone numbers on the poster, extract up to 2 of them.\n"
            f"Caption: {caption}"
        )
        parts = [{"text": prompt_text}]

        for path in image_paths:
            with open(path, "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                parts.append({
                    "inline_data": {
                        "mime_type": "image/jpeg",
                        "data": encoded_string
                    }
                })

        payload = {
            "contents": [{"parts": parts}],
            "generationConfig": {
                "temperature": 0.0,
                "responseMimeType": "application/json",
                "responseSchema": {
                    "type": "OBJECT",
                    "properties": {
                        "title": {"type": "STRING"},
                        "date": {"type": "STRING", "description": "Short date, e.g. 21 Apr, 16 August"},
                        "startTime": {"type": "STRING", "description": "e.g. 7:30 PM"},
                        "endTime": {"type": "STRING"},
                        "venue": {"type": "STRING"},
                        "summary": {"type": "STRING"},
                        "category": {
                            "type": "STRING",
                            "enum": [
                                "Cultural & Arts",
                                "Tech & Innovation",
                                "Fests & Major Events",
                                "Competitions & Quizzes",
                                "Talks & Workshops",
                                "Sports & Fitness",
                                "Social & Wellness",
                                "Campus Notices"
                            ]
                        },
                        "contacts": {
                            "type": "ARRAY",
                            "description": "Student coordinators/organizers and phone numbers found on the poster (up to 2)",
                            "items": {
                                "type": "OBJECT",
                                "properties": {
                                    "name": {"type": "STRING", "description": "First name of coordinator, e.g. Aryan, Priya"},
                                    "phone": {"type": "STRING", "description": "10-digit Indian phone number"},
                                    "role": {"type": "STRING", "description": "e.g. Lead Coordinator, Head"}
                                },
                                "required": ["name", "phone"]
                            }
                        },
                        "confidenceScore": {"type": "INTEGER"}
                    },
                    "required": ["title", "date", "startTime", "venue", "category", "confidenceScore"]
                }
            }
        }

        # Prioritize flash-lite models to avoid 429 quota exhaustion on free/dev tiers
        models = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.6-flash", "gemini-2.5-flash-lite"]
        headers = {'Content-Type': 'application/json'}

        result_json = None
        for model in models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
            max_retries = 3
            backoff = 60
            for attempt in range(max_retries):
                try:
                    response = requests.post(url, headers=headers, json=payload, timeout=30)
                    if response.status_code == 429:
                        print(f"[Gemini 429] Rate limited on {model}. Retrying in {backoff}s...")
                        time.sleep(backoff)
                        backoff *= 2
                        continue
                    response.raise_for_status()
                    result_json = response.json()
                    break
                except Exception as req_err:
                    print(f"[Gemini Error] Attempt {attempt+1} on {model} failed: {req_err}")
                    if attempt < max_retries - 1:
                        time.sleep(5)
            if result_json:
                break

        if not result_json:
            print("[Gemini Error] All models and retries exhausted.")
            return None

        # Extract text from response structure
        try:
            candidates = result_json.get("candidates", [])
            if not candidates:
                return None
            content_part = candidates[0].get("content", {}).get("parts", [])[0]
            raw_text = content_part.get("text", "")
            return json.loads(raw_text)
        except json.JSONDecodeError as json_err:
            print(f"[Gemini Error] Failed to parse JSON: {json_err}")
            return None

    except Exception as e:
        print(f"[Gemini Error] Failed to generate content: {e}")
        return None

