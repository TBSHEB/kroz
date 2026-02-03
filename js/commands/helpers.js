// ===== HELPER FUNCTIONS =====

// Build a list of all things the player can currently interact with
// Includes: room objects, room items, inventory items, generic disallowed items
function buildInteractablesList() {
  const currentRoom = rooms[gameState.currentRoom];
  const interactables = [];

  // Add objects in the room (like troll, door, etc.)
  if (currentRoom.objects) {
    currentRoom.objects.forEach(objId => {
      if (objects[objId]) {
        interactables.push({
          ...objects[objId],  // Copy all object properties
          id: objId,          // Add the ID for reference
          type: 'object',
          location: 'room'    // Mark as object
        });
      }
    });
  }

  // Add items in the room (not picked up yet)
  if (currentRoom.items) {
    currentRoom.items.forEach(itemId => {
      if (items[itemId]) {
        interactables.push({
          ...items[itemId],
          id: itemId,
          type: 'item',
          location: 'room'
        });
      }
    });
  }

  // Add items in inventory
  gameState.inventory.forEach(itemId => {
    if (items[itemId]) {
      interactables.push({
        ...items[itemId],
        id: itemId,
        type: 'item',
        location: 'inventory'
      });
    }
  });

  // Add room-specific disallowed items (things that exist but can't be taken)
  if (currentRoom.disallowedTakes) {
    Object.entries(currentRoom.disallowedTakes).forEach(([itemId, data]) => {
      // Support both old string format and new object format
      if (typeof data === 'string') {
        interactables.push({
          id: itemId,
          type: 'disallowedTake',
          names: [itemId],
          message: data,
          location: 'room'
        });
      } else {
        if (data.hiddenUnlessHasFlag === undefined || gameState.flags.includes(data.hiddenUnlessHasFlag)) {
          interactables.push({
            ...data,
            id: itemId,
            type: 'disallowedTake',
            location: 'room'
          });
        }
      }
    });
  }

  // Add global generic items (wall, air, etc.)
  Object.keys(genericDisallowedItems).forEach(itemId => {
    interactables.push({
      id: itemId,
      type: 'generic',
      names: [itemId],
      message: genericDisallowedItems[itemId],
      location: 'global'
    });
  });

  return interactables;
}

// Find an interactable thing by name or alias
// Checks: exact ID match, then aliases (items), then names (objects)
function findInteractable(searchName, interactables) {
  // First: exact ID match
  const exactMatch = interactables.find(i => i.id === searchName);
  if (exactMatch) return exactMatch;

  // Second: check names (for items, objects, and generic items)
  const namesMatch = interactables.find(i =>
    i.names && i.names.includes(searchName)
  );
  if (namesMatch) return namesMatch;

  // Not found
  return null;
}

// Disambiguate item selection - handles ambiguous matches
// Returns: item object if found, "AMBIGUOUS" if ambiguous (sets state), null if not found
function disambiguateItem(searchName, interactables, commandName) {
  // First: exact ID match
  const exactMatch = interactables.find(i => i.id === searchName);
  if (exactMatch) return exactMatch;

  // Second: find all name matches
  const nameMatches = interactables.filter(i =>
    i.names && i.names.includes(searchName)
  );

  if (nameMatches.length === 0) {
    return null; // Not found
  }

  if (nameMatches.length === 1) {
    return nameMatches[0]; // Single match
  }

  // Multiple matches - check if they're all the same ID (duplicate items)
  const uniqueIds = [...new Set(nameMatches.map(m => m.id))];
  if (uniqueIds.length === 1) {
    return nameMatches[0]; // All same item, just return first
  }

  // Check if all have same stackId (interchangeable items)
  const stackIds = nameMatches.map(m => {
    const itemData = items[m.id] || objects[m.id];
    return itemData?.stackId;
  }).filter(id => id);

  if (stackIds.length === nameMatches.length &&
      stackIds.every(id => id === stackIds[0])) {
    return nameMatches[0]; // All interchangeable
  }

  // Truly ambiguous - set state
  gameState.disambiguationMatches = nameMatches;
  gameState.disambiguationSearchName = searchName;
  gameState.disambiguationOriginalCommand = commandName;

  displayText(`Which ${searchName}?`);
  return "AMBIGUOUS";
}

