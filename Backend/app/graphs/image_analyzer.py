"""
Image Analyzer with LangGraph
Advanced implementation with memory, bounding box detection, and comprehensive analysis.
"""

import os
import base64
import json
import re
from datetime import datetime
from typing import Dict, Any, List
from dotenv import load_dotenv

from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from langchain_core.tools import tool

from ..core.states import ImageAnalyzerState
from ..tools.web_search import search_web_detailed

# Load environment variables
load_dotenv()

class ImageAnalyzer:
    """
    Advanced image analysis system with:
    - Conversation Memory
    - Bounding Box Detection & Analysis
    - Context-Aware Search Decision
    - Comprehensive Summarization with Citations
    """
    
    def __init__(
        self,
        model_name: str = "gemini-2.5-flash",
        temperature: float = 0.7,
        enable_memory: bool = True
    ):
        """Initialize the analyzer with all capabilities."""
        google_api_key = os.getenv("GOOGLE_API_KEY")
        if google_api_key:
            os.environ["GOOGLE_API_KEY"] = google_api_key
        
        self.model = ChatGoogleGenerativeAI(model=model_name, temperature=temperature)
        self.decision_model = ChatGoogleGenerativeAI(model=model_name, temperature=0.3)
        
        self.memory_enabled = enable_memory
        self.memory = MemorySaver() if enable_memory else None
        
        self.graph = self._create_graph()
        
        print(f"✅ Image Analyzer initialized")
        print(f"   Model: {model_name}")
        print(f"   Memory: {'Enabled' if enable_memory else 'Disabled'}")

    # ========================================================================
    # NODE 1: LOAD MEMORY AND ENCODE IMAGE
    # ========================================================================
    
    def load_memory_and_encode(self, state: ImageAnalyzerState) -> ImageAnalyzerState:
        """Node: Load conversation history and use provided base64 image."""
        print(f"\n[1/8] 📚🖼️  Loading memory and processing image...")
        
        try:
            thread_id = state.get("thread_id", "default")
            if not state.get("conversation_history"):
                state["conversation_history"] = []
            history_count = len(state["conversation_history"])
            print(f"   ✓ Loaded {history_count} previous messages for thread: {thread_id}")
        except Exception as e:
            print(f"   ⚠️  Error loading memory: {e}")
            state["conversation_history"] = []
        
        try:
            base64_image = state.get("base64_image")
            if not base64_image:
                raise ValueError("No base64 image provided in the state.")

            # Strip data URL prefix if present (e.g., "data:image/png;base64,")
            if base64_image.startswith('data:'):
                base64_image = base64_image.split(',', 1)[1]
                state["base64_image"] = base64_image

            # Basic validation
            if len(base64_image) % 4 != 0:
                 # Attempt to fix padding
                padding = '=' * (4 - len(base64_image) % 4)
                base64_image += padding
                state["base64_image"] = base64_image

            image_data = base64.b64decode(base64_image)

            state["image_metadata"] = {
                "size_bytes": len(image_data),
                "base64_length": len(base64_image)
            }
            state["error"] = None
            print(f"   ✓ Image processed successfully ({len(image_data)} bytes)")
        except Exception as e:
            error_msg = f"Error processing base64 image: {str(e)}"
            state["error"] = error_msg
            print(f"   ✗ {error_msg}")
        
        return state

    # ========================================================================
    # NODE 2: DETECT BOUNDING BOXES
    # ========================================================================
    
    def detect_bounding_boxes(self, state: ImageAnalyzerState) -> ImageAnalyzerState:
        """Node: Detect if image has bounding box annotations."""
        print(f"\n[2/8] 🔍 Detecting bounding boxes...")
        if state.get("error"): return state
        
        try:
            base64_image = state["base64_image"]
            prompt = """Analyze this image carefully. Are there any bounding boxes, rectangles, 
or annotated regions drawn on it? Respond ONLY with valid JSON:
{
  "has_boxes": true or false, "count": number of boxes,
  "boxes": [{"id": "box1", "color": "red", "location": "top-left", "label": "text label or null", "contains": "brief description"}]
}"""
            message = HumanMessage(content=[{"type": "text", "text": prompt}, {"type": "image_url", "image_url": f"data:image/jpeg;base64,{base64_image}"}])
            response = self.decision_model.invoke([message])
            response_text = re.sub(r'```json\s*|\s*```', '', response.content.strip())
            detection_result = json.loads(response_text)
            
            state["has_bounding_boxes"] = detection_result.get("has_boxes", False)
            state["bounding_boxes"] = detection_result.get("boxes", [])
            
            if state["has_bounding_boxes"]:
                print(f"   ✓ Detected {len(state['bounding_boxes'])} bounding box(es)")
            else:
                print(f"   ✓ No bounding boxes detected")
        except Exception as e:
            print(f"   ⚠️  Error detecting bounding boxes: {e}")
            state["has_bounding_boxes"] = False
            state["bounding_boxes"] = []
        
        return state

    # ========================================================================
    # NODE 3: ANALYZE BOUNDING BOXES
    # ========================================================================
    
    def analyze_bounding_boxes(self, state: ImageAnalyzerState) -> ImageAnalyzerState:
        """Node: Deep analysis of each bounding box region."""
        print(f"\n[3/8] 📦 Analyzing bounding box contents...")
        if state.get("error") or not state.get("has_bounding_boxes"): return state
        
        try:
            base64_image = state["base64_image"]
            boxes = state["bounding_boxes"]
            bbox_analyses = []
            
            for box in boxes:
                box_id = box.get("id", "unknown")
                prompt = f"""Focus exclusively on the region inside the bounding box identified as {box_id}. Describe in detail what is inside this box."""
                message = HumanMessage(content=[{"type": "text", "text": prompt}, {"type": "image_url", "image_url": f"data:image/jpeg;base64,{base64_image}"}])
                response = self.model.invoke([message])
                bbox_analyses.append(f"[{box_id}] {response.content.strip()}")
                print(f"   ✓ Analyzed {box_id}")
            
            state["bbox_analyses"] = bbox_analyses
        except Exception as e:
            print(f"   ⚠️  Error analyzing bounding boxes: {e}")
            state["bbox_analyses"] = []
        
        return state

    # ========================================================================
    # NODE 4: ANALYZE IMAGE GLOBALLY
    # ========================================================================
    
    def analyze_image_globally(self, state: ImageAnalyzerState) -> ImageAnalyzerState:
        """Node: Overall image understanding."""
        print(f"\n[4/8] 🌍 Analyzing overall image context...")
        if state.get("error"): return state
        
        try:
            base64_image = state["base64_image"]
            prompt = "Provide a comprehensive overview of this image, including the overall scene, main subjects, and background elements."
            message = HumanMessage(content=[{"type": "text", "text": prompt}, {"type": "image_url", "image_url": f"data:image/jpeg;base64,{base64_image}"}])
            response = self.model.invoke([message])
            state["global_image_context"] = response.content.strip()
            print(f"   ✓ Global analysis complete")
        except Exception as e:
            print(f"   ⚠️  Error in global analysis: {e}")
            state["global_image_context"] = "Error analyzing image"
        
        return state

    # ========================================================================
    # NODE 5: UNDERSTAND QUERY AND DECIDE SEARCH
    # ========================================================================
    
    def understand_and_decide_search(self, state: ImageAnalyzerState) -> ImageAnalyzerState:
        """Node: Parse user query and decide if search is needed."""
        print(f"\n[5/8] 🤔🎯 Understanding query and deciding search strategy...")
        if state.get("error"): return state
        
        try:
            # Build comprehensive context
            image_context = state.get("global_image_context", "")
            bbox_context = "\n".join(state.get("bbox_analyses", [])) if state.get("bbox_analyses") else ""
            user_query = state['query']
            
            prompt = f"""You are a search decision expert. Analyze if web search is needed based on:

USER QUERY: {user_query}

IMAGE CONTEXT: {image_context}

BOUNDING BOX DETAILS: {bbox_context if bbox_context else "No bounding boxes detected"}

Decide if web search is needed to answer the user's question. Search is needed when:
- Query asks about current events, news, or real-time information
- Query requires factual data not visible in the image (prices, specifications, reviews, etc.)
- Query asks about locations, businesses, or places mentioned in the image
- Image shows products/items that need external information
- Query requires comparison or verification of information

Search is NOT needed when:
- Question can be fully answered from image content alone
- Query is about visual elements, colors, layout, or composition
- Basic description or analysis of visible elements

Based on the image context and user query, provide:
1. Detailed search queries that combine both image context and user question
2. Make queries specific using information from the image

Respond with JSON only:
{{
  "should_search": true/false,
  "reasoning": "brief explanation",
  "search_queries": ["specific query 1", "specific query 2", "specific query 3"]
}}"""
            
            response = self.decision_model.invoke([HumanMessage(content=prompt)])
            decision = json.loads(re.sub(r'```json\s*|\s*```', '', response.content.strip()))
            
            state["search_decision"] = decision
            state["search_queries"] = decision.get("search_queries", [])
            
            if decision.get("should_search"):
                print(f"   ✓ Search NEEDED: {decision.get('reasoning', '')}")
                print(f"   📝 Queries: {state['search_queries']}")
            else:
                print(f"   ✓ Search NOT needed: {decision.get('reasoning', '')}")
        except Exception as e:
            print(f"   ⚠️  Error in search decision: {e}")
            state["search_decision"] = {"should_search": False}
            state["search_queries"] = []
        
        return state

    # ========================================================================
    # NODE 6: EXECUTE WEB SEARCH
    # ========================================================================
    
    def execute_web_search(self, state: ImageAnalyzerState) -> ImageAnalyzerState:
        """Node: Perform web searches."""
        print(f"\n[6/8] 🔎 Executing web searches...")
        if state.get("error"): return state
        
        try:
            search_queries = state.get("search_queries", [])
            all_results = []
            for query in search_queries:
                print(f"   Searching: {query}")
                result = search_web_detailed.invoke({"query": query})
                if "error" not in result:
                    all_results.extend(result.get("results", []))
            state["search_results"] = all_results
            print(f"   ✓ Found {len(all_results)} total results")
        except Exception as e:
            print(f"   ⚠️  Error executing search: {e}")
            state["search_results"] = []
        
        return state

    # ========================================================================
    # NODE 7: SYNTHESIZE AND FORMAT RESPONSE
    # ========================================================================
    
    def synthesize_and_format_response(self, state: ImageAnalyzerState) -> ImageAnalyzerState:
        """Node: Synthesize information and format final response."""
        print(f"\n[7/8] 🧠✨ Synthesizing and formatting response...")
        if state.get("error"): return state
        
        try:
            prompt = f"""Synthesize a comprehensive markdown response to the query "{state['query']}" using the following information:
- Global Context: {state.get('global_image_context', '')}
- BBox Analyses: {state.get('bbox_analyses', [])}
- Search Results: {state.get('search_results', [])}
Cite sources as [1], [2], etc. and include a "Sources" section."""
            response = self.model.invoke([HumanMessage(content=prompt)])
            state["final_response"] = response.content.strip()
            print(f"   ✓ Response synthesized")
        except Exception as e:
            print(f"   ⚠️  Error in synthesis: {e}")
            state["final_response"] = f"I encountered an error: {e}"
        
        return state

    # ========================================================================
    # NODE 8: UPDATE CONVERSATION MEMORY
    # ========================================================================
    
    def update_conversation_memory(self, state: ImageAnalyzerState) -> ImageAnalyzerState:
        """Node: Save interaction to conversation history."""
        print(f"\n[8/8] � Updating conversation memory...")
        try:
            if "conversation_history" not in state:
                state["conversation_history"] = []
            state["conversation_history"].append({"role": "user", "content": state["query"]})
            state["conversation_history"].append({"role": "assistant", "content": state["final_response"]})
            if len(state["conversation_history"]) > 20:
                state["conversation_history"] = state["conversation_history"][-20:]
            print(f"   ✓ Memory updated")
        except Exception as e:
            print(f"   ⚠️  Error updating memory: {e}")
        
        return state

    # ========================================================================
    # ROUTING FUNCTIONS
    # ========================================================================
    
    def route_after_encode(self, state: ImageAnalyzerState) -> str:
        return "error" if state.get("error") else "detect_boxes"
    
    def route_after_bbox_detection(self, state: ImageAnalyzerState) -> str:
        return "error" if state.get("error") else "analyze_boxes" if state.get("has_bounding_boxes") else "analyze_global"
    
    def route_after_search_decision(self, state: ImageAnalyzerState) -> str:
        return "error" if state.get("error") else "search" if state.get("search_decision", {}).get("should_search") else "synthesize_and_format"

    # ========================================================================
    # GRAPH CONSTRUCTION
    # ========================================================================
    
    def _create_graph(self) -> StateGraph:
        """Create the optimized 8-node LangGraph workflow."""
        workflow = StateGraph(ImageAnalyzerState)
        
        workflow.add_node("load_and_encode", self.load_memory_and_encode)
        workflow.add_node("detect_boxes", self.detect_bounding_boxes)
        workflow.add_node("analyze_boxes", self.analyze_bounding_boxes)
        workflow.add_node("analyze_global", self.analyze_image_globally)
        workflow.add_node("understand_and_decide", self.understand_and_decide_search)
        workflow.add_node("search", self.execute_web_search)
        workflow.add_node("synthesize_and_format", self.synthesize_and_format_response)
        workflow.add_node("update_memory", self.update_conversation_memory)
        
        workflow.set_entry_point("load_and_encode")
        
        workflow.add_conditional_edges("load_and_encode", self.route_after_encode, {"detect_boxes": "detect_boxes", "error": END})
        workflow.add_conditional_edges("detect_boxes", self.route_after_bbox_detection, {"analyze_boxes": "analyze_boxes", "analyze_global": "analyze_global", "error": END})
        workflow.add_edge("analyze_boxes", "analyze_global")
        workflow.add_edge("analyze_global", "understand_and_decide")
        workflow.add_conditional_edges("understand_and_decide", self.route_after_search_decision, {"search": "search", "synthesize_and_format": "synthesize_and_format", "error": END})
        workflow.add_edge("search", "synthesize_and_format")
        workflow.add_edge("synthesize_and_format", "update_memory")
        workflow.add_edge("update_memory", END)
        
        if self.memory:
            return workflow.compile(checkpointer=self.memory)
        return workflow.compile()

    # ========================================================================
    # PUBLIC INTERFACE
    # ========================================================================
    
    def analyze_image(self, image_path: str, query: str, thread_id: str = "default") -> Dict[str, Any]:
        """Main entry point for image analysis."""
        print(f"\n{'='*70}\n🚀 ANALYZING IMAGE\n{'='*70}")
        initial_state = {
            "thread_id": thread_id, "timestamp": datetime.now().isoformat(), "image_path": image_path, "query": query,
            "conversation_history": [], "base64_image": "", "image_metadata": {}, "has_bounding_boxes": False,
            "bounding_boxes": [], "bbox_analyses": [], "focused_bbox_ids": [], "global_image_context": "",
            "query_analysis": {}, "search_decision": {}, "search_queries": [], "search_results": [],
            "synthesized_response": "", "final_response": "", "response_metadata": {}, "next_action": "", "error": None
        }
        config = {"configurable": {"thread_id": thread_id}}
        result = self.graph.invoke(initial_state, config)
        
        print(f"\n{'='*70}\n📊 RESULTS\n{'='*70}")
        if result.get("error"):
            print(f"❌ Error: {result['error']}")
        else:
            print(result.get("final_response", "No response generated"))
        print("="*70 + "\n")
        return result
