# web_search_agent.py

from dotenv import load_dotenv
import os
from typing import Annotated, Generator, Any, List

from langchain_groq import ChatGroq
from langchain_core.tools import tool
from langchain_community.tools.tavily_search import TavilySearchResults
from typing_extensions import TypedDict

from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.types import Command, interrupt
from Crawler import CrawlerTool
from langchain_core.tools import tool

# Load environment variables
load_dotenv()


class State(TypedDict):
    messages: Annotated[list, add_messages]


crawler_tool_instance = CrawlerTool()

@tool
def crawl_webpages(urls: List[str]) -> str:
    """Crawl web pages from the given URLs and store their content."""
    results = crawler_tool_instance._run(urls)  # List[Dict[str, str]]
    return "\n\n".join([f"URL: {r['url']}\nContent:\n{r['content']}" for r in results])



def build_graph() -> Any:
    """Build and compile the state graph for the agent."""
    graph_builder = StateGraph(State)

    # Initialize tool and list of tools
    search_tool = TavilySearchResults(max_results=2)
    # crawler_tool = CrawlerTool()
    tools = [search_tool, crawl_webpages]

    # Initialize LLM and bind tools
    llm = ChatGroq(model="llama-3.1-8b-instant")
    llm_with_tools = llm.bind_tools(tools)

    def chatbot(state: State) -> State:
        """Invoke the LLM with the given state messages."""
        message = llm_with_tools.invoke(state["messages"])
        print(message)
        # Assuming at most one tool_call is expected.
        # assert len(message.tool_calls) <= 1 # type: ignore
        return {"messages": [message]}

    # Add nodes to the state graph
    graph_builder.add_node("chatbot", chatbot)

    tool_node = ToolNode(tools=tools)
    graph_builder.add_node("tools", tool_node)

    # Define edges between nodes
    graph_builder.add_conditional_edges("chatbot", tools_condition)
    graph_builder.add_edge("tools", "chatbot")
    graph_builder.add_edge(START, "chatbot")

    # Set up memory and compile the state graph
    memory = MemorySaver()
    graph = graph_builder.compile(checkpointer=memory)
    return graph


# Build the agent graph at module level so it can be reused.
GRAPH = build_graph()


def run_agent(user_input: str, config: dict = None) -> Generator[dict, None, None]: # type: ignore
    """
    Run the search agent with provided user input and configuration.
    
    Args:
        user_input (str): Input from the user.
        config (dict): Optional configuration dictionary.
        
    Returns:
        Generator[dict, None, None]: Stream of events from the graph.
    """
    if config is None:
        config = {"configurable": {"thread_id": "1"}}
    initial_state = {"messages": [{"role": "user", "content": user_input}]}
    return GRAPH.stream(initial_state, config, stream_mode="values")



if __name__ == "__main__":
    # Interactive loop for user input
    while True:
        try:
            user_input = input("User: ")
            if user_input.lower() in ["quit", "exit", "q"]:
                print("Goodbye!")
                break

            for event in run_agent(user_input):
                # print the last message from the assistant
                print("Assistant:", event["messages"][-1].content)
                print("\n")
        except Exception as e:
            print("Error:", e)
            break
