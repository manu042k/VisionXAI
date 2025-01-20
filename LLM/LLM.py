import os
import base64
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

class ImageChatBot:
    def __init__(self, model_name="llama-3.2-11b-vision-preview"):
        """Initialize the chatbot with environment variables and model."""
        load_dotenv()
        os.environ["LANGSMITH_TRACING"] = "false"
        os.environ["LANGSMITH_API_KEY"] = os.getenv("LANGSMITH_API_KEY")
        os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY")
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
                        "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"},
                    }
                ],
            ),
        ]
        self.messages.extend(messages)
        return ChatPromptTemplate.from_messages(messages)

    def get_response(self, query, image_path):
        """Generate a response for the given query and image."""
        base64_image = self.encode_image(image_path)
        prompt = self.create_prompt(query, base64_image)
        chain = prompt | self.model

        # Get the response
        response = chain.invoke({"base64_image": base64_image})
        self.messages.append(("assistant", response.content))
        return response.content

    def stream_response(self, query, image_path):
        """Stream the response for the given query and image."""
        base64_image = self.encode_image(image_path)
        prompt = self.create_prompt(query, base64_image)
        chain = prompt | self.model

        # Stream the response
        response_text = ""
        for chunk in chain.stream({"base64_image": base64_image}):
            print(chunk.content, end="")
            response_text += chunk.content
        self.messages.append(("assistant", response_text))
        return response_text

    def chat(self, image_path):
        """Start an interactive chat session with the model."""
        print("\nWelcome to the Image Chat Bot! Type 'exit' to quit.\n")
        while True:
            user_input = input("You: ").strip()
            if user_input.lower() == "exit":
                print("Exiting chat. Goodbye!")
                break

            try:
                response = self.get_response(user_input, image_path)
                print(f"Bot: {response}\n")
            except Exception as e:
                print(f"Error: {e}\n")


# Example Usage
if __name__ == "__main__":
    image_path = "download.png"  # Path to your image
    chatbot = ImageChatBot()
    chatbot.chat(image_path)
