# Backend

The `Backend` directory is responsible for the server-side operations of the VisionXAI project. It provides essential services and functionalities to support the frontend application and ensure smooth data processing and communication.

## Key Functionalities

### `memory.py`

- **ImageChatBot Class**: This class is the core of the backend's image analysis and chat functionality. It uses language models to analyze images and answer user queries, optionally using external search results for context.

  - **Image Analysis**: The bot can analyze images to provide detailed descriptions and answer questions based on the image content.
  
  - **Search Integration**: It can decide whether a query requires additional context from a web search and perform searches using the Tavily API.
  
  - **Response Generation**: Generates responses that incorporate image analysis and search results, formatted in markdown for clarity.

  - **Streaming Responses**: Supports streaming responses for real-time interaction with users.

### `main.py`

- **FastAPI Application**: This file sets up the FastAPI application, which serves as the backend API for the VisionXAI project.

  - **CORS Middleware**: Configures CORS to allow requests from any origin, supporting cross-origin resource sharing.

  - **Root Endpoint**: Provides a simple root endpoint to verify that the API is running.

  - **Chat Endpoint**: Processes chat requests by receiving an image and a query, then using the `ImageChatBot` to generate a response.

  - **Stream Chat Endpoint**: Similar to the chat endpoint, but streams the response for real-time interaction.

## Setup Instructions

1. **Install Dependencies**: Use the `requirements.txt` file to install all necessary Python packages with `pip install -r requirements.txt`.

2. **Configuration**: Ensure that all configuration files, such as `vercel.json`, are set up correctly for your environment.

## Running the Application

- **Development Server**: Start the development server using a command like `uvicorn app.main:app --reload`, ensuring that all necessary environment variables are configured.

- **Production Deployment**: Use `vercel.json` to configure deployment settings for platforms like Vercel.

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Python Documentation](https://docs.python.org/3/) 