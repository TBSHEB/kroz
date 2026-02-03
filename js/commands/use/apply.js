// ===== APPLY HANDLERS =====

// Handle applying items to objects/targets
function handleApply(item, target) {
  console.log("DEBUG handleApply:");
  console.log("  item:", item);
  console.log("  target:", target);
  console.log("  target.type:", target?.type);
  console.log("  target.applyWith:", target?.applyWith);
  // Special case: ladder placement on floor/ground
  if ((item.id === 'stepladder' || item.id === 'ladder') && (target.id === 'floor' || target.id === 'ground')) {
    setRoomState("items", item.id);
    setGameState("inventory", item.id, false);
    displayText(`You place the ${item.names[0]} on the ${target.names[0]}.`);
    return true;
  }

  // Special case: using equippable items on self (use helmet on me)
  if ((target.id === 'me' || target.id === 'myself' || target.id === 'self') && item.operate) {
    // Route to operate handler with "equip" or "use" verb
    return handleOperate('use', item);
  }

  // Check if target is a disallowedTake with apply interactions
  if (target.type === 'disallowedTake' && target.apply) {
    // apply is an object with item IDs as keys and error messages as values
    let errorMessage = target.apply[item.id];
    if (errorMessage) {
      if (typeof errorMessage === 'function') {
        errorMessage = errorMessage();
      }
      displayText(errorMessage);
      return false;
    }
    // Fall through to default error if no specific message
  }

  // Check if target is an object with applyWith interactions
  if (target.type === 'object' && target.applyWith) {
    // Check for progressive combination with single item
    if (target.applyWith._progressiveCombination) {
      const config = target.applyWith._progressiveCombination;

      // Check if this item is part of the progressive combination
      if (config.items.includes(item.id)) {
        const flagName = item.id + "Used";

        // Check if already used
        if (gameState.flags.includes(flagName)) {
          displayText("You've already used that key.");
          return true;
        }

        // Set flag and consume item
        setGameState("flags", flagName);
        setGameState("inventory", item.id, false);

        // Check completion
        const allUsed = config.items.every(itemId =>
          gameState.flags.includes(itemId + "Used")
        );

        // Display message
        if (allUsed) {
          displayText(config.completeMessage);
          if (config.completionFlag) {
            setGameState("flags", config.completionFlag);
          }
          if (config.removeOnComplete) {
            setRoomState("objects", target.id, false);
          }
        } else {
          const remaining = config.items.filter(itemId =>
            !gameState.flags.includes(itemId + "Used")
          ).length;

          let message = config.singleMessage || "You insert a key. It clicks into place.";
          if (config.incompleteSuffix) {
            message += config.incompleteSuffix.replace("{remaining}", remaining);
          }
          displayText(message);
        }

        return true;
      }
    }

    // Check for specific item interaction
    const interaction = target.applyWith[item.id] || target.applyWith._default;

    if (!interaction) {
      displayText(`You can't use the ${item.names[0]} on the ${target.names[0]}.`);
      return false;
    }

    // Check requirements
    if (interaction.requireFlags && !interaction.requireFlags.every(f => gameState.flags.includes(f))) {
      displayText(interaction.failMessage || `You can't use that yet.`);
      return false;
    }

    if (interaction.requireNotFlags && interaction.requireNotFlags.some(f => gameState.flags.includes(f))) {
      displayText(interaction.failMessage || `You've already done that.`);
      return false;
    }

    // Execute the interaction
    const message = typeof interaction.message === 'function'
      ? interaction.message(item)
      : interaction.message;
    displayText(message);

    // Set flags
    if (interaction.setFlags) {
      interaction.setFlags.forEach(flag => {
        if (!gameState.flags.includes(flag)) {
          setGameState("flags", flag);
        }
      });
    }

    // Set flags if all flags already set
    if (interaction.setFlagsIfAllFlags && interaction.setFlagsIfAllFlags.required.every(f => gameState.flags.includes(f))) {
      interaction.setFlagsIfAllFlags.set.forEach(flag => {
        if (!gameState.flags.includes(flag)) {
          setGameState("flags", flag);
        }
      })
    }

    // Unset flags
    if (interaction.unsetFlags) {
      interaction.unsetFlags.forEach(flag => {
        setGameState("flags", flag, false)
      });
    }

    // Consume item
    if (interaction.consumeItem) {
      setGameState("inventory", item.id, false)
    }

    // Give items to inventory
    if (interaction.giveItems) {
      interaction.giveItems.forEach(itemId => {
        setGameState("inventory", itemId);
      });
    }

    // Drop items in room
    const currentRoom = rooms[gameState.currentRoom];
    if (interaction.dropItems) {
      if (!currentRoom.items) currentRoom.items = [];
      interaction.dropItems.forEach(itemId => {
        setRoomState("items", itemId);
      });
    }

    // Add objects to room
    if (interaction.addObjects) {
      interaction.addObjects.forEach(objectId => {
        setRoomState("objects", objectId);
      });
    }

    // Remove object from room
    if (interaction.removeObject && currentRoom.objects) {
      setRoomState("objects", target.id, false);
      trackRoomChange(target.id, "object", false);
    }

    // Conditional removal (removeObjectIfAllFlags)
    if (interaction.removeObjectIfAllFlags && interaction.removeObjectIfAllFlags.every(f => gameState.flags.includes(f))) {
      if (currentRoom.objects) {
        setRoomState("objects", target.id, false);
        trackRoomChange(target.id, "object", false);
        if (objects[target.id] && objects[target.id].removeMessage) {
          displayText(objects[target.id].removeMessage);
        }
      }
    }



    // Trigger effects on other objects
    if (interaction.triggerEffects) {
      interaction.triggerEffects.forEach(objectId => {
        const affectedObj = objects[objectId];
        if (affectedObj && affectedObj.triggerEffects) {
          const effect = affectedObj.triggerEffects;

          // Set flags
          if (effect.setFlags) {
            effect.setFlags.forEach(flag => {
              if (!gameState.flags.includes(flag)) {
                setGameState("flags", flag);
              }
            });
          }

          // Drop items
          if (effect.dropItems) {
            if (effect.room) {
              effect.dropItems.forEach(itemId => {
                setRoomState("items", itemId, true, effect.room);
              });
            } else {
              effect.dropItems.forEach(itemId => {
                setRoomState("items", itemId);
              });
            }
          }

          // Remove object from its room
          if (effect.removeOnTrigger) {
            if (effect.room) {
              setRoomState("objects", objectId, false, effect.room);
            } else {
              setRoomState("objects", objectId, false);
            }
          }
        }
      });
    }

    return true;
  }

  // Default: no interaction defined
  displayText(`You can't use the ${item.names[0]} on the ${target.names[0]}.`);
  return false;
}

