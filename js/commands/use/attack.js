// ===== ATTACK HANDLER =====

function handleAttack(item, target) {

  // Check if target is a scene with attack interactions
  if (target.type === 'scene' && target.attack) {
    // attack is an object with item IDs as keys and error messages as values
    const errorMessage = target.attack[item.id];
    if (errorMessage) {
      displayText(resolveConditionalText(errorMessage));
      return false;
    }
    // Fall through to default error if no specific message
  }

  // If there is no combat for the target
  if (!target.combat) {
    if (target.attackMessage) {
      displayText(target.attackMessage)
    } else {
      displayText(`You can't attack the ${target.names[0]} with the ${item.names[0]}.`);
    }
    return false;
  }

  // Combat for the target implies an enemy, engage the enemy in combat

  const combat = gameState.combatState[target.id];

  combat.isEngaged = true;

  // Check you are using the right item (skip for eat-to-kill enemies which use verb, not item)

  if (target.combat.successfulWeapons && !target.combat.successfulWeapons.includes(item.id)) {
    if (target.combat.wrongWeaponMessage && target.combat.wrongWeaponMessage[item.id]) {
      displayText(target.combat.wrongWeaponMessage[item.id]);
    } else {
      displayText(`It would be silly to try to attack the ${target.id} with the ${item.names[0]}.`);
    }
    return false;
  }



  // If there are no restrictive flags
  let allowCombat = true;

  if (target.combat.requiredFlags) {
    for (const flag of target.combat.requiredFlags) {
      if (!gameState.flags.includes(flag)) {
        allowCombat = false;
      }
    }
  }

  if (!allowCombat) {
    if (target.combat.requiredFlagsFailMessage) {
      displayText(target.combat.requiredFlagsFailMessage);
    } else {
      displayText(`You can't attack the ${target}`);
    }
    return false;
  }

  // Special handling for eat-to-kill enemies
  if (target.combat.eatToKill) {
    // Initialize eat count
    if (!combat.eatCount) {
      combat.eatCount = 0;
    }

    // Increment eat count
    combat.eatCount++;

    // Display eat message
    const eatMsg = pickRandom(target.combat.eatMessage);
    displayText(eatMsg);

    // Check if killed
    if (combat.eatCount >= target.combat.requiredEats) {
      // Kill enemy
      const killMsg = pickRandom(target.combat.killMessage);
      displayText(killMsg);

      // Apply on-kill effects
      applyEffects(target.combat.effects);

      delete gameState.combatState[target.id];
      return true;
    }

    return true;
  }

  // If this is the first turn to attack on
  if (combat.turnCount === 1) {
    applyEffects(target.combat.effects);

    const randomMessage = pickRandom(target.combat.instakillMessage);
    displayText(randomMessage);
    delete gameState.combatState[target.id];
    return true;
  }

  // You attack the enemy on the second (or later) turn with the right weapon and all required flags
  let hitEnemy = false;
  const randomNumber = Math.random();
  if (target.combat.dodgeChanceDamaged && (gameState.healthState <= target.combat.damagedPlayerThreshold)) {
    if (randomNumber >= target.combat.dodgeChanceDamaged) {
      hitEnemy = true;
    } else {
      if (target.combat.missMessage) {
        const randomMessage = pickRandom(target.combat.missMessage);
        displayText(randomMessage)
      } else {
        displayText(`The ${target.id} dodges.`);
      }
    }
  } else if (target.combat.dodgeChance) {
    if (randomNumber >= target.combat.dodgeChance) {
      hitEnemy = true;
    } else {
      if (target.combat.dodgeMessage) {
        const randomMessage = pickRandom(target.combat.dodgeMessage);
        displayText(randomMessage)
      } else {
        displayText(`The ${target.id} dodges.`);
      }
    }
  }

  if (hitEnemy) {
    applyEffects(target.combat.effects);

    const randomMessage = pickRandom(target.combat.killMessage);
    delete gameState.combatState[target.id];
    displayText(randomMessage);
  }

  return true;
}