// Parse command into items and targets based on preposition
// For attack: "attack troll with sword" → target: [troll], items: [sword]
// For use/apply: "use sword on troll" → items: [sword], target: [troll]
// For craft: "combine hammer and nails" → items: [hammer, nails], target: []
function parseActionCommand(actionType, things) {
  // Find any preposition in the command
  const prepIndex = things.findIndex(word => PREPOSITIONS.includes(word));

  if (actionType === 'attack') {
    // Attack format: target comes first, then item
    // "attack troll with sword" → target: [troll], items: [sword]
    if (prepIndex === -1) {
      // No preposition: everything is target (unarmed attack)
      return { target: things, items: [] };
    }
    return {
      target: things.slice(0, prepIndex),
      items: things.slice(prepIndex + 1)
    };
  }
  else if (actionType === 'use' || actionType === 'apply') {
    // Use/apply format: item comes first, then target
    // "use sword on troll" → items: [sword], target: [troll]
    if (prepIndex === -1) {
      // No preposition: everything is items (need to ask for target)
      return { items: things, target: [] };
    }
    return {
      items: things.slice(0, prepIndex),
      target: things.slice(prepIndex + 1)
    };
  }
  else if (actionType === 'craft') {
    // Craft format: all items, preposition doesn't matter
    // "combine hammer and nails" → items: [hammer, nails]
    // Filter out the preposition itself
    return { items: things.filter(word => !PREPOSITIONS.includes(word)), target: [] };
  }
  else if (actionType === 'operate') {
    // Operate format: just the item, no target
    // "equip helmet" → items: [helmet], target: []
    return { items: things, target: [] };
  }
}

// Clear multi-step command state (call after command completes)
function clearUseState() {
  gameState.partCommand = "";
  gameState.pendingAlias = "";
  gameState.partApplyItems = [];
  gameState.partAttackTarget = [];
  gameState.partCraftItems = [];
}

function setGameState(field, data, adding = true) {

  if (adding === true) {
    gameState[field].push(data);
    return true;
  } else {
    const index = gameState[field].indexOf(data);
    if (index > -1) {
      gameState[field].splice(index, 1);
      return true;
    } else {
      return false;
    }
  }
}

function setRoomState(field, data, adding = true, roomOverride) {
  let currentRoom
  if (roomOverride) {
    currentRoom = rooms[roomOverride];
  } else {
    currentRoom = rooms[gameState.currentRoom];
  }

  if (adding === true) {
    currentRoom[field].push(data);
    return true;
  } else {
    const index = currentRoom[field].indexOf(data);
    if (index > -1) {
      currentRoom[field].splice(index, 1);
      return true;
    } else {
      return false;
    }
  }
}

function initializeCombat() {
  console.log("Combat initialized")
  const currentRoom = rooms[gameState.currentRoom];
  if (currentRoom.objects) {
    currentRoom.objects.forEach(objectId => {
      const object = objects[objectId];

      if (object && object.combat && !gameState.combatState[objectId]) {
        gameState.combatState[objectId] = {
          isEngaged: false,
          turnCount: 0,
        };
      }
    });
  }
}

// Get appropriate error message for a failed action
// Later you can add custom errorMessages to items/objects
function getErrorMessage(item, actionType, target) {
  if (!item) {
    return "I can't find that.";
  }

  // Check if item has custom error messages (future feature)
  const actionMsgs = item.errorMessages?.[actionType];

  // Try target-specific message
  if (target && actionMsgs?.[target.id]) {
    return actionMsgs[target.id];
  }

  // Fall back to action default
  if (actionMsgs?.default) {
    return actionMsgs.default;
  }

  // Global fallback
  return `You can't ${actionType} that.`;
}

// Helper: Check if two arrays contain the same elements (order doesn't matter)
function arraysMatchUnordered(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;

  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();

  return sorted1.every((val, index) => val === sorted2[index]);
}

