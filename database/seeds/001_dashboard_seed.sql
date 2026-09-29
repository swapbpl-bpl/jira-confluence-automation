DELETE FROM burndown_snapshots WHERE sprint_id = '33333333-3333-4333-8333-333333333333';
DELETE FROM issues WHERE sprint_id = '33333333-3333-4333-8333-333333333333';
DELETE FROM sprint_scope_changes WHERE sprint_id = '33333333-3333-4333-8333-333333333333';
DELETE FROM sprints WHERE id = '33333333-3333-4333-8333-333333333333';
DELETE FROM projects WHERE id = '11111111-1111-4111-8111-111111111111';
DELETE FROM team_members WHERE team_id = '22222222-2222-4222-8222-222222222222';
DELETE FROM teams WHERE id = '22222222-2222-4222-8222-222222222222';

INSERT INTO teams (id, name)
VALUES ('22222222-2222-4222-8222-222222222222', 'Platform Team');

INSERT INTO projects (id, team_id, name, project_type)
VALUES ('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'Staff Augment Project', 'Staff Augment');

INSERT INTO team_members (id, team_id, display_name, is_active)
VALUES
  ('44444444-4444-4444-8444-444444444444', '22222222-2222-4222-8222-222222222222', 'Avery Stone', TRUE),
  ('55555555-5555-4555-8555-555555555555', '22222222-2222-4222-8222-222222222222', 'Bri Chen', TRUE),
  ('66666666-6666-4666-8666-666666666666', '22222222-2222-4222-8222-222222222222', 'Casper Diaz', TRUE),
  ('77777777-7777-4777-8777-777777777777', '22222222-2222-4222-8222-222222222222', 'Dara Singh', TRUE),
  ('88888888-8888-4888-8888-888888888888', '22222222-2222-4222-8222-222222222222', 'Eden Park', TRUE),
  ('99999999-9999-4999-8999-999999999999', '22222222-2222-4222-8222-222222222222', 'Finn Woods', TRUE),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '22222222-2222-4222-8222-222222222222', 'Gina Ortiz', TRUE),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222', 'Hugo Reed', TRUE),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '22222222-2222-4222-8222-222222222222', 'Iris Jones', TRUE),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', '22222222-2222-4222-8222-222222222222', 'Jules Tran', TRUE);

INSERT INTO sprints (
  id, project_id, external_key, name, goal, start_date, end_date, state,
  as_of_at, original_committed_points
)
VALUES (
  '33333333-3333-4333-8333-333333333333',
  '11111111-1111-4111-8111-111111111111',
  'TEAM-24', 'Sprint 24', 'Local dashboard shell validation',
  '2026-09-21', '2026-10-02', 'active', '2026-09-28T23:59:59Z', 72
);

INSERT INTO sprint_scope_changes (id, sprint_id, effective_at, direction, points)
VALUES ('11111111-1111-5111-9111-111111111111', '33333333-3333-4333-8333-333333333333', '2026-09-24T12:00:00Z', 'added', 6);

INSERT INTO issues (
  id, sprint_id, external_key, summary, assignee_id, status, priority,
  story_points, flagged, updated_at
)
VALUES
  ('55555555-5555-4555-8555-555555555555', '33333333-3333-4333-8333-333333333333', 'TEAM-101', 'Finalize sprint dashboard schema', '44444444-4444-4444-8444-444444444444', 'To Do', 'High', 5, FALSE, '2026-09-28T23:59:59Z'),
  ('66666666-6666-4666-8666-666666666666', '33333333-3333-4333-8333-333333333333', 'TEAM-102', 'Build dashboard API contract', '55555555-5555-4555-8555-555555555555', 'To Do', 'High', 5, FALSE, '2026-09-28T23:59:59Z'),
  ('77777777-7777-4777-8777-777777777777', '33333333-3333-4333-8333-333333333333', 'TEAM-103', 'Investigate the flagged environment blocker', NULL, 'To Do', 'Medium', 2, TRUE, '2026-09-28T23:59:59Z'),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', '33333333-3333-4333-8333-333333333333', 'TEAM-111', 'Review blocked-item wording in design notes', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'To Do', 'Low', NULL, FALSE, '2026-09-28T23:59:59Z'),
  ('88888888-8888-4888-8888-888888888888', '33333333-3333-4333-8333-333333333333', 'TEAM-104', 'Prepare the local service container', '66666666-6666-4666-8666-666666666666', 'In Progress', 'Medium', 5, FALSE, '2026-09-28T23:59:59Z'),
  ('99999999-9999-4999-8999-999999999999', '33333333-3333-4333-8333-333333333333', 'TEAM-105', 'Validate sprint metrics against seed data', '77777777-7777-4777-8777-777777777777', 'In Progress', 'High', 5, FALSE, '2026-09-28T23:59:59Z'),
  ('abababab-abab-4aba-8aba-abababababab', '33333333-3333-4333-8333-333333333333', 'TEAM-106', 'Review responsive dashboard behavior', '88888888-8888-4888-8888-888888888888', 'In Review', 'Medium', 14, FALSE, '2026-09-28T23:59:59Z'),
  ('bcbcbcbc-bcbc-4bcb-8bcb-bcbcbcbcbcbc', '33333333-3333-4333-8333-333333333333', 'TEAM-107', 'Document the dashboard data contract', '99999999-9999-4999-8999-999999999999', 'Done', 'High', 10, FALSE, '2026-09-28T23:59:59Z'),
  ('cdcdcdcd-cdcd-4dcd-8dcd-cdcdcdcdcdcd', '33333333-3333-4333-8333-333333333333', 'TEAM-108', 'Add versioned database migrations', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Done', 'Medium', 10, FALSE, '2026-09-28T23:59:59Z'),
  ('dededede-dede-4ded-8ded-dededededede', '33333333-3333-4333-8333-333333333333', 'TEAM-109', 'Create a consistent fictional fixture', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Done', 'Medium', 10, FALSE, '2026-09-28T23:59:59Z'),
  ('efefefef-efef-4efe-8efe-efefefefefef', '33333333-3333-4333-8333-333333333333', 'TEAM-110', 'Verify server-side metric calculations', '44444444-4444-4444-8444-444444444444', 'Done', 'High', 12, FALSE, '2026-09-28T23:59:59Z');

INSERT INTO burndown_snapshots (id, sprint_id, snapshot_date, actual_remaining_points)
VALUES
  ('11111111-1111-6111-9111-111111111111', '33333333-3333-4333-8333-333333333333', '2026-09-21', 72),
  ('11111111-1111-6211-9111-111111111111', '33333333-3333-4333-8333-333333333333', '2026-09-22', 68),
  ('11111111-1111-6311-9111-111111111111', '33333333-3333-4333-8333-333333333333', '2026-09-23', 64),
  ('11111111-1111-6411-9111-111111111111', '33333333-3333-4333-8333-333333333333', '2026-09-24', 70),
  ('11111111-1111-6511-9111-111111111111', '33333333-3333-4333-8333-333333333333', '2026-09-25', 54),
  ('11111111-1111-6611-9111-111111111111', '33333333-3333-4333-8333-333333333333', '2026-09-28', 36);