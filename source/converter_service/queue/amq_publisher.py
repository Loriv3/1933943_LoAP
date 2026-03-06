"""
AMQ Publisher — invia UnifiedEvent alle code ActiveMQ via STOMP.
Due code:
  - /queue/sensors   → sensori REST + telemetry
  - /queue/actuators → stato attuatori (boot + update)
"""

import json
import logging
import stomp

from schema import UnifiedEvent

logger = logging.getLogger(__name__)

SENSORS_QUEUE   = "/queue/sensors"
ACTUATORS_QUEUE = "/queue/actuators"


class AMQPublisher:
    def __init__(self, host: str = "localhost", port: int = 61613):
        self.host = host
        self.port = port
        self._conn: stomp.Connection | None = None

    def connect(self):
        self._conn = stomp.Connection([(self.host, self.port)])
        self._conn.connect(wait=True)
        logger.info(f"Connected to ActiveMQ at {self.host}:{self.port}")

    def disconnect(self):
        if self._conn and self._conn.is_connected():
            self._conn.disconnect()
            logger.info("Disconnected from ActiveMQ")

    def _publish(self, queue: str, event: UnifiedEvent):
        if not self._conn or not self._conn.is_connected():
            logger.warning("AMQ not connected, attempting reconnect...")
            self.connect()
        body = json.dumps(event.to_dict())
        self._conn.send(destination=queue, body=body, content_type="application/json")
        logger.debug(f"Published to {queue}: {event.source_id}")

    def publish_sensor(self, event: UnifiedEvent):
        self._publish(SENSORS_QUEUE, event)

    def publish_actuator(self, event: UnifiedEvent):
        self._publish(ACTUATORS_QUEUE, event)