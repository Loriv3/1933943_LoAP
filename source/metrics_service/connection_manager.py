from fastapi import WebSocket

from log_config import logger

class Connection:
    def __init__(self, websocket: WebSocket, id: str):
        self.websocket = websocket
        self.id = id

class ConnectionManager:
    def __init__(self):
        self.connections: list[Connection] = []

    def connect(self, websocket: WebSocket, id: str, init_data: dict):
        self.send_message(websocket, init_data)
        self.connections.append(Connection(websocket, id))
        logger.info(f"Connection opened for {id}")

    def disconnect(self, websocket: WebSocket):
        for connection in self.connections:
            if connection.websocket == websocket:
                self.connections.remove(websocket)
                logger.info(f"Connection closed for {connection.id}")

    async def send_message(self, websocket: WebSocket, message: dict):
        websocket.send_json(message)

    async def broadcast(self, id: str, message: dict):
        for connection in self.connections:
            if connection.id != id:
                continue
            try:
                await self.send_message(connection.websocket, message)
            except Exception:
                continue

connection_manager = ConnectionManager()
