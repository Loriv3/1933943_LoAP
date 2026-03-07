import os
import json
import asyncio
import threading
from proton.handlers import MessagingHandler
from proton.reactor import Container
from contextlib import asynccontextmanager
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Dict, Optional, List, Union, Literal
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s"
)

logger = logging.getLogger("actuator-service")
# ---  CONFIGURAZIONE ACTIVEMQ ---
BROKER_HOST = os.getenv("ARTEMIS_HOST", "127.0.0.1")
BROKER_PORT = int(os.getenv("ARTEMIS_PORT", 61616))
BROKER_USER = os.getenv("ARTEMIS_USER", "admin")
BROKER_PASS = os.getenv("ARTEMIS_PASSWORD", "admin")
BROKER_URL = f"amqp://{BROKER_HOST}:{BROKER_PORT}"
ADDRESS = "sensor.events"

# ---  DEFINIZIONE DEI MODELLI  ---
class MetricValue(BaseModel):
    value: float
    unit: str


class MetricItem(BaseModel):
    metric_id: str
    type: str
    value: List[MetricValue]


class MetricEvent(BaseModel):
    type: Literal["metric"] = Field(..., description="Identifica l'evento come metrica")
    group_id: str
    updated_at: str
    metrics: List[MetricItem]
    status: Optional[str] = None


class ActuatorEvent(BaseModel):
    type: Literal["actuator"] = Field(..., description="Identifica l'evento come attuatore")
    actuator_id: str
    is_on: bool
    updated_at: str


# Pydantic capirà in automatico quale modello usare grazie al campo 'type'
AnyDeviceEvent = Union[MetricEvent, ActuatorEvent]

# --- 3. CACHE IN MEMORIA TODO ---
in_memory_cache: Dict[str, AnyDeviceEvent] = {}

class AMQPConsumer(MessagingHandler):

    def on_start(self, event):
        print("🚀 Avvio AMQP consumer")
        print(f"🔌 Connessione a broker: {BROKER_URL}")
        print(f"📡 Sottoscrizione address: {ADDRESS}")

        conn = event.container.connect(BROKER_URL)

        event.container.create_receiver(
            conn,
            source="sensor.events"
        )

        logger.info("📡 Receiver creato su sensor.events")

    def on_connection_opened(self, event):
        logger.info("🔗 Connessione AMQP aperta")

    def on_link_opened(self, event):
        logger.info("🔗 Link AMQP aperto")

    def on_message(self, event):
        logger.info("📥 [AMQP] Messaggio ricevuto")

        try:
            data = json.loads(event.message.body)

            if data.get("type") == "metric":
                evento = MetricEvent(**data)
                in_memory_cache[evento.group_id] = evento
                logger.info(f"💾 Salvata metrica {evento.group_id}")

            elif data.get("type") == "actuator":
                evento = ActuatorEvent(**data)
                in_memory_cache[evento.actuator_id] = evento
                logger.info(f"💾 Salvato attuatore {evento.actuator_id}")

        except Exception as e:
            logger.info("❌ Errore parsing:", e)

def start_amqp_consumer():
    while True:
        try:
            logger.info("🔄 Tentativo connessione AMQP...")
            Container(AMQPConsumer()).run()
        except Exception as e:
            logger.info("❌ Connessione fallita:", e)
            logger.warning("Connessione AMQP persa, retry tra 5 secondi...")
            time.sleep(5)

# --- 5. LIFESPAN: COSA FARE ALL'AVVIO E ALLO SPEGNIMENTO ---
@asynccontextmanager
async def lifespan(app: FastAPI):

    print("🚀 Avvio consumer AMQP...")

    consumer_thread = threading.Thread(
        target=start_amqp_consumer
    )

    consumer_thread.start()

    print("✅ Consumer AMQP avviato")

    yield

    print("🔌 Shutdown servizio")
# --- 6. DEFINIZIONE DELL'APP E DELLE ROTTE ---
app = FastAPI(
    title="Sensor/Actuator State API",
    description="Microservizio per la gestione dello stato in-memory della base marziana.",
    version="1.0.0",
    lifespan=lifespan
)


@app.get("/api/state", response_model=Dict[str, AnyDeviceEvent], tags=["State"])
async def get_all_states():
    """Restituisce lo stato corrente di TUTTI i sensori e attuatori."""
    return in_memory_cache


@app.get("/api/state/{device_id}", response_model=AnyDeviceEvent, tags=["State"])
async def get_device_state(device_id: str):
    """Restituisce lo stato di un singolo dispositivo (usa group_id o actuator_id)."""
    if device_id in in_memory_cache:
        return in_memory_cache[device_id]
    return {"error": "Device not found"}


@app.get("/api/stream", tags=["Real-Time"])
async def stream_updates():
    """Endpoint Dummy per Server-Sent Events (SSE)."""
    return {"message": "Qui ci sarà lo stream SSE connesso ad ActiveMQ"}