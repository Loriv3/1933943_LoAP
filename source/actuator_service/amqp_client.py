import json
import logging
import time
import redis
from proton.handlers import MessagingHandler
from proton.reactor import Container
from models import MetricEvent, ActuatorEvent
logger = logging.getLogger("actuator-service")
import asyncio
from notifier import manager
# Cache globale condivisa tra i moduli
in_memory_cache = {}
r = redis.Redis(host='redis', port=6379, db=0, decode_responses=True)
class AMQPConsumer(MessagingHandler):
    def __init__(self, broker_url, address, loop):
        super().__init__()
        self.broker_url = broker_url
        self.address = address
        self.loop = loop  # Il loop di FastAPI

    def on_start(self, event):
        conn = event.container.connect(self.broker_url)
        event.container.create_receiver(conn, source=self.address)
        logger.info(f"📡 AMQP Receiver creato su {self.address}")

    def on_message(self, event):
        # AGGIUNGI QUESTO LOG QUI SOTTO
        logger.info(f"📥 [AMQP] Messaggio ricevuto: {event.message.body}")

        try:
            raw_body = event.message.body
            # Conversione di sicurezza
            if isinstance(raw_body, memoryview):
                body_str = raw_body.tobytes().decode('utf-8')
            elif isinstance(raw_body, bytes):
                body_str = raw_body.decode('utf-8')
            else:
                body_str = str(raw_body)

            logger.info(f"📥 [AMQP] Messaggio ricevuto: {body_str}")
            data = json.loads(body_str)  # Ora riceve una stringa valida
            device_id = data.get("group_id") or data.get("actuator_id")
            # Salvataggio su Redis
            r.set(device_id, json.dumps(data))
            logger.info(f"💾 Stato salvato su Redis per: {device_id}")
            if "metrics" in data:
                obj = MetricEvent(**data)
                in_memory_cache[obj.group_id] = obj
                #logger.info(f"💾 Metrica salvata nella cache locale per: {obj.group_id}")  # LOG DI CONFERMA
            elif "actuator_id" in data:
                obj = ActuatorEvent(**data)
                in_memory_cache[obj.actuator_id] = obj
                #logger.info(f"💾 Stato attuatore salvato nella cache locale: {obj.actuator_id}")  # LOG DI CONFERMA
            # PONTE VERSO WEBSOCKET:
            # Spediamo il messaggio al loop di FastAPI in modo thread-safe
            asyncio.run_coroutine_threadsafe(
            manager.broadcast(data),
            self.loop
            )
        except Exception as e:
            logger.error(f"❌ Errore parsing AMQP: {e}")
def start_amqp_thread(broker_url, address, loop):
    """Funzione di supporto per far girare il consumer in un thread separato"""
    while True:
        try:
            logger.info(f"🔄 Tentativo connessione AMQP a {broker_url}...")
            Container(AMQPConsumer(broker_url, address, loop)).run()
        except Exception as e:
            logger.error(f"❌ Connessione AMQP fallita: {e}")
            logger.info("Retry tra 5 secondi...")
            time.sleep(5)