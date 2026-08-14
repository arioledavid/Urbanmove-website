import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canDeleteJob,
  getAllowedJobTransitions,
  isJobTransitionAllowed,
} from "./job-workflow";

describe("getAllowedJobTransitions", () => {
  it("allows only the next main-path step plus cancel from DRAFT", () => {
    assert.deepEqual(getAllowedJobTransitions("DRAFT"), [
      "SCHEDULED",
      "CANCELLED",
    ]);
  });

  it("allows IN_PROGRESS and CANCELLED from SCHEDULED", () => {
    assert.deepEqual(getAllowedJobTransitions("SCHEDULED"), [
      "IN_PROGRESS",
      "CANCELLED",
    ]);
  });

  it("allows COMPLETED and CANCELLED from IN_PROGRESS", () => {
    assert.deepEqual(getAllowedJobTransitions("IN_PROGRESS"), [
      "COMPLETED",
      "CANCELLED",
    ]);
  });

  it("treats COMPLETED as terminal", () => {
    assert.deepEqual(getAllowedJobTransitions("COMPLETED"), []);
  });

  it("only allows reopen to DRAFT from CANCELLED", () => {
    assert.deepEqual(getAllowedJobTransitions("CANCELLED"), ["DRAFT"]);
  });
});

describe("isJobTransitionAllowed", () => {
  it("rejects skipping ahead", () => {
    assert.equal(isJobTransitionAllowed("DRAFT", "IN_PROGRESS"), false);
    assert.equal(isJobTransitionAllowed("DRAFT", "COMPLETED"), false);
    assert.equal(isJobTransitionAllowed("SCHEDULED", "COMPLETED"), false);
  });

  it("rejects moving backwards on the main path", () => {
    assert.equal(isJobTransitionAllowed("SCHEDULED", "DRAFT"), false);
    assert.equal(isJobTransitionAllowed("IN_PROGRESS", "SCHEDULED"), false);
    assert.equal(isJobTransitionAllowed("COMPLETED", "IN_PROGRESS"), false);
  });

  it("allows the happy-path steps", () => {
    assert.equal(isJobTransitionAllowed("DRAFT", "SCHEDULED"), true);
    assert.equal(isJobTransitionAllowed("SCHEDULED", "IN_PROGRESS"), true);
    assert.equal(isJobTransitionAllowed("IN_PROGRESS", "COMPLETED"), true);
  });
});

describe("canDeleteJob", () => {
  it("only allows deleting completed jobs", () => {
    assert.equal(canDeleteJob("COMPLETED"), true);
    assert.equal(canDeleteJob("DRAFT"), false);
    assert.equal(canDeleteJob("SCHEDULED"), false);
    assert.equal(canDeleteJob("IN_PROGRESS"), false);
    assert.equal(canDeleteJob("CANCELLED"), false);
  });
});
