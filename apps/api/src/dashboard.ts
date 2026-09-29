type IssueStatus = 'To Do' | 'In Progress' | 'In Review' | 'Done';
type ScopeDirection = 'added' | 'removed';
type Freshness = 'current' | 'stale';

interface ProjectSummary {
  id: string;
  name: string;
  type: string;
}

interface TeamSummary {
  id: string;
  name: string;
  memberCount: number;
}

interface SprintSummary {
  id: string;
  key: string;
  name: string;
  goal: string | null;
  startDate: string;
  endDate: string;
  state: 'active';
}

interface DashboardSummary {
  originalCommittedPoints: number;
  currentScopePoints: number;
  netScopeChangePoints: number;
  completedPoints: number;
  remainingPoints: number;
  completionPercent: number | null;
  expectedCompletedPoints: number;
  paceVariancePoints: number;
  elapsedWorkingDays: number;
  totalWorkingDays: number;
  workingDaysRemaining: number;
  unestimatedIssueCount: number;
}

interface ScopeChange {
  date: string;
  direction: ScopeDirection;
  points: number;
}

interface BurndownPoint {
  date: string;
  elapsedWorkingDays: number;
  idealRemainingPoints: number;
  actualRemainingPoints: number;
}

interface StatusBreakdownRow {
  status: IssueStatus;
  issueCount: number;
  estimatedPoints: number;
}

interface WorkloadRow {
  assigneeId: string | null;
  assigneeName: string;
  assignedPoints: number;
  completedPoints: number;
  remainingPoints: number;
}

interface IssueRow {
  id: string;
  key: string;
  summary: string;
  assigneeId: string | null;
  assigneeName: string | null;
  status: IssueStatus;
  priority: string | null;
  storyPoints: number | null;
  flagged: boolean;
}

export interface DashboardResponse {
  asOf: string;
  freshness: Freshness;
  project: ProjectSummary;
  team: TeamSummary;
  sprint: SprintSummary;
  summary: DashboardSummary;
  scopeChanges: ScopeChange[];
  burndown: BurndownPoint[];
  statusBreakdown: StatusBreakdownRow[];
  workload: WorkloadRow[];
  issues: IssueRow[];
}

