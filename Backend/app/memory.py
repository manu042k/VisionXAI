import base64
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain.memory import ConversationBufferMemory
import os
from app.config import load_environment
from dotenv import load_dotenv
from uuid import uuid4

class ImageChatBot:
    def __init__(self, model_name="llama-3.2-11b-vision-preview"):
        """Initialize the chatbot with environment variables and model."""
        self.model = ChatGroq(model=model_name)
        self.messages = []

    
    def encode_image(self,image_path):
        """Encode an image to a base64 string."""
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")

    def create_prompt(self, query, base64_image):
        """Create a chat prompt template for the image query."""
        messages = [
            ("user", query),
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

    def stream_response(self, query, base64_image):
        """Stream the response for the given query and image."""
        #todo: i plment websockets here
        prompt = self.create_prompt(query, base64_image)
        chain = prompt | self.model

        # Stream the response
        response_text = ""
        for chunk in chain.stream({"base64_image": base64_image}):
            print(chunk.content, end="")
            response_text += chunk.content
        self.messages.append(("assistant", response_text))
        return response_text




