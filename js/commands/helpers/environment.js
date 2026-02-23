// ===== ENVIRONMENT & STATE HELPERS =====

// Pick a random element from an array
function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Get a random damage message for a given damage amount
function getDamageMessage(amount) {
  const messages = damageMessages
    .filter(t =>
      (t.min === undefined || amount >= t.min) &&
      (t.max === undefined || amount <= t.max)
    )
    .flatMap(t => t.messages);
  return messages.length ? pickRandom(messages) : null;
}

// Helper: Check if two arrays contain the same elements (order doesn't matter)
function arraysMatchUnordered(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;

  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();

  return sorted1.every((val, index) => val === sorted2[index]);
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

// Clear multi-step command state (call after command completes)
function clearUseState() {
  gameState.partCommand = "";
  gameState.pendingAlias = "";
  gameState.partApplyItems = [];
  gameState.partAttackTarget = [];
  gameState.partCraftItems = [];
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

// Check if player has items that cause instant death in hazard rooms
function checkKillIfInventory(currentRoom) {
    if (!currentRoom?.hazard?.killIfInventory) return false;

    let killed = false;
    for (const [item, message] of Object.entries(currentRoom.hazard.killIfInventory)) {
        if (gameState.inventory.includes(item)) {
            gameState.healthState = 0;
            displayText(message);
            killed = true;
        }
    }
    return killed;
}

// Process temporary item countdowns and expiration
function processTemporaryItems(currentRoom) {
    for (const itemId of gameState.inventory) {
        const tempConfig = typeof items[itemId]?.temporary === "function" ? items[itemId].temporary() : items[itemId]?.temporary;

        if (tempConfig && gameState.itemCountdowns[itemId] === undefined) {
            gameState.itemCountdowns[itemId] = 0;
        }
    }

    for (const [item, count] of Object.entries(gameState.itemCountdowns)) {
        const tempConfig = typeof items[item]?.temporary === "function" ? items[item].temporary() : items[item]?.temporary;

        if (!tempConfig) {
            continue;
        }

        if (tempConfig.duration === count) {
            switch (tempConfig.onExpire) {
                case "destroy":
                    if (currentRoom.items.includes(item) || gameState.inventory.includes(item)) {
                        gameState.healthState = 0;
                    }

                    for (const room of Object.keys(gameState.roomChanges)) {
                        if (gameState.roomChanges[room]?.items?.added.includes(item)) {
                            trackRoomChange(item, "item", false, room);
                            setRoomState("items", item, false, room);
                            if (rooms[room].objects) {
                                for (const object of rooms[room].objects) {
                                    if (objects[object].destructible) {
                                        setRoomState("objects", object, false, room)
                                        trackRoomChange(object, "object", false, room);
                                        if (objects[object].onDestruct) {
                                            for (const flag of objects[object].onDestruct) {
                                                setGameState("flags", flag);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (currentRoom.items.includes(item)) {
                        displayText(tempConfig.onExpireMessage.floor);
                    } else if (gameState.inventory.includes(item)) {
                        displayText(tempConfig.onExpireMessage.inventory);
                    } else {
                        displayText(tempConfig.onExpireMessage.away);
                    }
                    break;

                case "extinguish":

                    if (currentRoom.items.includes(item)) {
                        displayText(tempConfig.onExpireMessage.floor);
                    } else if (gameState.inventory.includes(item)) {
                        displayText(tempConfig.onExpireMessage.inventory);
                    }

                    if (tempConfig.actionSetFlags) {
                        for (const flag of tempConfig.actionSetFlags) {
                            setGameState("flags", flag);
                        }
                    }
                    if (tempConfig.actionUnsetFlags) {
                        for (const flag of tempConfig.actionUnsetFlags) {
                            setGameState("flags", flag, false);
                        }
                    }
            }
            delete gameState.itemCountdowns[item];
        }
        if (tempConfig.messages?.[count]) {
            if (tempConfig.globalMessages || rooms[gameState.currentRoom].items.includes(item)) {
                displayText(tempConfig.messages[count]);
            }
        }

        if (gameState.itemCountdowns[item] !== undefined) {
            gameState.itemCountdowns[item]++;
        }
    }
}

// Sync inventory-dependent flags
function updateHoldingFlags() {
    for (const item in holdingFlags) {
        if (gameState.inventory.includes(holdingFlags[item].item)) {
            if (!gameState.flags.includes(holdingFlags[item].flag)) {
                setGameState("flags", holdingFlags[item].flag);
            }
        } else {
            if (gameState.flags.includes(holdingFlags[item].flag)) {
                setGameState("flags", holdingFlags[item].flag, false);
            }
        }
    }
}

function applyEffects(data) {
  if (!data) return;
  for (const effect of Object.keys(data)) {
    switch (effect) {
      case "setFlags": {
        for (const flag of data[effect]) {
          setGameState("flags", flag);
        }
        break;
      }
      case "unsetFlags": {
        for (const flag of data[effect]) {
          setGameState("flags", flag, false);
        }
        break;
      }
      case "setFlagsIfAllFlags": {
        if (data[effect].required.every(flag => gameState.flags.includes(flag))) {
          for (const flag of data[effect].set) {
            setGameState("flags", flag);
          }
        }
        break;
      }
      case "giveItems": {
        for (const item of data[effect]) {
          setGameState("inventory", item);
        }
        break;
      }
      case "removeItems": {
        for (const item of data[effect]) {
          setGameState("inventory", item, false);
        }
        break;
      }
      case "spawnItems": {
        for (const item of data[effect].items) {
          const room = data[effect].room || null;
          setRoomState("items", item, true, room);
          trackRoomChange(item, "item", true, room);
        }
        break;
      }
      case "spawnObjects": {
        for (const object of data[effect].objects) {
          const room = data[effect].room || null;
          setRoomState("objects", object, true, room);
          trackRoomChange(object, "object", true, room);
        }
        break;
      }
      case "removeObjects": {
        for (const object of data[effect].objects) {
          const room = data[effect].room || null;
          setRoomState("objects", object, false, room);
          trackRoomChange(object, "object", false, room);
        }
        break;
      }
      case "removeObjectsIfAllFlags": {
        if (data[effect].required.every(flag => gameState.flags.includes(flag))) {
          for (const object of data[effect].objects) {
            const room = data[effect].room || null;
            setRoomState("objects", object, false, room);
            trackRoomChange(object, "object", false, room);
          }
          if (data[effect].message) {
            displayText(data[effect].message);
          }
        }
        break;
      }
      case "setHealth": {
        gameState.healthState = data[effect];
        break;
      }
      case "setCheckpoint": {
        gameState.lastCheckpoint = gameState.currentRoom;
        saveGame(gameState, "internal checkpoint");
        break;
      }
      case "loseNonvitalItems": {
        if (gameState.inventory.length > 0) {
          const itemsToLose = [];
          for (const item of gameState.inventory) {
            const isVital = typeof items[item].vital === 'function' ? items[item].vital() : items[item].vital;
            if (!isVital) {
              itemsToLose.push(item);
            }
          }
          for (const item of itemsToLose) {
            setGameState("inventory", item, false);
            setRoomState("items", item, true, "hideout");
            trackRoomChange(item, "item", true, "hideout");
          }
        }
        break;
      }
      case "teleportMap": {
        const newRoom = data[effect][gameState.currentRoom];
        if (newRoom) {
          gameState.currentRoom = newRoom;
        }
        break;
      }
      case "triggerEffects": {
        data[effect].forEach(thingId => {
          const affectedThing = objects[thingId] ?? items[thingId] ?? null;
          if (affectedThing && affectedThing.triggerEffects) {
            // call applyEffects on the new thing
            applyEffects(affectedThing.triggerEffects);
          }
        });
        break;
      }
      case "resetCountdowns": {
        data[effect].forEach(itemId => {
          if (gameState.itemCountdowns[itemId] !== undefined) {
            gameState.itemCountdowns[itemId] = 0;
          }
        });
        break;
      }
      case "checkSequence": {
        if (data[effect].solveOnce && gameState.flags.includes(data[effect].onSuccessEffects.setFlags[0])) continue;

        const store = data[effect].storeName;
        const key = data[effect].key;
        const sequence = data[effect].correctSequenceStore;

        if (!gameState.sequences[sequence]) continue;

        if (!gameState.sequences[store]) {
          gameState.sequences[store] = [];
        }

        if (gameState.sequences[store].includes(key) && !data[effect].duplicateCode) {
          gameState.sequences[store] = [key];
        } else {
          gameState.sequences[store].push(key);
        }

        if (gameState.sequences[store].length === gameState.sequences[sequence].length) {
          if (gameState.sequences[store].every((val, i) => val === gameState.sequences[sequence][i])) {
            displayText(data[effect].successMessage);
            applyEffects(data[effect].onSuccessEffects);
            gameState.sequences[store] = [];
          } else {
            displayText(data[effect].failMessage);
            gameState.sequences[store] = [];
          }
        }
        break;
      }
      default: {
        console.warn(`Add the effect: ${effect}`);
        break;
      }
    }
  }
}
