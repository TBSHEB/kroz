// ===== PARSING & ITEM LOOKUP =====

// Build alias-to-ID map from an array of item IDs
function buildAliasMap(itemIds) {
  const aliasToItemId = {};
  for (const itemId of itemIds) {
    const item = items[itemId];
    if (item && item.names) {
      for (const alias of item.names) {
        aliasToItemId[alias.toLowerCase()] = itemId;
      }
    }
  }
  return aliasToItemId;
}

// Build a list of all things the player can currently interact with
// Includes: room objects, room items, inventory items, generic disallowed items
function buildInteractablesList() {
  const currentRoom = rooms[gameState.currentRoom];
  const interactables = [];

  // Add objects in the room (like troll, door, etc.)
  if (currentRoom.objects) {
    currentRoom.objects.forEach(objId => {
      if (objects[objId] && (objects[objId].hiddenUnlessHasFlag === undefined || gameState.flags.includes(objects[objId].hiddenUnlessHasFlag))) {
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
  if (currentRoom.scenery) {
    Object.entries(currentRoom.scenery).forEach(([itemId, data]) => {
      // Support both old string format and new object format
      if (typeof data === 'string') {
        interactables.push({
          id: itemId,
          type: 'scene',
          names: [itemId],
          message: data,
          location: 'room'
        });
      } else {
        if (data.hiddenUnlessHasFlag === undefined || gameState.flags.includes(data.hiddenUnlessHasFlag)) {
          interactables.push({
            ...data,
            id: itemId,
            type: 'scene',
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

// Parse meaningful words from command input, filtering articles and punctuation
function parseThingsFromWords(words, startIndex = 0) {
  const ignoreWords = ["the", "a", "an", "and"];
  const things = [];

  for (let i = startIndex; i < words.length; i++) {
    let word = words[i].replace(/[,\.;!?]+$/, "");

    if (word && !ignoreWords.includes(word)) {
      things.push(word);
    }
  }

  return things;
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

// Handle disambiguation when multiple items match
// Returns true if input was consumed (caller should return early)
function handleDisambiguation(command, mainCommand) {
    if (gameState.disambiguationMatches.length === 0) return false;

    const useAliases = Object.keys(aliasToAction);

    if (simpleCommands[mainCommand] || useAliases.includes(mainCommand) ||
        complicatedCommands[mainCommand] || knownWords[mainCommand]) {
        gameState.disambiguationMatches = [];
        gameState.disambiguationSearchName = "";
        gameState.disambiguationOriginalCommand = "";
        return false;
    }

    const matches = gameState.disambiguationMatches;
    const previousSearch = gameState.disambiguationSearchName;
    const originalCommand = gameState.disambiguationOriginalCommand;

    const narrowedMatches = matches.filter(match => {
        const itemData = items[match.id] || objects[match.id];
        if (!itemData || !itemData.names) return false;

        return itemData.names.some(name => {
            if (name.includes(command)) return true;
            const words = name.split(' ');
            return words.includes(command);
        });
    });

    if (narrowedMatches.length === 0) {
        displayText(`You don't have the ${command} ${previousSearch}.`);
        gameState.disambiguationMatches = [];
        gameState.disambiguationSearchName = "";
        gameState.disambiguationOriginalCommand = "";
    } else if (narrowedMatches.length === 1) {
        const item = narrowedMatches[0];
        gameState.disambiguationMatches = [];
        gameState.disambiguationSearchName = "";
        gameState.disambiguationOriginalCommand = "";

        if (originalCommand === "take") {
            take([item.id]);
        } else if (originalCommand === "drop") {
            drop([item.id]);
        } else if (originalCommand === "examine") {
            examine([item.id]);
        }
    } else {
        gameState.disambiguationMatches = narrowedMatches;
        gameState.disambiguationSearchName = `${command} ${previousSearch}`;
        displayText(`Which ${gameState.disambiguationSearchName}?`);
    }

    return true;
}
