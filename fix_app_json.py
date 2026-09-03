import json

with open("loop-app/app.json", "r") as f:
    data = json.load(f)

# T-01: ios.bundleIdentifier
if "ios" not in data["expo"]:
    data["expo"]["ios"] = {}
data["expo"]["ios"]["bundleIdentifier"] = "com.loop.iitd"

# T-02: userInterfaceStyle to "automatic"
data["expo"]["userInterfaceStyle"] = "automatic"

# T-03: scheme
data["expo"]["scheme"] = "loop-iitd"

# T-05: owner
data["expo"]["owner"] = "prathamkathi" # or generic "loop" but usually requires specific owner. I'll just put a placeholder "iitd-loop"

with open("loop-app/app.json", "w") as f:
    json.dump(data, f, indent=2)
