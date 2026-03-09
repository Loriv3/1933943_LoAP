from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
import httpx
import os

from log_config import logger
from connection_manager import connection_manager
from metric_display import group_data

router = APIRouter()

CACHE_URL = os.getenv("CACHE_URL")

@router.get("/api/metrics/discover")
async def get_metrics_list():
    try:
        async with httpx.AsyncClient() as httpx_client:
            cache_data = (await httpx_client.get(f"{CACHE_URL}/api/metrics")).json()
            logger.info(f"Got cache response for all metrics: {cache_data}")
            return list(map(lambda key: { **group_data[key], "group_id": key }, cache_data.keys()))
    except Exception as e:
        logger.error(f"Error fetching all metrics from cache: {e}")

@router.websocket("/api/metrics/ws")
async def get_metrics_all(websocket: WebSocket):
    await websocket.accept()
    try:
        async with httpx.AsyncClient() as httpx_client:
            cache_data = (await httpx_client.get(f"{CACHE_URL}/api/metrics")).json()
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

@router.websocket("/api/metrics/{group_id}/ws")
async def get_metrics_group(websocket: WebSocket, group_id: str):
    await websocket.accept()
    try:
        async with httpx.AsyncClient() as httpx_client:
            cache_data = (await httpx_client.get(f"{CACHE_URL}/api/metrics/{group_id}")).json()
            logger.info(f"Got cache response for {group_id}: {cache_data}")
        await connection_manager.connect(websocket, group_id, cache_data)
        while True:
            # Wait for a message to handle disconnection
            await websocket.receive_text()
    except Exception as e:
        logger.error(f"Error in socket for {group_id}: {e}")
        connection_manager.disconnect(websocket)

