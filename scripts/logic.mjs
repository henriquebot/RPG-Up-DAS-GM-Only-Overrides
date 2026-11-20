/**
 * Pure GM-only override presentation rules.
 * Player-initiated overrides always retain DAS's default notifications.
 */
export function shouldInterceptGmOverride(enabled, forcerIsGM) {
  return enabled === true && forcerIsGM === true;
}

export function shouldConcealChatOverride(enabled, viewerIsGM, authorIsGM, hasOverrideFlag) {
  return shouldInterceptGmOverride(enabled, authorIsGM)
    && viewerIsGM !== true && hasOverrideFlag === true;
}

export function forcedAlertKey(itemName, targets = []) {
  if (!itemName) return "DND5ECOMBAT.Force.AlerteSansObjet";
  return targets.length ? "DND5ECOMBAT.Force.AlerteCibles" : "DND5ECOMBAT.Force.Alerte";
}

export function overrideReasons(reasons) {
  return Array.isArray(reasons) ? reasons.filter(reason => typeof reason === "string" && reason.length > 0) : [];
}
