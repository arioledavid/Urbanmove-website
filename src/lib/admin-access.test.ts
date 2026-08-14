import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canAccessJob,
  canEditJobs,
  canTrackJob,
  canTrackJobs,
  isDriverAllowedPath,
} from "./admin-access";

describe("canEditJobs / canTrackJobs", () => {
  it("lets admins edit and track", () => {
    assert.equal(canEditJobs("ADMIN"), true);
    assert.equal(canTrackJobs("ADMIN"), true);
  });

  it("lets drivers track but not edit", () => {
    assert.equal(canEditJobs("DRIVER"), false);
    assert.equal(canTrackJobs("DRIVER"), true);
  });
});

describe("canTrackJob / canAccessJob", () => {
  const driverId = "507f1f77bcf86cd799439011";
  const otherId = "507f1f77bcf86cd799439012";

  it("lets admins access any job", () => {
    assert.equal(canTrackJob("ADMIN", driverId, []), true);
    assert.equal(canAccessJob("ADMIN", driverId, [otherId]), true);
  });

  it("lets drivers access only assigned jobs", () => {
    assert.equal(canTrackJob("DRIVER", driverId, [driverId]), true);
    assert.equal(canTrackJob("DRIVER", driverId, [otherId]), false);
    assert.equal(canTrackJob("DRIVER", driverId, []), false);
    assert.equal(canAccessJob("DRIVER", driverId, [driverId, otherId]), true);
  });
});

describe("isDriverAllowedPath", () => {
  it("allows jobs list, job detail, and settings", () => {
    assert.equal(isDriverAllowedPath("/jobs"), true);
    assert.equal(isDriverAllowedPath("/jobs/UM-0001"), true);
    assert.equal(isDriverAllowedPath("/settings"), true);
    assert.equal(isDriverAllowedPath("/login"), true);
  });

  it("blocks create-job and admin-only areas", () => {
    assert.equal(isDriverAllowedPath("/jobs/new"), false);
    assert.equal(isDriverAllowedPath("/jobs/new/extra"), false);
    assert.equal(isDriverAllowedPath("/dashboard"), false);
    assert.equal(isDriverAllowedPath("/drivers"), false);
    assert.equal(isDriverAllowedPath("/calendar"), false);
  });
});
