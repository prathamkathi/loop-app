import os
import time
import json
import requests
import tempfile
import base64
from dotenv import load_dotenv
from instagrapi import Client

load_dotenv()

IG_USERNAME = os.getenv("IG_USERNAME")
IG_PASSWORD = os.getenv("IG_PASSWORD")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SESSION_FILE = "session.json"

HANDLES = [
    "ankahi_iitd", "axlr8r.formula.racing", "bhmiitd", "brcaiitd", "bsa.iitd",
    "bsp.iitdelhi", "bsw_iitd", "caic_iitd", "debsoc_iitd", "designclubiitd",
    "edc_iitd", "enactus_iitdelhi", "envogueiitd", "facc.azure.iitd",
    "hindisamiti.iitd", "humans_of_bloodconnect", "igem_iitd", "iitdaa",
    "iitddanceclub", "iitdelhi", "iitdmusicclub", "iitdonair", "iitdqc",
    "kaizen.iitd", "litclub.iitd", "literati.iitd", "nssiitd", "ocs_iitd",
    "outreach_iitd", "pac_iitd", "pfciitd", "rendezvous.iitd", "sac_iitdelhi",
    "speranza.iitd", "spicmacay_iitd", "sportech.iitd", "tryst.iitd",
    "uzyre.iitd", "vdefyn.iitd"
]


cl = Client()
if os.path.exists(SESSION_FILE):
    cl.load_settings(SESSION_FILE)
    try:
        cl.login(IG_USERNAME, IG_PASSWORD)
    except:
        cl.login(IG_USERNAME, IG_PASSWORD)
        cl.dump_settings(SESSION_FILE)
else:
    cl.login(IG_USERNAME, IG_PASSWORD)
    cl.dump_settings(SESSION_FILE)

os.makedirs("stock/images", exist_ok=True)
events_data = []

def download_image(url, filename):
    res = requests.get(url)
    res.raise_for_status()
    filepath = os.path.join("stock/images", filename)
    with open(filepath, "wb") as f:
        f.write(res.content)
    return filepath

count = 0
for handle in HANDLES:
    print(f"\nFetching posts for @{handle}...")
    try:
        user_id = cl.user_id_from_username(handle)
        medias = cl.user_medias(user_id, 3) # get 3 posts
        time.sleep(2)
        
        for media in medias:
            image_urls = []
            if media.media_type == 1:
                image_urls.append(media.thumbnail_url or media.thumbnail_url)
            elif media.media_type == 8:
                for res in media.resources[:2]:
                    if res.media_type == 1:
                        image_urls.append(res.thumbnail_url)
            
            if not image_urls:
                continue
            
            paths = []
            for idx, url in enumerate(image_urls):
                img_name = f"{handle}_{media.pk}_{idx}.jpg"
                try:
                    paths.append(download_image(url, img_name))
                except Exception as e:
                    print(f"Failed to download image {url}: {e}")
            
            if not paths:
                continue
                
            parsed = parse_with_gemini(paths, media.caption_text)
            if parsed:
                parsed['ig_id'] = media.pk
                parsed['host'] = f"@{handle}"
                parsed['image_paths'] = paths
                events_data.append(parsed)
                print(f" -> Added: {parsed.get('title')}")
                
                # Save progress iteratively
                with open("stock/events.json", "w") as f:
                    json.dump(events_data, f, indent=2)
            
            time.sleep(2)
            
    except Exception as e:
        print(f"Error processing {handle}: {e}")
        time.sleep(5)
    
    print(f"Total events scraped so far: {len(events_data)}")
    time.sleep(5) # Delay between handles to avoid rate limit
