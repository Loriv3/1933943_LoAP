"""
Unified internal event schema — v2.
Basato sulla proposta di Sara: group_id + metrics[].id + metrics[].type
"""

from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from typing import Any

CONVERTER_VERSION = "1.0.0"


@dataclass
class MetricValue:
    value: Any
    unit: str


@dataclass
class Metric:
    id: str
    type: str
    value: list[MetricValue]


@dataclass
class UnifiedEvent:
    group_id: str
    at: str
    metrics: list[Metric]
    status: str
    converter_version: str = CONVERTER_VERSION

    def to_dict(self) -> dict:
        return {
            "converter_version": self.converter_version,
            "group_id":          self.group_id,
            "at":                self.at,
            "metrics": [
                {
                    "id":    m.id,
                    "type":  m.type,
                    "value": [{"value": v.value, "unit": v.unit} for v in m.value],
                }
                for m in self.metrics
            ],
            "status": self.status,
        }

    @staticmethod
    def now_iso() -> str:
        return datetime.now(timezone.utc).isoformat()


def metric(id: str, type: str, value: Any, unit: str) -> Metric:
    """Shorthand per creare un Metric con un singolo valore."""
    return Metric(id=id, type=type, value=[MetricValue(value=value, unit=unit)])


# ─── Actuator Event ───────────────────────────────────────────────────────────

@dataclass
class ActuatorEvent:
    actuator_id: str
    is_on: bool
    updated_at: str

    def to_dict(self) -> dict:
        return {
            "actuator_id": self.actuator_id,
            "is_on":       self.is_on,
            "updated_at":  self.updated_at,
        }

    @staticmethod
    def now_iso() -> str:
        return datetime.now(timezone.utc).isoformat()