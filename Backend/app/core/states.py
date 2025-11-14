"""
State Definitions
TypedDict classes for LangGraph state management.
"""

from typing import TypedDict, List, Dict, Optional, Any


class ImageAnalyzerState(TypedDict):
    """Complete state for the image analyzer graph."""
    # Identity & Input
    thread_id: str
    timestamp: str
    image_path: str
    query: str
    
    # Memory
    conversation_history: List[Dict[str, str]]
    
    # Image Processing
    base64_image: str
    image_metadata: Dict[str, Any]
    
    # Bounding Box Detection
    has_bounding_boxes: bool
    bounding_boxes: List[Dict[str, Any]]
    bbox_analyses: List[str]
    focused_bbox_ids: List[str]
    
    # Image Analysis
    global_image_context: str
    
    # Query Understanding
    query_analysis: Dict[str, Any]
    
    # Search Decision & Execution
    search_decision: Dict[str, Any]
    search_queries: List[str]
    search_results: List[Dict[str, Any]]
    
    # Response Generation
    synthesized_response: str
    final_response: str
    response_metadata: Dict[str, Any]
    
    # Control Flow
    next_action: str
    error: Optional[str]
