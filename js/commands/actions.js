// ===== ITEM MANIPULATION COMMANDS =====

/**
 * @param {string} itemId
 * @returns {string|null} denial message, or null on success
 */
function takeItemFromRoom(itemId) {
  if (items[itemId].canTake) {
    const denial = evaluateCanTake(items[itemId].canTake);
    if (denial) return denial;
  }

  setGameState('inventory', itemId);
  if (items[itemId].setFlag) {
    setGameState('flags', items[itemId].setFlag);
  }
  if (!items[itemId].infinite) {
    setRoomState('items', itemId, false);
    trackRoomChange(itemId, 'item', false);
  }

  return null;
}

function takeSingle(alias) {
  gameState.partCommand = "take";
  displayText(`What would you like to ${alias}?`);
}

function take(things, all = false) {
  if (!things || things.length === 0) {
    displayText("That's not something I can take.");
    return;
  } else {
    // Check for ambiguous items first (unless taking all)
    if (!all) {
      const interactables = getInteractablesList();
      for (const thing of things) {
        const result = disambiguateItem(thing, interactables, "take", "room");
        if (result === "AMBIGUOUS") {
          return; // Wait for clarification
        }
      }
    }

    let feedback = "";
    const originalCount = things.length;
    const currentRoom = rooms[gameState.currentRoom];
    const operableObjects = [];

    // Check if trying to take an object with operate (like dungeonLamp)
    if (currentRoom.objects) {
      for (const objId of currentRoom.objects) {
        const obj = objects[objId];
        if (obj && obj.names && obj.operate) {
          for (const action of Object.keys(obj.operate)) {
            if (obj.operate[action].allowedVerbs.includes("take")) {
              // Check if any of the things match this object's names
              for (const thing of things) {
                if (obj.names.includes(thing)) {
                  // Route to operate handler
                  const objectWithId = { ...obj, id: objId, type: "object" };
                  operableObjects.push(objectWithId);
                  things = things.filter((t) => t !== thing);
                }
              }
            }
          }
        }
      }
    }

    if (currentRoom.objects) {
      for (const objectId of currentRoom.objects) {
        const object = objects[objectId];
        if (object && object.names) {
          for (const thing of things) {
            if (object.names.includes(thing)) {
              feedback += originalCount === 1 && !all ? "You can't take that.\n" : `${thing}: You can't take that.\n`;
              things = things.filter((t) => t !== thing);
            }
          }
        }
      }
    }

    // Build alias-to-itemId map for items in this room
    const aliasToItemId = currentRoom.items ? buildAliasMap(currentRoom.items) : {};

    // Build alias-to-key map for scenery (supports both string and object format)
    const disallowedAliasToKey = {};
    if (currentRoom.scenery) {
      Object.entries(currentRoom.scenery).forEach(([key, data]) => {
        if (typeof data === "string") {
          // Old format: key is the only alias
          disallowedAliasToKey[key] = key;
        } else {
          // New format: map all names to the key
          if (data.names) {
            data.names.forEach((alias) => {
              disallowedAliasToKey[alias] = key;
            });
          }
        }
      });
    }

    if (things.length !== 1 || all) {
      const taken = new Set();

      for (const thing of things) {
        const itemId = aliasToItemId[thing];

        if (itemId && currentRoom.items.includes(itemId)) {
          const denial = takeItemFromRoom(itemId);
          if (denial) {
            feedback += `${denial}\n`;
            continue;
          }

          taken.add(itemId);
          feedback += `${thing}: Taken.\n`;
        } else if (taken.has(itemId)) {
          feedback += `${thing}: You've already taken that.\n`;
        } else if (disallowedAliasToKey[thing]) {
          const key = disallowedAliasToKey[thing];
          const data = currentRoom.scenery[key];
          const message = resolveConditionalText(typeof data === "string" ? data : data.message);
          feedback += `${thing}: ${message}\n`;
        } else if (genericDisallowedItems[thing]) {
          feedback += `${thing}: ${genericDisallowedItems[thing]}\n`;
        } else {
          feedback += `${thing}: I can't find it.\n`;
        }
      }
    } else {
      const itemId = aliasToItemId[things[0]];

      if (itemId) {
        const denial = takeItemFromRoom(itemId);
        if (denial) {
          feedback += `${denial}\n`;
          displayText(feedback);
          return;
        }

        feedback += "Taken.";
      } else if (disallowedAliasToKey[things[0]]) {
        const key = disallowedAliasToKey[things[0]];
        const data = currentRoom.scenery[key];
        const message = resolveConditionalText(typeof data === "string" ? data : data.message);
        feedback += message;
      } else if (genericDisallowedItems[things[0]]) {
        feedback += genericDisallowedItems[things[0]];
      } else {
        feedback += "I can't find that.";
      }
    }
    displayText(feedback);
    if (operableObjects.length > 0) {
      for (const object of operableObjects) {
        handleOperate("take", object);
      }
    }
  }
}

