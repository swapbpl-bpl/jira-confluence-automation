import { useEffect, useState } from 'react';
import {
  isApiErrorResponse,
  isDashboardResponse,
  ISSUE_STATUSES,
  type DashboardResponse,
  type IssueStatus,
} from '@hello-genai/contracts';

interface LoadError {
  message: string;
  retryable: boolean;
}

interface BurndownChartProps {
  data: DashboardResponse;
}

function formatPoints(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function formatAsOf(value: string): string {
  return new Date(value).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }) + ' UTC';
}

function BurndownChart({ data }: BurndownChartProps) {
  const { burndown } = data;
  const maxValue = Math.max(
    data.summary.originalCommittedPoints,
    ...burndown.flatMap((point) => [point.actualRemainingPoints, point.idealRemainingPoints]),
    1,
  );
  const left = 56;
  const right = 760;
  const top = 20;
  const bottom = 250;
  const chartX = (elapsed: number) => left + (elapsed / data.summary.totalWorkingDays) * (right - left);
  const chartY = (value: number) => bottom - (value / maxValue) * (bottom - top);
  const idealPoints = [
    { elapsedWorkingDays: 0, idealRemainingPoints: data.summary.originalCommittedPoints },
    ...burndown,
  ];
  const idealLine = idealPoints
    .map((point) => `${chartX(point.elapsedWorkingDays)},${chartY(point.idealRemainingPoints)}`)
    .join(' ');
  const actualLine = burndown
    .map((point) => `${chartX(point.elapsedWorkingDays)},${chartY(point.actualRemainingPoints)}`)
    .join(' ');
  const ticks = Array.from({ length: 5 }, (_, index) => Math.round((maxValue * index) / 4));

  return (
    <>
      <div className="chart-legend" aria-hidden="true">
        <span><i className="legend-line ideal" />Ideal pace</span>
        <span><i className="legend-line actual" />Actual snapshots</span>
      </div>
      <div className="chart-scroll" role="region" aria-label="Sprint burndown chart, horizontally scrollable" tabIndex={0}>
        <svg
          className="burndown-chart"
          viewBox="0 0 800 300"
          role="img"
          aria-labelledby="burndown-title burndown-description"
        >
          <title id="burndown-title">Sprint burndown</title>
          <desc id="burndown-description">
            Ideal remaining points start at {formatPoints(data.summary.originalCommittedPoints)} on working day zero.
            Actual remaining points are shown only for the {burndown.length} recorded daily snapshots.
          </desc>
          {ticks.map((tick, index) => {
            const y = chartY(tick);
            return (
              <g key={`${tick}-${index}`}>
                <line x1={left} x2={right} y1={y} y2={y} className="chart-gridline" />
                <text x={left - 10} y={y + 4} textAnchor="end" className="chart-label">{tick}</text>
              </g>
            );
          })}
          <line x1={left} x2={right} y1={bottom} y2={bottom} className="chart-axis" />
          <polyline points={idealLine} className="chart-ideal-line" />
          {burndown.length > 0 && <polyline points={actualLine} className="chart-actual-line" />}
          {burndown.map((point) => (
            <circle
              key={point.date}
              cx={chartX(point.elapsedWorkingDays)}
              cy={chartY(point.actualRemainingPoints)}
              r="4"
              className="chart-actual-dot"
            >
              <title>{`${point.date}: ${formatPoints(point.actualRemainingPoints)} actual points`}</title>
            </circle>
          ))}
          <text x={left} y={bottom + 24} textAnchor="middle" className="chart-label">0</text>
          <text x={right} y={bottom + 24} textAnchor="middle" className="chart-label">{data.summary.totalWorkingDays}</text>
          <text x={(left + right) / 2} y="292" textAnchor="middle" className="chart-axis-title">Working days</text>
          <text x="14" y={(top + bottom) / 2} textAnchor="middle" transform={`rotate(-90 14 ${(top + bottom) / 2})`} className="chart-axis-title">Points remaining</text>
        </svg>
      </div>
      <p className="chart-caption">
        Pace is a directional signal against the original commitment, not a prediction of completion.
      </p>
    </>
  );
}

function LoadingState() {
  return (
    <main className="state-page" aria-live="polite" aria-busy="true">
      <span className="state-kicker">Sprint 24</span>
      <h1>Loading dashboard</h1>
      <p>Retrieving the latest complete sprint snapshot.</p>
      <div className="loading-rule" />
    </main>
  );
}

