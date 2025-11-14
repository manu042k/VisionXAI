# LLM Image Analysis System

A powerful and modular image analysis system using Google's Gemini model with LangGraph for workflow orchestration and Tavily for web search capabilities.

## Features

- 🖼️ **Image Analysis**: Process and analyze images using Google's Gemini 2.0 Flash model
- 🔍 **Web Search Integration**: Automatically search the web for additional context when needed
- 🔄 **Smart Routing**: Intelligent query analysis to determine if web search is required
- 📊 **LangGraph Workflow**: State-based workflow management with conditional routing
- 🛠️ **Extensible Tools**: Modular tool system for easy expansion
- 🏗️ **Clean Architecture**: Organized codebase with separation of concerns
- 🔌 **Multiple Implementations**: Choose between basic and enhanced graph workflows

## Project Structure

```
LLM/
├── LLM.py                      # Original implementation (unchanged)
├── gemini_langgraph.py         # Legacy basic implementation
├── gemini_langgraph_enhanced.py # Legacy enhanced implementation
├── studio_graph.py             # LangGraph Studio integration
├── requirements.txt            # Python dependencies
├── README.md                   # This file
│
├── core/                       # Core functionality
│   ├── __init__.py
│   ├── states.py              # TypedDict state definitions
│   └── utils.py               # Utility functions
│
├── tools/                      # External tools
│   ├── __init__.py
│   └── web_search.py          # Tavily web search tool
│
├── graphs/                     # LangGraph implementations
│   ├── __init__.py
│   ├── basic_graph.py         # Basic image analysis workflow
│   └── enhanced_graph.py      # Enhanced workflow (WIP)
│
├── config/                     # Configuration
│   └── __init__.py
│
├── examples/                   # Usage examples
│   ├── README.md
│   ├── basic_usage.py
│   ├── test.jpeg              # Sample test image
│   └── test.ipynb             # Jupyter notebook examples
│
└── tests/                      # Unit tests (future)
```

## Architecture

### Basic Graph Workflow

The basic implementation uses a LangGraph workflow with these nodes:

1. **encode_image**: Converts image to base64 format
2. **analyze_query**: Determines if web search is needed based on query keywords
3. **search** (optional): Performs web search using Tavily API
4. **generate_description**: Generates image description with Gemini, optionally using search context

### Enhanced Graph Workflow (Legacy)

The enhanced implementation adds:

- Conversation memory across sessions
- Bounding box detection and analysis
- Context-aware search decisions
- Comprehensive response formatting with citations

## Prerequisites

- Python 3.8+
- Google API Key (for Gemini)
- Tavily API Key (for web search)

## Installation

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Create a `.env` file in the LLM directory:

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

### Basic Usage (New Clean Architecture)

```python
from graphs.basic_graph import GeminiImageDescriber

# Initialize the describer
describer = GeminiImageDescriber()

# Simple image description (no search)
result = describer.describe_image(
    image_path="examples/test.jpeg",
    query="Describe this image in detail.",
    use_search=False
)

print(result['description'])
```

### With Automatic Search Detection

```python
# The system will automatically detect if search is needed
result = describer.describe_image(
    image_path="examples/test.jpeg",
    query="What is the latest information about this product?"
)
```

### Force Search

```python
# Force web search for additional context
result = describer.describe_image(
    image_path="examples/test.jpeg",
    query="Tell me about the brand shown in this image",
    use_search=True
)
```

### Using Legacy Implementation

```python
# For backwards compatibility, you can still use:
from gemini_langgraph import GeminiImageDescriber

describer = GeminiImageDescriber()
result = describer.describe_image("path/to/image.jpg", "Your query")
```

### Running Examples

```bash
cd examples
python basic_usage.py
```

## How It Works

### Query Analysis

The system looks for keywords that indicate external information is needed:

- "search", "find", "look up"
- "what is", "who is", "when was", "where is"
- "latest", "current", "news"

If detected, it performs a web search before generating the description.

### Search Integration

When search is triggered:

1. Tavily API searches for the query
2. Top 3 results are retrieved
3. Results are formatted and added to the context
4. Gemini generates a description using both image and search context

### Workflow States

Each state in the workflow contains:

- `image_path`: Path to the input image
- `base64_image`: Encoded image data
- `query`: User's question or instruction
- `description`: Generated description
- `search_results`: Web search results (if applicable)
- `next_action`: Next step in the workflow
- `error`: Error message (if any)

## Examples

### Example 1: Basic Image Description

```python
describer = GeminiImageDescriber()
result = describer.describe_image(
    image_path="photo.jpg",
    query="What do you see in this image?"
)
```

### Example 2: Product Information with Search

```python
result = describer.describe_image(
    image_path="product.jpg",
    query="Search and tell me about this product's features and reviews"
)
```

### Example 3: Historical Context

```python
result = describer.describe_image(
    image_path="landmark.jpg",
    query="What is this building and what is its historical significance?"
)
```

## Extending with More Tools

To add more tools, follow this pattern:

```python
from langchain_core.tools import tool

@tool
def your_custom_tool(param: str) -> str:
    """
    Description of what your tool does.

    Args:
        param: Parameter description

    Returns:
        Result description
    """
    # Your tool implementation
    return result

# Add to the GeminiImageDescriber class
self.tools = [search_web, your_custom_tool]
```

## Error Handling

The system includes comprehensive error handling:

- Image encoding errors
- API failures
- Search errors
- Model invocation errors

All errors are captured in the state and returned in the result.

## Dependencies

- **langgraph**: Workflow orchestration
- **langchain-google-genai**: Google Gemini model integration
- **tavily-python**: Web search API
- **python-dotenv**: Environment variable management

## Troubleshooting

### "GOOGLE_API_KEY not found"

Make sure you have a `.env` file with your Google API key.

### "TAVILY_API_KEY not found"

Add your Tavily API key to the `.env` file. Search functionality requires this.

### Import errors

Run `pip install -r requirements.txt` to install all dependencies.

## License

MIT License

## Contributing

Feel free to submit issues and enhancement requests!
