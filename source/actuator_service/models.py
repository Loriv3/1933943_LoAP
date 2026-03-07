from pydantic import BaseModel, Field
from typing import Dict, Optional, List, Union, Literal

class MetricValue(BaseModel):
    value: float
    unit: str

class MetricItem(BaseModel):
    metric_id: str
    type: str
    value: List[MetricValue]

class MetricEvent(BaseModel):
    type: Literal["metric"] = Field(..., description="Identifica l'evento come metrica")
    group_id: str
    updated_at: str
    metrics: List[MetricItem]
    status: Optional[str] = None

class ActuatorEvent(BaseModel):
    type: Literal["actuator"] = Field(..., description="Identifica l'evento come attuatore")
    actuator_id: str
    is_on: bool
    updated_at: str

AnyDeviceEvent = Union[MetricEvent, ActuatorEvent]

class CommandRequest(BaseModel):
    state: Literal["ON", "OFF"]