# SYSTEM DESCRIPTION:

MarsOps is a distributed automation platform designed to guarantee the survival of occupants in a Martian habitat by integrating heterogeneous IoT devices into a unified monitoring system. The platform acts as a bridge between a fragile habitat's infrastructure and the human operators. Operators can monitor critical environmental parameters (such as oxygen, temperature, and radiation) in real-time through a centralized dashboard. They can also define "if-then" rules to ensure that habitat actuators (like cooling fans or heaters) respond instantly to dangerous environmental shifts without manual intervention.

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


## CONTAINER_NAME: simulator

### DESCRIPTION:
The simulator provided as the initial assignment prompt. Provides sensor and actuator data, and endpoints to modify actuators' state, through diverse pollable REST sensors, SSE telemetry streams and actuator REST endpoints.

### USER STORIES:
1) As an operator, I want the system to periodically poll all REST sensors (greenhouse_temperature, co2_hall, etc.) so that data is continuously updated without manual intervention.
2) As an operator, I want the system to receive all telemetry data in real time.
5) As an operator, I want the system to fetch the list of sensors and topics at startup so that no manual configuration is required.

### PORTS:
9705:8080

### DESCRIPTION:
The simulator is treated as a black box by the rest of the system. It exposes REST sensor endpoints, SSE telemetry streams, and actuator REST endpoints all on port 8080.

### PERSISTENCE EVALUATION
While the simulator doesn't seem to persist data in this simulation, it is treated as a black box by the rest of the system.

### EXTERNAL SERVICES CONNECTIONS
The simulator does not connect to external services.

### MICROSERVICES:

#### MICROSERVICE: simulator
- TYPE: backend
- DESCRIPTION: Provides sensor data and actuator feedback.
- PORTS: 8080


## CONTAINER_NAME: redis

### DESCRIPTION:
Redis key-value store used as an in-memory cache to maintain the latest known state of all sensors and actuators. It guarantees fast reads for the frontend initial load and decoupling from the message broker stream.

### USER STORIES:
16) As the frontend, I want to retrieve the latest value of all sensors so that the dashboard can be populated on initial load.
17) As an operator, I want to see the current ON/OFF state of all actuators in the dashboard so that I know what is active in the habitat.
20) As the system, I want to keep the last known state of each actuator in memory so that the dashboard and the rule engine can access it without querying the environment every time.

### PORTS:
6379:6379

### DESCRIPTION:
The Redis container provides a fast in-memory key-value store used as the state cache for all sensor and actuator data across the platform.

### PERSISTENCE EVALUATION
Configured as an ephemeral in-memory cache for this laboratory setup. Historical data persistence is explicitly not required by the specifications; only the latest state is cached. Data is lost upon container restart, and reconstructed dynamically via incoming AMQP streams.

### EXTERNAL SERVICES CONNECTIONS
- Receives sensor/actuator data to cache from the cache service.
- Exposes the cache's contents to the cache service in order to serve queries about sensor/actuator state without waiting for new events.
- Docker service name: `redis`.

### MICROSERVICES:

#### MICROSERVICE: redis
- TYPE: database
- DESCRIPTION: Provides an in-memory cache for sensor and actuator states.
- PORTS: 6379


## CONTAINER_NAME: activemq

### DESCRIPTION:
ActiveMQ Artemis broker used as messaging backbone between telemetry ingestion and services that perform automation tasks or expose data to the frontend.

### USER STORIES:
2) As an operator, I want the system to receive all telemetry data in real time.
3) As a developer, I want every raw payload to be converted into a standard internal event so that downstream components work on homogeneous data.
4) As an ingestion component, I want every normalized event to be published to a message broker topic so that all services can consume it in a decoupled way.
7) As the system, I want every incoming broker event to trigger evaluation of all relevant rules so that actuators are commanded in real time when conditions are met.
15) As an operator, I want to see a status indicator showing whether the system is connected so that I can immediately tell if the infrastructure is working.

### PORTS:
61616:61616

### DESCRIPTION:
The ActiveMQ Artemis container acts as the messaging backbone of the platform. All microservices communicate event data through this broker using topic and queue semantics.

### PERSISTENCE EVALUATION
Configured as non-persistent broker for this laboratory setup (`persistence-enabled=false` in `broker.xml`).

