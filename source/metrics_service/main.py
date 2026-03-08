import os
import threading
import asyncio
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from contextlib import asynccontextmanager

from log_config import logger
from amqp_consumer import start_amqp_consumer
from routes import router

BROKER_HOST = os.getenv("ARTEMIS_HOST")
BROKER_PORT = os.getenv("ARTEMIS_PORT")
BROKER_URL = f"amqp://{BROKER_HOST}:{BROKER_PORT}"

main_loop = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global main_loop
    main_loop = asyncio.get_running_loop() # Save FastAPI loop

    logger.info("Starting AMQP thread...")
    thread = threading.Thread(
        target=start_amqp_consumer,
        args=(BROKER_URL, main_loop),
        daemon=True
    )
    thread.start()
    yield
    logger.info("Stopping service")

app = FastAPI(title="MarsOps Cache Service", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],    # In prod put the exact URL, for now * is fine
    allow_credentials=True,
    allow_methods=["*"],    # Allow all HTTP methods
    allow_headers=["*"],
)
app.include_router(router)
