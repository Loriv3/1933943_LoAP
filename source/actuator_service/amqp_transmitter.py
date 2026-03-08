import json
import time
from proton import Message
from proton.handlers import MessagingHandler
from proton.reactor import Container

from log_config import logger

RETRY_DELAY = 5

class AMQPTransmitter(MessagingHandler):
    def __init__(self, broker_url, address, producer):
        super().__init__()
        self.broker_url = broker_url
        self.address = address
        self.producer = producer

    def on_start(self, event):
        conn = event.container.connect(self.broker_url)
        for address in self.address:
            event.container.create_sender(conn, address)
        logger.info(f"[AMQP] Transmitter created on {self.address}")

    def on_link_opened(self, event):
        logger.info(f"[AMQP] Transmitter link opened for {event.sender.target.address}")

    def on_sendable(self, event):
        try:
            data = self.producer.produce()
            data_str = json.dumps(data)
            logger.info(f"[AMQP] Sending message: {data_str}")
            event.sender.send(Message(data_str))
            logger.info(f"[AMQP] Message sent: {data_str}")

        except Exception as e:
            logger.error(f"[AMQP] Error sending message: {e}")

def start_amqp_transmitter(broker_url, address, producer):
    """Support function to start an AMQP transmitter"""
    while True:
        try:
            logger.info(f"[AMQP] Connection attempt to {broker_url}...")
            Container(AMQPTransmitter(broker_url, address, producer)).run()
        except Exception as e:
            logger.error(f"[AMQP] Connection failed: {e}")
            logger.info(f"Retry in {RETRY_DELAY} seconds...")
            time.sleep(RETRY_DELAY)
