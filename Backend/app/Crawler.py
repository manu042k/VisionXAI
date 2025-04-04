import asyncio
from typing import List, Dict, Any, Optional, Type, Union, Tuple
import aiofiles
from pydantic import BaseModel, Field
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode


class CrawlerInput(BaseModel):
    """Input for the Crawler tool."""
    urls: List[str] = Field(description="List of URLs to crawl")


class CrawlerTool:
    """
    Tool for crawling web pages and storing their content.
    Attributes:
        name (str): The name of the tool.
        description (str): A brief description of the tool and its purpose.
        args_schema (Type[BaseModel]): The schema for the input arguments.
        max_concurrent (int): The maximum number of concurrent crawling tasks.
    Methods:
        process_and_store_document(url: str, content: str):
            Asynchronously processes and stores the content of a web page.
            Args:
                url (str): The URL of the web page.
                content (str): The content of the web page.
        crawl_parallel(urls: List[str]) -> List[Dict[str, str]]:
            Asynchronously crawls multiple URLs in parallel with a concurrency limit.
            Args:
                urls (List[str]): A list of URLs to crawl.
            Returns:
                List[Dict[str, str]]: A list of dictionaries containing the URL and its content.
        _run(urls: List[str]) -> List[Dict[str, str]]:
            Synchronously runs the tool to crawl the provided URLs.
            Args:
                urls (List[str): A list of URLs to crawl.
            Returns:
                List[Dict[str, str]]: A list of dictionaries containing the URL and its content.
        _arun(urls: List[str]) -> List[Dict[str, str]]:
            Asynchronously runs the tool to crawl the provided URLs.
            Args:
                urls (List[str): A list of URLs to crawl.
            Returns:
                List[Dict[str, str]]: A list of dictionaries containing the URL and its content.
    """
    """Tool for crawling web pages and storing their content."""

    name: str = "crawler_tool"
    description: str = (
        "CrawlerTool is an advanced web crawling or scrapping utility designed to efficiently fetch and extract content from web pages for real-time information retrieval."
        "It accepts a list of URLs as input and processes them concurrently using an asynchronous web crawler. "
        "The tool is optimized for large-scale data retrieval, handling dynamic content, and parsing structured data from diverse web sources. "
        "This makes it particularly useful for web scraping, data mining, content aggregation, and real-time information retrieval."
    )

    args_schema: Type[BaseModel] = CrawlerInput
    max_concurrent: int = 5

    async def process_and_store_document(self, url: str, content: str):
        filename = url.replace("https://", "").replace("/", "_") + ".txt"
        async with aiofiles.open(filename, 'w', encoding='utf-8') as f:
            await f.write(content)

    async def crawl_parallel(self, urls: List[str]) -> List[Dict[str, str]]:
        """Crawl multiple URLs in parallel with a concurrency limit."""
        browser_config = BrowserConfig(
            headless=True,
            verbose=False,
            extra_args=["--disable-gpu", "--disable-dev-shm-usage", "--no-sandbox"],
        )
        crawl_config = CrawlerRunConfig(cache_mode=CacheMode.BYPASS)

        crawler = AsyncWebCrawler(config=browser_config)
        await crawler.start()

        results = []

        try:
            semaphore = asyncio.Semaphore(self.max_concurrent)

            async def process_url(url: str):
                async with semaphore:
                    result = await crawler.arun(
                        url=url,
                        config=crawl_config,
                        session_id="session1"
                    )
                    if result.success:
                        print(f"Successfully crawled: {url}")
                        # await self.process_and_store_document(url, result.markdown_v2.raw_markdown)  # type: ignore
                        results.append({"url": url, "content": result.markdown_v2.raw_markdown}) # type: ignore
                    else:
                        print(f"Failed: {url} - Error: {result.error_message}")

            await asyncio.gather(*[process_url(url) for url in urls])
        finally:
            await crawler.close()

        return results

    def _run(self, urls: List[str]) -> List[Dict[str, str]]:
        """Run the tool synchronously."""
        return asyncio.run(self.crawl_parallel(urls))

    async def _arun(self, urls: List[str]) -> List[Dict[str, str]]:
        """Run the tool asynchronously."""
        return await self.crawl_parallel(urls)


# Example usage
if __name__ == "__main__":
    tool = CrawlerTool()
    urls = ["https://signoz.io/blog/python-elasticsearch-tutorial/#step-2-install-the-elasticsearch-python-client"]
    results = asyncio.run(tool._arun(urls))
    print(results)