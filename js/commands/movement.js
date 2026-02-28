// ===== MOVEMENT COMMANDS =====

// Handle room transition: entry messages, onExit flags, first-visit vs revisit
function performRoomTransition(direction, targetRoom) {
  const currentRoom = rooms[gameState.currentRoom];

  if (currentRoom.entryMessages && currentRoom.entryMessages[direction]) {
    displayText(resolveConditionalText(currentRoom.entryMessages[direction]));
  }

  if (currentRoom.onExit && gameState.visitedRooms.includes(gameState.currentRoom)) {
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
    if (!newRoom.light && !gameState.flags.includes("lanternLit")) {
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

      // Check requirements in order, show fail message for first unmet requirement
      if (restrictedPassage.requirements) {
        for (const requirement of restrictedPassage.requirements) {
          if (requirement.flag && !gameState.flags.includes(requirement.flag)) {
            displayText(requirement.failMessage);
            return;
          }
          if (requirement.item && !gameState.inventory.includes(requirement.item)) {
            displayText(requirement.failMessage);
            return;
          }
          if (requirement.roomItems) {
            let foundLadder = false;
            for (const ladder of requirement.roomItems) {
              if (currentRoom.items && currentRoom.items.includes(ladder)) {
                foundLadder = true;
              }
            }
            if (foundLadder === false) {
              displayText(requirement.failMessage);
              return;
            }
          }
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
    } else {
      let foundDirection = false;

      // Check normal passages first
      if (currentRoom.passages) {
        const directions = Object.keys(currentRoom.passages);

        for (let direction of directions) {

          if (currentRoom.mirrorDirections) {
            direction = flipDirection(direction);
          }

          if (currentRoom.passages[direction] === gameState.previousRoom) {
            performRoomTransition(direction, currentRoom.passages[direction]);
            return;
          }
        }
      }

      // If not found, check restricted passages
      if (!foundDirection && currentRoom.restrictedPassages) {
        const directions = Object.keys(currentRoom.restrictedPassages);

        for (let direction of directions) {

          if (currentRoom.mirrorDirections) {
            direction = flipDirection(direction);
          }

          if (currentRoom.restrictedPassages[direction].room === gameState.previousRoom) {
            // Check if requirements are met
            if (currentRoom.restrictedPassages[direction].requirements) {
              for (const requirement of currentRoom.restrictedPassages[direction].requirements) {
                if (requirement.flag && !gameState.flags.includes(requirement.flag)) {
                  if (requirement.backFailMessage) {
                    displayText(requirement.backFailMessage);
                  } else {
                    displayText("You can't go back that way.");
                  }
                  return;
                }
                if (requirement.item && !gameState.inventory.includes(requirement.item)) {
                  if (requirement.backFailMessage) {
                    displayText(requirement.backFailMessage);
                  } else {
                    displayText("You can't go back that way.");
                  }
                  return;
                }
                if (requirement.roomItems) {
                  let foundLadder = false;
                  for (const ladder of requirement.roomItems) {
                    if (currentRoom.items && currentRoom.items.includes(ladder)) {
                      foundLadder = true;
                    }
                  }
                  if (foundLadder === false) {
                    if (requirement.backFailMessage) {
                      displayText(requirement.backFailMessage);
                    } else {
                      displayText("You can't go back that way.");
                    }
                    return;
                  }
                }
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
