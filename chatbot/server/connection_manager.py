import asyncio
from contextlib import AsyncExitStack
from mcp import ClientSession, StdioServerParameters
from mcp.client.sse import sse_client

class ConnectionManager:
    def __init__(self, sse_server_map):
        self.sse_server_map = sse_server_map
        self.sessions = {}
        self.exit_stack = AsyncExitStack()

    async def initialize(self):
        # Initialize SSE connections
        for server_name, url in self.sse_server_map.items():
            sse_transport = await self.exit_stack.enter_async_context(
                sse_client(url=url)
            )
            read, write = sse_transport
            session = await self.exit_stack.enter_async_context(
                ClientSession(read, write)
            )
            await session.initialize()
            self.sessions[server_name] = session

    async def list_tools(self):
        tool_map = {}
        consolidated_tools = []
        for server_name, session in self.sessions.items():
            tools = await session.list_tools()
            tool_map.update({tool.name: server_name for tool in tools.tools})
            consolidated_tools.extend(tools.tools)
        return tool_map, consolidated_tools

    async def call_tool(self, tool_name, arguments, tool_map):
        server_name = tool_map.get(tool_name)
        if not server_name:
            print(f"Tool '{tool_name}' not found.")
            return

        session = self.sessions.get(server_name)
        if session:
            result = await session.call_tool(tool_name, arguments=arguments)
            return result.content[0].text

    async def close(self):
        await self.exit_stack.aclose()


# if __name__ == "__main__":
#     sse_server_map = {
#         "python_executor_mcp": "http://localhost:8001/sse",
#     }

#     async def main():
#         connection_manager = ConnectionManager(sse_server_map)
#         await connection_manager.initialize()

#         tool_map, tool_objects = await connection_manager.list_tools()

#         print(tool_map)
#         print(tool_objects)

#         tool_result = await connection_manager.call_tool("search_google", {"query": "đại học lạc hồng"}, tool_map)
#         print(tool_result)
#         await connection_manager.close()

#     asyncio.run(main())