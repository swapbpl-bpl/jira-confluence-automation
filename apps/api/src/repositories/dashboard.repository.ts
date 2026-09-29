import type { PoolClient } from 'pg';

export interface ProjectRecord {
  id: string;
  teamId: string;
  name: string;
  type: string;
}

export interface TeamRecord {
  id: string;
  name: string;
}

export interface SprintRecord {
  id: string;
  key: string;
  name: string;
  goal: string | null;
  startDate: string;
  endDate: string;
  asOf: string;
  originalCommittedPoints: string;
}

export interface MemberRecord {
  id: string;
  name: string;
}

export interface IssueRecord {
  id: string;
  key: string;
  summary: string;
  assigneeId: string | null;
  assigneeName: string | null;
  status: string;
  priority: string | null;
  storyPoints: string | null;
  flagged: boolean;
}

export interface ScopeChangeRecord {
  date: string;
  direction: 'added' | 'removed';
  points: string;
}

export interface BurndownRecord {
  date: string;
  actualRemainingPoints: string;
}

export interface DashboardSource {
  projectCount: number;
  teamCount: number;
  project: ProjectRecord | null;
  team: TeamRecord | null;
  activeSprints: SprintRecord[];
  members: MemberRecord[];
  issues: IssueRecord[];
  scopeChanges: ScopeChangeRecord[];
  burndown: BurndownRecord[];
}

export async function loadDashboardSource(client: PoolClient): Promise<DashboardSource> {
  const projectsQuery = await client.query<ProjectRecord & { teamName: string; teamId: string }>(`
    SELECT p.id, p.team_id AS "teamId", p.name, p.project_type AS type,
           t.name AS "teamName"
    FROM projects p
    JOIN teams t ON t.id = p.team_id
    ORDER BY p.id
  `);
  const teamsQuery = await client.query<{ id: string; name: string }>(
    'SELECT id, name FROM teams ORDER BY id',
  );
  const project = projectsQuery.rows[0];
  if (!project) {
    return {
      projectCount: projectsQuery.rowCount ?? 0,
      teamCount: teamsQuery.rowCount ?? 0,
      project: null,
      team: null,
      activeSprints: [],
      members: [],
      issues: [],
      scopeChanges: [],
      burndown: [],
    };
  }

  const sprintQuery = await client.query<SprintRecord>(`
    SELECT id, external_key AS key, name, goal,
           TO_CHAR(start_date, 'YYYY-MM-DD') AS "startDate",
           TO_CHAR(end_date, 'YYYY-MM-DD') AS "endDate",
           TO_CHAR(as_of_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "asOf",
           original_committed_points::text AS "originalCommittedPoints"
    FROM sprints
    WHERE project_id = $1 AND state = 'active'
    ORDER BY id
  `, [project.id]);

  const activeSprint = sprintQuery.rows[0];
  if (!activeSprint) {
    return {
      projectCount: projectsQuery.rowCount ?? 0,
      teamCount: teamsQuery.rowCount ?? 0,
      project: { id: project.id, teamId: project.teamId, name: project.name, type: project.type },
      team: { id: project.teamId, name: project.teamName },
      activeSprints: [],
      members: [],
      issues: [],
      scopeChanges: [],
      burndown: [],
    };
  }

  const membersQuery = await client.query<MemberRecord>(`
    SELECT id, display_name AS name
    FROM team_members
    WHERE team_id = $1 AND is_active = TRUE
    ORDER BY display_name, id
  `, [project.teamId]);
  const issuesQuery = await client.query<IssueRecord>(`
    SELECT i.id, i.external_key AS key, i.summary,
           i.assignee_id AS "assigneeId", tm.display_name AS "assigneeName",
           i.status, i.priority, i.story_points::text AS "storyPoints", i.flagged
    FROM issues i
    LEFT JOIN team_members tm ON tm.id = i.assignee_id
    WHERE i.sprint_id = $1
    ORDER BY i.external_key
  `, [activeSprint.id]);
  const scopeChangesQuery = await client.query<ScopeChangeRecord>(`
    SELECT TO_CHAR(effective_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date,
           direction, points::text AS points
    FROM sprint_scope_changes
    WHERE sprint_id = $1
    ORDER BY effective_at, id
  `, [activeSprint.id]);
  const burndownQuery = await client.query<BurndownRecord>(`
    SELECT TO_CHAR(snapshot_date, 'YYYY-MM-DD') AS date,
           actual_remaining_points::text AS "actualRemainingPoints"
    FROM burndown_snapshots
    WHERE sprint_id = $1
    ORDER BY snapshot_date
  `, [activeSprint.id]);

  return {
    projectCount: projectsQuery.rowCount ?? 0,
    teamCount: teamsQuery.rowCount ?? 0,
    project: { id: project.id, teamId: project.teamId, name: project.name, type: project.type },
    team: { id: project.teamId, name: project.teamName },
    activeSprints: sprintQuery.rows,
    members: membersQuery.rows,
    issues: issuesQuery.rows,
    scopeChanges: scopeChangesQuery.rows,
    burndown: burndownQuery.rows,
  };
}