function processEnemyTurns() {
    const currentRoom = rooms[gameState.currentRoom];

    if (currentRoom.objects) {
        for (const object of currentRoom.objects) {
            const enemy = objects[object];
            if (enemy.combat && gameState.combatState[object] && gameState.combatState[object].turnCount !== 1) {
                //The enemy gets a turn

                //Counter attack!
                if (enemy.combat.counterAttackMessage) {
                    const randomMessage = enemy.combat.counterAttackMessage[Math.floor(Math.random() * enemy.combat.counterAttackMessage.length)];
                    displayText(randomMessage);
                } else {
                    displayText(`The ${object} attacks!`);
                }

                //Player can dodge
                const dodge = Math.random() <= (enemy.combat.playerDodgeChance || 0);

                if (dodge) {
                    if (enemy.combat.playerDodgeMessage) {
                        const randomMessage = enemy.combat.playerDodgeMessage[Math.floor(Math.random() * enemy.combat.playerDodgeMessage.length)];
                        displayText(randomMessage);
                    } else {
                        displayText("You dodge");
                    }
                } else {
                    //The enemy hits the player
                    const damage = enemy.combat.damageToPlayer;
                    let healthLost = 0
                    if (damage.lowHealth && gameState.healthState <= damage.lowHealthThreshold) {
                        healthLost = damage.lowHealth;
                    } else if (damage.randomDamage) {
                        healthLost = Math.floor(Math.random() * (damage.randomDamage[1] - damage.randomDamage[0] + 1)) + damage.randomDamage[0];
                    } else if (damage.default) {
                        healthLost = damage.default;
                    } else {
                        healthLost = 1;
                    }

                    if (gameState.healthState - healthLost < 0) {
                        gameState.healthState = 0
                    } else {
                        gameState.healthState -= healthLost
                    }

                    if (enemy.combat.hitPlayerMessage) {
                        const randomMessage = enemy.combat.hitPlayerMessage[Math.floor(Math.random() * enemy.combat.hitPlayerMessage.length)];
                        displayText(randomMessage);
                    } else {
                        displayText(`The ${object} hits you.`);
                    }

                    if (healthLost === 1) {
                        const randomMessage = damageMessages.lowDamage[Math.floor(Math.random() * damageMessages.lowDamage.length)];
                        displayText(randomMessage);
                    } else if (healthLost === 2) {
                        const randomMessage = damageMessages.highDamage[Math.floor(Math.random() * damageMessages.highDamage.length)];
                        displayText(randomMessage);
                    } else {
                        displayText("You took a strange amount of damage");
                    }
                }
            }
        }
    }
}

function findRecipeMatch(itemIds) {
  for (const [resultId, recipe] of Object.entries(recipes)) {
    if (arraysMatchUnordered(itemIds, recipe.requires)) {
      return {
        type: "full",
        resultId,
        recipe,
        missing: []
      };
    }

    const allItemsInRecipe = itemIds.every(id => recipe.requires.includes(id));
    const missingItems = recipe.requires.filter(id => !itemIds.includes(id));

    if (allItemsInRecipe && missingItems.length > 0) {
      return {
        type: "partial",
        resultId,
        recipe,
        missing: missingItems
      };
    }

  }

  return {type: "none"};
}

function findAllMatching(searchName, interactables) {
  let matches = interactables.filter(i =>
    i.id === searchName || i.names?.includes(searchName)
  );

  if (matches.length > 0) return matches;

  if (searchName.endsWith("ies")) {
    const singular = searchName.slice(0, -3) + "y";
    matches = interactables.filter(i =>
      i.id === singular ||
      i.names?.includes(singular)
    );

    if (matches.length > 0) return matches;
  }

  if (searchName.endsWith("es")) {
    const singular = searchName.slice(0, -2);
    matches = interactables.filter(i =>
      i.id === singular ||
      i.names?.includes(singular)
    );

    if (matches.length > 0) return matches;
  }

  if (searchName.endsWith("s")) {
    const singular = searchName.slice(0, -1);
    matches = interactables.filter(i =>
      i.id === singular ||
      i.names?.includes(singular)
    );

    if (matches.length > 0) return matches;
  }

  return [];
}

function checkCombinations(items, target) {
  if (!target.applyWith || !target.applyWith._combinations) {
    return null;
  }

  const itemIds = items.map (i => i.id);

  for (const combo of target.applyWith._combinations) {
    if (arraysMatchUnordered(itemIds, combo.items)) {
      return combo;
    }
  }

  return null;
}

function checkRiddleAnswer(potentialAnswer) {
  const currentRoom = rooms[gameState.currentRoom];

  if (!currentRoom.objects) {
    return false;
  }

  for (const objectId of currentRoom.objects) {
    const object = objects[objectId];

    if (object && object.answer) {
      const normalizedAnswer = potentialAnswer.toLowerCase().trim();
      const isCorrect = object.answer.answer.some(answer => answer.toLowerCase() === normalizedAnswer);

      if (isCorrect) {

        if (object.answer.message) {
          displayText(object.answer.message);
        }

        if (object.answer.setFlags) {
          for (const flag of object.answer.setFlags) {
            setGameState("flags", flag);
          }
        }

        if (object.answer.removeOnAnswer) {
          setRoomState("objects", objectId, false);
        }

        return true;
      }
    }
  }
  return false;
}

