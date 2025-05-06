from pydantic import BaseModel
from typing import List, Optional, Union

class Content(BaseModel):
    role: str
    parts: List[dict]

class GenerationRequest(BaseModel):
    contents: List[Content]