### EXTERNAL SERVICES CONNECTIONS
- Receives sensor/actuator update events on topics `sensor.events` and `actuator.states`.
- Exposes queue `actuator.commands` for actuator commands.
- Docker service name: `activemq`.

### MICROSERVICES:

#### MICROSERVICE: activemq
- TYPE: message queue broker
- DESCRIPTION: Provides the message queues that all other microservices use to communicate.
- PORTS: 61616, 8161 (console)


## CONTAINER_NAME: converter

### DESCRIPTION:
The converter is a background service that acts as the data ingestion, normalization and forwarding layer of the MarsOps platform. It continuously polls all REST sensors, maintains persistent SSE connections to all telemetry topics, and fetches the initial actuator snapshot at boot.

### USER STORIES:
1) As an operator, I want the system to periodically poll all REST sensors (greenhouse_temperature, co2_hall, etc.) so that data is continuously updated without manual intervention.
2) As an operator, I want the system to receive all telemetry data in real time.
3) As a developer, I want every raw payload to be converted into a standard internal event so that downstream components work on homogeneous data.
4) As an ingestion component, I want every normalized event to be published to a message broker topic so that all services can consume it in a decoupled way.
5) As an operator, I want the system to fetch the list of sensors and topics at startup so that no manual configuration is required.
20) As the system, I want to keep the last known state of each actuator in memory so that the dashboard and the rule engine can access it without querying the environment every time.

### PORTS:
No ports exposed.

### DESCRIPTION:
The converter is a stateless background service that handles bidirectional translation between the simulator's heterogeneous data formats and the platform's internal event schema. Every raw payload is normalized and published to ActiveMQ, ensuring downstream components always work on homogeneous data. It also listens for actuator commands and executes the corresponding REST calls on the simulator.

### PERSISTENCE EVALUATION
The converter is stateless; it holds no persistent data. All normalized events are immediately forwarded to the message broker. The initial actuator snapshot is fetched from the simulator at boot and published to the broker.

### EXTERNAL SERVICES CONNECTIONS
- **Simulator (REST)** — `http://simulator:8080`: polled every 5 seconds for sensor readings via `GET /api/sensors/{id}`; queried once at boot for actuator states via `GET /api/actuators`; called on actuator commands via `POST /api/actuators/{id}`.
- **Simulator (SSE)** — `http://simulator:8080`: persistent SSE connections to all 7 telemetry topics via `GET /api/telemetry/stream/{topic}`.
- **ActiveMQ Artemis** — `activemq:61616` (STOMP/AMQP): publishes normalized sensor events to `sensor.events`; publishes actuator state changes to `actuator.states`; subscribes to `actuator.commands`.

### MICROSERVICES:

#### MICROSERVICE: converter
- TYPE: backend
- DESCRIPTION: Performs bidirectional conversion between data from and to the simulator, in all its formats, and the internal event structures shared by the rest of the system.
- PORTS: No ports exposed, communicates through AMQ.
- TECHNOLOGICAL SPECIFICATION:
  - Written in Python 3
  - Uses `httpx` for HTTP requests, `proton` and `stomp.py` for interfacing with the ActiveMQ queue
  - Uses async I/O as much as possible to maximize concurrency
- SERVICE ARCHITECTURE:
  - Polling loop for REST sensors (every 5 seconds)
  - Persistent SSE listener threads for each telemetry topic
  - AMQP publisher for normalized events to `sensor.events` and `actuator.states`
  - AMQP consumer for `actuator.commands` to proxy commands back to the simulator

- ENDPOINTS:

  | HTTP METHOD | URL | Description | User Stories |
  | ----------- | --- | ----------- | ------------ |
  | — | — | No HTTP endpoints exposed; all communication via AMQ | 1, 2, 3, 4, 5, 20 |


## CONTAINER_NAME: cache_service

### DESCRIPTION:
A Python-based FastAPI service that serves as the real-time state synchronization layer of the MarsOps platform.

### USER STORIES:
16) As the frontend, I want to retrieve the latest value of all sensors so that the dashboard can be populated on initial load.
17) As an operator, I want to see the current ON/OFF state of all actuators in the dashboard so that I know what is active in the habitat.
19) As an operator, I want the actuator state to update in the dashboard immediately after every command (whether manual or triggered by a rule) so that I always have a consistent view.
20) As the system, I want to keep the last known state of each actuator in memory so that the dashboard and the rule engine can access it without querying the environment every time.

