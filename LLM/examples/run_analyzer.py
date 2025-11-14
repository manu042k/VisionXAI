"""
Example: How to run the ImageAnalyzer
"""
import sys
import os

# Add the parent directory to the path to allow module imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from graphs.image_analyzer import ImageAnalyzer

def main():
    """
    Initializes and runs the image analyzer with a sample image and query.
    """
    # --- Prerequisites ---
    # 1. Make sure you have a .env file in the LLM/ directory with:
    #    GOOGLE_API_KEY=your_google_api_key
    #    TAVILY_API_KEY=your_tavily_api_key
    #
    # 2. Make sure you have a sample image at examples/test.jpeg
    # ---------------------

    print("Initializing Image Analyzer...")
    analyzer = ImageAnalyzer()

    # Define the path to your image and your query
    image_path = "examples/test.jpeg"
    query = "What is this image about? Search the web for more context if needed."
    thread_id = "session_123"

    if not os.path.exists(image_path):
        print(f"❌ Error: Image file not found at {image_path}")
        print("Please make sure you have a sample image named 'test.jpeg' in the 'examples' folder.")
        return

    print(f"Analyzing image: {image_path}")
    print(f"Query: {query}\n")

    # Run the analysis
    result = analyzer.analyze_image(
        image_path=image_path,
        query=query,
        thread_id=thread_id
    )

    # Print the final response
    if result and not result.get("error"):
        print("\n--- Analysis Complete ---")
        print(result.get("final_response", "No response generated."))
        print("-------------------------\n")
    elif result:
        print(f"\n--- Error ---")
        print(result.get("error"))
        print("---------------\n")

if __name__ == "__main__":
    main()
