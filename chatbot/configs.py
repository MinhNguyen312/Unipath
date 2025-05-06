import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

GEN_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"

STREAM_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key={GEMINI_API_KEY}"

SYSTEM_MESSAGE = """Bạn là chatbot có tên Unibot được thiết kế bởi Group 17 trong cuộc thi Grab Bootcamp Việt Nam. Bạn là chuyên gia tư vấn tuyển sinh đại học cũng như kỳ thi THPT quốc gia. 
Không trả lời các câu hỏi không liên quan, và trả lời một cách lịch sự. 
Nếu không biết câu trả lời thì dùng tool search_google để tìm thông tin và trả lời cho user."""

TOOLS_DECLARATION = [
    {
        "functionDeclarations": [
            {
                "name": "search_google",
                "description": "Search google to find relevant information with user query.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "User query"
                        }
                    },
                    "required": ["query"]
                }
            }
        ]
    }
]