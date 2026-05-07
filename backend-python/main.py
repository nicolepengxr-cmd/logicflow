import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import io

app = FastAPI(title="LogicFlow CleanSlate API")

# Configure CORS for LogicFlow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your actual frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def process_image_opencv(image_bytes: bytes):
    # Convert bytes to numpy array
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Invalid image format")

    # --- OpenCV Cleanup Pipeline ---
    
    # 1. Convert to Grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # 2. Increase Contrast (using CLAHE)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    contrast = clahe.apply(gray)
    
    # 3. Reduce Noise (Median Blur)
    denoised = cv2.medianBlur(contrast, 3)
    
    # 4. Light Thresholding (Adaptive)
    # This helps simulate "cleaning" by whitening the background while keeping text
    cleaned = cv2.adaptiveThreshold(
        denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
        cv2.THRESH_BINARY, 11, 2
    )

    # 5. Optional: Dilate/Erode to sharpen text if needed
    # kernel = np.ones((1,1), np.uint8)
    # cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_OPEN, kernel)

    # Encode back to PNG
    is_success, buffer = cv2.imencode(".png", cleaned)
    if not is_success:
        raise ValueError("Failed to encode image")
        
    return io.BytesIO(buffer).read()

@app.post("/remove-handwriting")
async def remove_handwriting(image: UploadFile = File(...)):
    """
    Receives an image and returns a 'cleaned' version.
    """
    try:
        contents = await image.read()
        
        # --- Future PyTorch Integration Point ---
        # To add a real model (e.g., HandWritingEraser-Pytorch):
        # 1. Load your model: model = MyHandwritingModel().load_state_dict(...)
        # 2. Preprocess: tensor = transform(image)
        # 3. Predict: output = model(tensor)
        # 4. Postprocess: result_img = tensor_to_image(output)
        # return Response(content=result_img_bytes, media_type="image/png")
        
        # Using OpenCV fallback for now
        processed_bytes = process_image_opencv(contents)
        
        return Response(content=processed_bytes, media_type="image/png")
        
    except Exception as e:
        print(f"Error processing image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok", "mode": "opencv-cleanup"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
