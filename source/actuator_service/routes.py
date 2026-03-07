from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
import httpx
import redis
import os
import json
import logging
from models import CommandRequest, AnyDeviceEvent
from amqp_client import in_memory_cache
from notifier import manager

router = APIRouter()
logger = logging.getLogger("actuator-service")
SIMULATOR_URL = os.getenv("SIMULATOR_URL", "http://simulator:8080")
r = redis.Redis(host='redis', port=6379, db=0, decode_responses=True)



@router.get("/api/state")
async def get_all_states():
    keys = r.keys("*")

    all_states = {}
    for key in keys:
        data = r.get(key)
        if data:
            all_states[key] = json.loads(data)

    return all_states
    #return in_memory_cache

@router.post("/api/actuators/{actuator_id}/control")
async def control_actuator(actuator_id: str, command: CommandRequest):
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(f"{SIMULATOR_URL}/api/actuators/{actuator_id}",
                                    json={"state": command.state})
            if resp.status_code == 200:
                return {"status": "success", "simulator_response": resp.json()}
            raise HTTPException(status_code=resp.status_code, detail="Simulator error")
        except Exception as e:
            logger.error(f"❌ Errore simulator: {e}")
            raise HTTPException(status_code=500, detail="Unreachable")
@router.get("/api/state/{device_id}")
async def get_device_state(device_id: str):
    state = r.get(device_id)
    if not state:
        raise HTTPException(status_code=404, detail="Dispositivo non trovato in cache")
    return json.loads(state)

@router.websocket("/ws/updates")
async def websocket_updates(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Resta in attesa (serve per gestire la disconnessione)
            await websocket.receive_text()
    except Exception:
        manager.disconnect(websocket)
