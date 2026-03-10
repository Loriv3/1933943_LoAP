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

# EVENT SCHEMA:

## MetricGroupStateEvent
Represents a telemetry snapshot published by a sensor group to the message broker.

| Field     | Type                      | Description                                        |
|-----------|---------------------------|----------------------------------------------------|
| `at`      | `Date`                    | Timestamp of when the snapshot was taken           |
| `group_id`| `String`                  | Identifier of the sensor group (e.g. `greenhouse`) |
| `metrics` | `List<MetricStateEvent>`  | List of individual metric readings in the group    |
| `status`  | `GroupStatus` (nullable)  | Overall group status (`ok` or `warning`)           |

## MetricStateEvent
Represents the reading of a single metric within a group.

| Field   | Type                           | Description                                      |
|---------|--------------------------------|--------------------------------------------------|
| `id`    | `String`                       | Metric identifier (e.g. `temperature`, `co2`)    |
| `type`  | `String`                       | Sensor/metric type description                   |
| `value` | `List<MetricStateEventValue>`  | One or more value readings for this metric       |

## MetricStateEventValue
A single unit-tagged value within a metric reading.

| Field   | Type     | Description                          |
|---------|----------|--------------------------------------|
| `value` | `Object` | The raw measurement value            |
| `unit`  | `String` | Unit of measurement (e.g. `°C`, `%`) |

## ActuatorStateEvent
Represents the current state of an actuator, published to the broker after any state change.

| Field        | Type      | Description                                         |
|--------------|-----------|-----------------------------------------------------|
| `updated_at` | `Date`    | Timestamp of the last state change                  |
| `actuator_id`| `String`  | Identifier of the actuator                          |
| `is_on`      | `boolean` | Current ON/OFF state of the actuator                |

## ActuatorCommand
Command sent to an actuator to change its state, emitted by the rule engine when a rule fires.

| Field        | Type      | Description                                           |
|--------------|-----------|-------------------------------------------------------|
| `updated_at` | `Date`    | Timestamp of the command                              |
| `actuator_id`| `String`  | Target actuator identifier                            |
| `is_on`      | `boolean` | Desired ON/OFF state                                  |
| `rule_id`    | `UUID`    | ID of the rule that triggered the command             |
| `reason`     | `Reason`  | Details of the condition that caused the rule to fire |

# RULE MODEL:

## Rule
Persisted automation rule that associates a sensor condition with an actuator action.

| Field           | Type       | Description                                              |
|-----------------|------------|----------------------------------------------------------|
| `id`            | `UUID`     | Unique rule identifier                                   |
| `enabled`       | `boolean`  | Whether the rule is active and evaluated                 |
| `created_at`    | `Date`     | Creation timestamp                                       |
| `updated_at`    | `Date`     | Last modification timestamp                              |
| `group_id`      | `String`   | Sensor group the rule listens to                         |
| `metric_id`     | `String`   | Specific metric to evaluate within the group             |
| `operator`      | `Operator` | Comparison operator (`lt`, `le`, `eq`, `gt`, `ge`)       |
| `compare_value` | `Object`   | Threshold value to compare the metric against            |
| `unit`          | `String`   | Expected unit of the metric value                        |
| `actuator_id`   | `String`   | Actuator to command when the condition is met            |
| `actuator_state`| `boolean`  | Desired actuator state (ON = `true`, OFF = `false`)      |

## CreateRuleRequest
DTO used when creating a new rule via the REST API.

| Field           | Type       | Required | Description                                        |
|-----------------|------------|----------|----------------------------------------------------|
| `enabled`       | `boolean`  | No       | Defaults to `true`                                 |
| `group_id`      | `String`   | Yes      | Sensor group identifier                            |
| `metric_id`     | `String`   | Yes      | Metric identifier within the group                 |
| `operator`      | `Operator` | Yes      | One of `lt`, `le`, `eq`, `gt`, `ge`               |
| `compare_value` | `Object`   | Yes      | Threshold value                                    |
| `unit`          | `String`   | Yes      | Unit of the metric                                 |
| `actuator_id`   | `String`   | Yes      | Target actuator identifier                         |
| `actuator_state`| `boolean`  | Yes      | Desired actuator state when condition is met       |

## FiringRecord
Audit record created each time a rule successfully fires and commands an actuator.

| Field           | Type      | Description                                      |
|-----------------|-----------|--------------------------------------------------|
| `id`            | `UUID`    | Unique firing record identifier                  |
| `rule_id`       | `UUID`    | ID of the rule that was triggered                |
| `fired_at`      | `Date`    | Timestamp of when the rule fired                 |
| `group_id`      | `String`  | Sensor group that provided the triggering event  |
| `metric_id`     | `String`  | Metric whose value triggered the rule            |
| `metric_value`  | `Object`  | Actual metric value at the time of firing        |
| `metric_unit`   | `String`  | Unit of the metric value                         |
| `actuator_id`   | `String`  | Actuator that was commanded                      |
| `actuator_state`| `boolean` | State the actuator was commanded to              |

## Operator
Enum defining the comparison operators available for rule conditions.

| Value | Meaning               |
|-------|-----------------------|
| `lt`  | Less than             |
| `le`  | Less than or equal    |
| `eq`  | Equal                 |
| `gt`  | Greater than          |
| `ge`  | Greater than or equal |

