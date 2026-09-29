import test from 'node:test';
import assert from 'node:assert/strict';
import type { PoolClient } from 'pg';

import type { DashboardSource } from '../apps/api/src/repositories/dashboard.repository.js';
import { buildDashboardResponse, DashboardError } from '../apps/api/src/services/dashboard.service.js';

const memberIds = Array.from({ length: 10 }, (_, index) => `member-${index + 1}`);

function createSource(): DashboardSource {
  const members = memberIds.map((id, index) => ({ id, name: `Member ${index + 1}` }));
  const issues: DashboardSource['issues'] = [
    { id: 'i1', key: 'TEAM-1', summary: 'To do', assigneeId: memberIds[0], assigneeName: 'Member 1', status: 'To Do', priority: null, storyPoints: '5.00', flagged: false },
    { id: 'i2', key: 'TEAM-2', summary: 'To do', assigneeId: null, assigneeName: null, status: 'To Do', priority: null, storyPoints: '7.00', flagged: true },
    { id: 'i3', key: 'TEAM-3', summary: 'Unestimated', assigneeId: memberIds[1], assigneeName: 'Member 2', status: 'To Do', priority: null, storyPoints: null, flagged: false },
    { id: 'i4', key: 'TEAM-4', summary: 'In progress', assigneeId: memberIds[2], assigneeName: 'Member 3', status: 'In Progress', priority: null, storyPoints: '10.00', flagged: false },
    { id: 'i5', key: 'TEAM-5', summary: 'In review', assigneeId: memberIds[3], assigneeName: 'Member 4', status: 'In Review', priority: null, storyPoints: '14.00', flagged: false },
    { id: 'i6', key: 'TEAM-6', summary: 'Done', assigneeId: memberIds[4], assigneeName: 'Member 5', status: 'Done', priority: null, storyPoints: '42.00', flagged: false },
  ];
  return {
    projectCount: 1,
    teamCount: 1,
    project: { id: 'project', teamId: 'team', name: 'Example', type: 'Staff Augment' },
    team: { id: 'team', name: 'Example Team' },
    activeSprints: [{
      id: 'sprint', key: 'TEAM-24', name: 'Sprint 24', goal: null,
      startDate: '2026-09-21', endDate: '2026-10-02', asOf: '2026-09-28T23:59:59Z',
      originalCommittedPoints: '72.00',
    }],
    members,
    issues,
    scopeChanges: [{ date: '2026-09-24', direction: 'added', points: '6.00' }],
    burndown: [
      { date: '2026-09-21', actualRemainingPoints: '72.00' },
      { date: '2026-09-22', actualRemainingPoints: '68.00' },
      { date: '2026-09-23', actualRemainingPoints: '64.00' },
      { date: '2026-09-24', actualRemainingPoints: '70.00' },
      { date: '2026-09-25', actualRemainingPoints: '54.00' },
      { date: '2026-09-28', actualRemainingPoints: '36.00' },
    ],
  };
}

function fakeClient(): PoolClient {
  return {
    query: async (_query: string, values: number[]) => ({
      rows: [{ completionPercent: values[1] === 0 ? null : '53.85' }],
    }),
  } as unknown as PoolClient;
}

test('dashboard metrics reconcile issue points, pace, status, and workload', async () => {
  const result = await buildDashboardResponse(fakeClient(), createSource());

  assert.equal(result.summary.currentScopePoints, 78);
  assert.equal(result.summary.completedPoints, 42);
  assert.equal(result.summary.remainingPoints, 36);
  assert.equal(result.summary.completionPercent, 53.85);
  assert.equal(result.summary.expectedCompletedPoints, 43.2);
  assert.equal(result.summary.paceVariancePoints, -1.2);
  assert.equal(result.summary.unestimatedIssueCount, 1);
  assert.equal(result.statusBreakdown.length, 4);
  assert.equal(result.workload.length, 11);
  assert.equal(result.issues.length, 6);
});

test('zero estimated scope returns unavailable completion', async () => {
  const source = createSource();
  source.activeSprints[0].originalCommittedPoints = '0.00';
  source.issues = [];
  source.scopeChanges = [];
  source.burndown = [
    { date: '2026-09-21', actualRemainingPoints: '0.00' },
    { date: '2026-09-22', actualRemainingPoints: '0.00' },
    { date: '2026-09-23', actualRemainingPoints: '0.00' },
    { date: '2026-09-24', actualRemainingPoints: '0.00' },
    { date: '2026-09-25', actualRemainingPoints: '0.00' },
    { date: '2026-09-28', actualRemainingPoints: '0.00' },
  ];
  const result = await buildDashboardResponse(fakeClient(), source);

  assert.equal(result.summary.completionPercent, null);
  assert.equal(result.summary.currentScopePoints, 0);
  assert.equal(result.statusBreakdown.every((row) => row.issueCount === 0), true);
  assert.equal(result.workload.length, 10);
});

test('scope changes that do not reconcile with issue estimates are rejected', async () => {
  const source = createSource();
  source.scopeChanges[0].points = '5.00';

  await assert.rejects(
    buildDashboardResponse(fakeClient(), source),
    (error: unknown) => error instanceof DashboardError && error.code === 'DASHBOARD_DATA_INVALID',
  );
});

test('the latest actual snapshot must equal current remaining points', async () => {
  const source = createSource();
  source.burndown.at(-1)!.actualRemainingPoints = '37.00';

  await assert.rejects(
    buildDashboardResponse(fakeClient(), source),
    (error: unknown) => error instanceof DashboardError && error.code === 'DASHBOARD_DATA_INVALID',
  );
});

test('missing working-day snapshots are rejected instead of interpolated', async () => {
  const source = createSource();
  source.burndown.splice(2, 1);

  await assert.rejects(
    buildDashboardResponse(fakeClient(), source),
    (error: unknown) => error instanceof DashboardError && error.code === 'DASHBOARD_DATA_INVALID',
  );
});