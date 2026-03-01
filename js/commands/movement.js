// ===== MOVEMENT COMMANDS =====

// Handle room transition: entry messages, onExit flags, first-visit vs revisit
function performRoomTransition(direction, targetRoom) {
  const currentRoom = rooms[gameState.currentRoom];

  if (currentRoom.entryMessages && currentRoom.entryMessages[direction]) {
    displayText(resolveConditionalText(currentRoom.entryMessages[direction]));
  }

  if (currentRoom.onExit) {
    const exitData = currentRoom.onExit[direction] || currentRoom.onExit;
    if (exitData.setFlags) {
      for (const flag of exitData.setFlags) {
        if (!gameState.flags.includes(flag)) {
          gameState.flags.push(flag);
        }
      }
    }
  }

  gameState.previousRoom = gameState.currentRoom;
  gameState.currentRoom = targetRoom;

  if (!gameState.visitedRooms.includes(gameState.currentRoom)) {
    gameState.visitedRooms.push(gameState.currentRoom);
    initializeCombat();
    look();
    if (rooms[gameState.currentRoom].isCheckpoint) {
      gameState.lastCheckpoint = gameState.currentRoom;
      saveGame(gameState, "internal checkpoint");
    }
  } else {
    const newRoom = rooms[gameState.currentRoom];
    if (isDark()) {
      displayRoomTitle("A dark room");
      displayText("It's too dark to see!");
    } else {
      displayRoomTitle(resolveConditionalText(newRoom.name));
    }
  }
}

function move(direction) {
  const currentRoom = rooms[gameState.currentRoom];

  if (direction !== "back") {
    if (currentRoom.mirrorDirections) {
      direction = flipDirection(direction);
    }

    if (currentRoom.passages && currentRoom.passages[direction]) {
      performRoomTransition(direction, currentRoom.passages[direction]);
      return;
    }

    if (currentRoom.restrictedPassages && currentRoom.restrictedPassages[direction]) {
      const restrictedPassage = currentRoom.restrictedPassages[direction];

      if (restrictedPassage.requirements) {
        const result = checkPassageRequirements(restrictedPassage.requirements, currentRoom);
        if (!result.met) {
          displayText(result.firstUnmet.failMessage);
          return;
        }
      }

      // All requirements met
      performRoomTransition(direction, restrictedPassage.room);
      return;
    }

    if (currentRoom.fail) {
      displayText(currentRoom.fail);
    } else {
      if (direction === "up") {
        displayText("There's nothing above me.");
      } else if (direction === "down") {
        displayText("There's solid ground beneath me.");
      } else {
        displayText("There's a wall there.");
      }
    }
  } else {
    if (currentRoom.backOff === true) {
      if (currentRoom.backOffText) {
        displayText(currentRoom.backOffText);
      } else {
        displayText("I can't go back.");
      }
    } else if (!gameState.previousRoom) {
      // TODO: flavour text for first room (previousRoom === "") vs teleport (previousRoom === null)
      displayText("That's going to be a little tricky.");
    } else {
      let foundDirection = false;

      // Check normal passages first
      if (currentRoom.passages) {
        const directions = Object.keys(currentRoom.passages);

        for (const direction of directions) {
          if (currentRoom.passages[direction] === gameState.previousRoom) {
            if (currentRoom.mirrorDirections) {
              move(direction);
            } else {
              performRoomTransition(direction, currentRoom.passages[direction]);
            }
            return;
          }
        }
      }

      // If not found, check restricted passages
      if (!foundDirection && currentRoom.restrictedPassages) {
        const directions = Object.keys(currentRoom.restrictedPassages);

        for (const direction of directions) {
          if (currentRoom.restrictedPassages[direction].room === gameState.previousRoom) {
            if (currentRoom.mirrorDirections) {
              move(direction);
              return;
            }
            if (currentRoom.restrictedPassages[direction].requirements) {
              const result = checkPassageRequirements(currentRoom.restrictedPassages[direction].requirements, currentRoom);
              if (!result.met) {
                displayText(result.firstUnmet.backFailMessage || "You can't go back that way.");
                return;
              }
            }

            // All requirements met
            performRoomTransition(direction, currentRoom.restrictedPassages[direction].room);
            return;
          }
        }
      }

      // No matching direction found
      if (!foundDirection) {
        if (currentRoom.failedBackText) {
          displayText(currentRoom.failedBackText);
        } else {
          displayText("Going back in this room isn't allowed.");
        }
      }
    }
  }
}

function teleportSingle(alias) {
  if (alias === "tp") alias = "teleport";
  gameState.partCommand = "teleport";
  displayText(`${alias[0].toUpperCase() + alias.slice(1)} where?`);
}

function performTeleport(targetRoom) {
  if (!gameState.flags.includes("teleportEnabled")) {
    displayText("As much as I'd like to just teleport out of here, I can't do that...");
    return;
  }

  if (!rooms[targetRoom] || !gameState.visitedRooms.includes(targetRoom)) {
    const matches = gameState.visitedRooms.filter(room => room.includes(targetRoom));
    if (matches.length === 1) {
      targetRoom = matches[0];
    } else if (matches.length > 1) {
      displayText("I'm not sure exactly where you want me to go.");
      return;
    } else {
      displayText("I don't know where that is.");
      return;
    }
  }

  if (gameState.currentRoom === targetRoom) {
    displayText("You teleport into the... oh wait, I'm already here.");
    return;
  }

  performRoomTransition(null, targetRoom);
  gameState.previousRoom = null;
}
