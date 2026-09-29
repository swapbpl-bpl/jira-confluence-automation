const STATUS_ORDER = ["To Do", "In Progress", "In Review", "Done"];
const STATUS_CLASS = {
  "To Do": "todo",
  "In Progress": "progress",
  "In Review": "review",
  Done: "done",
};
const SVG_NS = "http://www.w3.org/2000/svg";

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}[character]));

const initialsFor = (name) => name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
const formatDate = (date) => new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const sumPoints = (issues) => issues.reduce((total, issue) => total + issue.points, 0);

function weekdayCount(startValue, endValue) {
  const start = new Date(`${startValue}T12:00:00Z`);
  const end = new Date(`${endValue}T12:00:00Z`);
  let count = 0;
  for (const day = new Date(start); day <= end; day.setUTCDate(day.getUTCDate() + 1)) {
    if (day.getUTCDay() !== 0 && day.getUTCDay() !== 6) count += 1;
  }
  return count;
}

function renderSprintOverview(sprint, issues) {
  const totalPoints = sumPoints(issues);
  const donePoints = sumPoints(issues.filter((issue) => issue.status === "Done"));
  const completion = totalPoints ? (donePoints / totalPoints) * 100 : 0;
  const elapsedDays = weekdayCount(sprint.startDate, sprint.asOf);
  const totalDays = weekdayCount(sprint.startDate, sprint.endDate);
  const elapsedPercent = totalDays ? (elapsedDays / totalDays) * 100 : 0;
  const remainingDays = Math.max(0, totalDays - elapsedDays);
  const paceDifference = Math.abs(totalPoints * (elapsedPercent / 100) - donePoints);

  document.title = `Sprint Pulse | ${sprint.key}`;
  document.getElementById("sprint-title").textContent = sprint.name;
  document.getElementById("sprint-key").textContent = sprint.key;
  document.getElementById("sprint-dates").textContent = `${formatDate(sprint.startDate)} – ${formatDate(sprint.endDate)}`;
  document.getElementById("sprint-goal").textContent = sprint.goal;
  document.getElementById("completion-percent").textContent = `${Math.round(completion)}%`;
  document.getElementById("points-complete").textContent = donePoints;
  document.getElementById("points-total").textContent = totalPoints;
  document.getElementById("team-points").textContent = totalPoints;
  document.getElementById("issue-count").textContent = issues.length;
  document.getElementById("elapsed-percent").textContent = `${Math.round(elapsedPercent)}%`;
  document.getElementById("days-value").textContent = remainingDays;
  document.getElementById("days-remaining").textContent = `${remainingDays} working days left`;
  document.getElementById("end-date-label").textContent = `Ends ${formatDate(sprint.endDate)}`;
  document.getElementById("sprint-day").textContent = elapsedDays;
  document.getElementById("updated-label").textContent = formatDate(sprint.asOf);
  document.getElementById("pace-note").textContent = `${paceDifference.toFixed(1)} pts ${donePoints < totalPoints * elapsedPercent / 100 ? "behind" : "ahead of"} ideal pace`;

  const progressTrack = document.getElementById("progress-track");
  progressTrack.setAttribute("aria-label", `${Math.round(completion)} percent of current sprint points complete; ${Math.round(elapsedPercent)} percent of sprint weekdays elapsed`);
  document.getElementById("progress-fill").style.width = `${completion}%`;
  document.getElementById("progress-marker").style.left = `${elapsedPercent}%`;

  const weekStrip = document.getElementById("week-strip");
  weekStrip.innerHTML = Array.from({ length: totalDays }, (_, index) => {
    const state = index < elapsedDays ? "complete" : "";
    return `<i class="${state}" aria-hidden="true"></i>`;
  }).join("");

  return { totalPoints, donePoints, elapsedPercent, elapsedDays, totalDays };
}

function createSvgElement(tagName, attributes = {}) {
  const element = document.createElementNS(SVG_NS, tagName);
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
  return element;
}

