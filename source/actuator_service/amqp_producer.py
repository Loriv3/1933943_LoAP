from log_config import logger
from amqp_transmitter import start_amqp_transmitter
from connection_manager import connection_manager

class AMQPProducer():
    def __init__(self, transmitter):
        self.transmitter = transmitter

    def send_message(data):
        self.transmitter.send_message(data)

amqp_producer = None

def start_amqp_producer(broker_url):
    """Support function to start the AMQP producer"""
    global amqp_producer
    amqp_producer = AMQPProducer(start_amqp_transmitter(broker_url, ["actuator.commands"]))
