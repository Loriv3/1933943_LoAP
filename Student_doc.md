# SYSTEM DESCRIPTION:

MarsOps is a distributed automation platform designed to guarantee the survival of occupants in a Martian habitat by integrating heterogeneous IoT devices into a unified monitoring system.The platform acts as a bridge between a fragile habitat's infrastructure and the human operators. Operators can monitor critical environmental parameters (such as oxygen, temperature, and radiation) in real-time through a centralized dashboard. They can, also, define "if-then" rules to ensure that habitat actuators (like cooling fans or heaters) respond instantly to dangerous environmental shifts without manual intervention.

# USER STORIES:

1) As an operator, I want the system to periodically poll all REST sensors (greenhouse_temperature, co2_hall, etc.) so that data is continuously updated without manual intervention.
2) As an operator, I want the system to receive all telemetry data in real time.
3) As a developer, I want every raw payload to be converted into a standard internal event so that downstream components work on homogeneous data.
4) As an ingestion component, I want every normalized event to be published to a message broker topic so that all services can consume it in a decoupled way.
5) As an operator, I want the system to fetch the list of sensors and topics at startup so that no manual configuration is required.
6) As an operator, I want to create rules so that actuators respond automatically to habitat conditions.
7) As the system, I want every incoming broker event to trigger evaluation of all relevant rules so that actuators are commanded in real time when conditions are met.
8) As an operator, I want rules to survive service restarts so that I do not have to reconfigure them every time.
9) As an operator, I want to see the list of all configured rules (condition, target actuator, status) so that I can keep track of what is automated.
10) As an operator, I want to delete an existing rule so that I can remove automations that are no longer needed.
11) As an operator, I want to see all sensor values updated automatically so that I can monitor the habitat without refreshing the page.
12) As an operator, I want sensors with out-of-range values to be highlighted visually (e.g. red/orange) so that I can immediately identify dangerous situations.
13) As an operator, I want to see a line chart of a sensor's trend during the current session so that I can spot patterns and anomalies over time.
14) As an operator, I want to create, view and delete rules directly from the dashboard so that I do not need external tools.
15) As an operator, I want to see a status indicator showing whether the system is connected so that I can immediately tell if the infrastructure is working.
16) As the frontend, I want to retrieve the latest value of all sensors so that the dashboard can be populated on initial load.
17) As an operator, I want to see the current ON/OFF state of all actuators in the dashboard so that I know what is active in the habitat.
18) As an operator, I want to manually toggle an actuator on or off from the dashboard so that I can intervene directly in emergency situations.
19) As an operator, I want the actuator state to update in the dashboard immediately after every command (whether manual or triggered by a rule) so that I always have a consistent view.
20) As the system, I want to keep the last known state of each actuator in memory so that the dashboard and the rule engine can access it without querying the environment every time.


# CONTAINERS:

## CONTAINER_NAME: converter

### DESCRIPTION: 
Handles ingestion, normalization, and forwarding of all IoT data from heterogeneous sources (REST sensors, SSE telemetry streams, and actuators) into a unified internal event format published to the message broker.

### USER STORIES:
1) As an operator, I want the system to periodically poll all REST sensors (greenhouse_temperature, co2_hall, etc.) so that data is continuously updated without manual intervention.
2) As an operator, I want the system to receive all telemetry data in real time.
3) As a developer, I want every raw payload to be converted into a standard internal event so that downstream components work on homogeneous data.
4) As an ingestion component, I want every normalized event to be published to a message broker topic so that all services can consume it in a decoupled way.
5) As an operator, I want the system to fetch the list of sensors and topics at startup so that no manual configuration is required.
20) As the system, I want to keep the last known state of each actuator in memory so that the dashboard and the rule engine can access it without querying the environment every time.

### PORTS: 
No ports exposed. The service communicates exclusively via ActiveMQ message broker and outbound HTTP calls to the simulator.

