import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from langchain_groq import ChatGroq
# Load environment variables from a .env file
import os
from dotenv import load_dotenv
load_dotenv()
os.environ["GROQ_API_KEY"] = os.getenv('GROQ_API_KEY') # OpenAI API key

# Download necessary NLTK resources. In production, consider handling downloads separately.
nltk.download('punkt')
nltk.download('stopwords')

class OptimizationEngine:
    """
    The OptimizationEngine acts as a middleware that either rewrites user queries
    or extracts keywords from AI responses to frame a search phrase.
    """
    def __init__(self):
        self.stop_words = set(stopwords.words('english'))
        self.groq = ChatGroq(model = "llama3-8b-8192", temperature=0.5, max_tokens=1024)

    def optimize_user_query(self, user_query: str) -> str:
        """
        Optimizes or rewrites the user query to improve clarity and formatting.
        
        For demonstration purposes, this method:
        - Strips whitespace,
        - Converts the text to lowercase,
        - Removes punctuation.
        
        In a real-world application, you might integrate NLP models to rephrase or enrich the query.
        """
        # optimized = user_query.strip().lower()
        # Remove punctuation using a regular expression.
        # optimized = re.sub(r'[^\w\s]', '', optimized)
        print("User Query:", user_query)
        # More advanced optimization logic could be inserted here.
        messages = [(
            "system",
            "Given an user query, the objective is to rewrite it for getting the best llm response. Strictly return only the optimized query. No other content should be returned."),
        (
            "user", 
            user_query
        )]
        re_query = self.groq.invoke(messages)
        print("Search Query:", re_query.content)

        return re_query.content

    def extract_keywords_and_frame_search(self, ai_response: str) -> str:
        """
        Extracts keywords from an AI-generated response and constructs a Google search phrase.
        
        The method tokenizes the text, filters out stop words, and selects a limited number
        of keywords to form a concise search query.
        """
        tokens = word_tokenize(ai_response)
        # Filter out stop words and non-alphabetic tokens.
        keywords = [word for word in tokens if word.lower() not in self.stop_words and word.isalpha()]
        print("Keywords extracted from AI response:", keywords)

        messages = [("system", "Given a list of keywords, the objective is to use the keywords to frame a search query. The search query should be a string that can be used to search on Google. Make sure the query does not exceed 30 keywords. Strictly return only the search query. No other content should be returned."),
                    ("user", str(keywords))]
        
        search_query = self.groq.invoke(messages)

        # For demonstration, join the first 5 keywords into a search phrase.
        return search_query.content

class Agent:
    """
    Base Agent class that interacts with the OptimizationEngine.
    
    Depending on the type of input, the agent directs the engine to either optimize a query
    or process an AI response.
    """
    def __init__(self, name: str, engine: OptimizationEngine):
        self.name = name
        self.engine = engine

    def process_input(self, input_text: str, input_type: str) -> str:
        """
        Processes input based on its type.
        
        - If the input_type is 'user_query', it calls the optimization function.
        - If the input_type is 'ai_response', it calls the keyword extraction function.
        """
        if input_type == "user_query":
            optimized_query = self.engine.optimize_user_query(input_text)
            # In a full system, the optimized query might be forwarded to a vision agent.
            return optimized_query
        elif input_type == "ai_response":
            search_query = self.engine.extract_keywords_and_frame_search(input_text)
            return search_query
        else:
            raise ValueError("Unsupported input type. Use 'user_query' or 'ai_response'.")

# Example usage in a main function.
def main():
    # Instantiate the optimization engine.
    engine = OptimizationEngine()

    # Create an agent that uses the engine.
    agent = Agent("QueryAgent", engine)

    # --- Case 1: Optimize a User Query ---
    user_query = "Query: find value of equation 2x + 3 - 2x^2 = -5."
    optimized_query = agent.process_input(user_query, "user_query")
    print("Optimized User Query:")
    print(optimized_query)
    print("-" * 50)

    # --- Case 2: Process an AI Response ---
    ai_response = (
        "The image shows a scenic view of a mountain range with a river flowing "
        "through the valley. The sky is clear, and the sun is setting in the background."
        "The image captures the beauty of nature in a serene landscape."
        "The image is a high-resolution photograph taken from a drone."
        "The image is suitable for use in travel brochures or websites promoting tourism."
    )
    search_query = agent.process_input(ai_response, "ai_response")
    print("Google Search Query from AI Response:")
    print(search_query)

if __name__ == '__main__':
    main()
