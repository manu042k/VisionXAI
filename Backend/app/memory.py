import base64
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain.memory import ConversationBufferMemory
import os
from config import load_environment
from dotenv import load_dotenv
from uuid import uuid4
import asyncio
from typing import AsyncGenerator

class ImageChatBot:
    def __init__(self, model_name="llama-3.2-90b-vision-preview"):
        """Initialize the chatbot with environment variables and model."""
        self.model = ChatGroq(model=model_name)
        self.messages = []
        print("Chatbot initialized")

    
    def encode_image(self,image_path):
        """Encode an image to a base64 string."""
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")

    def create_prompt(self, query, base64_image):
        """Create a chat prompt template for the image query."""
        messages = [
            ("user",query),
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
        self.messages.extend(messages)
        return ChatPromptTemplate.from_messages(messages)

    def get_response(self, query, base64_image):
        """Generate a response for the given query and image."""
        prompt = self.create_prompt(query, base64_image)
        chain = prompt | self.model

        # Get the response
        response = chain.invoke({"base64_image": base64_image})
        self.messages.append(("assistant", response.content))
        return response.content

    async def stream_response(self, query: str, base64_image: str) -> AsyncGenerator[str, None]:
        """Stream the response for the given query and image."""
        try:
            # Convert base64 to URL or handle the image data properly
            image_data = {
                "url": base64_image  # This might be the issue
                # or possibly need:
                # "image_data": base64_image
            }
            
            chain = self.get_conversation_chain()
            for chunk in chain.stream({"base64_image": image_data}):  # Update this line
                yield chunk
        except Exception as e:
            print(f"Error in stream_response: {e}")
            yield f"Error: {str(e)}"




