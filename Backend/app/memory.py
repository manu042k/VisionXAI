import base64
import os
import re
from typing import AsyncGenerator, List, Dict, Any

from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.tools.tavily_search import TavilySearchResults

class ImageChatBot:
    """
    An intelligent chatbot that can analyze images and answer questions,
    optionally using external search for context.
    """
    def __init__(
        self,
        model_name: str = "gemini-2.0-flash-001",
        temperature: float = 0.5,
        search_decision_model_name: str = "gemini-2.0-flash-001",
        search_decision_temperature: float = 0.3,
        max_search_results: int = 2,
        default_image_mime_type: str = "image/jpeg",  # Added default MIME type
    ):
        """
        Initializes the chatbot with language models and tools.
        """
        self.vision_model = ChatGoogleGenerativeAI(
            model=model_name, temperature=temperature, max_retries=2
        )
        self.search_decision_model = ChatGoogleGenerativeAI(
            model=search_decision_model_name,
            temperature=search_decision_temperature,
            max_retries=2,
        )
        self.search_tool = TavilySearchResults(max_results=max_search_results)
        self.system_prompt = self._load_system_prompt()
        self.default_image_mime_type = default_image_mime_type

        if "TAVILY_API_KEY" not in os.environ:
            raise ValueError(
                "Tavily API key must be provided as an environment variable 'TAVILY_API_KEY'."
            )

    def _load_system_prompt(self) -> str:
        """Loads the system prompt from a string."""
        return """You are an expert in visual understanding, acting as an intelligent agent.
Your primary role is to analyze images and answer user questions based on their content.
Pay close attention to details within the image to provide accurate and informative responses.
Also, check for any bounding boxes present in the image and answer questions based on the content within those boxes, considering the context of the entire image.

You have access to search results that might provide additional context.
Use these results to enhance your understanding and answer the user's question more comprehensively.
If the search results are relevant, cite them in your response using the format '[Source: Title of the search result]'.

When responding:
- Be descriptive about the visual elements present in the image.
- Answer the user's question directly and concisely.
- Incorporate relevant information from the search results if available, citing the source as instructed.
- If the answer is not directly discernible from the image or the search results, state that you cannot provide a definitive answer.
- Avoid making assumptions or bringing in outside knowledge unless it is directly relevant and obvious from the image or supported by the search results.
- Maintain a helpful and objective tone.
- Return format should be in markdown format.

For example, if a user asks 'What breed of dog is this?', you should examine the image. If the breed is not clear, you can use the search results to help identify it and cite the source if you find the answer."""

    def encode_image(self, image_path: str) -> str:
        """
        Encodes an image to a base64 string with proper padding.

        Raises an exception if the encoded string's length modulo 4 equals 1,
        indicating potential data corruption.
        """
        try:
            with open(image_path, "rb") as image_file:
                data = image_file.read()
                encoded_string = base64.b64encode(data).decode("utf-8")
                remainder = len(encoded_string) % 4
                if remainder:
                    if remainder == 1:
                        # This should not happen in valid base64 encoding.
                        raise Exception(
                            f"Invalid base64 encoding: length modulo 4 is 1. "
                            f"File may be corrupted: {image_path}"
                        )
                    else:
                        encoded_string += "=" * (4 - remainder)
                return encoded_string
        except FileNotFoundError:
            raise FileNotFoundError(f"Image file not found: {image_path}")
        except Exception as e:
            raise Exception(f"Error encoding image: {e}")

    def _should_search(self, query: str, base64_image: str) -> bool:
        """
        Determines if the query necessitates a search using an LLM, considering the image content.
        """
        prompt_template = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "You need to decide whether the following user query, in the context of having provided an image, requires looking up external information using a search engine to answer effectively. Consider the content of the image when making this decision. Respond with 'Yes' or 'No' only.",
                ),
                ("user", "User Query: {query}"),
                (
                    "user",
                    [
                        {
                            "type": "image_url",
                            "image_url": {"url": f"{base64_image}"},
                        }
                    ],
                ),
            ]
        )
        prompt = prompt_template.format_messages(query=query, base64_image=base64_image)
        response = self.search_decision_model.invoke(prompt)
        decision = response.content.strip().lower()
        return decision == "yes"

    def _search(self, query: str, base64_image: str) -> List[Dict[str, str]]:
        """
        Performs a search using Tavily for the given query, potentially incorporating image analysis.
        """
        print(f"Performing Tavily search for: {query}")
        try:
            # First, let's get a brief description of the image content to potentially enhance the search query.
            image_description_prompt_template = ChatPromptTemplate.from_messages(
                [
                    (
                        "system",
                        "Describe the key elements and context of the following image in a concise manner that could help in a web search.",
                    ),
                    (
                        "user",
                        [
                            {
                                "type": "image_url",
                                "image_url": {"url": f"{base64_image}"},
                            }
                        ],
                    ),
                ]
            )
            image_description_prompt = image_description_prompt_template.format_messages(base64_image=base64_image)
            image_description_response = self.vision_model.invoke(image_description_prompt)
            image_description = image_description_response.content.strip()
            print(f"Image Description for search: {image_description}")

            # Enhance the search query with the image description.
            enhanced_query = f"{query} related to {image_description}"
            print(f"Enhanced search query: {enhanced_query}")

            results = self.search_tool.run(enhanced_query)
            formatted_results = []
            if isinstance(results, str):
                formatted_results.append({"title": "Search Result", "snippet": results})
            elif isinstance(results, list):
                for item in results:
                    if isinstance(item, dict) and "url" in item and "content" in item:
                        formatted_results.append({"title": item["url"], "snippet": item["content"]})
                    elif isinstance(item, str):
                        formatted_results.append({"title": "Search Result", "snippet": item})

            # Further process or filter search results based on the image content if needed.
            # This could involve another LLM call to assess relevance.
            # For now, we'll just return the results.
            return formatted_results
        except Exception as e:
            print(f"Error during Tavily search: {e}")
            return []

    def create_prompt(
        self, query: str, base64_image: str, search_results: List[Dict[str, str]] = None
    ) -> ChatPromptTemplate:
        """
        Creates a chat prompt template.
        """
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

    def get_response(self, query: str, base64_image: str) -> str:
        """
        Generates a response with conditional search and source formatting.
        """
        search_results = []
        if self._should_search(query, base64_image):
            search_results = self._search(query, base64_image)

        prompt = self.create_prompt(query, base64_image, search_results=search_results)
        chain = prompt | self.vision_model

        response = chain.invoke({"base64_image": base64_image})
        return self._format_response_with_sources(response.content, search_results)

    async def stream_response(self, query: str, base64_image: str) -> AsyncGenerator[str, None]:
        """
        Streams the response for the given query and image with conditional search.
        """
        search_results = []
        if self._should_search(query, base64_image):
            search_results = self._search(query, base64_image)
        try:
            prompt = self.create_prompt(query, base64_image, search_results=search_results)
            chain = prompt | self.vision_model
            async for chunk in chain.astream({"base64_image": base64_image}):
                yield chunk.content
            yield self._format_response_with_sources("", search_results)
        except Exception as e:
            print(f"Error in stream_response: {e}")
            yield f"Error: {str(e)}"

    def _format_response_with_sources(self, response: str, search_results: List[Dict[str, str]]) -> str:
        """
        Formats the chatbot's response to include clickable citations for search results.
        Uses regex to detect inline citations of the form [Source: ...].
        If no inline citations are found, appends a clickable sources section.
        """
        if not search_results:
            return response

        # Check for inline citations like "[Source: Title]" (case-insensitive)
        citation_pattern = re.compile(r"\[source:\s*([^\]]+)\]", re.IGNORECASE)
        found_citations = citation_pattern.findall(response)

        if found_citations:
            return response

        # Append a markdown sources section if no inline citations were detected.
        sources_section = "\n\n**Sources:**\n"
        for idx, result in enumerate(search_results, start=1):
            # Attempt to get a URL from the search result; if missing, use the title as URL.
            url = result.get("url", result.get("title", ""))
            title = result.get("title", "Search Result")
            if url:
                sources_section += f"[{idx}] [{title}]({url})\n"
            else:
                sources_section += f"[{idx}] {title}\n"

        return response.rstrip() + sources_section


