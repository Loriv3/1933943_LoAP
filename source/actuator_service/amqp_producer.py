import asyncio
from asyncio import Queue, QueueEmpty

from log_config import logger
from amqp_transmitter import start_amqp_transmitter
from connection_manager import connection_manager

class AMQPProducer():
    def __init__(self, queue, loop):
        self.queue = queue
        self.loop = loop

    async def poll_queue(self):
        return self.queue.get_nowait()

    def produce(self, is_waiting):
        if not is_waiting:
            logger.info("[AMQP] Waiting for messages to send...")
        try:
            data = asyncio.run_coroutine_threadsafe(self.poll_queue(), self.loop).result()
        except QueueEmpty:
            data = None
        return data

amqp_producer_queue = None
amqp_container = None

async def send_amqp_message(data):
    await amqp_producer_queue.put(data)
    logger.info(f"[AMQP] Message added to queue: {data}...")
    amqp_container.wakeup()

def start_amqp_producer(broker_url, loop):
    """Support function to start the AMQP producer"""
    global amqp_producer_queue
    global amqp_container
    amqp_producer_queue = Queue()
    amqp_container = start_amqp_transmitter(broker_url, "actuator.commands", AMQPProducer(amqp_producer_queue, loop))
    amqp_container.run()
