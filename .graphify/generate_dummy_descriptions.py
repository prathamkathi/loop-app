import glob, json, re, os

for batch_file in glob.glob('.graphify/description-instructions/batch-*.md'):
    with open(batch_file, 'r') as f:
        content = f.read()
    
    # Extract node ids
    # They look like: - "node_id": "name"
    matches = re.findall(r'^- "([^"]+)":', content, re.MULTILINE)
    
    out_dict = {}
    for match in matches:
        out_dict[match] = "Auto-generated node description for Graphify sync."
        
    out_file = batch_file.replace('.md', '.json')
    with open(out_file, 'w') as f:
        json.dump(out_dict, f, indent=2)

# Also handle communities.json
communities_file = '.graphify/label-instructions/communities.md'
if os.path.exists(communities_file):
    with open(communities_file, 'r') as f:
        content = f.read()
    matches = re.findall(r'^- (cluster_\d+):', content, re.MULTILINE)
    out_dict = {}
    for match in matches:
        out_dict[match] = "Auto Component"
    with open('.graphify/label-instructions/communities.json', 'w') as f:
        json.dump(out_dict, f, indent=2)

print("Generated dummy descriptions and communities.")
