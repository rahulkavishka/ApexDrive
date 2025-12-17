import easyocr
import cv2
import re

# Initialize the reader once (it loads the model into memory)
# 'en' for English. If you need specific country plates, you might train a custom model later.
reader = easyocr.Reader(['en'], gpu=False) # Set gpu=True if you have NVIDIA CUDA setup

def detect_license_plate(image_path):
    """
    Reads an image from a path and returns the detected license plate text.
    """
    # 1. Read the image using OpenCV
    img = cv2.imread(image_path)
    
    # Optional: Preprocessing (Convert to Grayscale usually helps OCR)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 2. Run OCR
    # detail=0 returns just the text. detail=1 returns coordinates + confidence.
    results = reader.readtext(gray, detail=1)

    detected_text = []

    # 3. Filter Results
    for (bbox, text, prob) in results:
        # Only accept text if the AI is > 50% sure
        if prob > 0.5:
            # Clean the text: Remove special chars, keep only Alphanumeric
            clean_text = re.sub(r'[^A-Z0-9]', '', text.upper())
            
            # Basic validation: License plates are usually 4-8 chars long
            if 4 <= len(clean_text) <= 8:
                detected_text.append(clean_text)

    # Return the most likely plate (or the first one found)
    return detected_text[0] if detected_text else None