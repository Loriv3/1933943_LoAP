import json
import time
from proton.handlers import MessagingHandler
from proton.reactor import Container

from log_config import logger

RETRY_DELAY = 5

class AMQPReceiver(MessagingHandler):
    def __init__(self, broker_url, address, consumer):
        super().__init__()
        self.broker_url = broker_url
        self.address = address
        self.consumer = consumer

    def on_start(self, event):
        conn = event.container.connect(self.broker_url)
        for address in self.address:
            event.container.create_receiver(conn, source=address)
        logger.info(f"[AMQP] Receiver created on {self.address}")

    def on_message(self, event):
        try:
            raw_body = event.message.body

            # Perform a security conversion to a string
            if isinstance(raw_body, memoryview):
                body_str = raw_body.tobytes().decode('utf-8')
            elif isinstance(raw_body, bytes):
                body_str = raw_body.decode('utf-8')
            else:
                body_str = str(raw_body)

            logger.info(f"[AMQP] Message received: {body_str}")

            # String validated
            data = json.loads(body_str)
            self.consumer.consume(data)
            
        except Exception as e:
            logger.error(f"[AMQP] Error parsing message: {e}")

def start_amqp_receiver(broker_url, address, consumer):
    """Support function to start an AMQP receiver"""
    while True:
        try:
            logger.info(f"[AMQP] Connection attempt to {broker_url}...")
            Container(AMQPReceiver(broker_url, address, consumer)).run()
        except Exception as e:
            logger.error(f"[AMQP] Connection failed: {e}")
            logger.info(f"Retry in {RETRY_DELAY} seconds...")
            time.sleep(RETRY_DELAY)
