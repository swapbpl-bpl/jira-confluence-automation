CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY,
  name VARCHAR(120) NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id),
  name VARCHAR(160) NOT NULL,
  project_type VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS sprints (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id),
  key VARCHAR(50) NOT NULL,
  name VARCHAR(120) NOT NULL,
  goal TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  state VARCHAR(20) NOT NULL CHECK (state IN ('active', 'completed')),
  UNIQUE (project_id, key)
);

CREATE TABLE IF NOT EXISTS sprint_scope_changes (
  id UUID PRIMARY KEY,
  sprint_id UUID NOT NULL REFERENCES sprints(id),
  change_date DATE NOT NULL,
  direction VARCHAR(12) NOT NULL CHECK (direction IN ('added', 'removed')),
  points NUMERIC(10,2) NOT NULL CHECK (points >= 0)
);

CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY,
  sprint_id UUID NOT NULL REFERENCES sprints(id),
  key VARCHAR(50) NOT NULL,
  summary TEXT NOT NULL,
  assignee_id UUID REFERENCES team_members(id),
  status VARCHAR(20) NOT NULL CHECK (status IN ('To Do', 'In Progress', 'In Review', 'Done')),
  priority VARCHAR(20),
  story_points NUMERIC(10,2),
  flagged BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (sprint_id, key)
);

CREATE TABLE IF NOT EXISTS burndown_snapshots (
  id UUID PRIMARY KEY,
  sprint_id UUID NOT NULL REFERENCES sprints(id),
  snapshot_date DATE NOT NULL,
  remaining_points NUMERIC(10,2) NOT NULL CHECK (remaining_points >= 0),
  completed_points NUMERIC(10,2) NOT NULL CHECK (completed_points >= 0),
  UNIQUE (sprint_id, snapshot_date)
);