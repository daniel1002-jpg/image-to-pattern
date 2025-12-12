from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.image_procesor import process_image_to_pattern

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
    try:
        content = await file.read()
        result = process_image_to_pattern(content, width, n_colors)

        return {
            "status": "Processed successfully",
            **result
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"server error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error to process image.")


# @app.post("/upload-image/")
# async def upload_image(file: UploadFile = File(...)):
#     # read the file bytes
#     content = await file.read()

#     # open it with Pillow to verify it's an image
#     try:
#         image = Image.open(io.BytesIO(content))
#     except IOError:
#         return {"error": "File is not a valid image."}

#     return {
#         "filename": file.filename,
#         "format": image.format,
#         "size": image.size, # (width, height)
#         "mode": image.mode
#     }