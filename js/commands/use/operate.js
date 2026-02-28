// ===== OPERATE HANDLER =====

function handleOperate(verb, item) {
  // Check if this is a scene with operate error messages
  if (item.type === 'scene' && item.operate) {
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
      if (action.requireFlags && action.requireFlags.some(flag => !gameState.flags.includes(flag))) {
        allowed = false;
      }
      if (action.requireNotFlags && action.requireNotFlags.some(flag => gameState.flags.includes(flag))) {
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
    displayText(`You can't ${verb} the ${item.names[0]}`);
    return false;
  }

  // Do you have all flags required for the operation of the item?
  if (matchedAction.requireFlags) {
    let allowed = true;
    for (const flag of matchedAction.requireFlags) {
      if (!gameState.flags.includes(flag)) {
        allowed = false;
      }
    }

    if (allowed === false) {
      // Don't have required flags
      if (matchedAction.failMessage) {
        displayText(matchedAction.failMessage);
      } else {
        displayText("Not allowed.");
      }
      return false;
    }
  }

  // Do you have any flags restricting the operation of the item?
  if (matchedAction.requireNotFlags) {
    let allowed = true;
    let failedFlag = null;
    for (const flag of matchedAction.requireNotFlags) {
      if (gameState.flags.includes(flag)) {
        allowed = false;
        failedFlag = flag;
        break;
      }
    }

    if (allowed === false) {
      // Have flags restricting use.
      if (matchedAction.failMessage) {
        displayText(matchedAction.failMessage);
      } else if (matchedAction.failMessages && matchedAction.failMessages[failedFlag]) {
        displayText(matchedAction.failMessages[failedFlag]);
      } else {
        displayText("Not allowed.");
      }
      return false;
    }
  }

  if (matchedAction.message) {
    displayText(resolveConditionalText(matchedAction.message));
  }

  // Apply effects
  applyEffects(matchedAction.effects);

  // Handle eat-to-kill enemies
  if (matchedAction.eatToKill && item.combat) {
    // Initialize combat state if needed
    if (!gameState.combatState[item.id]) {
      initializeCombat(item);
    }

    const combat = gameState.combatState[item.id];

    // Increment eat count
    if (!combat.eatCount) {
      combat.eatCount = 0;
    }
    combat.eatCount++;

    // Display eat message
    const eatMsg = pickRandom(item.combat.eatMessage);
    displayText(eatMsg);

    // Check if killed
    if (combat.eatCount >= item.combat.requiredEats) {
      // Kill enemy
      const killMsg = pickRandom(item.combat.killMessage);
      displayText(killMsg);

      // Apply on-kill effects
      applyEffects(item.combat.effects);

      delete gameState.combatState[item.id];
    }

    return;
  }
}
