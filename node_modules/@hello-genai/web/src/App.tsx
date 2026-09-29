import { useEffect, useState } from 'react';

type DashboardResponse = {
  asOf: string;
  freshness: string;
  project: { name: string; type: string };
  team: { name: string; memberCount: number };
  sprint: { key: string; name: string; goal: string; startDate: string; endDate: string };
  summary: { originalCommittedPoints: number; currentScopePoints: number; completedPoints: number; remainingPoints: number; completionPercent: number };
};

export default function App() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/dashboard')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const json = (await response.json()) as DashboardResponse;
        setData(json);
      })
      .catch((fetchError) => {
        setError(fetchError instanceof Error ? fetchError.message : 'Unknown error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <main className="page"><h1>Loading dashboard…</h1></main>;
  }

  if (error) {
    return <main className="page"><h1>Dashboard unavailable</h1><p>{error}</p></main>;
  }

  if (!data) {
    return <main className="page"><h1>No dashboard data</h1></main>;
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
        <div className="card">
          <h2>Team</h2>
          <p>{data.team.name}</p>
          <p>{data.team.memberCount} active members</p>
        </div>
        <div className="card">
          <h2>Sprint</h2>
          <p>{data.sprint.key} • {data.sprint.name}</p>
          <p>{data.sprint.startDate} to {data.sprint.endDate}</p>
        </div>
        <div className="card">
          <h2>Goal</h2>
          <p>{data.sprint.goal}</p>
        </div>
      </section>

      <section className="grid stats">
        <div className="card stat">
          <span>Original commitment</span>
          <strong>{data.summary.originalCommittedPoints}</strong>
        </div>
        <div className="card stat">
          <span>Current scope</span>
          <strong>{data.summary.currentScopePoints}</strong>
        </div>
        <div className="card stat">
          <span>Completed</span>
          <strong>{data.summary.completedPoints}</strong>
        </div>
        <div className="card stat">
          <span>Remaining</span>
          <strong>{data.summary.remainingPoints}</strong>
        </div>
        <div className="card stat">
          <span>Completion</span>
          <strong>{data.summary.completionPercent}%</strong>
        </div>
      </section>
    </main>
  );
}
