"""
Utility Functions
Common utility functions for image processing and encoding.
"""

import base64
from typing import Dict, Any


def encode_image(image_path: str) -> str:
    """
    Encode an image file to base64 string.
    
    Args:
        image_path: Path to the image file
        
    Returns:
        Base64 encoded string of the image
        
    Raises:
        FileNotFoundError: If image file doesn't exist
        ValueError: If encoding fails
    """
    with open(image_path, "rb") as image_file:
        image_data = image_file.read()
        base64_image = base64.b64encode(image_data).decode("utf-8")
    
    # Validate encoding
    if len(base64_image) % 4 == 1:
        raise ValueError("Invalid base64 encoding")
    
    return base64_image


def get_image_metadata(image_path: str, base64_image: str) -> Dict[str, Any]:
    """
    Get metadata about an image.
    
    Args:
        image_path: Path to the image file
        base64_image: Base64 encoded image string
        
    Returns:
        Dictionary containing image metadata
    """
    with open(image_path, "rb") as f:
        size_bytes = len(f.read())
    
    return {
        "path": image_path,
        "size_bytes": size_bytes,
        "base64_length": len(base64_image)
    }


def format_search_results(results: list) -> str:
    """
    Format search results into a readable string.
    
    Args:
        results: List of search result dictionaries
        
    Returns:
        Formatted string of search results
    """
    if not results:
        return "No search results available."
    
    formatted = []
    for idx, result in enumerate(results, 1):
        formatted.append(
            f"{idx}. {result.get('title', 'No title')}\n"
            f"   URL: {result.get('url', 'N/A')}\n"
            f"   Content: {result.get('content', 'No content')}\n"
        )
    
    return "\n".join(formatted)