export const dashboardFixture: DashboardResponse = {
  asOf: '2026-09-28T23:59:59Z',
  freshness: 'current',
  project: {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Staff Augment Project',
    type: 'Staff Augment',
  },
  team: {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Platform Team',
    memberCount: 10,
  },
  sprint: {
    id: '33333333-3333-4333-8333-333333333333',
    key: 'TEAM-24',
    name: 'Sprint 24',
    goal: 'Local dashboard shell validation',
    startDate: '2026-09-21',
    endDate: '2026-10-02',
    state: 'active',
  },
  summary: {
    originalCommittedPoints: 72,
    currentScopePoints: 78,
    netScopeChangePoints: 6,
    completedPoints: 42,
    remainingPoints: 36,
    completionPercent: 53.85,
    expectedCompletedPoints: 43.2,
    paceVariancePoints: -1.2,
    elapsedWorkingDays: 6,
    totalWorkingDays: 10,
    workingDaysRemaining: 4,
    unestimatedIssueCount: 1,
  },
  scopeChanges: [{ date: '2026-09-24', direction: 'added', points: 6 }],
  burndown: [
    { date: '2026-09-21', elapsedWorkingDays: 1, idealRemainingPoints: 64.8, actualRemainingPoints: 72 },
    { date: '2026-09-22', elapsedWorkingDays: 2, idealRemainingPoints: 57.6, actualRemainingPoints: 68 },
    { date: '2026-09-23', elapsedWorkingDays: 3, idealRemainingPoints: 50.4, actualRemainingPoints: 64 },
    { date: '2026-09-24', elapsedWorkingDays: 4, idealRemainingPoints: 43.2, actualRemainingPoints: 70 },
    { date: '2026-09-25', elapsedWorkingDays: 5, idealRemainingPoints: 36, actualRemainingPoints: 54 },
    { date: '2026-09-28', elapsedWorkingDays: 6, idealRemainingPoints: 28.8, actualRemainingPoints: 36 },
  ],
  statusBreakdown: [
    { status: 'To Do', issueCount: 3, estimatedPoints: 12 },
    { status: 'In Progress', issueCount: 2, estimatedPoints: 10 },
    { status: 'In Review', issueCount: 1, estimatedPoints: 6 },
    { status: 'Done', issueCount: 4, estimatedPoints: 20 },
  ],
  workload: [
    { assigneeId: '44444444-4444-4444-8444-444444444444', assigneeName: 'Avery Stone', assignedPoints: 13, completedPoints: 8, remainingPoints: 5 },
    { assigneeId: '55555555-5555-4555-8555-555555555555', assigneeName: 'Bri Chen', assignedPoints: 11, completedPoints: 7, remainingPoints: 4 },
    { assigneeId: '66666666-6666-4666-8666-666666666666', assigneeName: 'Casper Diaz', assignedPoints: 8, completedPoints: 4, remainingPoints: 4 },
    { assigneeId: '77777777-7777-4777-8777-777777777777', assigneeName: 'Dara Singh', assignedPoints: 9, completedPoints: 5, remainingPoints: 4 },
    { assigneeId: '88888888-8888-4888-8888-888888888888', assigneeName: 'Eden Park', assignedPoints: 7, completedPoints: 2, remainingPoints: 5 },
    { assigneeId: '99999999-9999-4999-8999-999999999999', assigneeName: 'Finn Woods', assignedPoints: 8, completedPoints: 3, remainingPoints: 5 },
    { assigneeId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', assigneeName: 'Gina Ortiz', assignedPoints: 5, completedPoints: 3, remainingPoints: 2 },
    { assigneeId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', assigneeName: 'Hugo Reed', assignedPoints: 6, completedPoints: 2, remainingPoints: 4 },
    { assigneeId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', assigneeName: 'Iris Jones', assignedPoints: 0, completedPoints: 0, remainingPoints: 0 },
    { assigneeId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', assigneeName: 'Jules Tran', assignedPoints: 0, completedPoints: 0, remainingPoints: 0 },
    { assigneeId: null, assigneeName: 'Unassigned', assignedPoints: 11, completedPoints: 8, remainingPoints: 3 },
  ],
  issues: [
    {
      id: '55555555-5555-4555-8555-555555555555',
      key: 'TEAM-101',
      summary: 'Finalize sprint dashboard schema',
      assigneeId: '44444444-4444-4444-8444-444444444444',
      assigneeName: 'Avery Stone',
      status: 'In Progress',
      priority: 'High',
      storyPoints: 5,
      flagged: false,
    },
    {
      id: '66666666-6666-4666-8666-666666666666',
      key: 'TEAM-102',
      summary: 'Build dashboard API contract',
      assigneeId: '55555555-5555-4555-8555-555555555555',
      assigneeName: 'Bri Chen',
      status: 'Done',
      priority: 'High',
      storyPoints: 8,
      flagged: false,
    },
    {
      id: '77777777-7777-4777-8777-777777777777',
      key: 'TEAM-103',
      summary: 'Prepare backlog review notes',
      assigneeId: null,
      assigneeName: null,
      status: 'To Do',
      priority: 'Medium',
      storyPoints: null,
      flagged: true,
    },
    {
      id: '88888888-8888-4888-8888-888888888888',
      key: 'TEAM-104',
      summary: 'Review status report formatting',
      assigneeId: '66666666-6666-4666-8666-666666666666',
      assigneeName: 'Casper Diaz',
      status: 'In Review',
      priority: 'Medium',
      storyPoints: 6,
      flagged: false,
    },
    {
      id: '99999999-9999-4999-8999-999999999999',
      key: 'TEAM-105',
      summary: 'Confirm local data readiness',
      assigneeId: '77777777-7777-4777-8777-777777777777',
      assigneeName: 'Dara Singh',
      status: 'Done',
      priority: 'Low',
      storyPoints: 3,
      flagged: false,
    },
  ],
};

export function getDashboardFixture(): DashboardResponse {
  return structuredClone(dashboardFixture);
}