### PORTS:
8081:8080

### DESCRIPTION:
The cache_service acts as the real-time state synchronization layer. It consumes normalized events from ActiveMQ and writes the latest state to Redis, while exposing a REST API for frontend initial load queries.

### PERSISTENCE EVALUATION
The service itself is stateless; all state is delegated to the Redis container.

### EXTERNAL SERVICES CONNECTIONS
- **ActiveMQ Artemis**: Connects via AMQP 1.0 to consume normalized events from `sensor.events` and `actuator.states` topics.
- **Redis**: Connects to the `redis` host on port 6379 to perform atomic SET/GET operations on state snapshots.

### MICROSERVICES:

#### MICROSERVICE: cache-service
- TYPE: backend
- DESCRIPTION: Manages the life cycle of real-time data ingestion and serves as the primary data provider for the frontend dashboard initial load.
- PORTS: 8080 (internal), 8081 (exposed)
- TECHNOLOGICAL SPECIFICATION:
  - Python 3.12-slim
  - Web Framework: FastAPI with Uvicorn
  - Messaging: `python-qpid-proton` (AMQP 1.0)
- SERVICE ARCHITECTURE:
  - Lifespan Manager: Orchestrates the startup of the AMQP consumer thread alongside the FastAPI app.
  - AMQP Consumer: Parses incoming JSON payloads and routes them to Redis using key prefixes (`metrics.*` for sensors and `actuator.*` for devices).
  - REST API: Provides grouped and granular access to cached state data.

- ENDPOINTS:

  | HTTP METHOD | URL | Description | User Stories |
  | ----------- | --- | ----------- | ------------ |
  | GET | `/api/metrics` | Returns a JSON dictionary of the latest known state of all devices from Redis. | 17, 20 |
  | GET | `/api/metrics/{group_id}` | Returns the latest state of a specific sensor group from Redis. | 16 |
  | POST | `/api/actuators` | Returns a JSON dictionary of the latest known ON/OFF state of all actuators from Redis. | 18, 19 |
  | GET | `/api/actuators/{actuator_id}` | Returns the latest state of a specific actuator from Redis. | 17, 20 |


## CONTAINER_NAME: metrics_service

### DESCRIPTION:
Python/FastAPI microservice responsible for the real-time distribution of telemetry data to the frontend. It acts as a WebSocket hub: it continuously consumes events from the message broker (ActiveMQ).

### USER STORIES:
11) As an operator, I want to see all sensor values updated automatically so that I can monitor the habitat without refreshing the page.
16) As the frontend, I want to retrieve the latest value of all sensors so that the dashboard can be populated on initial load.

### PORTS:
8082:8080

### DESCRIPTION:
The metrics_service bridges the message broker and the frontend by consuming telemetry events from ActiveMQ and forwarding them in real time over WebSocket connections to all connected dashboard clients.

### PERSISTENCE EVALUATION
The service is stateless.

### EXTERNAL SERVICES CONNECTIONS
- **ActiveMQ Artemis**: Consumes telemetry events from the `sensor.events` topic via AMQP.
- **Cache Service**: Queried via HTTP (using the `CACHE_URL` environment variable) to retrieve the current values upon establishing WebSocket connections or for discovery.
- **Frontend Clients**: Manages persistent WebSocket connections to push data streams.

### MICROSERVICES:

#### MICROSERVICE: metrics-service
- TYPE: backend
- DESCRIPTION: Asynchronous handler for exposing and broadcasting environmental metrics.
- PORTS: 8080 (internal), 8082 (exposed)
- TECHNOLOGICAL SPECIFICATION:
  - Python 3.12, FastAPI, WebSockets, `httpx` (HTTP client), `python-qpid-proton` (AMQP 1.0)
- SERVICE ARCHITECTURE:
  - Threaded AMQP Consumer: A dedicated thread listens to the broker to prevent blocking the asynchronous web server's event loop.
  - Async Connection Manager: Tracks active WebSocket connections and their subscriptions (global or per-group).
  - Thread-safe Coroutines: Utilizes `asyncio.run_coroutine_threadsafe` to safely communicate incoming events from the synchronous AMQP consumer thread to the asynchronous FastAPI WebSocket broadcaster.