function dropSingle(alias) {
  gameState.partCommand = "drop";
  displayText(`What would you like to ${alias}?`);
}

function drop(things) {
  if (!things || things.length === 0) {
    displayText("I don't think I could drop that.");
    return;
  } else {
    // Check for ambiguous items first
    const interactables = getInteractablesList();
    for (const thing of things) {
      const result = disambiguateItem(thing, interactables, "drop", "inventory");
      if (result === "AMBIGUOUS") {
        return; // Wait for clarification
      }
    }

    let feedback = "";

    // Build alias-to-itemId map for items in the inventory
    const aliasToItemId = buildAliasMap(gameState.inventory);

    if (things.length !== 1) {
      const dropped = new Set();
      for (const thing of things) {
        const itemId = aliasToItemId[thing];

        if (!itemId || !items[itemId]) {
          feedback += `${thing}: I don't have that.\n`;
          continue;
        }

        if (items[itemId].undroppable === true) {
          displayText(items[itemId].undroppableMessage);
          continue;
        }

        if (setGameState("inventory", itemId, false)) {
          setRoomState("items", itemId);
          feedback += `${thing}: Dropped.\n`;
          dropped.add(itemId);
          trackRoomChange(itemId, "item");
        } else if (dropped.has(itemId)) {
          feedback += `${thing}: You've already dropped that.\n`;
        } else {
          feedback += `${thing}: I don't have that.\n`;
        }
      }
    } else {
      const itemId = aliasToItemId[things[0]];

      if (setGameState("inventory", itemId, false)) {
        setRoomState("items", itemId);
        trackRoomChange(itemId, "item");
        feedback += "Dropped.";
      } else {
        feedback += "I don't have that.";
      }
    }
    displayText(feedback);
  }
}

/**
 * @param {string} thing
 * @param {object} currentRoom
 * @param {object} roomItemAliases
 * @param {object} inventoryAliases
 * @returns {string|null} examine text, or null if not found
 */
function resolveExamineText(thing, currentRoom, roomItemAliases, inventoryAliases) {
  if (currentRoom.objects?.length) {
    for (const objectId of currentRoom.objects) {
      if (objects[objectId].names?.includes(thing) && objects[objectId].examine) {
        if (objects[objectId].onExamine) applyEffects(objects[objectId].onExamine);
        return resolveConditionalText(objects[objectId].examine);
      }
    }
  }

  if (roomItemAliases[thing]) {
    const item = items[roomItemAliases[thing]];
    if (item?.examine) return resolveConditionalText(item.examine);
  }

  if (inventoryAliases[thing]) {
    const item = items[inventoryAliases[thing]];
    if (item?.examine) return resolveConditionalText(item.examine);
  }

  if (currentRoom.scenery) {
    for (const [key, data] of Object.entries(currentRoom.scenery)) {
      if (typeof data === 'object' && data.names?.includes(thing) && data.examine) {
        return resolveConditionalText(data.examine);
      }
    }
  }

  if (genericExamines[thing]) return genericExamines[thing];

  return null;
}

function examineSingle(alias) {
  if (isDark()) {
    displayText("It's far too dark to examine anything...");
    return;
  }

  gameState.partCommand = "examine";
  displayText(`What would you like to ${alias}?`);
}