function handleCombination(items, target) {

  // This has already been checked, so should always work, but we'll double check to be safe
  console.log("DEBUG handleCombination:");
  console.log("  items:", items);
  console.log("  target:", target);
  console.log("  target.type:", target?.type);
  console.log("  target.applyWith:", target?.applyWith);

  // Check if target is a disallowedTake with apply interactions
  if (target.type === 'disallowedTake' && target.apply) {
    // Check if any of the items have a specific error message
    for (const itemId of items) {
      let errorMessage = target.apply[itemId];
      if (errorMessage) {
        if (typeof errorMessage === 'function') {
          errorMessage = errorMessage();
        }
        displayText(errorMessage);
        return false;
      }
    }
    // Fall through to default error if no specific messages
  }

  // Check if target is an object with applyWith interactions
  if (target.type === 'object' && target.applyWith) {
    // Check for progressive combination with multiple items
    if (target.applyWith._progressiveCombination) {
      const config = target.applyWith._progressiveCombination;

      // Filter to only valid items from the progressive combination
      const validItems = items.filter(itemId => config.items.includes(itemId));

      if (validItems.length === 0) {
        // No valid items, fall through to default
        const interaction = target.applyWith._default;
        if (interaction) {
          displayText(interaction.message);
          return true;
        }
        return false;
      }

      // Check which items haven't been used yet
      const unusedItems = validItems.filter(itemId => {
        const flagName = itemId + "Used";
        return !gameState.flags.includes(flagName);
      });

      if (unusedItems.length === 0) {
        displayText("You've already used those key(s).");
        return true;
      }

      // Set flags and consume items
      unusedItems.forEach(itemId => {
        const flagName = itemId + "Used";
        setGameState("flags", flagName);
        setGameState("inventory", itemId, false);
      });

      // Check completion
      const allUsed = config.items.every(itemId =>
        gameState.flags.includes(itemId + "Used")
      );

      // Display message
      if (allUsed) {
        displayText(config.completeMessage);
        if (config.completionFlag) {
          setGameState("flags", config.completionFlag);
        }
        if (config.removeOnComplete) {
          setRoomState("objects", target.id, false);
        }
      } else {
        const remaining = config.items.filter(itemId =>
          !gameState.flags.includes(itemId + "Used")
        ).length;

        if (unusedItems.length === 1) {
          let message = config.singleMessage || "You insert a key. It clicks into place.";
          if (config.incompleteSuffix) {
            message += config.incompleteSuffix.replace("{remaining}", remaining);
          }
          displayText(message);
        } else {
          let message = config.multiMessage || `You insert ${unusedItems.length} keys. They click into place.`;
          message = message.replace("{count}", unusedItems.length);
          if (config.incompleteSuffix) {
            message += config.incompleteSuffix.replace("{remaining}", remaining);
          }
          displayText(message);
        }
      }

      return true;
    }
  }

  // Check if target is an object with applyWith interactions
  if (target.type === 'object' && target.applyWith._combinations) {

    let interaction

    // We need to find the correct interaction
    for (const combo of target.applyWith._combinations) {
      if (arraysMatchUnordered(items, combo.items)) {
        interaction = combo
      }
    }

    if (!interaction) {
      interaction = target.applyWith._default;
    }

    // Check requirements
    if (interaction.requireFlags && !interaction.requireFlags.every(f => gameState.flags.includes(f))) {
      displayText(interaction.failMessage || `You can't use that yet.`);
      return false;
    }

    if (interaction.requireNotFlags && interaction.requireNotFlags.some(f => gameState.flags.includes(f))) {
      displayText(interaction.failMessage || `You've already done that.`);
      return false;
    }

    // Execute the interaction
    const message = typeof interaction.message === 'function'
      ? interaction.message(items)
      : interaction.message;
    displayText(message);


    // Set flags
    if (interaction.setFlags) {
      interaction.setFlags.forEach(flag => {
        if (!gameState.flags.includes(flag)) {
          setGameState("flags", flag);
        }
      });
    }

    // Unset flags
    if (interaction.unsetFlags) {
      interaction.unsetFlags.forEach(flag => {
        setGameState("flags", flag, false)
      });
    }

    // Consume items
    if (interaction.consumeItems) {
      interaction.consumeItems.forEach(item => {
        setGameState("inventory", item, false);
      })
    }

    // Give items to inventory
    if (interaction.giveItems) {
      interaction.giveItems.forEach(itemId => {
        setGameState("inventory", itemId);
      });
    }

    // Drop items in room
    const currentRoom = rooms[gameState.currentRoom];
    if (interaction.dropItems) {
      if (!currentRoom.items) currentRoom.items = [];
      interaction.dropItems.forEach(itemId => {
        setRoomState("items", itemId);
      });
    }

    // Add objects to room
    if (interaction.addObjects) {
      interaction.addObjects.forEach(objectId => {
        setRoomState("objects", objectId);
      });
    }

    // Remove object from room
    if (interaction.removeObject && currentRoom.objects) {
      setRoomState("objects", target.id, false);
      trackRoomChange(target.id, "object", false);
    }

    if (target.removeMessage) {
      displayText(target.removeMessage);
    }

    // Trigger effects on other objects
    if (interaction.triggerEffects) {
      interaction.triggerEffects.forEach(objectId => {
        const affectedObj = objects[objectId];
        if (affectedObj && affectedObj.triggerEffects) {
          const effect = affectedObj.triggerEffects;

          // Set flags
          if (effect.setFlags) {
            effect.setFlags.forEach(flag => {
              if (!gameState.flags.includes(flag)) {
                setGameState("flags", flag);
              }
            });
          }

          // Drop items
          if (effect.dropItems) {
            if (effect.room) {
              effect.dropItems.forEach(itemId => {
                setRoomState("items", itemId, true, effect.room);
              });
            } else {
              effect.dropItems.forEach(itemId => {
                setRoomState("items", itemId);
              });
            }
          }

          // Remove object from its room
          if (effect.removeOnTrigger) {
            if (effect.room) {
              setRoomState("objects", objectId, false, effect.room);
            } else {
              setRoomState("objects", objectId, false);
            }
          }
        }
      });
    }

    return true;
  }

  // Default: no interaction defined
  displayText(`You can't use the ${item.names[0]} on the ${target.names[0]}.`);
  return false;
}
