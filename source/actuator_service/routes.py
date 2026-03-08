from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
import httpx
import os

from log_config import logger
from amqp_producer import send_amqp_message
from models import PostActuatorStateRequest
from connection_manager import connection_manager

router = APIRouter()

CACHE_URL = os.getenv("CACHE_URL")

@router.get("/api/actuators/discover")
async def get_actuators_list():
    try:
        async with httpx.AsyncClient() as httpx_client:
            cache_data = (await httpx_client.get(f"{CACHE_URL}/api/actuators")).json()
            logger.info(f"Got cache response for all actuators: {cache_data}")
            return list(cache_data.keys())
    except Exception as e:
        logger.error(f"Error fetching all actuators from cache: {e}")

@router.websocket("/api/actuators/ws")
async def get_actuators_all(websocket: WebSocket):
    await websocket.accept()
    try:
        async with httpx.AsyncClient() as httpx_client:
            cache_data = (await httpx_client.get(f"{CACHE_URL}/api/actuators")).json()
            logger.info(f"Got cache response for all: {cache_data}")
            for value in cache_data.values():
                await connection_manager.send_message(websocket, value)
        await connection_manager.connect(websocket, None)
        while True:
            # Wait for a message to handle disconnection
            await websocket.receive_text()
    except Exception as e:
        logger.error(f"Error in socket for all: {e}")
        connection_manager.disconnect(websocket)

@router.websocket("/api/actuators/{actuator_id}/ws")
async def get_actuators_group(websocket: WebSocket, actuator_id: str):
    await websocket.accept()
    try:
        async with httpx.AsyncClient() as httpx_client:
            cache_data = (await httpx_client.get(f"{CACHE_URL}/api/actuators/{actuator_id}")).json()
            logger.info(f"Got cache response for {actuator_id}: {cache_data}")
        await connection_manager.connect(websocket, actuator_id, cache_data)
        while True:
            # Wait for a message to handle disconnection
            await websocket.receive_text()
    except Exception as e:
        logger.error(f"Error in socket for {actuator_id}: {e}")
        connection_manager.disconnect(websocket)

@router.post("/api/actuators/{actuator_id}")
async def post_actuator_state(actuator_id: str, body: PostActuatorStateRequest):
    data = {
        "actuator_id": actuator_id,
        "is_on": body.is_on,
    }
    try:
        await send_amqp_message(data)
        return {}
    except Exception as e:
        logger.error(f"Error sending new actuator state: {e}")
        raise HTTPException(status_code=500, detail="Unreachable")
