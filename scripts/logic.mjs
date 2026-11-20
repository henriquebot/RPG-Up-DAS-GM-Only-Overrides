/**
 * Pure helpers shared by the Foundry module and Node tests.
 * Only the presentation of an override changes; the roll/action is untouched.
 */
export function shouldConcealOverride(enabled, isGM) {
  return enabled === true && isGM !== true;
}

export function forcedAlertKey(itemName, targets = []) {
  if (!itemName) return "DND5ECOMBAT.Force.AlerteSansObjet";
  return targets.length ? "DND5ECOMBAT.Force.AlerteCibles" : "DND5ECOMBAT.Force.Alerte";
}

export function overrideReasons(reasons) {
  return Array.isArray(reasons) ? reasons.filter(reason => typeof reason === "string" && reason.length > 0) : [];
}
