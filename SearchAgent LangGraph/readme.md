# Web Search Agent

A powerful web search agent built with LangChain and Groq that combines web search capabilities with web crawling functionality to provide comprehensive information retrieval.

## Features

- Web search using Tavily Search API
- Web page crawling for deeper content analysis
- Conversational interface powered by Groq's LLama 3.1 model
- Stateful conversation management using LangGraph
- Environment-based configuration
- Interactive command-line interface

## Prerequisites

- Python 3.8+
- Groq API key
- Tavily API key
- Environment variables properly configured

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd web-search-agent
```

2. Install required dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the project root and add your API keys:
```
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
```

## Project Structure

```
web_search_agent/
├── web_search_agent.py    # Main agent implementation
├── crawler.py             # Web crawling functionality
├── requirements.txt       # Project dependencies
└── .env                  # Environment variables
```

## Usage

### As a Module

```python
from web_search_agent import run_agent

# Run the agent with a query
for event in run_agent("What is the latest news about AI?"):
    print(event["messages"][-1].content)
```

### Command Line Interface

Run the script directly to use the interactive command-line interface:

```bash
python web_search_agent.py
```

Enter your queries at the prompt. Type 'quit', 'exit', or 'q' to end the session.

## Components

### State Graph

The agent uses a state graph architecture with the following components:

- Chatbot Node: Processes user input and generates responses using the LLM
- Tools Node: Executes web search and crawling operations
- Memory Saver: Maintains conversation state

### Tools

1. **Tavily Search**
   - Performs web searches with a maximum of 2 results per query
   - Provides relevant URLs and snippets

2. **Web Crawler**
   - Crawls specified URLs to extract detailed content
   - Returns structured content for each crawled page

## Configuration

The agent supports configuration through a dictionary passed to `run_agent()`:

```python
config = {
    "configurable": {
        "thread_id": "custom_thread_id"
    }
}
run_agent("query", config=config)
```

## Error Handling

The agent includes basic error handling for:
- API failures
- Invalid URLs
- Network issues
- User interruptions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Specify your license here]

## Dependencies

- langchain-groq
- langchain-core
- langgraph
- python-dotenv
- typing-extensions

## Notes

- The agent uses Groq's llama-3.1-8b-instant model for optimal performance
- Web crawling is rate-limited to respect website policies
- Ensure proper error handling in production environments