### DESCRIPTION:
The Converter is a background service that acts as the data ingestion and normalization layer of the MarsOps platform. It continuously polls all REST sensors, maintains persistent SSE connections to all telemetry topics, and fetches the initial actuator snapshot at boot. Every raw payload is normalized into a schema-consistent internal event and published to ActiveMQ Artemis, ensuring that all downstream components work on homogeneous data regardless of the original source format. The service also listens for actuator commands from the Automation Engine, executes the corresponding REST API calls on the simulator, and publishes the resulting state change to the broker.

### PERSISTENCE EVALUATION
The Converter is stateless, it holds no persistent data. All normalized events are immediately forwarded to the message broker. Actuator states are not stored locally; the initial snapshot is fetched from the simulator REST API at boot and published to the broker for other services to consume.

### EXTERNAL SERVICES CONNECTIONS
- **Simulator (REST)** — `http://simulator:8080`: polled every 5 seconds for sensor readings via `GET /api/sensors/{id}`; queried once at boot for actuator states via `GET /api/actuators`; called on actuator commands via `POST /api/actuators/{id}`
- **Simulator (SSE)** — `http://simulator:8080`: persistent SSE connections to all 7 telemetry topics via `GET /api/telemetry/stream/{topic}`
- **ActiveMQ Artemis** — `activemq:61616` (STOMP protocol): publishes normalized sensor and telemetry events to `sensor.events`; publishes actuator state changes to `actuator.states`; subscribes to `actuator.commands` for incoming commands from the Automation Engine

## CONTAINER_NAME: activemq

### DESCRIPTION:
ActiveMQ Artemis broker used as messaging backbone between telemetry ingestion and automation services.

### USER STORIES:
2, 3, 4, 7, 15

### PORTS:
- `61616` (JMS broker)
- `8161` (web console)

### PERSISTENCE EVALUATION
Configured as non-persistent broker for this laboratory setup (`persistence-enabled=false` in `broker.xml`).

### EXTERNAL SERVICES CONNECTIONS
- Receives events on topic `sensor.events`.
- Exposes queue `actuator.commands` for actuator commands.
- Docker service name: `activemq`.


## CONTAINER_NAME: automation-rules

### DESCRIPTION:
Spring Boot backend service that stores automation rules, consumes telemetry events from broker, evaluates conditions, and publishes actuator commands.

### USER STORIES:
6, 7, 8, 9, 10, 15, 17, 19, 20

### PORTS:
- `8082` on host mapped to `8080` in container.

### PERSISTENCE EVALUATION
SQLite database persisted on Docker volume:
- DB path in container: `/data/rules.db`
- volume: `automation_rules_data`
- persists `rules` and `rule_firings` across restarts.

### EXTERNAL SERVICES CONNECTIONS
- Connects to Artemis broker with:
	- URL: `tcp://activemq:61616`
	- user/password: `admin/admin`
- Consumes from `sensor.events` as topic (pub/sub).
- Produces to `actuator.commands` as queue (p2p).

### MICROSERVICES:

#### MICROSERVICE: <name of the microservice>
- TYPE: backend
- DESCRIPTION: rule management and real-time automation engine.
- PORTS: `8080` (internal container), published as `8082`.
- TECHNOLOGICAL SPECIFICATION:
	- Java 21, Spring Boot 3.3.2
	- Spring Web, Spring JDBC, Spring Artemis JMS
	- SQLite (`org.xerial:sqlite-jdbc`)
	- Maven multi-stage Docker build
- SERVICE ARCHITECTURE:
	- Controller layer for REST APIs
	- Repository layer for SQLite persistence
	- JMS listener for telemetry ingestion
	- Rule engine service for condition evaluation and command production
	- In-memory anti-spam cache per actuator (`ConcurrentHashMap`)

- ENDPOINTS:

