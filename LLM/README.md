# LLM Image Analysis System

A sophisticated and modular image analysis system built with Google's Gemini 2.5 Flash model, LangGraph for stateful workflow orchestration, and Tavily for intelligent web search capabilities. This module serves as the core AI processing engine for VisionXai.

## Features

- **Advanced Image Analysis**: Process and analyze images using Google's Gemini 2.5 Flash model with vision capabilities
- **Web Search Integration**: Automatically search the web for additional context when needed using Tavily API
- **Smart Routing**: Intelligent query analysis to determine if web search is required
- **LangGraph Workflow**: State-based workflow management with conditional routing and memory persistence
- **Bounding Box Detection**: Identify and analyze specific objects and regions within images
- **Conversation Memory**: Maintain context across multiple interactions with the same image
- **Extensible Tools**: Modular tool system for easy expansion and customization
- **Clean Architecture**: Organized codebase with clear separation of concerns
- **Multiple Use Cases**: Support for description, Q&A, search-enhanced analysis, and more

## Project Structure

```
LLM/
├── studio_graph.py             # LangGraph Studio integration and visualization
├── requirements.txt            # Python dependencies
├── README.md                   # This file
│
├── core/                       # Core functionality
│   ├── __init__.py
│   ├── states.py              # TypedDict state definitions for workflow
│   └── utils.py               # Utility functions and helpers
│
├── tools/                      # External tool integrations
│   ├── __init__.py
│   └── web_search.py          # Tavily web search implementation
│
├── graphs/                     # LangGraph workflow implementations
│   ├── __init__.py
│   └── image_analyzer.py      # Advanced image analysis workflow
│
├── config/                     # Configuration management
│   └── __init__.py
│
├── examples/                   # Usage examples and documentation
│   ├── README.md              # Example documentation
│   ├── run_analyzer.py        # Standalone analysis script
│   └── test.jpeg              # Sample test image
│
└── tests/                      # Unit tests (future implementation)
```

## Architecture

### ImageAnalyzer Workflow

The ImageAnalyzer implements an advanced LangGraph workflow with the following nodes:

1. **load_memory_and_encode**: Loads conversation history and validates base64 image data
2. **analyze_initial_query**: Examines the user's question to understand intent and context
3. **detect_bounding_boxes**: Identifies objects and regions of interest within the image
4. **decide_search**: Determines if web search is needed based on query analysis
5. **search_web**: Performs contextual web search using Tavily API (conditional)
6. **generate_final_summary**: Generates comprehensive response with all available context
7. **save_memory**: Persists conversation history for future interactions

### Advanced Features

The implementation includes sophisticated capabilities:

- **Conversation Memory**: Maintains multi-turn conversation context using MemorySaver
- **Bounding Box Detection**: Identifies and analyzes specific objects and regions
- **Context-Aware Search**: Intelligently decides when external information is needed
- **Comprehensive Summarization**: Generates detailed responses with proper citations
- **Error Recovery**: Graceful handling of failures at each workflow stage
- **Streaming Support**: Real-time response generation for better user experience

## Prerequisites

- Python 3.8 or higher
- Google API Key for Gemini models
- Tavily API Key for web search functionality
- pip package manager

## Installation

1. Navigate to the LLM directory:

```bash
cd LLM
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the LLM directory:

```env
GOOGLE_API_KEY=your_google_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

## API Keys Setup

### Google API Key (Gemini)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

### Tavily API Key (Web Search)

