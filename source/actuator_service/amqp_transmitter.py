import json
import time
from proton.handlers import MessagingHandler
from proton.reactor import Container

from log_config import logger

RETRY_DELAY = 5

class AMQPTransmitter(MessagingHandler):
    def __init__(self, broker_url, address, consumer):
        super().__init__()
        self.broker_url = broker_url
        self.address = address
        self.consumer = consumer

    def on_start(self, event):
        conn = event.container.connect(self.broker_url)
        for address in self.address:
            event.container.create_sender(conn, address)
        logger.info(f"[AMQP] Transmitter created on {self.address}")

    def on_link_opened(self, event):
        logger.info(f"[AMQP] Transmitter link opened for {event.sender.target.address}")

    def on_sendable(self, event):
        logger.info(f"[AMQP] Transmitter sendable for {event.sender.target.address}")

    def send_message(self, data):
        try:
            event.sender.send(json.dumps(data))
            logger.info(f"[AMQP] Message sent: {data}")
            
        except Exception as e:
            logger.error(f"[AMQP] Error sending message: {e}")

def start_amqp_transmitter(broker_url, address, consumer):
    """Support function to start an AMQP transmitter"""
    while True:
        try:
            logger.info(f"[AMQP] Connection attempt to {broker_url}...")
            Container(AMQPReceiver(broker_url, address, consumer)).run()
        except Exception as e:
            logger.error(f"[AMQP] Connection failed: {e}")
            logger.info(f"Retry in {RETRY_DELAY} seconds...")
            time.sleep(RETRY_DELAY)
