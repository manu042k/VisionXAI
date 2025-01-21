from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models import ImageRequest
from app.config import load_environment
from app.memory import ImageChatBot
import base64
from fastapi import FastAPI, File, UploadFile,Form
from pydantic import BaseModel

app = FastAPI()

origins = [
    "*",  
]

# Load environment variables
load_environment()
# Add CORSMiddleware to your app
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows specific origins or "*" to allow all
    allow_credentials=True,  # Allow cookies to be sent
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)



@app.post("/chat/")
async def chat(request:ImageRequest):
    """Process chat request with image and query."""
    try:
        chat = ImageChatBot()    
        response = chat.get_response(request.query, request.base64Image)
        return {"response": response}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")



