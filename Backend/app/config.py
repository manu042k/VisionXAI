import os
from dotenv import load_dotenv

def load_environment():
    """Load environment variables from .env file."""
    load_dotenv()
    os.environ["LANGSMITH_TRACING"] = "false"
    
    # Only set environment variables if they exist
    if os.getenv("LANGSMITH_API_KEY"):
        os.environ["LANGSMITH_API_KEY"] = os.getenv("LANGSMITH_API_KEY")
    if os.getenv("GROQ_API_KEY"):
        os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY")
    if os.getenv("GOOGLE_API_KEY"):
        os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")
    if os.getenv("TAVILY_API_KEY"):
        os.environ["TAVILY_API_KEY"] = os.getenv("TAVILY_API_KEY")