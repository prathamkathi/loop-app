import re

def clean_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Remove old firebase init
    content = re.sub(r'# Setup Firebase Admin\ntry:\n.*?\nexcept Exception as e:\n.*?\n    exit\(1\)\n\ndb = firestore.client\(\)\n', '', content, flags=re.DOTALL)
    
    # Remove old cloudinary config
    content = re.sub(r'# --- 2\. CLOUDINARY CONFIGURATION ---\ncloudinary.config\([\s\S]*?secure=True\n\)\n', '', content)
    
    # Remove old parse_with_gemini
    content = re.sub(r'def x_parse_with_gemini.*?\n    except Exception as e:\n        print\(f"\[Gemini Error\] Failed to generate content: \{e\}"\)\n        return None\n', '', content, flags=re.DOTALL)

    # Remove upload_to_cloudinary in scraper if exists
    content = re.sub(r'def upload_to_cloudinary.*?\n        return None\n', '', content, flags=re.DOTALL)
    
    with open(filepath, 'w') as f:
        f.write(content)

clean_file('loop-scraper/scraper.py')
clean_file('loop-scraper/stock_scraper.py')
