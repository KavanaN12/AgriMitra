import urllib.request
import os

CROPS = {
    "sugarcane.jpg": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=800",
    "paddy.jpg": "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800",
    "ragi.jpg": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800",
    "banana.jpg": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=800",
    "coconut.jpg": "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800",
    "tomato.jpg": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800",
}

OUT_DIR = os.path.join("frontend", "public", "images", "crops")
os.makedirs(OUT_DIR, exist_ok=True)

headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

for filename, url in CROPS.items():
    filepath = os.path.join(OUT_DIR, filename)
    print(f"Downloading {filename} from {url}...")
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = resp.read()
        with open(filepath, "wb") as f:
            f.write(data)
        print(f"  ✓ Saved {filename} ({len(data)} bytes)")

print("\nAll crop images downloaded successfully!")
