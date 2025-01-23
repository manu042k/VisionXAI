from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models import ImageRequest
from app.config import load_environment
from app.memory import ImageChatBot
import base64
from fastapi import FastAPI, File, UploadFile,Form
from pydantic import BaseModel
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Angular app's origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
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



if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=3000, reload=True)
