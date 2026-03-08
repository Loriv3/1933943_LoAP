import json
import time
from proton import Message, symbol
from proton.handlers import MessagingHandler
from proton.reactor import Container, SenderOption

from log_config import logger

MESSAGE_POLLING_INTERVAL = 0.1
RETRY_DELAY = 5

class AMQPTransmitter(MessagingHandler):
    def __init__(self, broker_url, address, producer):
        super(AMQPTransmitter, self).__init__()
        self.broker_url = broker_url
        self.address = address
        self.producer = producer

    def on_start(self, event):
        conn = event.container.connect(self.broker_url)
        self.sender = event.container.create_sender(conn, self.address)
        logger.info(f"[AMQP] Transmitter created on {self.address}")

    def on_link_opened(self, event):
        logger.info(f"[AMQP] Transmitter link opened for {event.sender.target.address}")

    def poll(self, event, is_waiting):
        try:
            data = self.producer.produce(is_waiting)
            if data is None:
                event.container.schedule(MESSAGE_POLLING_INTERVAL, self)
                return
            data_str = json.dumps(data)
            logger.info(f"[AMQP] Sending message: {data_str}")
            self.sender.send(Message(body=data_str))
            logger.info(f"[AMQP] Message sent: {data_str}")

        except Exception as e:
            logger.error(f"[AMQP] Error sending message: {e}")

    def on_sendable(self, event):
        self.poll(event, False)

    def on_timer_task(self, event):
        self.poll(event, True)

    def on_accepted(self, event):
        logger.info("[AMQP] Message accepted by broker")

    def on_rejected(self, event):
        logger.error(f"[AMQP] Message rejected: {event.delivery.remote.condition}")

    def on_released(self, event):
        logger.warning("[AMQP] Message released")

    def on_modified(self, event):
        logger.warning("[AMQP] Message modified")

    def on_disconnected(self, event):
        print(f"[AMQP] Disconnected from {self.address}: {event}")

def start_amqp_transmitter(broker_url, address, producer):
    """Support function to start an AMQP transmitter"""
    while True:
        try:
            logger.info(f"[AMQP] Connection attempt to {broker_url}...")
            container = Container(AMQPTransmitter(broker_url, address, producer))
            container.container_id = "actuator_service"
            return container
        except Exception as e:
            logger.error(f"[AMQP] Connection failed: {e}")
            logger.info(f"Retry in {RETRY_DELAY} seconds...")
            time.sleep(RETRY_DELAY)
