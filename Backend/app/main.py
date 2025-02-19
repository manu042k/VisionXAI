from fastapi import FastAPI, HTTPException,WebSocketDisconnect,WebSocket
from fastapi.middleware.cors import CORSMiddleware
from models import ImageRequest
from config import load_environment
from memory import ImageChatBot
import base64
from fastapi import FastAPI, File, UploadFile,Form
from pydantic import BaseModel
import uvicorn
from fastapi.responses import StreamingResponse
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200","http://127.0.0.1:5500"],  # Or ["*"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Load environment variables
load_environment()

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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
