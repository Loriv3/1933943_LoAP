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

## CONTAINER_NAME: <name of the container>

### DESCRIPTION: 
<description of the container>

### USER STORIES:
<list of user stories satisfied>

### PORTS: 
<used ports>

### DESCRIPTION:
<description of the container>

### PERSISTENCE EVALUATION
<description on the persistence of data>

### EXTERNAL SERVICES CONNECTIONS
<description on the connections to external services>

### MICROSERVICES:

#### MICROSERVICE: <name of the microservice>
- TYPE: backend
- DESCRIPTION: <description of the microservice>
- PORTS: <ports to be published by the microservice>
- TECHNOLOGICAL SPECIFICATION:
<description of the technological aspect of the microservice>
- SERVICE ARCHITECTURE: 
<description of the architecture of the microservice>

- ENDPOINTS: <put this bullet point only in the case of backend and fill the following table>
		
	| HTTP METHOD | URL | Description | User Stories |
	| ----------- | --- | ----------- | ------------ |
    | ... | ... | ... | ... |

- PAGES: <put this bullet point only in the case of frontend and fill the following table>

	| Name | Description | Related Microservice | User Stories |
	| ---- | ----------- | -------------------- | ------------ |
	| ... | ... | ... | ... |

- DB STRUCTURE: <put this bullet point only in the case a DB is used in the microservice and specify the structure of the tables and columns>

	**_<name of the table>_** :	| **_id_** | <other columns>

#### <other microservices>

## <other containers>
