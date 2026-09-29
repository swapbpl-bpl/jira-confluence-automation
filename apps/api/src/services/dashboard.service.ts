import type { Pool, PoolClient } from 'pg';
import {
  ISSUE_STATUSES,
  isDashboardResponse,
  type DashboardResponse,
  type IssueStatus,
} from '@hello-genai/contracts';
import { loadDashboardSource, type DashboardSource } from '../repositories/dashboard.repository.js';

export class DashboardError extends Error {
  constructor(
    readonly code: 'ACTIVE_SPRINT_NOT_FOUND' | 'DASHBOARD_DATA_INVALID' | 'DATABASE_UNAVAILABLE',
  ) {
    super(code);
  }
}

function invalidData(): never {
  throw new DashboardError('DASHBOARD_DATA_INVALID');
}

function numericValue(value: string | null): number {
  if (value === null) return 0;
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) invalidData();
  return numeric;
}

function cents(value: number): number {
  return Math.round(value * 100);
}

function points(valueInCents: number): number {
  return valueInCents / 100;
}

function parseDate(date: string): Date {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== date) invalidData();
  return parsed;
}

function countWorkingDays(startDate: string, endDate: string): number {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (end < start) invalidData();
  let count = 0;
  for (let day = start.valueOf(); day <= end.valueOf(); day += 86400000) {
    const weekday = new Date(day).getUTCDay();
    if (weekday !== 0 && weekday !== 6) count += 1;
  }
  return count;
}

