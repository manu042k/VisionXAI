from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from app.models import ImageRequest
from app.config import load_environment
from app.graphs.image_analyzer import ImageAnalyzer
import base64
from pydantic import BaseModel
import uvicorn
import asyncio
import json

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

# Initialize the ImageAnalyzer
image_analyzer = ImageAnalyzer()

@app.get("/")
async def root():
    """Root endpoint to verify API is running."""
    return {"message": "Welcome to the Image Chat API"}

@app.post("/chat/")
async def chat(request: ImageRequest):
    """Process chat request with image and query using ImageAnalyzer."""
    try:
        initial_state = {
            "query": request.query,
            "base64_image": request.base64Image,
            "thread_id": "default_thread" 
        }
        
        # Run the graph to get the final state
        final_state = image_analyzer.run(initial_state)
        
        if final_state.get("error"):
            raise HTTPException(status_code=500, detail=final_state["error"])
            
        return {"response": final_state.get("final_summary", "No summary available.")}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.post("/stream-chat/")
async def stream_chat(request: ImageRequest):
    """Stream chat response with image and query using ImageAnalyzer."""
    
    async def event_stream():
        try:
            thread_id = request.threadId or "default_thread"
            
            initial_state = {
                "thread_id": thread_id,
                "timestamp": "",
                "image_path": "",
                "query": request.query,
                "conversation_history": [],
                "base64_image": request.base64Image,
                "image_metadata": {},
                "has_bounding_boxes": False,
                "bounding_boxes": [],
                "bbox_analyses": [],
                "focused_bbox_ids": [],
                "global_image_context": "",
                "query_analysis": {},
                "search_decision": {},
                "search_queries": [],
                "search_results": [],
                "synthesized_response": "",
                "final_response": "",
                "response_metadata": {},
                "next_action": "",
                "error": None
            }
            
            config = {"configurable": {"thread_id": thread_id}}
            
            final_response = None
            async for event in image_analyzer.graph.astream(initial_state, config, stream_mode="updates"):
                # Event is a dict with node name as key and state as value
                for node_name, state_update in event.items():
                    # Check for final response
                    if isinstance(state_update, dict) and "final_response" in state_update:
                        final_response = state_update["final_response"]
                    # Stream errors if any
                    if isinstance(state_update, dict) and "error" in state_update and state_update["error"]:
                        yield f"data: {json.dumps({'error': state_update['error']})}\n\n"
                        return
            
            # Send the final response at the end
            if final_response:
                yield f"data: {json.dumps({'response': final_response})}\n\n"
            else:
                yield f"data: {json.dumps({'error': 'No response generated'})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'error': f'Error processing stream: {str(e)}'})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


