async function loadData() {
  const res = await fetch("data.json");
  if (!res.ok) {
    throw new Error(`Failed to load data.json: ${res.status}`);
  }
  return res.json();
}

function daysBetween(startStr, endStr) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function renderSummary(sprint, issues) {
  const totalPoints = issues.reduce((sum, i) => sum + i.points, 0);
  const donePoints = issues.filter(i => i.status === "Done").reduce((sum, i) => sum + i.points, 0);
  const percent = totalPoints === 0 ? 0 : Math.round((donePoints / totalPoints) * 100);
  const daysRemaining = Math.max(0, daysBetween(sprint.today, sprint.endDate));

  document.getElementById("sprint-title").textContent = `${sprint.name} — Progress Dashboard`;
  document.getElementById("sprint-meta").textContent =
    `${sprint.team} · ${formatDate(sprint.startDate)} – ${formatDate(sprint.endDate)} · as of ${formatDate(sprint.today)}`;

  document.getElementById("stat-total").textContent = totalPoints;
  document.getElementById("stat-done").textContent = donePoints;
  document.getElementById("stat-percent").textContent = `${percent}%`;
  document.getElementById("stat-days").textContent = daysRemaining;

  return { totalPoints, donePoints };
}

function renderBurndown(sprint, totalPoints, donePoints) {
  const sprintLengthDays = daysBetween(sprint.startDate, sprint.endDate);
  const labels = [];
  const idealData = [];
  for (let d = 0; d <= sprintLengthDays; d++) {
    const date = new Date(sprint.startDate);
    date.setDate(date.getDate() + d);
    labels.push(formatDate(date.toISOString().slice(0, 10)));
    idealData.push(Math.round(totalPoints - (totalPoints / sprintLengthDays) * d));
  }

  const todayIndex = Math.min(sprintLengthDays, Math.max(0, daysBetween(sprint.startDate, sprint.today)));
  const remainingToday = totalPoints - donePoints;
  const actualData = labels.map((_, idx) => (idx === todayIndex ? remainingToday : null));

  new Chart(document.getElementById("burndown-chart"), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Ideal burndown",
          data: idealData,
          borderColor: "#94a3b8",
          borderDash: [6, 4],
          pointRadius: 0,
          tension: 0
        },
        {
          label: "Actual remaining (today)",
          data: actualData,
          borderColor: "#38bdf8",
          backgroundColor: "#38bdf8",
          pointRadius: 6,
          showLine: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: "#e2e8f0" } } },
      scales: {
        x: { ticks: { color: "#94a3b8" }, grid: { color: "#334155" } },
        y: { ticks: { color: "#94a3b8" }, grid: { color: "#334155" }, beginAtZero: true }
      }
    }
  });
}

function renderStatusBreakdown(issues) {
  const statuses = ["To Do", "In Progress", "In Review", "Done"];
  const counts = statuses.map(s => issues.filter(i => i.status === s).length);

  new Chart(document.getElementById("status-chart"), {
    type: "bar",
    data: {
      labels: statuses,
      datasets: [
        {
          label: "Issues",
          data: counts,
          backgroundColor: ["#94a3b8", "#38bdf8", "#facc15", "#4ade80"]
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#94a3b8" }, grid: { display: false } },
        y: { ticks: { color: "#94a3b8", stepSize: 1 }, grid: { color: "#334155" }, beginAtZero: true }
      }
    }
  });
}

function renderBlockers(issues) {
  const list = document.getElementById("blockers-list");
  const flagged = issues.filter(i => i.flagged);

  if (flagged.length === 0) {
    list.innerHTML = `<li class="empty">No flagged issues 🎉</li>`;
    return;
  }

  list.innerHTML = flagged
    .map(
      i => `<li><span class="issue-id">${i.id}</span>${i.title} — ${i.status}, ${i.assignee}</li>`
    )
    .join("");
}

async function init() {
  const { sprint, issues } = await loadData();
  const { totalPoints, donePoints } = renderSummary(sprint, issues);
  renderBurndown(sprint, totalPoints, donePoints);
  renderStatusBreakdown(issues);
  renderBlockers(issues);
}

init().catch(err => {
  document.body.innerHTML = `<p style="color:#f87171;padding:2rem;">Error loading dashboard: ${err.message}</p>`;
});
