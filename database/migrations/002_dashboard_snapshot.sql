DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'team_members' AND column_name = 'name'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'team_members' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE team_members RENAME COLUMN name TO display_name;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sprints' AND column_name = 'key'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sprints' AND column_name = 'external_key'
  ) THEN
    ALTER TABLE sprints RENAME COLUMN key TO external_key;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sprint_scope_changes' AND column_name = 'change_date'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sprint_scope_changes' AND column_name = 'effective_at'
  ) THEN
    ALTER TABLE sprint_scope_changes RENAME COLUMN change_date TO effective_at;
    ALTER TABLE sprint_scope_changes ALTER COLUMN effective_at TYPE TIMESTAMPTZ
      USING effective_at::timestamp AT TIME ZONE 'UTC';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'issues' AND column_name = 'key'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'issues' AND column_name = 'external_key'
  ) THEN
    ALTER TABLE issues RENAME COLUMN key TO external_key;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'burndown_snapshots' AND column_name = 'remaining_points'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'burndown_snapshots' AND column_name = 'actual_remaining_points'
  ) THEN
    ALTER TABLE burndown_snapshots RENAME COLUMN remaining_points TO actual_remaining_points;
  END IF;
END $$;

ALTER TABLE team_members ADD COLUMN IF NOT EXISTS display_name VARCHAR(160);
ALTER TABLE team_members DROP COLUMN IF EXISTS email;
ALTER TABLE sprints ADD COLUMN IF NOT EXISTS as_of_at TIMESTAMPTZ;
ALTER TABLE sprints ADD COLUMN IF NOT EXISTS original_committed_points NUMERIC(8,2);
ALTER TABLE issues ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE burndown_snapshots ADD COLUMN IF NOT EXISTS actual_remaining_points NUMERIC(8,2);

UPDATE sprints
SET original_committed_points = COALESCE(original_committed_points, 72),
    as_of_at = COALESCE(
      as_of_at,
      (SELECT MAX(snapshot_date)::timestamp AT TIME ZONE 'UTC' + INTERVAL '23 hours 59 minutes 59 seconds'
       FROM burndown_snapshots WHERE sprint_id = sprints.id)
    );

UPDATE burndown_snapshots SET actual_remaining_points = COALESCE(actual_remaining_points, 0);

DO $$
DECLARE
  check_row RECORD;
BEGIN
  FOR check_row IN
    SELECT conname, conrelid::regclass AS table_name
    FROM pg_constraint
    WHERE contype = 'c'
      AND conrelid IN ('sprints'::regclass, 'sprint_scope_changes'::regclass,
                       'issues'::regclass, 'burndown_snapshots'::regclass)
  LOOP
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', check_row.table_name, check_row.conname);
  END LOOP;
END $$;

UPDATE sprints SET state = 'closed' WHERE state = 'completed';

ALTER TABLE team_members ALTER COLUMN display_name SET NOT NULL;
ALTER TABLE sprints ALTER COLUMN as_of_at SET NOT NULL;
ALTER TABLE sprints ALTER COLUMN original_committed_points SET NOT NULL;
ALTER TABLE burndown_snapshots ALTER COLUMN actual_remaining_points SET NOT NULL;
ALTER TABLE sprint_scope_changes ALTER COLUMN points SET NOT NULL;
ALTER TABLE issues ALTER COLUMN status TYPE VARCHAR(80);

ALTER TABLE sprints ADD CONSTRAINT sprints_state_check CHECK (state IN ('active', 'future', 'closed'));
ALTER TABLE sprints ADD CONSTRAINT sprints_points_nonnegative CHECK (original_committed_points >= 0);
ALTER TABLE sprints ADD CONSTRAINT sprints_date_range_check CHECK (end_date >= start_date);
ALTER TABLE sprint_scope_changes ADD CONSTRAINT sprint_scope_changes_direction_check CHECK (direction IN ('added', 'removed'));
ALTER TABLE sprint_scope_changes ADD CONSTRAINT sprint_scope_changes_points_positive CHECK (points > 0);
ALTER TABLE issues ADD CONSTRAINT issues_status_check CHECK (status IN ('To Do', 'In Progress', 'In Review', 'Done'));
ALTER TABLE issues ADD CONSTRAINT issues_points_nonnegative CHECK (story_points IS NULL OR story_points >= 0);
ALTER TABLE burndown_snapshots ADD CONSTRAINT burndown_snapshots_points_nonnegative CHECK (actual_remaining_points >= 0);

CREATE UNIQUE INDEX IF NOT EXISTS one_active_sprint_per_project
  ON sprints (project_id) WHERE state = 'active';