function renderBurndown(sprint, totalPoints, elapsedDays) {
  const values = sprint.remainingPoints;
  const width = 700;
  const height = 238;
  const left = 42;
  const right = 14;
  const top = 14;
  const bottom = 30;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const maxValue = Math.max(totalPoints, ...values.filter(Number.isFinite));
  const xAt = (index) => left + (index / (values.length - 1)) * plotWidth;
  const yAt = (value) => top + (1 - value / maxValue) * plotHeight;
  const svg = createSvgElement("svg", { viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": "Story points remaining by sprint day. The actual line tracks near ideal through day six." });
  const gridValues = [0, Math.round(maxValue / 2), maxValue];

  for (const value of gridValues) {
    const y = yAt(value);
    svg.append(createSvgElement("line", { x1: left, x2: width - right, y1: y, y2: y, class: "chart-gridline" }));
    const label = createSvgElement("text", { x: left - 10, y: y + 4, "text-anchor": "end", class: "axis-label" });
    label.textContent = value;
    svg.append(label);
  }

  const idealValues = values.map((_, index) => totalPoints * (1 - index / (values.length - 1)));
  const linePath = (series) => series.reduce((path, value, index) => {
    if (!Number.isFinite(value)) return path;
    return `${path}${path ? " L" : "M"}${xAt(index).toFixed(1)} ${yAt(value).toFixed(1)}`;
  }, "");

  svg.append(createSvgElement("path", { d: linePath(idealValues), class: "ideal-path" }));
  svg.append(createSvgElement("path", { d: linePath(values), class: "actual-path" }));

  const actualIndex = Math.max(0, Math.min(values.length - 1, elapsedDays - 1));
  const actualValue = values[actualIndex];
  if (Number.isFinite(actualValue)) {
    svg.append(createSvgElement("circle", { cx: xAt(actualIndex), cy: yAt(actualValue), r: 5.5, class: "actual-point" }));
  }

  for (let index = 0; index < values.length; index += 1) {
    if (index % 2 !== 0 && index !== values.length - 1) continue;
    const label = createSvgElement("text", { x: xAt(index), y: height - 7, "text-anchor": "middle", class: "axis-label" });
    label.textContent = `D${index + 1}`;
    svg.append(label);
  }

  const chart = document.getElementById("burndown-chart");
  chart.replaceChildren(svg);
  document.getElementById("burndown-current").textContent = `${Number.isFinite(actualValue) ? actualValue : totalPoints} pts remaining today`;
}

function renderStatusBreakdown(issues, totalPoints) {
  const list = document.getElementById("status-breakdown");
  list.innerHTML = STATUS_ORDER.map((status) => {
    const matching = issues.filter((issue) => issue.status === status);
    const count = matching.length;
    const width = issues.length ? (count / issues.length) * 100 : 0;
    const points = sumPoints(matching);
    return `<div class="status-row">
      <span class="status-name"><i class="status-swatch ${STATUS_CLASS[status]}"></i>${status}</span>
      <div class="status-bar-track" aria-label="${count} issues, ${points} points"><span class="status-bar-fill ${STATUS_CLASS[status]}" style="width:${width}%"></span></div>
      <strong class="status-count">${count}</strong>
      <span class="status-points">${points} pts</span>
    </div>`;
  }).join("");

  const blocked = issues.filter((issue) => issue.blocked).length;
  document.getElementById("status-total").textContent = issues.length;
  document.getElementById("status-points").textContent = totalPoints;
  document.getElementById("blocked-total").textContent = blocked;
}

function renderWorkload(issues) {
  const people = [...new Set(issues.map((issue) => issue.assignee))].map((assignee) => {
    const assigned = issues.filter((issue) => issue.assignee === assignee);
    const done = sumPoints(assigned.filter((issue) => issue.status === "Done"));
    return { assignee, total: sumPoints(assigned), done, remaining: sumPoints(assigned) - done };
  }).sort((first, second) => second.total - first.total);
  const maxPoints = Math.max(...people.map((person) => person.total));

  document.getElementById("workload-list").innerHTML = people.map((person, index) => {
    const doneWidth = (person.done / maxPoints) * 100;
    const remainingWidth = (person.remaining / maxPoints) * 100;
    return `<div class="workload-row">
      <div class="person-label"><span class="avatar avatar-${index + 1}">${escapeHtml(initialsFor(person.assignee))}</span><span>${escapeHtml(person.assignee)}</span></div>
      <div class="workload-track" role="img" aria-label="${escapeHtml(person.assignee)}: ${person.done} points done, ${person.remaining} points remaining">
        <span class="workload-done" style="width:${doneWidth}%"></span><span class="workload-open" style="width:${remainingWidth}%"></span>
      </div>
      <span class="workload-numbers"><strong>${person.done}</strong><span> / ${person.total} pts</span></span>
    </div>`;
  }).join("");
}

function renderIssueRows(issues) {
  const statusFilter = document.getElementById("status-filter").value;
  const assigneeFilter = document.getElementById("assignee-filter").value;
  const blockedOnly = document.getElementById("blocked-filter").checked;
  const visible = issues.filter((issue) => {
    return (statusFilter === "all" || issue.status === statusFilter)
      && (assigneeFilter === "all" || issue.assignee === assigneeFilter)
      && (!blockedOnly || issue.blocked);
  });

  document.getElementById("issue-rows").innerHTML = visible.map((issue, index) => `<tr>
    <td class="issue-cell"><span class="issue-key">${escapeHtml(issue.key)}</span><span class="issue-title">${escapeHtml(issue.title)}</span>${issue.blocked ? `<span class="blocked-tag">Blocked</span>` : ""}</td>
    <td><span class="assignee-cell"><span class="avatar avatar-${(index % 4) + 1}">${escapeHtml(initialsFor(issue.assignee))}</span>${escapeHtml(issue.assignee)}</span></td>
    <td><span class="issue-status ${STATUS_CLASS[issue.status]}"><i></i>${escapeHtml(issue.status)}</span></td>
    <td><span class="priority ${escapeHtml(issue.priority.toLowerCase())}"><i></i>${escapeHtml(issue.priority)}</span></td>
    <td class="points-column"><strong>${issue.points}</strong><span> pts</span></td>
  </tr>`).join("");

  document.getElementById("visible-issue-count").textContent = visible.length;
  document.getElementById("showing-count").textContent = visible.length;
  document.getElementById("table-total").textContent = issues.length;
  document.getElementById("empty-issues").hidden = visible.length > 0;
  document.querySelector(".table-wrap table").hidden = visible.length === 0;
}

function setupFilters(issues) {
  const assigneeFilter = document.getElementById("assignee-filter");
  [...new Set(issues.map((issue) => issue.assignee))].sort().forEach((assignee) => {
    const option = document.createElement("option");
    option.value = assignee;
    option.textContent = assignee;
    assigneeFilter.append(option);
  });

  for (const control of [assigneeFilter, document.getElementById("status-filter"), document.getElementById("blocked-filter")]) {
    control.addEventListener("change", () => renderIssueRows(issues));
  }
}

async function init() {
  const response = await fetch("data.json");
  if (!response.ok) throw new Error(`Could not load sprint data (${response.status}).`);
  const data = await response.json();
  const metrics = renderSprintOverview(data.sprint, data.issues);
  renderBurndown(data.sprint, metrics.totalPoints, metrics.elapsedDays);
  renderStatusBreakdown(data.issues, metrics.totalPoints);
  renderWorkload(data.issues);
  setupFilters(data.issues);
  renderIssueRows(data.issues);
}

init().catch((error) => {
  const message = document.getElementById("load-error");
  if (message) {
    message.hidden = false;
    message.textContent = `${error.message} Start a local server from this folder to view the dashboard.`;
  }
});