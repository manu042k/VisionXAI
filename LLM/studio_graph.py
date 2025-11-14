"""
LangGraph Studio Compatible Graph Definition
This file exposes the image analyzer graph for visualization in LangGraph Studio.
"""
from graphs.image_analyzer import ImageAnalyzer

# Create the describer instance
describer = ImageAnalyzer()

# Export the compiled graph for LangGraph Studio
graph = describer.graph

__all__ = ['graph', 'describer']
