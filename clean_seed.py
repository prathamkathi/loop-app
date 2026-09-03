import re

def clean_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Remove cloudinary imports other than upload_image_to_cloudinary
    content = content.replace("import cloudinary\n", "")
    content = content.replace("import cloudinary.uploader\n", "")
    
    content = re.sub(r'def upload_local_to_cloudinary.*?\n    return res.get\("secure_url"\)\n', '', content, flags=re.DOTALL)
    content = re.sub(r'def upload_url_to_cloudinary.*?\n    return res.get\("secure_url"\)\n', '', content, flags=re.DOTALL)
    
    content = content.replace('upload_local_to_cloudinary', 'upload_image_to_cloudinary')
    content = content.replace('upload_url_to_cloudinary', 'upload_image_to_cloudinary')
    
    with open(filepath, 'w') as f:
        f.write(content)

clean_file('loop-scraper/seed_data.py')
