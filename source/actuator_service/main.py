import os
import threading
import logging
import asyncio
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

main_loop = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global main_loop
    main_loop = asyncio.get_running_loop()  # Cattura il loop di FastAPI

    logger.info("🚀 Avvio thread AMQP...")
    thread = threading.Thread(
        target=start_amqp_thread,
        args=(BROKER_URL, "sensor.events", main_loop),  # Passa il loop
        daemon=True
    )
    thread.start()
    yield
    logger.info("🛑 Spegnimento servizio")


app = FastAPI(title="Mars Actuator Service", lifespan=lifespan)
app.include_router(router)