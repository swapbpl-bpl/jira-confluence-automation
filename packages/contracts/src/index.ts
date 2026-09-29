export const ISSUE_STATUSES = ['To Do', 'In Progress', 'In Review', 'Done'] as const;

export type IssueStatus = (typeof ISSUE_STATUSES)[number];
export type ScopeDirection = 'added' | 'removed';
export type Freshness = 'current' | 'stale';

export interface DashboardResponse {
	asOf: string;
	freshness: Freshness;
	project: { id: string; name: string; type: string };
	team: { id: string; name: string; memberCount: number };
	sprint: {
		id: string;
		key: string;
		name: string;
		goal: string | null;
		startDate: string;
		endDate: string;
		state: 'active';
	};
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
	scopeChanges: Array<{ date: string; direction: ScopeDirection; points: number }>;
	burndown: Array<{
		date: string;
		elapsedWorkingDays: number;
		idealRemainingPoints: number;
		actualRemainingPoints: number;
	}>;
	statusBreakdown: Array<{
		status: IssueStatus;
		issueCount: number;
		estimatedPoints: number;
	}>;
	workload: Array<{
		assigneeId: string | null;
		assigneeName: string;
		assignedPoints: number;
		completedPoints: number;
		remainingPoints: number;
	}>;
	issues: Array<{
		id: string;
		key: string;
		summary: string;
		assigneeId: string | null;
		assigneeName: string | null;
		status: IssueStatus;
		priority: string | null;
		storyPoints: number | null;
		flagged: boolean;
	}>;
}

export interface ApiErrorResponse {
	error: {
		code: string;
		message: string;
		requestId: string;
	};
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
	return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
	return typeof value === 'number' && Number.isFinite(value);
}

function isNullableNumber(value: unknown): value is number | null {
	return value === null || isNumber(value);
}

function isStringOrNull(value: unknown): value is string | null {
	return value === null || isString(value);
}

function isArrayOf<T>(value: unknown, predicate: (item: unknown) => item is T): value is T[] {
	return Array.isArray(value) && value.every(predicate);
}

const isProject = (value: unknown): value is DashboardResponse['project'] =>
	isRecord(value) && isString(value.id) && isString(value.name) && isString(value.type);

const isTeam = (value: unknown): value is DashboardResponse['team'] =>
	isRecord(value) && isString(value.id) && isString(value.name) && isNumber(value.memberCount);

const isSprint = (value: unknown): value is DashboardResponse['sprint'] =>
	isRecord(value) && isString(value.id) && isString(value.key) && isString(value.name)
	&& isStringOrNull(value.goal) && isString(value.startDate) && isString(value.endDate)
	&& value.state === 'active';

const isSummary = (value: unknown): value is DashboardResponse['summary'] => {
	if (!isRecord(value)) return false;
	return isNumber(value.originalCommittedPoints) && isNumber(value.currentScopePoints)
		&& isNumber(value.netScopeChangePoints) && isNumber(value.completedPoints)
		&& isNumber(value.remainingPoints) && isNullableNumber(value.completionPercent)
		&& isNumber(value.expectedCompletedPoints) && isNumber(value.paceVariancePoints)
		&& isNumber(value.elapsedWorkingDays) && isNumber(value.totalWorkingDays)
		&& isNumber(value.workingDaysRemaining) && isNumber(value.unestimatedIssueCount);
};

const isScopeChange = (value: unknown): value is DashboardResponse['scopeChanges'][number] =>
	isRecord(value) && isString(value.date) && (value.direction === 'added' || value.direction === 'removed')
	&& isNumber(value.points);

const isBurndownPoint = (value: unknown): value is DashboardResponse['burndown'][number] =>
	isRecord(value) && isString(value.date) && isNumber(value.elapsedWorkingDays)
	&& isNumber(value.idealRemainingPoints) && isNumber(value.actualRemainingPoints);

const isStatusRow = (value: unknown): value is DashboardResponse['statusBreakdown'][number] =>
	isRecord(value) && ISSUE_STATUSES.includes(value.status as IssueStatus)
	&& isNumber(value.issueCount) && isNumber(value.estimatedPoints);

const isWorkloadRow = (value: unknown): value is DashboardResponse['workload'][number] =>
	isRecord(value) && isStringOrNull(value.assigneeId) && isString(value.assigneeName)
	&& isNumber(value.assignedPoints) && isNumber(value.completedPoints) && isNumber(value.remainingPoints);

const isIssue = (value: unknown): value is DashboardResponse['issues'][number] =>
	isRecord(value) && isString(value.id) && isString(value.key) && isString(value.summary)
	&& isStringOrNull(value.assigneeId) && isStringOrNull(value.assigneeName)
	&& ISSUE_STATUSES.includes(value.status as IssueStatus) && isStringOrNull(value.priority)
	&& isNullableNumber(value.storyPoints) && typeof value.flagged === 'boolean';

export function isDashboardResponse(value: unknown): value is DashboardResponse {
	return isRecord(value) && isString(value.asOf)
		&& (value.freshness === 'current' || value.freshness === 'stale')
		&& isProject(value.project) && isTeam(value.team) && isSprint(value.sprint)
		&& isSummary(value.summary)
		&& isArrayOf(value.scopeChanges, isScopeChange)
		&& isArrayOf(value.burndown, isBurndownPoint)
		&& isArrayOf(value.statusBreakdown, isStatusRow)
		&& isArrayOf(value.workload, isWorkloadRow)
		&& isArrayOf(value.issues, isIssue);
}

export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
	return isRecord(value) && isRecord(value.error)
		&& isString(value.error.code) && isString(value.error.message)
		&& isString(value.error.requestId);
}
