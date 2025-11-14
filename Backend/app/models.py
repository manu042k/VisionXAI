from pydantic import BaseModel
from typing import Optional

class ImageRequest(BaseModel):
    query: str
    base64Image: str
    threadId: Optional[str] = "default_thread"

