from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
import json

from log_config import logger
from redis_config import redis_client

router = APIRouter()

@router.get("/api/metrics")
async def get_metrics_all():
    keys = redis_client.keys("metrics.*")
    all_data = {}
    for key in keys:
        data = redis_client.get(key)
        if data:
            all_data[key.removeprefix("metrics.")] = json.loads(data)
    return all_data

@router.get("/api/metrics/{group_id}")
async def get_metrics_group(group_id: str):
    data = redis_client.get(f"metrics.{group_id}")
    if not data:
        raise HTTPException(status_code=404, detail="Not found in cache")
    return json.loads(data)

@router.get("/api/actuators")
async def get_actuators_all():
    keys = redis_client.keys("actuator.*")
    all_data = {}
    for key in keys:
        data = redis_client.get(key)
        if data:
            all_data[key.removeprefix("actuator.")] = json.loads(data)
    return all_data

@router.get("/api/actuators/{actuator_id}")
async def get_metrics_group(actuator_id: str):
    data = redis_client.get(f"actuator.{group_id}")
    if not data:
        raise HTTPException(status_code=404, detail="Not found in cache")
    return json.loads(data)
