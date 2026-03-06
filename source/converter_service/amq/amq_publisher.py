"""
AMQ Publisher — pubblica su ActiveMQ Artemis via STOMP su porta 61616.

Code:
  - sensor.events    → sensori REST + telemetry (multicast)
  - actuator.commands → stato attuatori (anycast)
"""

import json
import logging
import stomp

from schema import UnifiedEvent, ActuatorEvent

logger = logging.getLogger(__name__)

SENSORS_QUEUE   = "sensor.events"
ACTUATORS_QUEUE = "actuator.states"


class AMQPublisher:
    def __init__(self, host: str = "localhost", port: int = 61616):
        self.host = host
        self.port = port
        self._conn: stomp.Connection | None = None

    def connect(self):
        self._conn = stomp.Connection([(self.host, self.port)])
        self._conn.connect(wait=True)
        logger.info(f"Connected to ActiveMQ Artemis at {self.host}:{self.port}")

    def disconnect(self):
        if self._conn and self._conn.is_connected():
            self._conn.disconnect()
            logger.info("Disconnected from ActiveMQ")

    def _publish(self, destination: str, body: dict):
        if not self._conn or not self._conn.is_connected():
            logger.warning("AMQ not connected, attempting reconnect...")
            self.connect()
        self._conn.send(
            destination=destination,
            body=json.dumps(body),
            content_type="application/json"
        )

    def publish_sensor(self, event: UnifiedEvent):
        self._publish(SENSORS_QUEUE, event.to_dict())
        logger.debug(f"[sensor.events] {event.group_id} | status={event.status}")

    def publish_actuator(self, event: ActuatorEvent):
        self._publish(ACTUATORS_QUEUE, event.to_dict())
        logger.debug(f"[actuator.commands] {event.actuator_id} | is_on={event.is_on}")