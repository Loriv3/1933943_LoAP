from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
import httpx
import redis
import os
import json
import logging
import datetime
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
                simulator_data = resp.json()
                # Il simulatore restituisce: {"actuator": "...", "state": "ON", "updated_at": "..."}

                # 1. Creiamo il payload standardizzato per la nostra cache e il Frontend
                # (Usiamo la struttura di ActuatorEvent in models.py)
                cache_payload = {
                    "type": "actuator",
                    "actuator_id": actuator_id,
                    "is_on": command.state == "ON",
                    "updated_at": simulator_data.get("updated_at")
                }

                # 2. Aggiorniamo la cache su Redis
                r.set(actuator_id, json.dumps(cache_payload))

                # 3. Opzionale: aggiorna anche la cache in memoria se la stai usando
                # in_memory_cache[actuator_id] = cache_payload

                # 4. SPARALO SUI WEBSOCKET! Così la dashboard cambia colore all'istante
                await manager.broadcast(cache_payload)

                logger.info(f"🕹️ Attuatore {actuator_id} impostato a {command.state}. Cache e WS aggiornati.")
                return {"status": "success", "simulator_response": simulator_data}

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
