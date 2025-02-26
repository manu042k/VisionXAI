import base64
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from typing import AsyncGenerator
from langchain.prompts import PromptTemplate
from groq import Groq

class ImageChatBot:
    def __init__(self, model_name="llama-3.2-90b-vision-preview", temperature=0.5):
        """Initialize the chatbot with environment variables and model."""
        self.vision_model  = ChatGroq(model=model_name, temperature=temperature)
        self.text_model = ChatGroq(model="llama-3.1-8b-instant", temperature=temperature)


    def encode_image(self, image_path):
        """Encode an image to a base64 string."""
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")

    def create_prompt(self, query, base64_image):
        """Create a chat prompt template for the image query."""
        messages = [
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


#yield """<div class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg shadow-md max-w-max">
#     <!-- Logo Image with Reduced Size -->
#     <img src="https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg" alt="OpenAI Logo" class="w-6 h-6 rounded-full border-2 border-sky-500">
    
#     <!-- Link with Hover, Focus, and Transition Effects -->
#     <a href="https://www.wikipedia.org" 
#        class="text-gray-700 hover:text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600 transition duration-300 text-lg font-semibold"
#        target="_blank" 
#        rel="noopener noreferrer">
#         Visit Wikipedia
#     </a>
    
#     <!-- Spinning Google Icon -->
#     <i class="pi pi-spin pi-google text-2xl text-sky-600"></i>
# </div>


# """ 