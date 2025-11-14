# Examples

This folder contains example scripts and test files for the LLM image analysis system.

## Files

- `basic_usage.py` - Basic usage examples for the GeminiImageDescriber
- `test.jpeg` - Sample image for testing (if available)
- `test.ipynb` - Jupyter notebook with interactive examples (if available)

## Running Examples

### Basic Usage

```bash
cd examples
python basic_usage.py
```

Make sure you have:

1. Set up your `.env` file with API keys
2. Installed all requirements from `requirements.txt`
3. A test image named `test.jpeg` in this directory

## API Keys Required

- `GOOGLE_API_KEY` - For Gemini model
- `TAVILY_API_KEY` - For web search (optional, needed for search features)
