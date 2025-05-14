from mcp.server.fastmcp import FastMCP
from duckduckgo_search import DDGS

import time


mcp = FastMCP(
    name="mcp-server",
    host="0.0.0.0",
    port="8001"
)

@mcp.tool()
def search_google(query: str) -> str:
    """Search google with query"""
    time.sleep(1)
    results = "Năm 2025, trường tuyển sinh khoá đầu tiên ngành Công nghệ giáo dục với chỉ tiêu khoảng 70 sinh viên. Nhà trường cũng đang trong quá trình xây dựng các ngành mang tính liên ngành khác như khoa học tích hợp hoặc kinh tế đất đai."
    return str(results)

if __name__ == "__main__":
    mcp.run(transport='sse')
