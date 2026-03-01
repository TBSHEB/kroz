// ===== ACTION RESOLUTION =====

// This function is used when the specific command is "use" to check which type of using to use
function resolveSmartUse(parsed, interactables) {
  const itemCount = parsed.items.length;
  const targetCount = parsed.target.length;

  // const items = parsed.items.map(name => findInteractable(name, interactables));
  // const targets = parsed.target.map(name => findInteractable(name, interactables));

  const items = [];
  const remainingInteractables = [...interactables];

  for (const name of parsed.items) {
    const found = findInteractable(name, remainingInteractables);
    if (!found) {
      return {
        action: "fail",
        message: `I can't find "${name}".`
      };
    }
    items.push(found);

    const index = remainingInteractables.indexOf(found);
    if (index > -1) {
      remainingInteractables.splice(index, 1);
    }
  }

  const targets = [];

  for (const name of parsed.target) {
    const found = findInteractable(name, remainingInteractables);
    if (!found) {
      return {
        action: "fail",
        message: `I can't find "${name}"`
      };
    }
    targets.push(found);

    const index = remainingInteractables.indexOf(found);
    if (index > -1) {
      remainingInteractables.splice(index, 1);
    }
  }

  if (targetCount === 0) {
    if (itemCount === 1 && items[0].type === "item") {
      if (!gameState.inventory.includes(items[0].id)) {
        return {
          action: "fail",
          message: `You don't have the ${parsed.items[0]}.`
        };
      }

      if (items[0].primaryType === "operate") {
        return { action: "operate" };
      }

      return {
        action: "need-target",
        itemName: items[0].names[0]
      };
    }

    if (itemCount > 1 && items.every((i) => i.type === "item")) {
      const missingItem = items.find((item) => !gameState.inventory.includes(item.id));
      if (missingItem) {
        return {
          action: "fail",
          message: `You don't have the ${missingItem.names[0]}.`
        };
      }

      const operableItems = items.filter((i) => i.operate);
      if (operableItems.length > 0) {
        return {
          action: "operate-multiple",
          items: parsed.items
        };
      }

      return {
        action: "need-target",
        itemNames: items.map((i) => i.names[0]),
        isPartialRecipe: true
      };
    }

    if (items.some((i) => i.type === "object")) {
      if (itemCount === 1) {
        if (items[0].operate) {
          return { action: "operate" };
        }

        return {
          action: "fail",
          message: "You can't use that."
        };
      }

      if (!items.some((i) => i.type === "item")) {
        if (items.every((i) => i.operate)) {
          return {
            action: "operate-multiple",
            items: parsed.items
          };
        }

        return {
          action: "fail",
          message: "You can't use those."
        };
      }

      return {
        action: "fail",
        message: "I don't understand what you want me to do."
      };
    }
  }

  if (targetCount > 0) {
    if (items.some((i) => i.type === "object" || i.type === "generic")) {
      return {
        action: "fail",
        message: "I don't understand how you want me to do that."
      };
    }

    if (targets.every((t) => t.type === "item")) {
      const allItemIds = [...items.map((i) => i.id), ...targets.map((t) => t.id)];
      const recipeMatch = findRecipeMatch(allItemIds);

      if (recipeMatch.type === "partial") {
        return {
          action: "need-target",
          itemNames: [...items.map((i) => i.names[0]), ...targets.map((t) => t.names[0])],
          isPartialRecipe: true
        };
      }
      if (recipeMatch.type === "full") {
        return {
          action: "craft",
          allItems: [...parsed.items, ...parsed.target]
        };
      }

      return {
        action: "fail",
        message: "I can't make anything with those items"
      };
    }

    if (itemCount === 1 && targetCount === 1 && (targets[0].type === "object" || targets[0].type === "generic")) {
      if (items[0].primaryType && items[0].primaryType === "combat" && targets[0].combat) {
        return { action: "attack" };
      }

      return { action: "apply" };
    }

    if (targets.some((t) => t.type === "object")) {
      return { action: "apply" };
    }
  }

  return {
    action: "fail",
    message: "I don't understand what you want me to do."
  };
}

// Main resolver: validates action and dispatches to execution
// This is where we check if the action makes sense before doing it
function resolveAction(actionType, parsed, verb) {
  // Default null (generic "use") becomes "use" action
  if (actionType === null) {
    actionType = "use";
  }

  const interactables = getInteractablesList();

  // Find the item (tool/weapon being used)
  const item = parsed.items.length > 0 ? findInteractable(parsed.items[0], interactables) : null;

  // Find the target (thing being acted upon)
  const target = parsed.target.length > 0 ? findInteractable(parsed.target[0], interactables) : null;

  // Validation: Check if item exists
  if (!item && parsed.items.length > 0) {
    displayText("I can't find that.");
    return false;
  }

  // Validation: For use/apply/craft, item must be in inventory (not just in room)
  if (item && (actionType === "use" || actionType === "apply" || actionType === "craft")) {
    if (item.type === "object") {
      displayText("You can't take that to use it on something else.");
      return false;
    }
    if (item.type === "generic") {
      displayText("You can't use that.");
      return false;
    }
    // Check if item is actually IN inventory (positive check, not negative)
    if (item.type === "item" && !gameState.inventory.includes(item.id)) {
      displayText(`You don't have the ${parsed.items[0]}.`);
      return false;
    }
  }

  // Validation: Check if target exists
  if (!target && parsed.target.length > 0) {
    displayText("I can't find that.");
    return false;
  }

  // Action is valid - execute it!
  return executeAction(actionType, item, target, parsed, verb);
}

// ===== EXECUTION DISPATCHER =====

// Main dispatcher - routes to specific handler based on action type
function executeAction(actionType, item, target, parsed, verb) {
  switch (actionType) {
    case "attack":
      return handleAttack(item, target);
    case "apply":
      return handleApply(item, target);
    case "craft":
      return handleCraft(parsed.items);
    case "operate":
      return handleOperate(verb, item);
    case "applyCombination":
      return handleCombination(parsed.items, target);
    default:
      displayText("Action not implemented yet.");
      return false;
  }
}
