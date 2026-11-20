import test from "node:test";
import assert from "node:assert/strict";
import {
  shouldInterceptGmOverride, shouldConcealChatOverride,
  forcedAlertKey, overrideReasons
} from "../scripts/logic.mjs";

test("only GM-initiated overrides are intercepted", () => {
  assert.equal(shouldInterceptGmOverride(true, true), true);
  assert.equal(shouldInterceptGmOverride(true, false), false);
  assert.equal(shouldInterceptGmOverride(false, true), false);
  assert.equal(shouldInterceptGmOverride(false, false), false);
});

test("chat banner hidden only from players for GM-authored overrides", () => {
  assert.equal(shouldConcealChatOverride(true, false, true, true), true);
  assert.equal(shouldConcealChatOverride(true, true, true, true), false);
  assert.equal(shouldConcealChatOverride(true, false, false, true), false);
  assert.equal(shouldConcealChatOverride(true, false, true, false), false);
  assert.equal(shouldConcealChatOverride(false, false, true, true), false);
});

test("native DAS GM alert keys are retained", () => {
  assert.equal(forcedAlertKey("", []), "DND5ECOMBAT.Force.AlerteSansObjet");
  assert.equal(forcedAlertKey("Fireball", []), "DND5ECOMBAT.Force.Alerte");
  assert.equal(forcedAlertKey("Fireball", ["Goblin"]), "DND5ECOMBAT.Force.AlerteCibles");
});

test("reasons are restricted to nonempty strings", () => {
  assert.deepEqual(overrideReasons(["Out of range", null, "", 5, "No action"]), ["Out of range", "No action"]);
  assert.deepEqual(overrideReasons(null), []);
});
