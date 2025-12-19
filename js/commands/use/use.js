// ===== USE COMMAND HANDLER =====

// Handle use commands with multi-step support
// Supports: "use" → "sword" → "troll" (3 steps)
// Or: "use sword on troll" (1 step)
function handleUseCommand(alias, things) {
  let actionType = aliasToAction[alias] || 'use';

  // No parameters: start multi-step sequence
  if (!things || things.length === 0) {
    gameState.partCommand = actionType;
    gameState.pendingAlias = alias;
    displayText(`What would you like to ${alias}?`);
    return;
  }

  // Parse the command
  const parsed = parseActionCommand(actionType, things);

  if (things && (things.includes("all") || things.includes("every") || things.includes("both"))) {

    let multiIndex

    if (things.includes("all")) {
      multiIndex = things.indexOf("all");
    } else if (things.includes("every")) {
      multiIndex = things.indexOf("every");
    } else if (things.includes("both")) {
      multiIndex = things.indexOf("both");
    }

    if (multiIndex < things.length - 1) {
      const targetWord = things[multiIndex + 1];
      const interactables = buildInteractablesList();
      const matches = findAllMatching(targetWord, interactables);

      if (matches.length > 0) {
        const inventoryMatches = matches.filter(m =>
          m.location === "inventory" && m.type === "item"
        );

        if (inventoryMatches.length === 0) {
          displayText(`You don't have any ${targetWord}.`);
          clearUseState();
          return;
        }

        const expansion = inventoryMatches.map(m => m.id);
        things = [
          ...things.slice(0, multiIndex),
          ...expansion,
          ...things.slice(multiIndex + 2)
        ];

        const reparsed = parseActionCommand(actionType, things);
        parsed.items = reparsed.items;
        parsed.target = reparsed.target;
      } else {
        displayText(`I don't see any ${targetWord} here.`);
        clearUseState();
        return;
      }
    }
  }

  if (parsed.items.length > 0) {
    const interactables = buildInteractablesList();
    const expandedItems = [];

    for (const itemName of parsed.items) {
      const isPotentialPlural = itemName.endsWith("ies") || itemName.endsWith("es") || itemName.endsWith("s");

      if (isPotentialPlural) {
        const matches = findAllMatching(itemName, interactables);

        const inventoryMatches = matches.filter(m =>
          m.type === "item" && m.location === "inventory"
        );

        if (inventoryMatches.length > 1) {
          expandedItems.push(...inventoryMatches.map(m => m.id));
        } else if (inventoryMatches.length === 1) {
          expandedItems.push(inventoryMatches[0].id);
        } else {
          expandedItems.push(itemName);
        }
      } else {
        expandedItems.push(itemName);
      }
    }

    parsed.items = expandedItems;
  }

  if (actionType === "use" || actionType === null) {
    const interactables = buildInteractablesList();
    const smartResult = resolveSmartUse(parsed, interactables);

    if (smartResult.action === "fail") {
      displayText(smartResult.message);
      clearUseState();
      return;
    }

    if (smartResult.action === "need-target") {
      gameState.partCommand = "use";
      gameState.pendingAlias = alias;
      gameState.partApplyItems = [...parsed.items, ...parsed.target];

      if (smartResult.isPartialRecipe) {
        const itemList = smartResult.itemNames.join(" and ");
        displayText(`What would you like to use the ${itemList} on?`);
      } else if (smartResult.itemName) {
        displayText(`What would you like to ${alias} the ${smartResult.itemName} on?`);
      } else {
        displayText(`What would you like to ${alias} that on?`);
      }
      return;
    }

    if (smartResult.action === "operate-multiple") {
      for (const itemName of smartResult.items) {
        const singleParsed = {items: [itemName], target: []};
        resolveAction("operate", singleParsed, alias);
      }
      clearUseState();
      return;
    }

    if (smartResult.action === "craft" && smartResult.allItems) {
      const craftParsed = {items: smartResult.allItems, target: []};
      resolveAction("craft", craftParsed, alias);
      clearUseState();
      return;
    }

    actionType = smartResult.action;
  }

  // Check if we need more information for apply/use
  if (actionType === 'use' || actionType === 'apply') {
    if (parsed.items.length > 0 && parsed.target.length === 0) {
      // Have item but no target - validate item first
      const itemName = parsed.items[0];
      const interactables = buildInteractablesList();
      const item = findInteractable(itemName, interactables);

      // Check if item exists
      if (!item) {
        displayText("I can't find that.");
        clearUseState();
        return;
      }

      // Check if it's an object (can't use objects as tools)
      if (item.type === 'object') {
        displayText("You can't take that to use it on something else.");
        clearUseState();
        return;
      }

      // Check if it's a generic disallowed item (wall, air, etc.)
      if (item.type === 'generic') {
        displayText("You can't use that.");
        clearUseState();
        return;
      }

      // Check if item is actually IN inventory (positive check, not negative)
      if (item.type === 'item' && !gameState.inventory.includes(item.id)) {
        displayText(`You don't have the ${itemName}.`);
        clearUseState();
        return;
      }

      // Valid item - ask for target
      gameState.partCommand = actionType;
      gameState.pendingAlias = alias;
      gameState.partApplyItems = parsed.items;
      displayText(`What would you like to ${alias} the ${itemName} on?`);
      return;
    }

    const interactables = buildInteractablesList();
    const itemObjects = parsed.items.map(name => findInteractable(name, interactables));
    const targetObject = findInteractable(parsed.target[0], interactables);
    const combination = checkCombinations(itemObjects, targetObject);

    if (combination) {
      actionType = "applyCombination"
    }


  }

  // Check if we need more information for attack
  if (actionType === 'attack') {
    if (parsed.target.length > 0 && parsed.items.length === 0) {
      // Have target but no weapon - validate target first
      const targetName = parsed.target[0];
      const interactables = buildInteractablesList();
      const target = findInteractable(targetName, interactables);

      // Check if target exists
      if (!target) {
        displayText("I can't find that.");
        clearUseState();
        return;
      }

      // Valid target - ask for weapon
      gameState.partCommand = actionType;
      gameState.pendingAlias = alias;
      gameState.partAttackTarget = parsed.target;
      displayText(`What would you like to ${alias} the ${targetName} with?`);
      return;
    }
  }

  if (actionType === 'operate') {
    if (parsed.items.length > 0 && parsed.target.length === 0) {
      resolveAction('operate', parsed, alias);
      clearUseState();
      return;
    }
  }

  // We have everything needed - execute the action
  // Clear state regardless of success/failure so user isn't stuck
  const result = resolveAction(actionType, parsed, alias);
  clearUseState();
  return result;
}
