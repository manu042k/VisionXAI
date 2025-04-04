import base64
from langchain_core.prompts import ChatPromptTemplate
from typing import AsyncGenerator
from langchain.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

class ImageChatBot:
    def __init__(self, model_name="gemini-2.0-flash-001", temperature=0.5):
        """Initialize the chatbot with environment variables and model."""
        self.vision_model = ChatGoogleGenerativeAI(
        model=model_name,
        temperature=temperature,
        max_retries=2,
    )
        self.system_prompt = """You are an expert in visual understanding. Your primary role is to analyze images and answer user questions based on their content. Pay close attention to details within the image to provide accurate and informative responses.
        Addinationlly, check for any bouding box answer the question based on the bounding box with respect to content of entire image.
        When responding:
        - Be descriptive about the visual elements present in the image.
        - Answer the user's question directly and concisely.
        - If the answer is not directly discernible from the image, state that you cannot provide a definitive answer based on the visual information.
        - Avoid making assumptions or bringing in outside knowledge unless it is directly relevant and obvious from the image.
        - Maintain a helpful and objective tone.
        - return format should be in markdown format.

        For example, if a user asks 'What color is the car?', you should examine the image and respond with the color you see. If the car is not clearly visible, you should say something like 'The color of the car is not clearly visible in this image.'"""

    def encode_image(self, image_path):
        """Encode an image to a base64 string."""
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")

    def create_prompt(self, query, base64_image):
        """Create a chat prompt template for the image query with a system prompt."""
        messages = [
            ("system", self.system_prompt),
            ("user",  query),
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
        return ChatPromptTemplate.from_messages(messages)

    def get_response(self, query, base64_image):
        """Generate a response for the given query and image."""
        prompt = self.create_prompt(query, base64_image)
        chain = prompt | self.vision_model

        # Get the response
        response = chain.invoke({"base64_image": base64_image})
        print(response.content)
        return response.content

    async def stream_response(self, query: str, base64_image: str) -> AsyncGenerator:
        """Stream the response for the given query and image."""
        try:
            prompt = self.create_prompt(query, base64_image)
            chain = prompt | self.vision_model
            async for chunk in chain.astream({"base64_image": base64_image}):
                yield chunk.content

        except Exception as e:
            print(f"Error in stream_response: {e}")
            yield f"Error: {str(e)}"

