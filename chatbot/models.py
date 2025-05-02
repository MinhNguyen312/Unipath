from pydantic import BaseModel
from typing import List, Optional, Union

class Content(BaseModel):
    role: str
    parts: List[dict]

class GenerationRequest(BaseModel):
    system_instruction: Optional[Content] = None
    contents: List[Content]
