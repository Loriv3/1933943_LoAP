from pydantic import BaseModel

class PostActuatorStateRequest(BaseModel):
    is_on: bool
