// ===== ITEM MANIPULATION COMMANDS =====

function takeSingle(alias) {
  gameState.partCommand = "take";
  displayText(`What would you like to ${alias}?`);
}

function take(things, all = false) {
  if (!things || things.length === 0) {
    displayText("That's not something I can take.");
    return;
  } else {
    let feedback = "";
    const currentRoom = rooms[gameState.currentRoom];
    const operableObjects = [];

    // Remove any hidden objects first
    if (currentRoom.objects) {
      for (const object of currentRoom.objects) {
        for (const thing of things) {
          if (objects[object].names.includes(thing)) {
            if (objects[object].hiddenUnlessHasFlag && !gameState.flags.includes(objects[object].hiddenUnlessHasFlag)) {
              // This object is hidden, remove it.
              things = things.filter(t => t !== thing);
            }
          }
        }
      }
    }

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
                  const objectWithId = {...obj, id: objId, type: 'object'};
                  operableObjects.push(objectWithId);
                  things = things.filter(t => t !== thing)
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
              feedback += `${thing}: You can't take that.\n`;
              things = things.filter(t => t !== thing);
            }
          }
        }
      }
    }



    // Build alias-to-itemId map for items in this room
    const aliasToItemId = {};
    if (currentRoom.items) {
      for (const itemId of currentRoom.items) {
        const item = items[itemId];
        // Add all names for this item
        if (item.names) {
          for (const alias of item.names) {
            aliasToItemId[alias.toLowerCase()] = itemId;
          }
        }
      }
    }

    const nonTakeableItems = currentRoom.disallowedTakes ? Object.keys(currentRoom.disallowedTakes) : [];

    console.log("Final things array:", things);

    if (things.length !== 1 || all) {

      const taken = new Set();

      for (const thing of things) {
        const itemId = aliasToItemId[thing];

        if (itemId && currentRoom.items.includes(itemId)) {
          // Item found in room
          setGameState("inventory", itemId);
          if (items[itemId].setFlag) {
            setGameState("flags", items[itemId].setFlag)
          }

          // Remove item from room
          setRoomState("items", itemId, false);
          taken.add(itemId);
          trackRoomItemChange(itemId, false);


          feedback += `${thing}: Taken.\n`;
        } else if (taken.has(itemId)) {
          feedback += `${thing}: You've already taken that.`
        } else if (currentRoom.disallowedTakes && nonTakeableItems.includes(thing)) {
          feedback += `${thing}: ${currentRoom.disallowedTakes[thing]}.\n`;
        } else if (genericDisallowedItems[thing]) {
          feedback += `${thing}: ${genericDisallowedItems[thing]}.\n`;
        } else {
          feedback += `${thing}: I can't find it.\n`;
        }
      }
    } else {
      const itemId = aliasToItemId[things[0]];

      if (itemId) {
        // Item found in room
        setGameState("inventory", itemId);
        if (items[itemId].setFlag) {
          setGameState("flags", items[itemId].setFlag)
        }
        // Remove item from room
        setRoomState("items", itemId, false);
        trackRoomItemChange(itemId, false);

        feedback += "Taken.";
      } else if (currentRoom.disallowedTakes && nonTakeableItems.includes(things[0])) {
        feedback += currentRoom.disallowedTakes[things[0]];
      } else if (genericDisallowedItems[things[0]]) {
        feedback += genericDisallowedItems[things[0]];
      } else {
        feedback += "I can't find that.";
      }
    }
    displayText(feedback);
    if (operableObjects.length > 0) {
      for (const object of operableObjects) {
        handleOperate('take', object);
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
    let feedback = "";
    const currentRoom = rooms[gameState.currentRoom];

    // Build alias-to-itemId map for items in the inventory
    const aliasToItemId = {};
    if (gameState.inventory.length !== 0) {
      for (const itemId of gameState.inventory) {
        const item = items[itemId];
        // Add all names for this item
        if (item.names) {
          for (const alias of item.names) {
            aliasToItemId[alias.toLowerCase()] = itemId;
          }
        }
      }
    }

    if (things.length !== 1) {
      const dropped = new Set();
      for (const thing of things) {
        const itemId = aliasToItemId[thing];

        if (setGameState("inventory", itemId, false)){

          setRoomState("items", itemId);
          feedback += `${thing}: Dropped.\n`;
          dropped.add(itemId);
          trackRoomItemChange(itemId);

        } else if (dropped.has(itemId)) {
          feedback += `${thing}: You've already dropped that.`;
        } else {
          feedback += `${thing}: I don't have that.\n`;
        }
      }
    } else {
      const itemId = aliasToItemId[things[0]];

      if (setGameState("inventory", itemId, false)) {

        setRoomState("items", itemId);
        trackRoomItemChange(itemId);
        feedback += "Dropped.";

      } else {
        feedback += "I don't have that.";
      }
    }
    displayText(feedback);
  }
}

function examineSingle(alias) {
  gameState.partCommand = "examine";
  displayText(`What would you like to ${alias}?`);
}

