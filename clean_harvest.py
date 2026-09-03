import re

def clean_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    content = re.sub(r'import cloudinary\nimport cloudinary.uploader\n', 'from shared import upload_image_to_cloudinary\n', content)
    content = re.sub(r'cloudinary.config\([\s\S]*?secure=True\n\)\n', '', content)
    content = re.sub(r'def upload_to_cloudinary.*?\n        return None\n', '', content, flags=re.DOTALL)
    content = content.replace('upload_to_cloudinary', 'upload_image_to_cloudinary')
    
    with open(filepath, 'w') as f:
        f.write(content)

clean_file('loop-scraper/harvest_avatars.py')
