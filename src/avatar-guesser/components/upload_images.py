import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
from pathlib import Path
import os
import json


load_dotenv(Path(__file__).parent.parent / ".env")


cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)



folder = Path(__file__).parent.parent / "images"
json_file = Path(__file__).parent.parent / "episodes.json"


episodes = []

for image in folder.glob("*"):

    # Filename format: S01E03-description.png
    filename = image.stem  # removes .png

    season = int(filename[1:3])
    episode = int(filename[4:6])

    result = cloudinary.uploader.upload(
        str(image),
        folder="episodes"
    )

    episodes.append({
        "season": season,
        "episode": episode,
        "url": result["secure_url"]
    })

    print(image.name, "->", result["secure_url"])


with open(json_file, "w") as f:
    json.dump(episodes, f, indent=2)

print("Saved episodes.json")