function matchItemPhrase(things, aliasToItemId) {
  const matches = [];
  const used = new Set();

  for (let i = 0; i < things.length; i++) {
    if (used.has(i)) continue;

    let matched = false;
    for (let len = things.length - i; len > 0; len--) {
      const phrase = things.slice(i, i + len).join(' ');

      if (aliasToItemId[phrase]) {
        matches.push({ alias: phrase, itemId: aliasToItemId[phrase] });
        for (let j = i; j < i + len; j ++) {
          used.add(j);
        }
        matched = true;
        break;
      }
    }

    if (!matched && aliasToItemId[things[i]]) {
      matches.push({ alias: things[i], itemId: aliasToItemId[things[i]] });
      used.add(i);
    }
  }

  const unmatched = things.filter((_, idx) => !used.has(idx));

  return { matches, unmatched };
}

function replaceSplitWordsWithFullName(words) {
  const aliasToInteractableId = {};
  const interactables = buildInteractablesList();
  if (interactables) {
    interactables.forEach(int => {
      if (int.type === "item" && items[int.id].names) {
        for (const name of items[int.id].names) {
          aliasToInteractableId[name.toLowerCase()] = int.id;
        }
      } else if (int.type === "object" && objects[int.id].names) {
        for (const name of objects[int.id].names) {
          aliasToInteractableId[name.toLowerCase()] = int.id;
        }
      }
    });
  }
  const { matches, unmatched } = matchItemPhrase(words, aliasToInteractableId);

  const result = [];
  const used = new Set();

  for (let i = 0; i < words.length; i++) {
    if (used.has(i)) continue;

    const match = matches.find(m => {
      const splitMatch = m.alias.split(' ');
      return splitMatch.every((word, offset) => words[i + offset] === word);
    });

    if (match) {
      result.push(match.alias);

      const phraseLength = match.alias.split(' ').length;
      for (let j = 0; j < phraseLength; j++) {
        used.add(i + j);
      }
    } else {
      result.push(words[i])
    }
  }
  return result;
}

function trackRoomChange(id, type, added = true, roomOverride) {
  let roomId
  if (roomOverride) {
    roomId = roomOverride;
  } else {
    roomId = gameState.currentRoom;
  }

  if (!gameState.roomChanges[roomId]) {
    gameState.roomChanges[roomId] = { items: { removed: [], added: [] }, objects: { removed: [], added: [] } };
  }

  const changes = gameState.roomChanges[roomId];

  if (type === "item") {
    if (added) {
      if (!changes.items.added.includes(id)) {
        changes.items.added.push(id);
      }

      const removedIndex = changes.items.removed.indexOf(id);
      if (removedIndex > -1) {
        changes.items.removed.splice(removedIndex, 1);
      }
    } else {
      if (!changes.items.removed.includes(id)) {
        changes.items.removed.push(id);
      }

      const addedIndex = changes.items.added.indexOf(id);
      if (addedIndex > -1) {
        changes.items.added.splice(addedIndex, 1);
      }
    }
  }
  if (type === "object") {
    if (added) {
      if (!changes.objects.added.includes(id)) {
        changes.objects.added.push(id);
      }

      const removedIndex = changes.objects.removed.indexOf(id);
      if (removedIndex > -1) {
        changes.objects.removed.splice(removedIndex, 1);
      }
    } else {
      if (!changes.objects.removed.includes(id)) {
        changes.objects.removed.push(id);
      }

      const addedIndex = changes.objects.added.indexOf(id);
      if (addedIndex > -1) {
        changes.objects.added.splice(addedIndex, 1);
      }
    }
  }

  if (changes.items.added.length === 0 && changes.items.removed.length === 0 && changes.objects.added.length === 0 && changes.objects.removed.length === 0) {
    delete gameState.roomChanges[roomId];
  }
}

// Flip a direction to its opposite (for mirror rooms)
function flipDirection(direction) {
  const directionMap = {
    'north': 'south',
    'south': 'north',
    'east': 'west',
    'west': 'east',
    'northeast': 'southwest',
    'southwest': 'northeast',
    'northwest': 'southeast',
    'southeast': 'northwest',
    'n': 's',
    's': 'n',
    'e': 'w',
    'w': 'e',
    'ne': 'sw',
    'sw': 'ne',
    'nw': 'se',
    'se': 'nw'
  };
  return directionMap[direction] || direction;
}