export default function SprintDashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loadError, setLoadError] = useState<LoadError | null>(null);
  const [noActiveSprint, setNoActiveSprint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [retryToken, setRetryToken] = useState(0);
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [blockedOnly, setBlockedOnly] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);
    setNoActiveSprint(false);

    async function loadDashboard() {
      try {
        const response = await fetch('/api/v1/dashboard', { signal: controller.signal });
        const payload: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          const errorBody = isApiErrorResponse(payload) ? payload.error : null;
          const errorCode = typeof errorBody?.code === 'string' ? errorBody.code : '';
          if (response.status === 404 && errorCode === 'ACTIVE_SPRINT_NOT_FOUND') {
            setNoActiveSprint(true);
            return;
          }
          const retryable = response.status === 503;
          setLoadError({
            message: typeof errorBody?.message === 'string'
              ? errorBody.message
              : retryable
                ? 'Dashboard data is temporarily unavailable.'
                : 'Dashboard data could not be loaded or validated.',
            retryable,
          });
          return;
        }
        if (!isDashboardResponse(payload)) {
          setLoadError({ message: 'The server returned an invalid dashboard response.', retryable: false });
          return;
        }
        setData(payload);
      } catch (error) {
        if (controller.signal.aborted) return;
        setLoadError({
          message: error instanceof Error ? 'Could not reach the dashboard service.' : 'Dashboard request failed.',
          retryable: true,
        });
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadDashboard();
    return () => controller.abort();
  }, [retryToken]);

  if (loading) return <LoadingState />;

  if (noActiveSprint) {
    return (
      <main className="state-page" role="status">
        <span className="state-kicker">Sprint dashboard</span>
        <h1>No active sprint</h1>
        <p>There is no active sprint in the local dashboard data.</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="state-page" role="alert">
        <span className="state-kicker">Sprint dashboard</span>
        <h1>{loadError.retryable ? 'Dashboard unavailable' : 'Dashboard data needs attention'}</h1>
        <p>{loadError.message}</p>
        {loadError.retryable && (
          <button className="button-primary" type="button" onClick={() => setRetryToken((value) => value + 1)}>
            Retry request
          </button>
        )}
      </main>
    );
  }

  if (!data) {
    return (
      <main className="state-page" role="status">
        <span className="state-kicker">Sprint dashboard</span>
        <h1>No dashboard data</h1>
        <p>The service returned no sprint snapshot.</p>
      </main>
    );
  }

  const blockedCount = data.issues.filter((issue) => issue.flagged).length;
  const filteredIssues = data.issues.filter((issue) => {
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesAssignee = assigneeFilter === 'all'
      || (assigneeFilter === 'unassigned' ? issue.assigneeId === null : issue.assigneeId === assigneeFilter);
    const matchesBlocked = !blockedOnly || issue.flagged;
    return matchesStatus && matchesAssignee && matchesBlocked;
  });
  const assignees = data.workload.filter((row) => row.assigneeId !== null);
  const completion = data.summary.completionPercent === null
    ? 'Unavailable'
    : `${formatPoints(data.summary.completionPercent)}%`;

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div className="brand-lockup" aria-label="Sprint delivery dashboard">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span>Delivery / Sprint view</span>
        </div>
        <div className="snapshot-status">
          <span className={`freshness-dot ${data.freshness}`} aria-hidden="true" />
          <span className={`freshness-label ${data.freshness}`}>
            {data.freshness === 'stale' ? 'Stale snapshot' : 'Current snapshot'}
          </span>
          <span className="as-of">As of {formatAsOf(data.asOf)}</span>
        </div>
      </header>

      <section className="context-block" aria-labelledby="project-title">
        <div>
          <p className="eyebrow">{data.project.type} / {data.team.name}</p>
          <h1 id="project-title">{data.project.name}</h1>
          <p className="sprint-goal">{data.sprint.goal ?? 'No sprint goal provided'}</p>
        </div>
        <div className="sprint-context">
          <span className="sprint-key">{data.sprint.key}</span>
          <strong>{data.sprint.name}</strong>
          <span>{data.sprint.startDate} to {data.sprint.endDate}</span>
          <span>{data.team.memberCount} active teammates</span>
        </div>
      </section>

      <section className="summary-section" aria-labelledby="summary-title">
        <div className="section-heading">
          <div>
            <p className="section-index">01 / DELIVERY</p>
            <h2 id="summary-title">Sprint summary</h2>
          </div>
          <p className="summary-period">{data.summary.elapsedWorkingDays} of {data.summary.totalWorkingDays} working days elapsed</p>
        </div>
        <div className="metric-grid">
          <article className="metric metric-baseline">
            <span>Original commitment</span>
            <strong>{formatPoints(data.summary.originalCommittedPoints)}<small> pts</small></strong>
            <p>Kickoff baseline</p>
          </article>
          <article className="metric">
            <span>Current scope</span>
            <strong>{formatPoints(data.summary.currentScopePoints)}<small> pts</small></strong>
            <p>Net change {data.summary.netScopeChangePoints > 0 ? '+' : ''}{formatPoints(data.summary.netScopeChangePoints)} pts</p>
          </article>
          <article className="metric">
            <span>Completed</span>
            <strong>{formatPoints(data.summary.completedPoints)}<small> pts</small></strong>
            <p>{completion} complete</p>
          </article>
          <article className="metric">
            <span>Remaining</span>
            <strong>{formatPoints(data.summary.remainingPoints)}<small> pts</small></strong>
            <p>{data.summary.workingDaysRemaining} working days remaining</p>
          </article>
          <article className="metric metric-signal">
            <span>Pace variance</span>
            <strong>{data.summary.paceVariancePoints > 0 ? '+' : ''}{formatPoints(data.summary.paceVariancePoints)}<small> pts</small></strong>
            <p>Expected {formatPoints(data.summary.expectedCompletedPoints)} pts / {data.summary.paceVariancePoints >= 0 ? 'ahead' : 'behind'} ideal pace</p>
          </article>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="panel burndown-panel" aria-labelledby="burndown-heading">
          <div className="panel-heading">
            <div>
              <p className="section-index">02 / PACE</p>
              <h2 id="burndown-heading">Burndown</h2>
            </div>
            <span className="panel-meta">{data.burndown.length} snapshots</span>
          </div>
          <BurndownChart data={data} />
        </section>

        <section className="panel status-panel" aria-labelledby="status-heading">
          <div className="panel-heading">
            <div>
              <p className="section-index">03 / FLOW</p>
              <h2 id="status-heading">Status and blockers</h2>
            </div>
            <span className="blocker-count">{blockedCount} blocked</span>
          </div>
          <div className="status-list">
            {data.statusBreakdown.map((row) => {
              const width = data.summary.currentScopePoints > 0
                ? Math.min(100, (row.estimatedPoints / data.summary.currentScopePoints) * 100)
                : 0;
              return (
                <div className="status-row" key={row.status}>
                  <div className="status-row-top">
                    <span className="status-name">{row.status}</span>
                    <span>{row.issueCount} {row.issueCount === 1 ? 'issue' : 'issues'} / {formatPoints(row.estimatedPoints)} pts</span>
                  </div>
                  <div className="status-track" aria-hidden="true">
                    <span className={`status-fill status-${ISSUE_STATUSES.indexOf(row.status)}`} style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="blocker-note">
            <span className="blocker-symbol" aria-hidden="true">!</span>
            <p><strong>{blockedCount} flagged {blockedCount === 1 ? 'issue' : 'issues'}</strong> are marked blocked from their explicit flag.</p>
          </div>
        </section>

        <section className="panel workload-panel" aria-labelledby="workload-heading">
          <div className="panel-heading">
            <div>
              <p className="section-index">04 / TEAM</p>
              <h2 id="workload-heading">Workload context</h2>
            </div>
            <span className="panel-meta">{assignees.length} teammates</span>
          </div>
          <p className="panel-description">Assigned, completed, and remaining story points. This is workload context, not a performance or utilization measure.</p>
          <div className="table-scroll" role="region" aria-label="Team workload table, horizontally scrollable" tabIndex={0}>
            <table className="data-table workload-table">
              <thead>
                <tr><th scope="col">Teammate</th><th scope="col">Assigned</th><th scope="col">Completed</th><th scope="col">Remaining</th></tr>
              </thead>
              <tbody>
                {data.workload.map((row) => (
                  <tr key={row.assigneeId ?? 'unassigned'}>
                    <th scope="row">{row.assigneeName}</th>
                    <td>{formatPoints(row.assignedPoints)}</td>
                    <td>{formatPoints(row.completedPoints)}</td>
                    <td>{formatPoints(row.remainingPoints)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel scope-panel" aria-labelledby="scope-heading">
          <div className="panel-heading">
            <div>
              <p className="section-index">05 / SCOPE</p>
              <h2 id="scope-heading">Scope changes</h2>
            </div>
            <span className="panel-meta">{data.scopeChanges.length} events</span>
          </div>
          {data.scopeChanges.length === 0 ? (
            <p className="empty-inline">No scope changes recorded.</p>
          ) : (
            <ul className="scope-list">
              {data.scopeChanges.map((change, index) => (
                <li key={`${change.date}-${index}`}>
                  <time dateTime={change.date}>{change.date}</time>
                  <span className={`scope-direction ${change.direction}`}>{change.direction}</span>
                  <strong>{change.direction === 'added' ? '+' : '-'}{formatPoints(change.points)} pts</strong>
                </li>
              ))}
            </ul>
          )}
          <p className="scope-total">Current scope differs from kickoff by <strong>{data.summary.netScopeChangePoints > 0 ? '+' : ''}{formatPoints(data.summary.netScopeChangePoints)} pts</strong>.</p>
        </section>
      </div>

      <section className="panel issues-panel" aria-labelledby="issues-heading">
        <div className="panel-heading issues-heading">
          <div>
            <p className="section-index">06 / ISSUE DETAIL</p>
            <h2 id="issues-heading">Sprint issues</h2>
          </div>
          <p className="result-count" aria-live="polite"><strong>{filteredIssues.length}</strong> of {data.issues.length} issues</p>
        </div>
        <div className="filter-row" aria-label="Filter sprint issues">
          <label>
            <span>Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as IssueStatus | 'all')}>
              <option value="all">All statuses</option>
              {ISSUE_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <label>
            <span>Assignee</span>
            <select value={assigneeFilter} onChange={(event) => setAssigneeFilter(event.target.value)}>
              <option value="all">All assignees</option>
              {assignees.map((member) => <option key={member.assigneeId!} value={member.assigneeId!}>{member.assigneeName}</option>)}
              <option value="unassigned">Unassigned</option>
            </select>
          </label>
          <label className="toggle-label">
            <input type="checkbox" checked={blockedOnly} onChange={(event) => setBlockedOnly(event.target.checked)} />
            <span>Blocked only</span>
          </label>
          <button
            className="button-reset"
            type="button"
            onClick={() => {
              setStatusFilter('all');
              setAssigneeFilter('all');
              setBlockedOnly(false);
            }}
          >
            Clear filters
          </button>
        </div>
        {data.issues.length === 0 ? (
          <div className="table-empty" role="status"><strong>No issues in this sprint</strong><span>The active sprint has no issue records.</span></div>
        ) : filteredIssues.length === 0 ? (
          <div className="table-empty" role="status"><strong>No matching issues</strong><span>Change or clear the filters to see sprint issues.</span></div>
        ) : (
          <div className="table-scroll issue-table-scroll" role="region" aria-label="Sprint issue table, horizontally scrollable" tabIndex={0}>
            <table className="data-table issue-table">
              <thead>
                <tr><th scope="col">Key</th><th scope="col">Summary</th><th scope="col">Assignee</th><th scope="col">Status</th><th scope="col">Priority</th><th scope="col">Points</th><th scope="col">Blocked</th></tr>
              </thead>
              <tbody>
                {filteredIssues.map((issue) => (
                  <tr key={issue.id}>
                    <td className="issue-key">{issue.key}</td>
                    <th scope="row" className="issue-summary">{issue.summary}</th>
                    <td>{issue.assigneeName ?? 'Unassigned'}</td>
                    <td><span className="status-tag">{issue.status}</span></td>
                    <td>{issue.priority ?? 'Not set'}</td>
                    <td>{issue.storyPoints === null ? <span className="unestimated">Unestimated</span> : formatPoints(issue.storyPoints)}</td>
                    <td>{issue.flagged ? <span className="blocked-tag">Flagged</span> : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className="dashboard-footer">
        <span>{data.summary.unestimatedIssueCount} unestimated {data.summary.unestimatedIssueCount === 1 ? 'issue' : 'issues'} excluded from point totals</span>
        <span>Read-only local snapshot</span>
      </footer>
    </main>
  );
}