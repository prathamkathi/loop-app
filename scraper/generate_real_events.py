import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

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

def generate_real_events():
    prompt = f"""
    You are an expert on IIT Delhi's student culture, fests, and clubs.
    I need you to generate a JSON array of REAL, historically accurate events for each of the following 39 Instagram handles at IIT Delhi.
    For each handle, generate exactly 2 highly realistic events that they actually host in real life (e.g., Rendezvous has Pronites, Ankahi has Nukkad Natak, DebSoc has Mukhaute, etc.).
    
    Handles:
    {', '.join(HANDLES)}
    
    Output a single flat JSON array of event objects.
    Each object MUST have:
    "id": "e_uniqueid",
    "title": "Real Event Name",
    "host": "@handle",
    "hostAvatar": "https://picsum.photos/seed/host/120/120",
    "category": "Pick one: BRCA Cultural, CAIC Technical, BSA Sports, BSW Welfare, Major Fests, E-Cell & Startups, Academic & Admin, Free Food & Social",
    "date": "10 Nov",
    "day": "Friday",
    "time": "6:00 PM",
    "venue": "Real IITD Venue (e.g., OAT, Dogra Hall, LHC 111, SAC)",
    "image": "https://picsum.photos/seed/uniqueseed/800/800",
    "aspect": "square",
    "blurb": "A realistic 1-2 sentence description of the event.",
    "confidenceScore": 95
    """

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json"
        }
    }
    
    print("Asking Gemini to generate 78 historically accurate events for IIT Delhi...")
    resp = requests.post(url, headers={'Content-Type': 'application/json'}, json=payload)
    resp.raise_for_status()
    
    result = resp.json()['candidates'][0]['content']['parts'][0]['text']
    events = json.loads(result)
    
    os.makedirs("stock", exist_ok=True)
    with open("stock/real_events_generated.json", "w") as f:
        json.dump(events, f, indent=2)
        
    print(f"Successfully generated {len(events)} events and saved to stock/real_events_generated.json!")

if __name__ == "__main__":
    generate_real_events()
