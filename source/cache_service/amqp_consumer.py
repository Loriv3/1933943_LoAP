import redis
import json

from log_config import logger
from redis_config import redis_client
from amqp_receiver import start_amqp_receiver

class AMQPConsumer():
    def consume(self, data):
        if "group_id" in data:
            group_id = data.get("group_id")

            # Save data to Redis
            redis_client.set(f"metrics.{group_id}", json.dumps(data))
            logger.info(f"State saved to Redis for metric group: {group_id}")

        elif "actuator_id" in data:
            actuator_id = data.get("actuator_id")

            # Save data to Redis
            redis_client.set(f"actuator.{actuator_id}", json.dumps(data))
            logger.info(f"State saved to Redis for actuator: {actuator_id}")

def start_amqp_consumer(broker_url):
    """Support function to start the AMQP consumer"""
    start_amqp_receiver(broker_url, ["sensor.events", "actuator.states"], AMQPConsumer())
