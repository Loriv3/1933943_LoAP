"""
Unified internal event schema.
Every message published to AMQ queues uses this format.
"""

from dataclasses import dataclass, field, asdict
from typing import Literal, Any
from datetime import datetime, timezone

CONVERTER_VERSION = "1.0.0"

SourceType = Literal["rest_sensor", "telemetry", "actuator"]


@dataclass
class Measurement:
    metric: str
    value: Any          # number or string (e.g. last_state in airlock)
    unit: str = ""


@dataclass
class UnifiedEvent:
    source_type: SourceType
    source_schema: str
    source_id: str
    timestamp: str
    status: str
    measurements: list[Measurement] = field(default_factory=list)
    converter_version: str = CONVERTER_VERSION

    def to_dict(self) -> dict:
        d = asdict(self)
        # reorder for readability
        return {
            "converter_version": d["converter_version"],
            "source_type":       d["source_type"],
            "source_schema":     d["source_schema"],
            "source_id":         d["source_id"],
            "timestamp":         d["timestamp"],
            "status":            d["status"],
            "measurements":      d["measurements"],
        }

    @staticmethod
    def now_iso() -> str:
        return datetime.now(timezone.utc).isoformat()