from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from models import ImageRequest
from config import load_environment
from memory import ImageChatBot
import base64
from fastapi import FastAPI, File, UploadFile,Form
from pydantic import BaseModel
import uvicorn

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)
# Load environment variables
load_environment()

@app.get("/")
async def root():
    """Root endpoint to verify API is running."""
    return {"message": "Welcome to the Image Chat API"}

@app.post("/chat/")
async def chat(request:ImageRequest):
    """Process chat request with image and query."""
    try:
        chat = ImageChatBot()    
        response = chat.get_response(request.query, request.base64Image)
        return {"response": response}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.post("/stream-chat/")
async def stream_chat(request:ImageRequest):
    """Stream chat response with image and query."""
    try:
        chat = ImageChatBot()
        return StreamingResponse(chat.stream_response(request.query,request.base64Image), media_type="text/plain")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")