function roundPoints(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

async function roundCompletionPercent(
  client: PoolClient,
  completedPoints: number,
  currentScopePoints: number,
): Promise<number | null> {
  const result = await client.query<{ completionPercent: string | null }>(`
    SELECT CASE WHEN $2::numeric = 0 THEN NULL
      ELSE ROUND($1::numeric / $2::numeric * 100, 2)::text
    END AS "completionPercent"
  `, [completedPoints, currentScopePoints]);
  return result.rows[0].completionPercent === null
    ? null
    : Number(result.rows[0].completionPercent);
}

export async function buildDashboardResponse(
  client: PoolClient,
  source: DashboardSource,
): Promise<DashboardResponse> {
  if (source.projectCount !== 1 || source.teamCount !== 1 || !source.project || !source.team) invalidData();
  if (source.activeSprints.length === 0) throw new DashboardError('ACTIVE_SPRINT_NOT_FOUND');
  if (source.activeSprints.length !== 1 || source.members.length !== 10) invalidData();

  const sprint = source.activeSprints[0];
  const originalCents = cents(numericValue(sprint.originalCommittedPoints));
  const estimatedByStatus = new Map<IssueStatus, number>(ISSUE_STATUSES.map((status) => [status, 0]));
  const issueCountByStatus = new Map<IssueStatus, number>(ISSUE_STATUSES.map((status) => [status, 0]));
  const memberTotals = new Map(source.members.map((member) => [member.id, {
    id: member.id,
    name: member.name,
    assignedCents: 0,
    completedCents: 0,
  }]));
  let unassignedCents = 0;
  let scopeCents = 0;
  let completedCents = 0;
  let unestimatedIssueCount = 0;

  for (const issue of source.issues) {
    if (!ISSUE_STATUSES.includes(issue.status as IssueStatus)) invalidData();
    const status = issue.status as IssueStatus;
    issueCountByStatus.set(status, (issueCountByStatus.get(status) ?? 0) + 1);
    if (issue.storyPoints === null) {
      unestimatedIssueCount += 1;
      continue;
    }
    const issueCents = cents(numericValue(issue.storyPoints));
    scopeCents += issueCents;
    estimatedByStatus.set(status, (estimatedByStatus.get(status) ?? 0) + issueCents);
    if (status === 'Done') completedCents += issueCents;

    if (issue.assigneeId === null) {
      unassignedCents += issueCents;
    } else {
      const member = memberTotals.get(issue.assigneeId);
      if (!member) invalidData();
      member.assignedCents += issueCents;
      if (status === 'Done') member.completedCents += issueCents;
    }
  }

  const scopeChanges = source.scopeChanges.map((change) => ({
    date: change.date,
    direction: change.direction,
    points: numericValue(change.points),
  }));
  for (const change of scopeChanges) {
    if (parseDate(change.date) < parseDate(sprint.startDate)
      || parseDate(change.date) > parseDate(sprint.asOf.slice(0, 10))) invalidData();
  }
  const netScopeCents = source.scopeChanges.reduce((total, change) => {
    const changeCents = cents(numericValue(change.points));
    return total + (change.direction === 'added' ? changeCents : -changeCents);
  }, 0);
  if (scopeCents !== originalCents + netScopeCents) invalidData();

  const startWorkingDays = countWorkingDays(sprint.startDate, sprint.endDate);
  if (startWorkingDays < 1) invalidData();
  const asOfDate = sprint.asOf.slice(0, 10);
  const asOfTimestamp = Date.parse(sprint.asOf);
  if (!Number.isFinite(asOfTimestamp) || asOfTimestamp > Date.now()) invalidData();
  parseDate(asOfDate);
  const snapshotDates = new Set(source.burndown.map((snapshot) => snapshot.date));
  const sprintStart = parseDate(sprint.startDate);
  const snapshotEnd = parseDate(asOfDate);
  for (let day = sprintStart.valueOf(); day <= snapshotEnd.valueOf(); day += 86400000) {
    const date = new Date(day);
    const weekday = date.getUTCDay();
    if (weekday !== 0 && weekday !== 6 && !snapshotDates.has(date.toISOString().slice(0, 10))) invalidData();
  }
  const latestSnapshot = source.burndown[source.burndown.length - 1];
  if (!latestSnapshot || latestSnapshot.date !== asOfDate) invalidData();
  if (cents(numericValue(latestSnapshot.actualRemainingPoints)) !== scopeCents - completedCents) invalidData();

  const elapsedWorkingDays = Math.min(
    startWorkingDays,
    countWorkingDays(sprint.startDate, asOfDate),
  );
  const currentScopePoints = points(scopeCents);
  const completedPoints = points(completedCents);
  const remainingPoints = points(scopeCents - completedCents);
  const originalCommittedPoints = points(originalCents);
  const expectedCompletedPoints = roundPoints(originalCommittedPoints * elapsedWorkingDays / startWorkingDays);
  const completionPercent = await roundCompletionPercent(client, completedPoints, currentScopePoints);

  const members: DashboardResponse['workload'] = Array.from(memberTotals.values()).map((member) => ({
    assigneeId: member.id,
    assigneeName: member.name,
    assignedPoints: points(member.assignedCents),
    completedPoints: points(member.completedCents),
    remainingPoints: points(member.assignedCents - member.completedCents),
  }));
  if (unassignedCents > 0) {
    const unassignedCompleted = source.issues.reduce((total, issue) => (
      issue.assigneeId === null && issue.status === 'Done' && issue.storyPoints !== null
        ? total + cents(numericValue(issue.storyPoints))
        : total
    ), 0);
    members.push({
      assigneeId: null,
      assigneeName: 'Unassigned',
      assignedPoints: points(unassignedCents),
      completedPoints: points(unassignedCompleted),
      remainingPoints: points(unassignedCents - unassignedCompleted),
    });
  }

  const burndown = source.burndown.map((snapshot) => {
    const snapshotDate = parseDate(snapshot.date);
    const weekday = snapshotDate.getUTCDay();
    if (weekday === 0 || weekday === 6) invalidData();
    const elapsed = countWorkingDays(sprint.startDate, snapshot.date);
    if (elapsed < 1 || elapsed > startWorkingDays) invalidData();
    return {
      date: snapshot.date,
      elapsedWorkingDays: elapsed,
      idealRemainingPoints: roundPoints(originalCommittedPoints * (1 - elapsed / startWorkingDays)),
      actualRemainingPoints: numericValue(snapshot.actualRemainingPoints),
    };
  });

  const response: DashboardResponse = {
    asOf: sprint.asOf,
    freshness: Date.now() - Date.parse(sprint.asOf) <= 24 * 60 * 60 * 1000 ? 'current' : 'stale',
    project: { id: source.project.id, name: source.project.name, type: source.project.type },
    team: { id: source.team.id, name: source.team.name, memberCount: source.members.length },
    sprint: {
      id: sprint.id,
      key: sprint.key,
      name: sprint.name,
      goal: sprint.goal,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      state: 'active',
    },
    summary: {
      originalCommittedPoints,
      currentScopePoints,
      netScopeChangePoints: points(netScopeCents),
      completedPoints,
      remainingPoints,
      completionPercent,
      expectedCompletedPoints,
      paceVariancePoints: roundPoints(completedPoints - expectedCompletedPoints),
      elapsedWorkingDays,
      totalWorkingDays: startWorkingDays,
      workingDaysRemaining: startWorkingDays - elapsedWorkingDays,
      unestimatedIssueCount,
    },
    scopeChanges,
    burndown,
    statusBreakdown: ISSUE_STATUSES.map((status) => ({
      status,
      issueCount: issueCountByStatus.get(status) ?? 0,
      estimatedPoints: points(estimatedByStatus.get(status) ?? 0),
    })),
    workload: members,
    issues: source.issues.map((issue) => ({
      id: issue.id,
      key: issue.key,
      summary: issue.summary,
      assigneeId: issue.assigneeId,
      assigneeName: issue.assigneeName,
      status: issue.status as IssueStatus,
      priority: issue.priority,
      storyPoints: issue.storyPoints === null ? null : numericValue(issue.storyPoints),
      flagged: issue.flagged,
    })),
  };

  if (!isDashboardResponse(response)) invalidData();
  return response;
}

export async function getDashboard(pool: Pool): Promise<DashboardResponse> {
  let client: PoolClient | undefined;
  try {
    client = await pool.connect();
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const source = await loadDashboardSource(client);
    const response = await buildDashboardResponse(client, source);
    await client.query('COMMIT');
    return response;
  } catch (error) {
    await client?.query('ROLLBACK').catch(() => undefined);
    if (error instanceof DashboardError) throw error;
    throw new DashboardError('DATABASE_UNAVAILABLE');
  } finally {
    client?.release();
  }
}