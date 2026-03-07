import os
import threading
import logging
from fastapi import FastAPI
from contextlib import asynccontextmanager
# Importiamo solo quello che serve veramente
from amqp_client import start_amqp_thread
from routes import router

# Configurazione Log
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("actuator-service")

BROKER_HOST = os.getenv("ARTEMIS_HOST", "127.0.0.1")
BROKER_URL = f"amqp://{BROKER_HOST}:61616"


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Avvio sistema e thread AMQP...")

    # Avviamo il consumer usando la funzione definita in amqp_client
    thread = threading.Thread(
        target=start_amqp_thread,
        args=(BROKER_URL, "sensor.events"),
        daemon=True
    )
    thread.start()

    yield
    logger.info("🛑 Spegnimento servizio")


app = FastAPI(title="Mars Actuator Service", lifespan=lifespan)
app.include_router(router)