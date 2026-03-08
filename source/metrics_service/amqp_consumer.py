import asyncio

from log_config import logger
from amqp_receiver import start_amqp_receiver
from connection_manager import connection_manager

class AMQPConsumer():
    def __init__(self, loop):
        self.loop = loop

    def consume(self, data):
        asyncio.run_coroutine_threadsafe(
            connection_manager.broadcast(data["group_id"], data),
            self.loop
        ).result()

def start_amqp_consumer(broker_url, loop):
    """Support function to start the AMQP consumer"""
    start_amqp_receiver(broker_url, ["sensor.events"], AMQPConsumer(loop))
