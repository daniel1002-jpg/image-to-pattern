from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import numpy as np
from sklearn.cluster import KMeans

app = FastAPI()

# --- CORS SETUP ---
origins = [
    "http://localhost:5173",
    "http://localhost:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ---------------------------

def rgb_to_hex(rgb):
    return '#{:02x}{:02x}{:02x}'.format(int(rgb[0]), int(rgb[1]), int(rgb[2]))

@app.get("/")
def read_root():
    return {
        "message": "Image-to-Pattern API is running."
    }

"""
    1. Resize image.
    2. Reduce colors using Kmeans clustering.
"""
@app.post("/process-image/")
async def process_image(file: UploadFile = File(...), width: int = Form(50), n_colors: int = Form(5)):
    content = await file.read()

    try:
        # open and resize
        image = Image.open(io.BytesIO(content))
        image = image.convert("RGB")
        
        aspect_ratio = image.height / image.width
        new_height = int(width * aspect_ratio)
        # Resize using basic NEAREST to avoid adding too much anti-aliasing noise before K-Means
        resized_image = image.resize((width, new_height), Image.Resampling.NEAREST)

        # Prepare data for Scikit-Learn KMeans
        # Convert image to numpy array: (Height, Width, 3) -> (Pixels, 3)
        image_array = np.array(resized_image)
        pixels = image_array.reshape(-1, 3)

        # Apply K-Means
        kmeans = KMeans(n_clusters=n_colors, random_state=42, n_init=10)
        kmeans.fit(pixels)

        # Extract Results
        # The 'clusters_centers_' are the dominant color found
        palette_rgb = kmeans.cluster_centers_
        palette_hex = [rgb_to_hex(color) for color in palette_rgb]

        # The 'labels_' tells us wich color index (0-4) each pixel belongs to
        labels = kmeans.labels_

        # Reshape labels back to the 2D grid dimensions
        pattern_grid = labels.reshape(new_height, width).tolist()

        return {
            "status": "Resized successfully",
            "dimensions": {"width": width, "height": new_height},
            "palette": palette_hex, # yarn colors nedded
            "grid": pattern_grid    # matrix of numbers [0, 1, 4, ...] referencing palette colors
            
        }
    except Exception as e:
        return {"error": str(e)}


@app.post("/upload-image/")
async def upload_image(file: UploadFile = File(...)):
    # read the file bytes
    content = await file.read()

    # open it with Pillow to verify it's an image
    try:
        image = Image.open(io.BytesIO(content))
    except IOError:
        return {"error": "File is not a valid image."}

    return {
        "filename": file.filename,
        "format": image.format,
        "size": image.size, # (width, height)
        "mode": image.mode
    }