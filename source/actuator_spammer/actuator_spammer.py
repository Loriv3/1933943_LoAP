"""
Actuator Command Spammer
Pubblica comandi casuali su actuator.commands per testare il consumer.
"""

import json
import os
import random
import time
import stomp
from datetime import datetime, timezone

AMQ_HOST = os.getenv("AMQ_HOST", "localhost")
AMQ_PORT = int(os.getenv("AMQ_PORT", "61616"))
QUEUE    = "actuator.commands"
INTERVAL = float(os.getenv("INTERVAL", "2.0"))

ACTUATORS = [
    "cooling_fan",
    "entrance_humidifier",
    "hall_ventilation",
    "habitat_heater",
]

def now_iso():
    return datetime.now(timezone.utc).isoformat()

def main():
    conn = stomp.Connection([(AMQ_HOST, AMQ_PORT)])
    # Retry finché AMQ non è pronto
    while True:
        try:
            conn.connect(wait=True)
            print(f"Connected to AMQ at {AMQ_HOST}:{AMQ_PORT}")
            break
        except Exception as e:
            print(f"Cannot connect to {AMQ_HOST}:{AMQ_PORT} — retrying in 5s... ({e})")
            time.sleep(5)
            conn = stomp.Connection([(AMQ_HOST, AMQ_PORT)])
    print(f"Publishing to {QUEUE} every {INTERVAL}s — Ctrl+C to stop\n")

    try:
        while True:
            actuator_id = random.choice(ACTUATORS)
            is_on       = random.choice([True, False])
            cmd = {
                "actuator_id": actuator_id,
                "is_on":       is_on,
                "created_at":  now_iso(),
            }
            conn.send(
                destination=QUEUE,
                body=json.dumps(cmd),
                content_type="application/json"
            )
            print(f"→ {actuator_id} | is_on={is_on}")
            time.sleep(INTERVAL)
    except KeyboardInterrupt:
        print("\nStopped.")
    finally:
        conn.disconnect()

if __name__ == "__main__":
    main()