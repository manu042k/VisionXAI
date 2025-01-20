from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.config import load_environment
from app.memory import ImageChatBot
import base64
# Load environment variables
load_environment()
from fastapi import FastAPI, File, UploadFile,Form
from pydantic import BaseModel

app = FastAPI()

origins = [
    "*",  
]

# Add CORSMiddleware to your app
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows specific origins or "*" to allow all
    allow_credentials=True,  # Allow cookies to be sent
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)



@app.post("/chat/")
async def chat(text: str = Form(...), file: UploadFile = File(...)):
    """Process chat request with image and query."""
    
    async def encode_image(image_file: UploadFile):
        """Encode an image to a base64 string."""
        image_bytes = await image_file.read()
        return base64.b64encode(image_bytes).decode("utf-8")
    
    try:
        chat = ImageChatBot()
        
        image_base64 = await encode_image(file)
        
        response = chat.get_response(text, image_base64)
        
        return {"response": response}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")



