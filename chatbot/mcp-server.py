from mcp.server.fastmcp import FastMCP
from duckduckgo_search import DDGS

mcp = FastMCP(
    name="mcp-server",
    host="0.0.0.0",
    port="8001"
)

@mcp.tool()
def search_google(query: str) -> list:
    """Search google with query"""
    results = DDGS().text(query, max_results=10)
    return results

if __name__ == "__main__":
    mcp.run(transport='sse')
