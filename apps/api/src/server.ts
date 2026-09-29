import express from 'express';

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(express.json());

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ready' });
});

app.get('/api/v1/dashboard', (_req, res) => {
  res.json({
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
      {
        assigneeId: '44444444-4444-4444-8444-444444444444',
        assigneeName: 'Example Teammate',
        assignedPoints: 13,
        completedPoints: 8,
        remainingPoints: 5,
      },
    ],
    issues: [
      {
        id: '55555555-5555-4555-8555-555555555555',
        key: 'TEAM-123',
        summary: 'Example issue',
        assigneeId: '44444444-4444-4444-8444-444444444444',
        assigneeName: 'Example Teammate',
        status: 'In Progress',
        priority: 'High',
        storyPoints: 5,
        flagged: false,
      },
    ],
  });
});

app.listen(port, '127.0.0.1', () => {
  console.log(`API listening on http://127.0.0.1:${port}`);
});
