// ===== OPERATE HANDLER =====

function handleOperate(verb, item) {
  // Check if this is a scene with operate error messages
  if (item.type === "scene" && item.operate) {
    // operate is an object with verb: error message format
    const errorMessage = item.operate[verb];
    if (errorMessage) {
      displayText(resolveConditionalText(errorMessage));
    } else {
      // No specific message for this verb, use generic message
      displayText(`You can't ${verb} that.`);
    }
    return false;
  }

  if (!item.operate) {
    displayText(`You can't ${verb} that.`);
    return false;
  }

  let matchedAction = null;

  for (const [actionName, action] of Object.entries(item.operate)) {
    if (item.togglable && verb === "use") {
      let allowed = true;
      if (action.requireFlags && action.requireFlags.some((flag) => !gameState.flags.includes(flag))) {
        allowed = false;
      }
      if (action.requireNotFlags && action.requireNotFlags.some((flag) => gameState.flags.includes(flag))) {
        allowed = false;
      }
      if (allowed) {
        matchedAction = action;
        break;
      }
    } else {
      if (action.allowedVerbs && action.allowedVerbs.includes(verb)) {
        matchedAction = action;
        break;
      }
    }
  }

  if (!matchedAction) {
    displayText(`You can't ${verb} the ${item.names[0]}.`);
    return false;
  }

  if (!checkOperateRequirements(matchedAction)) return false;

  if (matchedAction.message) {
    displayText(resolveConditionalText(matchedAction.message));
  }

  // Apply effects
  applyEffects(matchedAction.effects);

  // Handle eat-to-kill enemies
  if (matchedAction.eatToKill && item.combat) {
    if (!gameState.combatState[item.id]) {
      initializeCombat(item);
    }
    processEatToKill(item);
    return;
  }
}
