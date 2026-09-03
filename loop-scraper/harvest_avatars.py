import os
import json
import time
import requests
import tempfile
from dotenv import load_dotenv
from apify_client import ApifyClient
from shared import upload_image_to_cloudinary
import cloudinary.uploader

def main():
    load_dotenv()
    APIFY_TOKEN = os.getenv("APIFY_TOKEN")
    
    # We will import load_target_handles from scraper (or just parse docs/insta_ids.md)
    from scraper import load_target_handles
    handles = load_target_handles()
    
    print(f"Initializing ApifyClient for {len(handles)} handles to harvest avatars...")
    client = ApifyClient(APIFY_TOKEN)
    run_input = {
        "usernames": handles,
        "resultsLimit": 0
    }
    
    try:
        run = client.actor("apify/instagram-profile-scraper").call(run_input=run_input)
    except Exception as e:
        print(f"Error calling actor: {e}")
        return
        
    dataset_id = getattr(run, "default_dataset_id", None) or (run.get("defaultDatasetId") if isinstance(run, dict) else None)
    raw_items = client.dataset(dataset_id).iterate_items()
    
    avatars_map = {}
    for item in raw_items:
        username = item.get("username")
        pic_url = item.get("profilePicUrl") or item.get("profilePicUrlHD")
        if not username or not pic_url:
            continue
            
        try:
            res = requests.get(pic_url, timeout=10)
            res.raise_for_status()
            with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
                tmp.write(res.content)
                tmp_path = tmp.name
                
            cloud_url = cloudinary.uploader.unsigned_upload(
                tmp_path,
                upload_preset="loop_unsigned_preset",
                folder="loop_avatars",
                public_id=f"avatar_{username}"
            ).get("secure_url")
            
            avatars_map[username] = cloud_url
            os.remove(tmp_path)
            print(f"Uploaded avatar for {username}: {cloud_url}")
        except Exception as e:
            print(f"Failed for {username}: {e}")
            
    with open("avatars_map.json", "w") as f:
        json.dump(avatars_map, f, indent=2)
    print("Done harvesting avatars.")

if __name__ == "__main__":
    main()
