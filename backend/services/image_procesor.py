from PIL import Image
import io
import numpy as np
from sklearn.cluster import KMeans

"""
Helper function to convert RGB tuple to HEX string.
"""
def rgb_to_hex(rgb):
    rgb = np.clip(rgb, 0, 255)
    r, g, b = int(rgb[0]), int(rgb[1]), int(rgb[2])
    return '#{:02x}{:02x}{:02x}'.format(r, g, b)

"""
Process the baytes of an image and return the palette and grid.
Throw exceptions if something goes wrong, so the controller can catch them.
"""
def process_image_to_pattern(image_bytes: bytes, width: int, n_colors: int) -> dict:
    try:
        image = Image.open(io.BytesIO(image_bytes))
        image = image.convert("RGB")
    except Exception:
        raise ValueError("El archivo no es una imagen válida.")
    
    aspect_ratio = image.height / image.width
    new_height = int(width * aspect_ratio)

    resized_image = image.resize((width, new_height), Image.Resampling.NEAREST)

    image_array = np.array(resized_image)
    pixels = image_array.reshape(-1, 3)

    kmeans = KMeans(n_clusters=n_colors, random_state=42, n_init=10)
    kmeans.fit(pixels)

    palette_hex = [rgb_to_hex(color) for color in kmeans.cluster_centers_]
    pattern_grid = kmeans.labels_.reshape(new_height, width).tolist()

    return {
        "dimensions": {"width": width, "height": new_height},
        "palette": palette_hex,
        "grid": pattern_grid
    }