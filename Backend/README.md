# Backend

The Backend directory contains the FastAPI-based REST API service that powers AnnotAIx. It serves as the bridge between the frontend application and the LangGraph-based image analysis pipeline, handling image processing, workflow orchestration, and response streaming.

## Architecture Overview

The backend follows a modular architecture with clear separation of concerns:

- **FastAPI Application**: Modern async web framework with automatic API documentation
- **LangGraph Integration**: Executes the image analysis workflow with stateful memory
- **CORS Support**: Enables cross-origin requests from the frontend
- **Streaming Responses**: Real-time response generation for enhanced UX
- **Error Handling**: Comprehensive error management and logging

## Project Structure

```
Backend/
├── run.py                      # Application entry point
├── requirements.txt            # Python dependencies
├── app/
│   ├── __init__.py
│   ├── main.py                # FastAPI app and route definitions
│   ├── config.py              # Environment configuration
│   ├── models.py              # Pydantic request/response models
│   ├── core/
│   │   ├── states.py          # TypedDict state definitions
│   │   └── utils.py           # Utility functions
│   ├── graphs/
│   │   └── image_analyzer.py  # LangGraph workflow implementation
│   └── tools/
│       └── web_search.py      # Tavily search integration
└── env/                        # Virtual environment (created locally)
```

## Key Components

### main.py

The core FastAPI application with the following endpoints:

**GET /**

- Health check endpoint
- Returns a welcome message to verify API is running

**POST /chat/**

- Synchronous image analysis endpoint
- Accepts: JSON with `query`, `base64Image`, and optional `threadId`
- Returns: Complete analysis response after workflow execution
- Use case: Simple request-response pattern

**POST /chat/stream/**

- Streaming image analysis endpoint
- Accepts: Same as `/chat/`
- Returns: Server-Sent Events (SSE) stream with incremental updates
- Use case: Real-time response generation with progress updates

### models.py

Pydantic models for request/response validation:

```python
class ImageRequest(BaseModel):
    query: str                           # User's question about the image
    base64Image: str                     # Base64-encoded image data
    threadId: Optional[str] = "default"  # Conversation thread identifier
```

### config.py

Environment configuration management:

- Loads environment variables from `.env` file
- Validates required API keys (Google, Tavily)
- Provides configuration access to other modules

### graphs/image_analyzer.py

The ImageAnalyzer class orchestrates the complete workflow:

**Features:**

- Multi-turn conversation memory using MemorySaver
- Base64 image processing and validation
- Intelligent query analysis for search decisions
- Bounding box detection for object identification
- Context-aware web search integration
- Comprehensive response generation with citations
- Error handling and state management

**Workflow Nodes:**

1. Load memory and encode image
2. Analyze query intent
3. Detect bounding boxes
4. Decide on search necessity
5. Execute web search (conditional)
6. Generate final analysis
7. Persist conversation memory

### tools/web_search.py

Tavily API integration for web search:

- Structured search queries based on image content and user questions
- Result formatting with titles, URLs, and snippets
- Error handling and fallback mechanisms
- Configurable search depth and result count

### core/states.py

TypedDict definitions for LangGraph state management:

```python
class ImageAnalyzerState(TypedDict):
    query: str
    base64_image: str
    thread_id: str
    conversation_history: List[Dict]
    image_metadata: Dict
    bounding_boxes: List[Dict]
    search_needed: bool
    search_results: List[Dict]
    final_summary: str
    error: Optional[str]
```

## Setup and Installation

### Prerequisites

- Python 3.8 or higher
- pip package manager
- Virtual environment support

### Environment Variables

Create a `.env` file in the Backend directory:

```env
GOOGLE_API_KEY=your_google_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

### Installation Steps

1. Navigate to the Backend directory:

```bash
cd Backend
```

2. Create and activate a virtual environment:

```bash
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

## Running the Application

### Development Server

Start the development server with hot-reload:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### Custom Port

Run on a different port:

```bash
uvicorn app.main:app --reload --port 8080
```

### Production Server

For production deployment:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Using run.py

Alternative entry point:

```bash
python run.py
```

## API Usage Examples

### Synchronous Request

```bash
curl -X POST http://localhost:8000/chat/ \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What objects can you identify in this image?",
    "base64Image": "data:image/png;base64,iVBORw0KGgo...",
    "threadId": "user_session_123"
  }'
```

### Streaming Request

```bash
curl -X POST http://localhost:8000/chat/stream/ \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Analyze this image and provide details",
    "base64Image": "data:image/png;base64,iVBORw0KGgo...",
    "threadId": "user_session_456"
  }'
```

## API Documentation

FastAPI provides automatic interactive documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI Schema**: `http://localhost:8000/openapi.json`

## Dependencies

### Core Framework

- **fastapi**: Modern web framework with async support
- **uvicorn**: ASGI server implementation
- **pydantic**: Data validation and settings management
- **python-multipart**: Form data parsing
- **starlette**: ASGI toolkit (FastAPI dependency)

### AI/ML

- **langchain-core**: LangChain framework core
- **langchain-google-genai**: Google Gemini integration
- **langchain-community**: Community-contributed components
- **langgraph**: Stateful workflow orchestration
- **google-generativeai**: Google AI SDK

### Search and HTTP

- **tavily-python**: Web search API client
- **httpx**: Modern HTTP client
- **requests**: Traditional HTTP library

### Utilities

- **python-dotenv**: Environment variable management
- **tenacity**: Retry logic and error handling
- **typing_extensions**: Advanced type hints

## Error Handling

The backend implements comprehensive error handling:

- **Validation Errors**: Pydantic models validate all incoming requests
- **API Errors**: Graceful handling of external API failures
- **State Errors**: LangGraph state validation and recovery
- **HTTP Exceptions**: Proper HTTP status codes and error messages

## Performance Considerations

- **Async Operations**: All endpoints use async/await for non-blocking I/O
- **Connection Pooling**: Efficient HTTP client connection management
- **Memory Management**: MemorySaver provides efficient conversation persistence
- **Streaming**: Reduces latency for long-running operations

## Deployment

### Vercel Deployment

Configure `vercel.json` for serverless deployment:

```json
{
  "builds": [
    {
      "src": "app/main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app/main.py"
    }
  ]
}
```

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Troubleshooting

### Common Issues

**ImportError: No module named 'app'**

- Ensure you're running from the Backend directory
- Virtual environment is activated

**API Key Errors**

- Verify `.env` file exists and contains valid API keys
- Check environment variable loading in `config.py`

**CORS Errors**

- Verify CORS middleware configuration in `main.py`
- Check allowed origins match frontend URL

**Memory Issues**

- MemorySaver stores conversation history in memory
- For production, consider persistent storage solutions

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [Google Gemini API](https://ai.google.dev/)
- [Tavily API Documentation](https://docs.tavily.com/)
- [Uvicorn Documentation](https://www.uvicorn.org/)
