import asyncio
from asyncio import Queue

from log_config import logger
from amqp_transmitter import start_amqp_transmitter
from connection_manager import connection_manager

class AMQPProducer():
    def __init__(self, queue, loop):
        self.queue = queue
        self.loop = loop

    def produce(self):
        logger.info("[AMQP] Waiting for messages to send...")
        data = asyncio.run_coroutine_threadsafe(self.queue.get(), self.loop).result()
        return data

amqp_producer_queue = None

async def send_amqp_message(data):
    await amqp_producer_queue.put(data)
    logger.info(f"[AMQP] Message added to queue: {data}...")

def start_amqp_producer(broker_url, loop):
    """Support function to start the AMQP producer"""
    global amqp_producer_queue
    amqp_producer_queue = Queue()
    start_amqp_transmitter(broker_url, ["actuator.commands"], AMQPProducer(amqp_producer_queue, loop))
