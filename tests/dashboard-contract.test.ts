import test from 'node:test';
import assert from 'node:assert/strict';

import { dashboardFixture } from '../apps/api/src/dashboard.js';

test('dashboard fixture exposes the expected sprint summary contract', () => {
  assert.equal(dashboardFixture.project.name, 'Staff Augment Project');
  assert.equal(dashboardFixture.team.memberCount, 10);
  assert.equal(dashboardFixture.summary.originalCommittedPoints, 72);
  assert.equal(dashboardFixture.statusBreakdown.length, 4);
  assert.equal(dashboardFixture.workload.length, 11);
  assert.equal(dashboardFixture.issues.length >= 1, true);
});