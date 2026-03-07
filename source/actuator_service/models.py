from pydantic import BaseModel, Field
from typing import Dict, Optional, List, Union, Literal

class MetricValue(BaseModel):
    value: Union[float, str]
    unit: str

class MetricItem(BaseModel):
    metric_id: str = Field(alias="id")
    type: str
    value: List[MetricValue]

class MetricEvent(BaseModel):
    type: Literal["metric"] = Field(default="metric", description="Identifica l'evento come metrica")
    group_id: str
    # Mappa la chiave 'at' su 'updated_at'
    updated_at: str = Field(alias="at")
    metrics: List[MetricItem]
    status: Optional[str] = None
    converter_version: Optional[str] = None # Aggiunto per evitare warning

class ActuatorEvent(BaseModel):
    type: Literal["actuator"] = Field(..., description="Identifica l'evento come attuatore")
    actuator_id: str
    is_on: bool
    updated_at: str = Field(..., alias="at")

AnyDeviceEvent = Union[MetricEvent, ActuatorEvent]

class CommandRequest(BaseModel):
    state: Literal["ON", "OFF"]