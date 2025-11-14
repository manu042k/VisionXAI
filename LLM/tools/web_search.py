"""
Web Search Tool
Provides web search capabilities using Tavily API.
"""

import os
from typing import Dict, Any
from dotenv import load_dotenv
from langchain_core.tools import tool
from tavily import TavilyClient

# Load environment variables
load_dotenv()


@tool
def search_web_detailed(query: str) -> Dict[str, Any]:
    """
    Search the web for information using Tavily API with detailed results.
    
    Args:
        query: The search query string
        
    Returns:
        Search results with titles, URLs, and content as structured data
    """
    try:
        tavily_api_key = os.getenv("TAVILY_API_KEY")
        if not tavily_api_key:
            return {"error": "TAVILY_API_KEY not found", "results": []}
        
        client = TavilyClient(api_key=tavily_api_key)
        response = client.search(query, max_results=3)
        
        results = []
        for idx, result in enumerate(response.get('results', []), 1):
            results.append({
                "id": idx,
                "title": result.get('title', 'No title'),
                "url": result.get('url', ''),
                "content": result.get('content', 'No content')
            })
        
        return {"query": query, "results": results}
    except Exception as e:
        return {"error": str(e), "results": []}
