PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS rules (
  id TEXT PRIMARY KEY,
  enabled INTEGER NOT NULL DEFAULT 1,
  sensor_name TEXT NOT NULL,
  operator TEXT NOT NULL CHECK (operator IN ('<','<=','=','>','>=')),
  threshold_value REAL NOT NULL,
  unit TEXT,
  actuator_name TEXT NOT NULL,
  target_state TEXT NOT NULL CHECK (target_state IN ('ON','OFF')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rules_sensor_enabled
ON rules(sensor_name, enabled);

CREATE TABLE IF NOT EXISTS rule_firings (
  id TEXT PRIMARY KEY,
  rule_id TEXT NOT NULL,
  fired_at TEXT NOT NULL,
  sensor_name TEXT NOT NULL,
  sensor_value REAL NOT NULL,
  actuator_name TEXT NOT NULL,
  target_state TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rule_firings_rule_id
ON rule_firings(rule_id);

CREATE INDEX IF NOT EXISTS idx_rule_firings_fired_at
ON rule_firings(fired_at);
