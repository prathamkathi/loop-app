import json

with open("loop-app/eas.json", "r") as f:
    data = json.load(f)

if "preview" in data["build"]:
    if "ios" not in data["build"]["preview"]:
        data["build"]["preview"]["ios"] = {}
    data["build"]["preview"]["ios"]["simulator"] = True

with open("loop-app/eas.json", "w") as f:
    json.dump(data, f, indent=2)
