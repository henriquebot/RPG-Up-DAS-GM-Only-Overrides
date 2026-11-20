import test from "node:test";
import assert from "node:assert/strict";
import { shouldConcealOverride, forcedAlertKey, overrideReasons } from "../scripts/logic.mjs";

test("only players are concealed when the world option is enabled", () => {
  assert.equal(shouldConcealOverride(true, false), true);
  assert.equal(shouldConcealOverride(true, true), false);
  assert.equal(shouldConcealOverride(false, false), false);
  assert.equal(shouldConcealOverride(false, true), false);
});

test("the native DAS alert keys are selected for item and targeting", () => {
  assert.equal(forcedAlertKey("", []), "DND5ECOMBAT.Force.AlerteSansObjet");
  assert.equal(forcedAlertKey("Fireball", []), "DND5ECOMBAT.Force.Alerte");
  assert.equal(forcedAlertKey("Fireball", ["Goblin"]), "DND5ECOMBAT.Force.AlerteCibles");
});

test("reasons are restricted to nonempty strings", () => {
  assert.deepEqual(overrideReasons(["Out of range", null, "", 5, "No action"]), ["Out of range", "No action"]);
  assert.deepEqual(overrideReasons(null), []);
});
