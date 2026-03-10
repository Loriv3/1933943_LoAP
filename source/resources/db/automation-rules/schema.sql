PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS rules (
  id TEXT PRIMARY KEY,
  enabled INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  group_id TEXT NOT NULL,
  metric_id TEXT NOT NULL,
  operator TEXT NOT NULL,
  compare_value_str TEXT,
  compare_value_double REAL,
  unit TEXT,
  actuator_id TEXT NOT NULL,
  actuator_state INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rules_sensor_enabled
ON rules(group_id, metric_id, enabled);

CREATE TABLE IF NOT EXISTS rule_firings (
  id TEXT PRIMARY KEY,
  rule_id TEXT NOT NULL,
  fired_at TEXT NOT NULL,
  group_id TEXT NOT NULL,
  metric_id TEXT NOT NULL,
  metric_value_str TEXT,
  metric_value_double REAL,
  metric_unit TEXT,
  actuator_id TEXT NOT NULL,
  actuator_state INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rule_firings_rule_id
ON rule_firings(rule_id);

CREATE INDEX IF NOT EXISTS idx_rule_firings_fired_at
ON rule_firings(fired_at);
