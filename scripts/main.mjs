/**
 * RPG Up — DAS GM-Only Overrides
 * Foundry V14 / dnd5e 6 / DAS Core >= 0.288.0
 *
 * No monkey-patching of DAS, no changes to actor/item/chat data:
 * 1. A public DAS hook prevents the default broadcast for forced rule overrides.
 * 2. DAS's public GM alert API keeps the usual private reasons/chat/banner.
 * 3. A GM-only query plays the floating "Forçado" on the GM client.
 * 4. Player-side chat rendering removes DAS's override banner.
 */
import { shouldConcealOverride, forcedAlertKey, overrideReasons } from "./logic.mjs";

const ID = "rpgup-das-gm-only-overrides";
const DAS = "dnd5e-combat";
const SETTING = "gmOnlyOverrides";
const PRIVATE_QUERY = `${ID}.gmForcedFloat`;
const PLAYER_CLASS = "rpgup-das-gm-only";
const CHAT_MARKER = ".das-overridden";

function enabled() {
  try { return game.settings.get(ID, SETTING) === true; }
  catch { return false; }
}

function concealForThisClient() {
  return shouldConcealOverride(enabled(), game.user?.isGM);
}

function syncVisuals() {
  document.documentElement.classList.toggle(PLAYER_CLASS, concealForThisClient());
}

function rerenderChat() {
  syncVisuals();
  try { ui.chat?.render?.(); } catch (err) { console.warn(`${ID} | chat redraw:`, err); }
}

function suppressPlayerChatBanner(_message, html) {
  if (!concealForThisClient()) return;
  // DAS adds its .das-overridden element in this same hook. Waiting one microtask
  // allows all hook listeners to finish regardless of their registration order.
  queueMicrotask(() => {
    if (!concealForThisClient()) return;
    html?.querySelectorAll?.(CHAT_MARKER).forEach(element => element.remove());
  });
}

function actionToken(actor) {
  const token = actor?.token ?? actor?.getActiveTokens?.(false, true)?.[0];
  return token?.document?.uuid ?? token?.uuid ?? null;
}

function gmAlertAllowed() {
  try {
    return game.settings.get(DAS, "forcedAlerts") !== false
      && game.settings.get(DAS, "gmAlerts") !== false;
  } catch {
    return true;
  }
}

function forcedMessage({ actor, item, reasons, targets, user }) {
  const itemName = typeof item === "string" ? item : item?.name ?? "";
  const targetNames = Array.isArray(targets) ? targets : [];
  const key = forcedAlertKey(itemName, targetNames);
  const variables = {
    user: user?.name ?? game.user?.name ?? "",
    actor: actor?.name ?? "",
    item: itemName,
    targets: targetNames.join(", "),
    reasons: reasons.join(" · ")
  };
  const text = game.i18n.format(key, variables);
  return { text, itemName };
}

/** Runs ONLY on the active GM's client. Not sent to players or to the scene. */
function showPrivateFloat(payload) {
  if (!game.user?.isGM || !enabled()) return false;
  const token = payload?.token;
  if (typeof token !== "string" || !token) return false;
  const api = game.modules.get(DAS)?.api;
  if (typeof api?.floats?.play !== "function") return false;
  return api.floats.play(token, "forced", game.i18n.localize("DND5ECOMBAT.Retour.Force"));
}

async function informGM({ actor, item, reasons, targets, user }) {
  const gm = game.users?.activeGM;
  if (!gm) {
    console.warn(`${ID} | Override was concealed, but no active GM is available for the private notification.`);
    return;
  }
  const { text, itemName } = forcedMessage({ actor, item, reasons, targets, user });
  const api = game.modules.get(DAS)?.api;
  // Keep the existing DAS choices for disabling GM alerts; when enabled the
  // private chat card and banner are created by DAS on the active GM client.
  if (gmAlertAllowed() && typeof api?.gm?.alert === "function") {
    try {
      await api.gm.alert({ text, item: itemName || null, actor });
    } catch (err) {
      console.error(`${ID} | private DAS GM alert failed:`, err);
    }
  }
  const token = actionToken(actor);
  if (!token) return;
  try {
    if (gm.isSelf) showPrivateFloat({ token });
    else await gm.query(PRIVATE_QUERY, { token }, { timeout: 5000 });
  } catch (err) {
    console.warn(`${ID} | private GM floating notice unavailable:`, err);
  }
}

/**
 * DAS invokes this cancellable public hook before notifying the table.
 * Returning false prevents DAS's public floating text/sound and its default
 * alert, but does not undo the action or remove its overridden chat flag.
 */
function onForced(event) {
  if (!enabled()) return;
  const reasons = overrideReasons(event?.reasons);
  if (!reasons.length) return;
  void informGM({
    actor: event?.actor ?? null,
    item: event?.item ?? null,
    reasons,
    targets: event?.targets ?? [],
    user: event?.user ?? game.user
  }).catch(err => console.error(`${ID} | GM notice failed:`, err));
  return false;
}

Hooks.once("init", () => {
  game.settings.register(ID, SETTING, {
    name: "RPGUP_DAS_GM_ONLY.Setting.Name",
    hint: "RPGUP_DAS_GM_ONLY.Setting.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: rerenderChat
  });
  Hooks.on(`${DAS}.forced`, onForced);
  Hooks.on("dnd5e.renderChatMessage", suppressPlayerChatBanner);
});

Hooks.once("ready", () => {
  if (CONFIG.queries) CONFIG.queries[PRIVATE_QUERY] = showPrivateFloat;
  syncVisuals();
  if (!game.modules.get(DAS)?.active) console.warn(`${ID} | DAS Core is not active.`);
});