- ENDPOINTS:

  | HTTP METHOD | URL | Description | User Stories |
  | ----------- | --- | ----------- | ------------ |
  | GET | `/api/metrics/discover` | Retrieves the list of available metric groups and their metadata by querying the cache service. | 16 |


## CONTAINER_NAME: actuator_service

### DESCRIPTION:
Python/FastAPI microservice acting as the state manager and API Gateway. It consumes real-time AMQP events, persists the latest state to Redis, provides a WebSocket stream for the frontend, and acts as a proxy for actuator commands towards the simulator.

### USER STORIES:
11) As an operator, I want to see all sensor values updated automatically so that I can monitor the habitat without refreshing the page.
16) As the frontend, I want to retrieve the latest value of all sensors so that the dashboard can be populated on initial load.
17) As an operator, I want to see the current ON/OFF state of all actuators in the dashboard so that I know what is active in the habitat.
18) As an operator, I want to manually toggle an actuator on or off from the dashboard so that I can intervene directly in emergency situations.
19) As an operator, I want the actuator state to update in the dashboard immediately after every command (whether manual or triggered by a rule) so that I always have a consistent view.
20) As the system, I want to keep the last known state of each actuator in memory so that the dashboard and the rule engine can access it without querying the environment every time.

### PORTS:
8000:8000

### DESCRIPTION:
The actuator_service is the central hub for actuator state management. It caches the latest state in Redis, broadcasts real-time updates to the frontend via WebSocket, and proxies manual actuator toggle commands to the simulator.

### PERSISTENCE EVALUATION
Stateless service. State persistence is delegated entirely to the `redis` container.

### EXTERNAL SERVICES CONNECTIONS
- Connects to `activemq` via AMQP 1.0 protocol on port `61616` to consume events.
- Connects to `redis` on port `6379` to read/write state.
- Forwards HTTP POST commands directly to the `simulator` on port `8080` to actuate devices.

### MICROSERVICES:

#### MICROSERVICE: actuator-service
- TYPE: backend
- DESCRIPTION: Real-time state cache, WebSocket broadcaster, and Actuator API Facade.
- PORTS: 8000 (internal), 8000 (exposed)
- TECHNOLOGICAL SPECIFICATION:
  - Python 3.12
  - Web Framework: FastAPI + Uvicorn
  - AMQP Client: `python-qpid-proton`
  - Caching: `redis-py`
  - Async HTTP Client: `httpx`
- SERVICE ARCHITECTURE:
  - Threaded AMQP Consumer loop decoupled from the main asyncio event loop.
  - Redis-backed state management.
  - Async Connection Manager for WebSocket multiplexing and broadcasting.
  - REST Proxy to forward actuator commands.

- ENDPOINTS:

  | HTTP METHOD | URL | Description | User Stories |
  | ----------- | --- | ----------- | ------------ |
  | GET | `/api/state` | Returns a JSON dictionary of the latest known state of all devices from Redis. | 16, 17, 20 |
  | GET | `/api/state/{device_id}` | Returns the latest state of a specific device (sensor or actuator). | 20 |
  | POST | `/api/actuators/{actuator_id}/control` | Proxies command to simulator, updates Redis cache, and triggers a WebSocket broadcast. | 18, 19 |
  | WS (WebSocket) | `/ws/updates` | Real-time push of normalized JSON payloads directly to connected frontend clients. | 11, 19 |

- MESSAGE CONTRACTS:

  1. Accepted telemetry payloads on AMQP topic (internal representation):
     ```json
     {
       "converter_version": "1.0.0",
       "group_id": "greenhouse_temperature",
       "at": "2026-03-07T13:44:17.132744+00:00",
       "metrics": [
         {
           "id": "temperature",
           "type": "thermal.temperature",
           "value": [{"value": 24.01, "unit": "C"}]
         }
       ],
       "status": "ok"
     }
     ```

  2. Received Command format (`POST /api/actuators/{actuator_id}/control`):
     ```json
     {
       "state": "ON"
     }
     ```

  3. Broadcasted WebSockets Payload (Actuator update):
     ```json
     {
       "type": "actuator",
       "actuator_id": "cooling_fan",
       "is_on": true,
       "updated_at": "2026-03-07T13:44:17.132744+00:00"
     }
     ```


## CONTAINER_NAME: automation-rules

### DESCRIPTION:
Spring Boot backend service that stores automation rules, consumes telemetry events from the broker, evaluates conditions, and publishes actuator commands.

