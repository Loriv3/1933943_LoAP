import json
import random
from datetime import datetime, timezone
from proton import Message
from proton.handlers import MessagingHandler
from proton.reactor import Container

BROKER_URL = "amqp://127.0.0.1:61616"
ADDRESS = "sensor.events"

class SensorProducer(MessagingHandler):
    def __init__(self):
        super().__init__()
        self.sender = None

    def on_start(self, event):
        print("✅ Connessione ad ActiveMQ (AMQP)...", flush=True)
        conn = event.container.connect(BROKER_URL)
        self.sender = event.container.create_sender(conn, ADDRESS)
        # Avviamo il loop temporizzato
        self.send_loop(event.container)

    def generate_payload(self):
        """Genera i dati casuali (Metrica o Attuatore)"""
        if random.choice([True, False]):
            return {
                "type": "metric",
                "group_id": "air_quality",
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "metrics": [
                    {
                        "metric_id": "co2e",
                        "type": "air_quality.particle_volume_concentration",
                        "value": [{"value": round(random.uniform(400, 600), 2), "unit": "ppm"}]
                    }
                ],
                "status": "ok"
            }
        else:
            return {
                "type": "actuator",
                "actuator_id": "cooling_fan",
                "is_on": random.choice([True, False]),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }

    def send_loop(self, container):
        # 1. Genera il carico utile
        payload = self.generate_payload()
        msg = Message(body=json.dumps(payload))

        # 2. Invia solo se il broker ha dato credito (permesso di invio)
        if self.sender and self.sender.credit > 0:
            self.sender.send(msg)
            print(f"🚀 Inviato a {ADDRESS}: {payload['type']} - {payload.get('group_id') or payload.get('actuator_id')}", flush=True)
        else:
            print("⏳ In attesa di credito dal broker...", flush=True)

        # 3. Pianifica il prossimo invio tra 3 secondi (NON BLOCCANTE)
        container.schedule(3, self)

    def on_timer_task(self, event):
        """Callback del timer"""
        self.send_loop(event.container)

if __name__ == "__main__":
    try:
        Container(SensorProducer()).run()
    except KeyboardInterrupt:
        print("\n🛑 Producer fermato dall'utente.")