function examine(things) {
  if (isDark()) {
    displayText("It's far too dark to examine anything...");
    return;
  }

  if (!things || things.length === 0) {
    displayText("I can't examine that.");
    return;
  } else {
    // Check for ambiguous items first
    const interactables = getInteractablesList();
    for (const thing of things) {
      const result = disambiguateItem(thing, interactables, "examine");
      if (result === "AMBIGUOUS") {
        return; // Wait for clarification
      }
    }

    let feedback = "";
    const currentRoom = rooms[gameState.currentRoom];
    const roomItemAliases = currentRoom.items ? buildAliasMap(currentRoom.items) : {};
    const inventoryAliases = buildAliasMap(gameState.inventory);

    if (things.length === 1) {
      const text = resolveExamineText(things[0], currentRoom, roomItemAliases, inventoryAliases);
      feedback += text || "I can't find that.";
    } else {
      for (const thing of things) {
        const text = resolveExamineText(thing, currentRoom, roomItemAliases, inventoryAliases);
        feedback += `${thing}: ${text || "I can't find that."}\n`;
      }
    }

    displayText(feedback);
  }
}

function takeAll() {
  if (isDark()) {
    displayText("I'm not sure how you want me to take everything in the room, when I can see nothing of the room.");
    return;
  }

  const interactables = getInteractablesList();

  // Filter items in the room, excluding those with allIgnore: true
  let takes = interactables.filter((item) => item.location === "room" && !item.allIgnore);

  const takesIds = takes
    .map((t) => {
      if (t.names) {
        return t.names[0]; // Use first name/alias
      } else if (t.type === "generic" || t.type === "scene") {
        return t.id;
      }
    })
    .filter((id) => id !== undefined);

  if (takesIds.length === 0) {
    displayText("There's nothing here for me to take.");
    return;
  }

  take(takesIds, true);
}

function saySingle(alias) {
  gameState.partCommand = "say";
  displayText(`What would you like to ${alias}?`);
}
function say(raw) {
  // The input is literally what the user typed.
  // First, we need a clean version
  const clean = raw.split(" ");
  // If the first member of clean is "say", "answer" or "speak", we remove it.
  if (clean[0] === "say" || clean[0] === "speak" || clean[0] === "answer") {
    clean.splice(0, 1);
  }
  // Now, clean should consist of an array with everything the user inputted, with the spaces removed. Lets check if it's an answer to a riddle.
  const currentRoom = rooms[gameState.currentRoom];

  if (currentRoom.objects) {
    for (const object of currentRoom.objects) {
      if (objects[object].answer) {
        // We're in a room with a riddle. Does the text include the answer?
        let foundAnswer = false;
        for (const thing of clean) {
          const cleanThing = thing
            .toLowerCase()
            .trim()
            .replace(/[,\.;!?]+$/, "");
          if (checkRiddleAnswer(cleanThing)) {
            // Yes, the answer was within the text.
            // checkRiddleAnswer already handles what happens when you correctly answer the riddle.
            foundAnswer = true;
            break;
          }
        }

        if (foundAnswer) {
          return true;
        }
      }
    }
  }

  // Check for sayTrigger on objects
  if (currentRoom.objects) {
    for (const objectId of currentRoom.objects) {
      const obj = objects[objectId];
      if (obj && obj.sayTrigger) {
        // Check if any of the words match the trigger word
        for (const thing of clean) {
          const cleanThing = thing
            .toLowerCase()
            .trim()
            .replace(/[,\.;!?]+$/, "");
          if (cleanThing === obj.sayTrigger.word.toLowerCase()) {
            // Trigger matched!
            displayText(obj.sayTrigger.message);

            // Apply effects
            applyEffects(obj.sayTrigger.effects);

            clearUseState();
            return true;
          }
        }
      }
    }
  }

  // Build up what to say.
  let feedback = "";

  for (const thing of clean) {
    feedback += `${thing} `;
  }

  displayText(feedback);
  clearUseState();
}
