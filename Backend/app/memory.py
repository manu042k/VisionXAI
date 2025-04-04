import base64
from langchain_core.prompts import ChatPromptTemplate
from typing import AsyncGenerator, List
from langchain.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from typing import Dict, Any
from langchain_community.tools.tavily_search import TavilySearchResults
import os
class ImageChatBot:
    def __init__(self, model_name="gemini-2.0-flash-001", temperature=0.5):
        """Initialize the chatbot with environment variables and model."""
        self.vision_model = ChatGoogleGenerativeAI(
            model=model_name,
            temperature=temperature,
            max_retries=2,
        )
        self.system_prompt = """You are an expert in visual understanding. Your primary role is to analyze images and answer user questions based on their content. Pay close attention to details within the image to provide accurate and informative responses.
        Additionally, check for any bounding box and answer the question based on the bounding box with respect to the content of the entire image.
        You also have access to search results that might provide additional context. Use these results to enhance your understanding and answer the user's question more comprehensively.

        When responding:
        - Be descriptive about the visual elements present in the image.
        - Answer the user's question directly and concisely, incorporating relevant information from the search results if available.
        - If the answer is not directly discernible from the image or the search results, state that you cannot provide a definitive answer.
        - Avoid making assumptions or bringing in outside knowledge unless it is directly relevant and obvious from the image or supported by the search results.
        - Maintain a helpful and objective tone.
        - Return format should be in markdown format.

        For example, if a user asks 'What breed of dog is this?', you should examine the image. If the breed is not clear, you can use the search results to help identify it. If still uncertain, state that the breed cannot be definitively determined."""
        if  os.environ["TAVILY_API_KEY"]  is None:
            raise ValueError("Tavily API key must be provided.")
        self.search_tool = TavilySearchResults(max_results=2)

    def encode_image(self, image_path):
        """Encode an image to a base64 string."""
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")

    def _search(self, query: str) -> List[Dict[str, Any]]:
        """Perform a search using Tavily for the given query."""
        print(f"Performing Tavily search for: {query}")
        try:
            results = self.search_tool.run(query)
            formatted_results = []
            if isinstance(results, str):
                # TavilySearchResults might return a string directly
                formatted_results.append({"title": "Search Result", "snippet": results})
            elif isinstance(results, list):
                for item in results:
                    if isinstance(item, dict) and "url" in item and "content" in item:
                        formatted_results.append({"title": item["url"], "snippet": item["content"]})
                    elif isinstance(item, str):
                        formatted_results.append({"title": "Search Result", "snippet": item})
            return formatted_results
        except Exception as e:
            print(f"Error during Tavily search: {e}")
            return []

    def create_prompt(self, query, base64_image, search_results: List[Dict[str, Any]] = None):
        """Create a chat prompt template for the image query with a system prompt and optional search results."""
        messages = [("system", self.system_prompt)]
        if search_results:
            search_context = "\n\nSearch Results:\n"
            for i, result in enumerate(search_results):
                search_context += f"[{i+1}] {result['title']}: {result['snippet']}\n"
            messages.append(("system", search_context))
        messages.append(("user", query))
        messages.append(
            (
                "user",
                [
                    {
                        "type": "image_url",
                        "image_url": {"url": f"{base64_image}"},
                    }
                ],
            )
        )
        return ChatPromptTemplate.from_messages(messages)

    def get_response(self, query, base64_image):
        """Generate a response for the given query and image with optional search."""
        search_results = self._search(query)
        prompt = self.create_prompt(query, base64_image, search_results=search_results)
        chain = prompt | self.vision_model

        response = chain.invoke({"base64_image": base64_image})
        print(response.content)
        return response.content

    async def stream_response(self, query: str, base64_image: str) -> AsyncGenerator:
        """Stream the response for the given query and image with optional search."""
        search_results = self._search(query)
        try:
            prompt = self.create_prompt(query, base64_image, search_results=search_results)
            chain = prompt | self.vision_model
            async for chunk in chain.astream({"base64_image": base64_image}):
                yield chunk.content

        except Exception as e:
            print(f"Error in stream_response: {e}")
            yield f"Error: {str(e)}"

