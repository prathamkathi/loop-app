import json

with open("loop-app/package.json", "r") as f:
    data = json.load(f)

# Lock expo-status-bar
data["dependencies"]["expo-status-bar"] = "~57.0.1"
data["dependencies"]["expo-splash-screen"] = "~57.0.2"

with open("loop-app/package.json", "w") as f:
    json.dump(data, f, indent=2)