function examine(things) {
  if (!things || things.length === 0) {
    displayText("I can't examine that.");
    return;
  } else {
    let feedback = "";
    const currentRoom = rooms[gameState.currentRoom];

    // I need to check what type of thing is being examined, item, object, or something else
    if (things.length === 1) {
      let found = false;

      // Check objects
      if (currentRoom.objects && currentRoom.objects.length !== 0) {
        for (const object of currentRoom.objects) {
          if (objects[object].names && objects[object].names.includes(things[0])) {
            if (objects[object].examine) {
              feedback += objects[object].examine;
              found = true;
              break;
            }
          }
        }
      }

      // Check room items
      if (!found && currentRoom.items && currentRoom.items.length !== 0) {
        const aliasToItemId = {};

        for (const itemId of currentRoom.items) {
          const item = items[itemId];

          if (item.names) {
            for (const alias of item.names) {
              aliasToItemId[alias.toLowerCase()] = itemId;
            }
          }
        }

        if (aliasToItemId[things[0]]) {
          const item = items[aliasToItemId[things[0]]];
          if (item && item.examine) {
            feedback += item.examine;
            found = true;
          }
        }
      }

      // Check inventory items
      if (!found && gameState.inventory && gameState.inventory.length !== 0) {
        const aliasToItemId = {};

        for (const itemId of gameState.inventory) {
          const item = items[itemId];

          if (item.names) {
            for (const alias of item.names) {
              aliasToItemId[alias.toLowerCase()] = itemId;
            }
          }
        }

        if (aliasToItemId[things[0]]) {
          const item = items[aliasToItemId[things[0]]];
          if (item && item.examine) {
            feedback += item.examine;
            found = true;
          }
        }
      }

      // Check generic examines
      if (!found && genericExamines[things[0]]) {
        feedback += genericExamines[things[0]];
        found = true;
      }

      // Not found
      if (!found) {
        feedback += "I can't find that.";
      }
    } else {
      // Build alias maps once, outside the loop
      const roomItemAliases = {};
      if (currentRoom.items && currentRoom.items.length !== 0) {
        for (const itemId of currentRoom.items) {
          const item = items[itemId];
          if (item.names) {
            for (const alias of item.names) {
              roomItemAliases[alias.toLowerCase()] = itemId;
            }
          }
        }
      }

      const inventoryAliases = {};
      if (gameState.inventory && gameState.inventory.length !== 0) {
        for (const itemId of gameState.inventory) {
          const item = items[itemId];
          if (item.names) {
            for (const alias of item.names) {
              inventoryAliases[alias.toLowerCase()] = itemId;
            }
          }
        }
      }

      // Check each thing against all categories
      for (const thing of things) {
        let found = false;

        // Check objects
        if (currentRoom.objects && currentRoom.objects.length !== 0) {
          for (const object of currentRoom.objects) {
            if (objects[object].names && objects[object].names.includes(thing)) {
              if (objects[object].examine) {
                feedback += `${thing}: ${objects[object].examine}\n`;
                found = true;
                break;
              }
            }
          }
        }

        // Check room items
        if (!found && roomItemAliases[thing]) {
          const item = items[roomItemAliases[thing]];
          if (item && item.examine) {
            feedback += `${thing}: ${item.examine}\n`;
            found = true;
          }
        }

        // Check inventory items
        if (!found && inventoryAliases[thing]) {
          const item = items[inventoryAliases[thing]];
          if (item && item.examine) {
            feedback += `${thing}: ${item.examine}\n`;
            found = true;
          }
        }

        // Check generic examines
        if (!found && genericExamines[thing]) {
          feedback += `${thing}: ${genericExamines[thing]}\n`;
          found = true;
        }

        // Not found
        if (!found) {
          feedback += `${thing}: I can't find that.\n`;
        }
      }
    }

    displayText(feedback);

  }
}

function takeAll() {
  const interactables = buildInteractablesList();

  // We want to try to take all items in the room, all objects in the room, and all room specific items that can't be taken
  let takes = [];

  for (const item of interactables) {
    if (item.location === "room") {
      takes.push(item)
    }
  }

  const takesIds = takes.map(t => {
    if (t.type === "item" && t.names) {
      return t.names[0];
    } else if (t.type === "object" && t.names) {
      return t.names[0];
    } else if (t.type === "generic") {
      return t.id;
    }
  }).filter(id => id !== undefined);

  if (takesIds.length === 0) {
    displayText("There's nothing here for me to take.");
    return;
  }

  take(takesIds, true);
}

function saySingle(alias) {
  gameState.partCommand = "say";
  displayText(`What would you like to ${alias}?`)
}
function say(raw) {
  // The input is literally what the user typed.
  // First, we need a clean version
  const clean = raw.split(' ');
  // If the first member of clean is "say", "answer" or "speak", we remove it.
  if (clean[0] === "say" || clean[0] === "speak" || clean[0] === "answer") {
    clean.splice(0,1);
  }
  // Now, clean should consist of an array with everything the user inputted, with the spaces removed. Lets check if it's an answer to a riddle.
  const currentRoom = rooms[gameState.currentRoom];

  if (currentRoom.objects) {
    for (const object of currentRoom.objects) {
      if (objects[object].answer) {
        // We're in a room with a riddle. Does the text include the answer?
        let foundAnswer = false;
        for (const thing of clean) {
          const cleanThing = thing.toLowerCase().trim().replace(/[,\.;!?]+$/, "");
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
          const cleanThing = thing.toLowerCase().trim().replace(/[,\.;!?]+$/, "");
          if (cleanThing === obj.sayTrigger.word.toLowerCase()) {
            // Trigger matched!
            displayText(obj.sayTrigger.message);

            // Set flags
            if (obj.sayTrigger.setFlags) {
              obj.sayTrigger.setFlags.forEach(flag => {
                setGameState("flags", flag);
              });
            }

            // Remove object
            if (obj.sayTrigger.removeObject) {
              setRoomState("objects", objectId, false);
            }

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