1. Sign up at [Tavily](https://tavily.com/)
2. Get your API key from the dashboard
3. Add it to your `.env` file

## Usage

### Basic Usage

```python
from graphs.image_analyzer import ImageAnalyzer

# Initialize the analyzer with memory enabled
analyzer = ImageAnalyzer(
    model_name="gemini-2.5-flash",
    temperature=0.7,
    enable_memory=True
)

# Prepare the initial state
initial_state = {
    "query": "What objects can you identify in this image?",
    "base64_image": "your_base64_encoded_image_data",
    "thread_id": "user_session_123"
}

# Run the analysis
final_state = analyzer.run(initial_state)

# Access the results
print(final_state["final_summary"])
```

### With File Path

```python
import base64
from graphs.image_analyzer import ImageAnalyzer

# Read and encode image
with open("examples/test.jpeg", "rb") as image_file:
    base64_image = base64.b64encode(image_file.read()).decode('utf-8')

analyzer = ImageAnalyzer()

initial_state = {
    "query": "Describe this image in detail",
    "base64_image": base64_image,
    "thread_id": "session_001"
}

result = analyzer.run(initial_state)
print(result["final_summary"])
```

### Search-Enhanced Analysis

```python
# The system automatically detects if search is needed
# based on query keywords and context

initial_state = {
    "query": "What is the latest information about this product?",
    "base64_image": base64_image,
    "thread_id": "session_002"
}

result = analyzer.run(initial_state)
# Result will include web search context if needed
```

### Multi-Turn Conversation

```python
# First query
state1 = {
    "query": "What do you see in this image?",
    "base64_image": base64_image,
    "thread_id": "conversation_123"
}
result1 = analyzer.run(state1)

# Follow-up query with same thread_id maintains context
state2 = {
    "query": "Can you tell me more about the object on the left?",
    "base64_image": base64_image,
    "thread_id": "conversation_123"
}
result2 = analyzer.run(state2)
```

### Running Examples

```bash
cd examples
python run_analyzer.py
```

## How It Works

### Query Analysis

The system performs intelligent query analysis to determine if web search is needed:

**Search Trigger Keywords:**

- Informational: "search", "find", "look up", "tell me about"
- Question words: "what is", "who is", "when was", "where is", "why", "how"
- Temporal: "latest", "current", "recent", "news", "today"
- Factual: "information about", "details on", "facts about"

### Bounding Box Detection

The analyzer can identify and locate objects within images:

1. Gemini model detects objects and regions of interest
2. Returns bounding box coordinates for each identified object
3. Provides labels and confidence scores
4. Used for targeted analysis of specific image areas

### Search Integration

When search is triggered:

1. Query is reformulated based on image content
2. Tavily API performs contextual web search
3. Top 3-5 results are retrieved and formatted
4. Results include titles, URLs, and relevant snippets
5. Gemini generates final response incorporating search context
6. Citations are added for all external sources

### Workflow State

The ImageAnalyzerState TypedDict contains:

- `query`: User's question or instruction
- `base64_image`: Base64-encoded image data
- `thread_id`: Conversation thread identifier
- `conversation_history`: Previous messages in the thread
- `image_metadata`: Image size and encoding information
- `bounding_boxes`: Detected objects with coordinates
- `search_needed`: Boolean flag for search requirement
- `search_results`: Formatted web search results
- `final_summary`: Generated comprehensive response
- `error`: Error message if any operation failed

### Memory Persistence

Conversation history is maintained using LangGraph's MemorySaver:

- Each thread_id has independent conversation history
- Previous queries and responses are loaded at the start
- New interactions are appended to history
- Memory is preserved across multiple invocations
- Enables context-aware follow-up questions

## Examples

### Example 1: Basic Image Description

```python
from graphs.image_analyzer import ImageAnalyzer
import base64

analyzer = ImageAnalyzer()

with open("photo.jpg", "rb") as f:
    base64_image = base64.b64encode(f.read()).decode('utf-8')

state = {
    "query": "What do you see in this image?",
    "base64_image": base64_image,
    "thread_id": "basic_example"
}

result = analyzer.run(state)
print(result["final_summary"])
```

### Example 2: Product Information with Search

```python
state = {
    "query": "Search and tell me about this product's features and reviews",
    "base64_image": base64_image,
    "thread_id": "product_search"
}

result = analyzer.run(state)
print(result["final_summary"])
print(f"Search performed: {result['search_needed']}")
```

### Example 3: Object Detection

```python
state = {
    "query": "Identify all objects in this image with their locations",
    "base64_image": base64_image,
    "thread_id": "object_detection"
}

result = analyzer.run(state)
print("Detected objects:")
for bbox in result.get("bounding_boxes", []):
    print(f"  - {bbox['label']}: {bbox['coordinates']}")
```

### Example 4: Conversational Analysis

```python
# First interaction
state1 = {
    "query": "What is the main subject of this image?",
    "base64_image": base64_image,
    "thread_id": "conversation_example"
}
result1 = analyzer.run(state1)

# Follow-up question
state2 = {
    "query": "What colors are dominant?",
    "base64_image": base64_image,
    "thread_id": "conversation_example"  # Same thread_id
}
result2 = analyzer.run(state2)
```

## Dependencies

### Core Framework

- **langgraph**: Stateful workflow orchestration with conditional routing
- **langchain-core**: LangChain framework core components
- **langchain-google-genai**: Google Gemini model integration
- **langchain-community**: Community-contributed LangChain components

### AI Models

- **google-generativeai**: Google AI SDK for Gemini models
- **google-ai-generativelanguage**: Google AI language generation

### Tools and Utilities

- **tavily-python**: Web search API client
- **python-dotenv**: Environment variable management from .env files
