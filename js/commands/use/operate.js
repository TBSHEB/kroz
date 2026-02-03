// ===== OPERATE HANDLER =====

function handleOperate(verb, item) {
  // Check if this is a disallowedTake with operate error messages
  if (item.type === 'disallowedTake' && item.operate) {
    // operate is an object with verb: error message format
    let errorMessage = item.operate[verb];
    if (errorMessage) {
      if (typeof errorMessage === 'function') {
        errorMessage = errorMessage();
      }
      displayText(errorMessage);
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

  // Set flags for using the item
  if (matchedAction.setFlags) {
    for (const flag of matchedAction.setFlags) {
      setGameState("flags", flag);
    }
  }

  // Remove flags for using the item
  if (matchedAction.unsetFlags) {
    for (const flag of matchedAction.unsetFlags) {
      setGameState("flags", flag, false);
    }
  }

  // Drop any items in the room for using the item
  if (matchedAction.dropItems) {
    for (const item of matchedAction.dropItems) {
      setRoomState("items", item);
    }
  }

  // Give the player any items for using the item
  if (matchedAction.giveItems) {
    for (const item of matchedAction.giveItems) {
      setGameState("inventory", item);
    }
  }

  // Remove object from room
  if (matchedAction.removeObject) {
    setRoomState("objects", item.id, false);
    trackRoomChange(item.id, "object", false);
  }

  // Remove item from player
  if (matchedAction.removeItem) {
    setGameState("inventory", item.id, false)
  }

  // Set player health
  if (matchedAction.setHealth) {
    gameState.healthState = matchedAction.setHealth;
  }

  // Set any checkpoints and remove items
  if (matchedAction.action) {
    switch (matchedAction.action) {
      case "setCheckpoint":
        gameState.lastCheckpoint = gameState.currentRoom;
        saveGame(gameState, "internal checkpoint");
        break;
      case "loseNonvitalItems":
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
    }
  }

  //Display message for successfully using the item in the intended manner
  if (matchedAction.message) {
    displayText(matchedAction.message);
  } else {
    displayText("You successfully used the item");
  }

  // Handle teleportation
  if (matchedAction.teleportMap) {
    const newRoom = matchedAction.teleportMap[gameState.currentRoom];
    if (newRoom) {
      gameState.currentRoom = newRoom;
    }
  }

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
    const eatMsg = item.combat.eatMessage[Math.floor(Math.random() * item.combat.eatMessage.length)];
    displayText(eatMsg);

    // Check if killed
    if (combat.eatCount >= item.combat.requiredEats) {
      // Kill enemy
      const killMsg = item.combat.killMessage[Math.floor(Math.random() * item.combat.killMessage.length)];
      displayText(killMsg);

      // Remove enemy and set flags
      if (item.combat.removeOnKill) {
        setRoomState("objects", item.id, false);
      }
      if (item.combat.setFlags) {
        for (const flag of item.combat.setFlags) {
          setGameState("flags", flag);
        }
      }
      if (item.combat.unsetFlags) {
        for (const flag of item.combat.unsetFlags) {
          setGameState("flags", flag, false);
        }
      }
      if (item.combat.dropItems) {
        for (const dropItem of item.combat.dropItems) {
          setRoomState("items", dropItem);
        }
      }
      if (item.combat.giveItems) {
        for (const giveItem of item.combat.giveItems) {
          setGameState("inventory", giveItem);
        }
      }

      delete gameState.combatState[item.id];
    }

    return;
  }

  // Handle button sequence checking
  if (matchedAction.checkSequence && matchedAction.buttonColor) {
    // Check if puzzle already solved
    if (gameState.flags.includes("ballPuzzleSolved")) {
      return;
    }

    // Initialize buttonsPressed if it doesn't exist
    if (!gameState.buttonsPressed) {
      gameState.buttonsPressed = [];
    }

    const color = matchedAction.buttonColor;

    // Check if this color is already in the sequence
    if (gameState.buttonsPressed.includes(color)) {
      // Reset sequence and start with this color
      gameState.buttonsPressed = [color];
    } else {
      // Add color to sequence
      gameState.buttonsPressed.push(color);
    }

    // Check if we have 4 buttons pressed
    if (gameState.buttonsPressed.length === 4) {
      // Compare to the color code
      const pressedSequence = gameState.buttonsPressed.join(" ");
      const correctSequence = gameState.colorCode.join(" ");

      if (pressedSequence === correctSequence) {
        // Success!
        displayText(matchedAction.successMessage);

        // Drop items
        if (matchedAction.dropItems) {
          for (const dropItem of matchedAction.dropItems) {
            setRoomState("items", dropItem);
          }
        }

        // Mark puzzle as solved
        setGameState("flags", "ballPuzzleSolved");

        // Clear sequence
        gameState.buttonsPressed = [];
      } else {
        // Failure
        displayText(matchedAction.failMessage);

        // Reset sequence
        gameState.buttonsPressed = [];
      }
    }
  }
}
