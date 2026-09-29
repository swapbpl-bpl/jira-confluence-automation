import { useEffect, useMemo, useState } from 'react';

type DashboardResponse = {
  asOf: string;
  freshness: 'current' | 'stale';
  project: { id: string; name: string; type: string };
  team: { id: string; name: string; memberCount: number };
  sprint: { id: string; key: string; name: string; goal: string | null; startDate: string; endDate: string; state: 'active' };
  summary: {
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
  };
  scopeChanges: { date: string; direction: 'added' | 'removed'; points: number }[];
  burndown: { date: string; elapsedWorkingDays: number; idealRemainingPoints: number; actualRemainingPoints: number }[];
  statusBreakdown: { status: string; issueCount: number; estimatedPoints: number }[];
  workload: { assigneeId: string | null; assigneeName: string; assignedPoints: number; completedPoints: number; remainingPoints: number }[];
  issues: { id: string; key: string; summary: string; assigneeId: string | null; assigneeName: string | null; status: string; priority: string | null; storyPoints: number | null; flagged: boolean }[];
};

const formatPercent = (value: number | null) => (value == null ? 'N/A' : `${value.toFixed(2)}%`);

export default function App() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/dashboard');
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const json = (await response.json()) as DashboardResponse;
      setData(json);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unknown error');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const blockedCount = useMemo(
    () => data?.issues.filter((issue) => issue.flagged).length ?? 0,
    [data],
  );

  if (loading) {
    return <main className="page"><section className="card loading"><h1>Loading sprint dashboard…</h1><p>Waiting for the local API snapshot.</p></section></main>;
  }

  if (error) {
    return (
      <main className="page">
        <section className="card error">
          <h1>Dashboard unavailable</h1>
          <p>{error}</p>
          <button type="button" onClick={() => void loadDashboard()}>Retry</button>
        </section>
      </main>
    );
  }

  if (!data) {
    return <main className="page"><section className="card"><h1>No dashboard data</h1></section></main>;
  }

  return (
    <main className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">{data.project.type}</p>
          <h1>{data.project.name}</h1>
        </div>
        <div className="pill">{data.freshness}</div>
      </header>

      <section className="grid top">
        <article className="card">
          <h2>Team</h2>
          <p>{data.team.name}</p>
          <p>{data.team.memberCount} active members</p>
        </article>

        <article className="card">
          <h2>Sprint</h2>
          <p>{data.sprint.key} • {data.sprint.name}</p>
          <p>{data.sprint.startDate} to {data.sprint.endDate}</p>
        </article>

        <article className="card">
          <h2>Goal</h2>
          <p>{data.sprint.goal ?? 'No sprint goal set'}</p>
          <small>As of {data.asOf}</small>
        </article>
      </section>

      <section className="grid stats">
        <article className="card stat"><span>Original commitment</span><strong>{data.summary.originalCommittedPoints}</strong></article>
        <article className="card stat"><span>Current scope</span><strong>{data.summary.currentScopePoints}</strong></article>
        <article className="card stat"><span>Completed</span><strong>{data.summary.completedPoints}</strong></article>
        <article className="card stat"><span>Remaining</span><strong>{data.summary.remainingPoints}</strong></article>
        <article className="card stat"><span>Completion</span><strong>{formatPercent(data.summary.completionPercent)}</strong></article>
      </section>

      <section className="grid split">
        <article className="card">
          <h2>Pace and burndown</h2>
          <ul className="metric-list">
            <li>Expected completed: {data.summary.expectedCompletedPoints}</li>
            <li>Pace variance: {data.summary.paceVariancePoints} pts</li>
            <li>Elapsed working days: {data.summary.elapsedWorkingDays} of {data.summary.totalWorkingDays}</li>
            <li>Working days remaining: {data.summary.workingDaysRemaining}</li>
          </ul>
          <div className="burndown-values">
            {data.burndown.map((point) => (
              <div key={`${point.date}-${point.elapsedWorkingDays}`} className="burndown-row">
                <span>{point.date}</span>
                <span>ideal {point.idealRemainingPoints}</span>
                <span>actual {point.actualRemainingPoints}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <h2>Status and blockers</h2>
          <ul className="metric-list">
            {data.statusBreakdown.map((status) => (
              <li key={status.status}><strong>{status.status}</strong>: {status.issueCount} issues / {status.estimatedPoints} pts</li>
            ))}
          </ul>
          <p className="blocked-note">Blocked issues: {blockedCount}</p>
        </article>
      </section>

      <section className="grid split">
        <article className="card">
          <h2>Team workload</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Member</th><th>Assigned</th><th>Completed</th><th>Remaining</th></tr>
              </thead>
              <tbody>
                {data.workload.map((row) => (
                  <tr key={`${row.assigneeName}-${row.assigneeId ?? 'unassigned'}`}>
                    <td>{row.assigneeName}</td>
                    <td>{row.assignedPoints}</td>
                    <td>{row.completedPoints}</td>
                    <td>{row.remainingPoints}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card">
          <h2>Scope changes</h2>
          <ul className="metric-list">
            {data.scopeChanges.map((change) => (
              <li key={`${change.date}-${change.direction}`}>
                {change.date}: {change.direction} {change.points} pts
              </li>
            ))}
          </ul>
        </article>
      </section>

      <article className="card">
        <h2>Issue details</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Key</th><th>Summary</th><th>Assignee</th><th>Status</th><th>Priority</th><th>Points</th><th>Blocked</th></tr>
            </thead>
            <tbody>
              {data.issues.map((issue) => (
                <tr key={issue.id}>
                  <td>{issue.key}</td>
                  <td>{issue.summary}</td>
                  <td>{issue.assigneeName ?? 'Unassigned'}</td>
                  <td>{issue.status}</td>
                  <td>{issue.priority ?? '—'}</td>
                  <td>{issue.storyPoints ?? '—'}</td>
                  <td>{issue.flagged ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </main>
  );
}