# Example usage (assuming 'image.jpg' exists and TAVILY_API_KEY is set as an environment variable):
if __name__ == "__main__":
    bot = ImageChatBot(default_image_mime_type="image/jpeg")
    try:
        # **Important:** Replace "image.jpg" with the actual path to your image file
        image_path = "image.jpg"
        base64_image = bot.encode_image(image_path)

        query_needs_search = "What is the capital of France?"
        response_needs_search = bot.get_response(query_needs_search, base64_image)
        print(f"Response (needs search):\n{response_needs_search}")

        query_no_search = "Describe the image."
        response_no_search = bot.get_response(query_no_search, base64_image)
        print(f"\nResponse (no search):\n{response_no_search}")

        # Example of streaming response
        async def stream_example():
            print("\nStreaming Response:")
            full_response = ""
            async for chunk in bot.stream_response(query_no_search, base64_image):
                print(chunk, end="", flush=True)
                full_response += chunk
            print()
            if bot._should_search(query_no_search, base64_image):
                search_results = bot._search(query_no_search, base64_image)
                formatted_full_response = bot._format_response_with_sources(full_response, search_results)
                print(f"\nFormatted Full Streamed Response:\n{formatted_full_response}")

        import asyncio
        asyncio.run(stream_example())

    except FileNotFoundError as e:
        print(f"Error: {e}")
    except ValueError as e:
        print(f"Error: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")