| HTTP METHOD | URL | Description | User Stories |
| ----------- | --- | ----------- | ------------ |
| GET | `/health` | Service health with broker connectivity flag (`brokerConnected`) | 15 |
| GET | `/api/health` | Alias of `/health` | 15 |
| GET | `/api/rules` | List all rules | 9 |
| POST | `/api/rules` | Create rule | 6, 14 |
| PUT | `/api/rules/{id}` | Replace existing rule (404 if not found) | 6, 9 |
| PATCH | `/api/rules/{id}/enabled` | Enable/disable rule | 9 |
| DELETE | `/api/rules/{id}` | Delete rule | 10, 14 |
| GET | `/api/rule-firings?limit=50` | List recent rule firing records | 7, 9 |
| GET | `/api/metrics/mapping` | Returns dynamic mapping of `group_id` + `metric_id` to display names for frontend | 11, 16 |

- MESSAGE CONTRACTS:

1. Accepted telemetry payloads on topic `sensor.events`:
	 - Legacy single event format:
		 ```json
		 {
			 "event_time": "2026-03-06T14:00:00Z",
			 "kind": "sensor",
			 "sensor_name": "greenhouse_temperature.value",
			 "value": 29.0,
			 "unit": "C",
			 "status": "ok"
		 }
		 ```
	 - Grouped metrics format:
		 ```json
		 {
			 "group_id": "air_quality",
			 "updated_at": "2026-03-06T01:53:34.247Z",
			 "metrics": [
				 {
					 "metric_id": "voc",
					 "type": "air_quality.particle_volume_concentration",
					 "value": [{"value": 0.60448, "unit": "ppm"}]
				 }
			 ],
			 "status": "warning"
		 }
		 ```
		 Internally transformed to sensor names like `air_quality.voc`.

2. Produced command payload on queue `actuator.commands`:
	 ```json
	 {
		 "issued_at": "2026-03-06T14:00:03Z",
		 "updated_at": "2026-03-06T14:00:03Z",
		 "actuator_name": "cooling_fan",
		 "actuator_id": "cooling_fan",
		 "state": "ON",
		 "is_on": true,
		 "rule_id": "6d5d2a0d-3c5a-4c1a-9bb4-7bf3fcd5a233",
		 "reason": {
			 "sensor_name": "greenhouse_temperature.value",
			 "value": 29.0,
			 "operator": ">",
			 "threshold": 28.0
		 }
	 }
	 ```

- RULE ENGINE POLICIES:
	- Valid operators: `<`, `<=`, `=`, `>`, `>=`.
	- Valid target state: `ON` or `OFF`.
	- Event accepted if:
		- `sensor_name` exists
		- `value` is numeric
		- `kind` is `sensor` (case-insensitive) or missing
	- Unit compatibility:
		- if rule unit is defined, event unit must match.
	- Anti-spam:
		- same actuator + same state is not sent repeatedly.
		- cache resets on service restart.

- DB STRUCTURE:

	**_rules_**:
	| **id** | enabled | sensor_name | operator | threshold_value | unit | actuator_name | target_state | created_at | updated_at |
	| ------ | ------- | ----------- | -------- | --------------- | ---- | ------------- | ------------ | ---------- | ---------- |

	**_rule_firings_**:
	| **id** | rule_id | fired_at | sensor_name | sensor_value | actuator_name | target_state |
	| ------ | ------- | -------- | ----------- | ------------ | ------------- | ------------ |


## IMPLEMENTATION AND TEST SUMMARY

- Implemented service build/run with Docker Compose (`activemq` + `automation-rules`).
- Verified REST CRUD for rules (including `PATCH enabled` and `DELETE` with `204`).
- Verified end-to-end trigger: event on topic => command on queue.
- Verified anti-spam behavior (duplicate event does not increase queue repeatedly).
- Verified persistence across restart (`rules` preserved in `/data/rules.db`).
- Verified negative tests:
	- unit mismatch (`C` rule vs `F` event) does not trigger command.
	- value below threshold does not trigger command.