### USER STORIES:
6) As an operator, I want to create rules so that actuators respond automatically to habitat conditions.
7) As the system, I want every incoming broker event to trigger evaluation of all relevant rules so that actuators are commanded in real time when conditions are met.
8) As an operator, I want rules to survive service restarts so that I do not have to reconfigure them every time.
9) As an operator, I want to see the list of all configured rules (condition, target actuator, status) so that I can keep track of what is automated.
10) As an operator, I want to delete an existing rule so that I can remove automations that are no longer needed.
14) As an operator, I want to create, view and delete rules directly from the dashboard so that I do not need external tools.
15) As an operator, I want to see a status indicator showing whether the system is connected so that I can immediately tell if the infrastructure is working.

### PORTS:
8082:8080

### DESCRIPTION:
The automation-rules container stores operator-defined if-then rules, consumes real-time telemetry from ActiveMQ, evaluates each rule condition against incoming sensor events, and publishes actuator commands to the broker whenever a condition is met. Rules are persisted in SQLite so they survive service restarts.

### PERSISTENCE EVALUATION
SQLite database persisted on a Docker volume:
- DB path in container: `/data/rules.db`
- Volume: `automation_rules_data`
- Persists `rules` and `rule_firings` tables across restarts.

### EXTERNAL SERVICES CONNECTIONS
- Connects to Artemis broker:
  - URL: `tcp://activemq:61616`
  - Credentials: `admin/admin`
- Consumes from `sensor.events` as a topic (pub/sub).
- Produces to `actuator.commands` as a queue (p2p).

### MICROSERVICES:

#### MICROSERVICE: automation-rules
- TYPE: backend
- DESCRIPTION: Rule management and real-time automation engine.
- PORTS: 8080 (internal), 8082 (exposed)
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
  - Unit compatibility: if rule unit is defined, event unit must match.
  - Anti-spam: same actuator + same state is not sent repeatedly; cache resets on service restart.

- DB STRUCTURE:

  **_rules_**: | **id** | enabled | sensor_name | operator | threshold_value | unit | actuator_name | target_state | created_at | updated_at |

  **_rule_firings_**: | **id** | rule_id | fired_at | sensor_name | sensor_value | actuator_name | target_state |


## CONTAINER_NAME: frontend

### DESCRIPTION:
React-based single-page application that provides the operator dashboard for monitoring sensor values, actuator states, and managing automation rules.

### USER STORIES:
11) As an operator, I want to see all sensor values updated automatically so that I can monitor the habitat without refreshing the page.
12) As an operator, I want sensors with out-of-range values to be highlighted visually (e.g. red/orange) so that I can immediately identify dangerous situations.
13) As an operator, I want to see a line chart of a sensor's trend during the current session so that I can spot patterns and anomalies over time.
14) As an operator, I want to create, view and delete rules directly from the dashboard so that I do not need external tools.
15) As an operator, I want to see a status indicator showing whether the system is connected so that I can immediately tell if the infrastructure is working.
17) As an operator, I want to see the current ON/OFF state of all actuators in the dashboard so that I know what is active in the habitat.
18) As an operator, I want to manually toggle an actuator on or off from the dashboard so that I can intervene directly in emergency situations.

### PORTS:
3000:3000

### DESCRIPTION:
The frontend container delivers the operator-facing dashboard as a single-page application. It connects to the backend services via REST for initial state and WebSocket for real-time updates, and provides controls for monitoring sensors, toggling actuators, and managing automation rules.

### PERSISTENCE EVALUATION
The frontend container does not include a database.

### EXTERNAL SERVICES CONNECTIONS
The frontend container does not connect to external services directly; it communicates with `actuator_service`, `metrics_service`, `cache_service`, and `automation-rules` via HTTP/WebSocket.

### MICROSERVICES:

#### MICROSERVICE: frontend
- TYPE: frontend
- DESCRIPTION: This microservice serves the main operator dashboard SPA.
- PORTS: 3000

- PAGES:

  | Name | Description | Related Microservice | User Stories |
  | ---- | ----------- | -------------------- | ------------ |
  | Dashboard | Displays real-time sensor values with color highlights, actuator toggle controls, trend charts, rule management panel, and system connectivity indicator | actuator-service, metrics-service, cache-service, automation-rules | 11, 12, 13, 14, 15, 17, 18 |
