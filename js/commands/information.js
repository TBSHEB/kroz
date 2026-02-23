// ===== INFORMATION/DISPLAY COMMANDS =====

function help() {
  // Progressive goal logic
  let goal;

  // Count green keys found
  const greenKeysFound = [
    "greenKey1Taken", "greenKey2Taken", "greenKey3Taken", "greenKey4Taken",
    "greenKey5Taken", "greenKey6Taken", "greenKey7Taken", "greenKey8Taken"
  ].filter(flag => gameState.flags.includes(flag)).length;

  // Determine current goal based on progression
  if (!gameState.visitedRooms.includes("five")) {
    goal = "Escape the dungeon";
  } else if (!gameState.visitedRooms.includes("drop")) {
    goal = "Explore the underground";
  } else if (!gameState.flags.includes("parachuteTaken") && !gameState.inventory.includes("parachute")) {
    goal = "Find a way to safely descend the hole";
  } else if (greenKeysFound === 0) {
    goal = "Explore the underground";
  } else if (!gameState.visitedRooms.includes("door")) {
    goal = "Find the keys";
  } else if (greenKeysFound < 8) {
    goal = `Find all eight glowing green keys (${greenKeysFound}/8)`;
  } else {
    goal = "Escape";
  }

  displayText("=== KROZ ===\n" +
    `Current Goal: ${goal}\n\n` +
    "MOVEMENT:\n" +
    "  north (n), south (s), east (e), west (w)\n" +
    "  northeast (ne), southeast (se), southwest (sw), northwest (nw)\n" +
    "  up (u), down (d)\n" +
    "  back (b) - Takes you in the direction of the previous room\n\n" +
    "COMMANDS:\n" +
    "  look (l) - See the room and available exits\n" +
    "  examine <thing> (x) - Take a more detailed look at something\n" +
    "  inventory (i) (inv) - Display the inventory\n\n" +
    "  take <item> - Pick up an item\n" +
    "  take all - Pick up everything in the room\n" +
    "  drop <item> - Drop an item\n\n" +
    "  use <item> - Use, operate, equip, or activate an item\n" +
    "  use <item> on <target> - Use an item on something\n" +
    "  attack <enemy> with <weapon> - Engage in combat\n" +
    "  craft <item> and <item> - Combine items to create something\n\n" +
    "GAME:\n" +
    "  save - Save your progress\n" +
    "  save <name> - Save to a specific slot\n" +
    "  load - Load your last save\n" +
    "  load <name> - Load a specific save\n" +
    "  reset - Restart from the beginning\n" +
    "  help (h) (?) - Display this message\n\n" +
    "These are all required commands, but there are more commands. Try things out!")
}

function inventory() {
  if (gameState.inventory.length === 0) {
    displayText("I don't have anything.");
  } else {
    const counts = {};

    for (const item of gameState.inventory) {
      const itemName = items[item].names[0];
      counts[itemName] = (counts[itemName] || 0) + 1;
    }

    const itemList = [];
    for (const [item, count] of Object.entries(counts)) {
      if (count === 1) {
        itemList.push(item);
      } else {
        itemList.push(item + ` x ${count}`);
      }
    }

    displayText(`I've got:\n${itemList.join(", ")}`);
  }
}

function look() {
  const currentRoom = rooms[gameState.currentRoom];

  if (!currentRoom.light && !gameState.flags.includes("lanternLit")) {
    displayRoomTitle("A dark room");
    displayText("It's too dark to see!");
    return;
  }
  const roomName = typeof currentRoom.name === "function" ? currentRoom.name() : currentRoom.name;
  displayRoomTitle(roomName);

  let look = "";

  if (typeof currentRoom.look === "object") {
    if (currentRoom.look.base) {
      look += currentRoom.look.base + "\n";

    }
    for (const part of currentRoom.look.parts) {
      if (part.if) {
        if (gameState.flags.includes(part.if)) {
          if (look) look += " ";
          look += part.text;
        }
      } else if (part.unless) {
        if (!gameState.flags.includes(part.unless)) {
          if (look) look += " ";
          look += part.text;
        }
      } else {
        look = "This room has an error...";
      }
    }
  } else if (typeof currentRoom.look === "string") {
    look = currentRoom.look;
  } else if (typeof currentRoom.look === "function") {
    look = currentRoom.look();
  } else {
    look = "This room has an error...";
  }

  look += "\n";

  // Add object descriptions
  if (currentRoom.objects && currentRoom.objects.length > 0) {
    for (const objectId of currentRoom.objects) {
      const obj = objects[objectId];
      if (obj && obj.description) {
        look += obj.description + "\n";
      }
    }
  }

  // Collect all visible passages (normal + restricted with showAsNormal)
  let allDirections = [];

  if (currentRoom.passages) {
    allDirections = Object.keys(currentRoom.passages);
  }

  // Add restricted passages marked as showAsNormal
  if (currentRoom.restrictedPassages) {
    for (const direction of Object.keys(currentRoom.restrictedPassages)) {
      if (currentRoom.restrictedPassages[direction].showAsNormal === true) {
        allDirections.push(direction);
      }
    }
  }

  if (allDirections.length > 0) {
    if (allDirections.length === 1) {
      const dir = allDirections[0];
      if (dir === "up" || dir === "down") {
        look += `There is a passage ${dir}.`;
      } else {
        look += `There is a passage to the ${dir}.`;
      }
    } else if (allDirections.length > 1) {
      const firstDir = allDirections[0];

      // Start the sentence based on first direction
      if (firstDir === "up" || firstDir === "down") {
        look += "There are passages ";
      } else {
        look += "There are passages to the ";
      }

      // Build passage list
      for (let i = 0; i < allDirections.length; i++) {
        const dir = allDirections[i];
        const isLast = (i === allDirections.length - 1);

        if (isLast) {
          // Last item: "and [direction]."
          if (dir === "up" || dir === "down") {
            look += `and ${dir}.`;
          } else {
            look += `and to the ${dir}.`;
          }
        } else {
          // Middle items
          if (i === 0) {
            // First item - "to the" already in sentence starter (line 129)
            look += `${dir}, `;
          } else if (dir === "up" || dir === "down") {
            look += `${dir}, `;
          } else {
            look += `to the ${dir}, `;
          }
        }
      }
    }
  }

  if (currentRoom.restrictedPassages) {
    const directions = Object.keys(currentRoom.restrictedPassages);
    for (const direction of directions) {
      const passage = currentRoom.restrictedPassages[direction];

      // Skip passages shown as normal (already included in passage list above)
      if (passage.showAsNormal === true) {
        continue;
      }

      if (passage.hidden !== true) {
        let allRequirementsMet = true;
        let firstUnmetRequirement = null;

        // Check all requirements
        if (passage.requirements) {
          for (const requirement of passage.requirements) {
            const flagMet = !requirement.flag || gameState.flags.includes(requirement.flag);
            const itemMet = !requirement.item || gameState.inventory.includes(requirement.item);

            // Check roomItem requirement
            let roomItemMet = true;
            if (requirement.roomItems) {
              const allowedItems = Array.isArray(requirement.roomItems)
                ? requirement.roomItems
                : [requirement.roomItems];
              roomItemMet = allowedItems.some(item => currentRoom.items?.includes(item));
            }

            if (!flagMet || !itemMet || !roomItemMet) {
              allRequirementsMet = false;
              if (!firstUnmetRequirement) {
                firstUnmetRequirement = requirement;
              }
            }
          }
        }

        // Show appropriate description
        if (allRequirementsMet && passage.metDescription) {
          look += `\n${passage.metDescription}`;
        } else if (!allRequirementsMet && firstUnmetRequirement?.unmetDescription) {
          look += `\n${firstUnmetRequirement.unmetDescription}`;
        }
      }
    }
  }

  // Add item descriptions
  if (currentRoom.items && currentRoom.items.length > 0) {
    let itemTexts = [];

    for (const itemId of currentRoom.items) {
      // Skip items that this room wants to handle manually
      if (currentRoom.hideItemDescriptions && currentRoom.hideItemDescriptions.includes(itemId)) {
        continue;
      }

      // Skip nails in sand room if not taken yet
      if (gameState.currentRoom === "sand" && itemId === "nails" && !gameState.flags.includes("nailsTaken")) {
        continue;
      }

      const item = items[itemId];
      if (item) {
        let desc = "";

        // Check if item has been taken by looking at its setFlag
        const itemTaken = item.setFlag && gameState.flags.includes(item.setFlag);

        // Use initialDescription if item hasn't been taken and it exists
        if (!itemTaken && item.initialDescription) {
          desc = item.initialDescription;
        } else if (item.description) {
          desc = item.description;
        }

        if (desc) {
          itemTexts.push(desc);
        }
      }
    }

    if (itemTexts.length > 0) {
      look += "\n" + itemTexts.join(" ");
    }
  }

  displayText("\n" + look)
}

function isInCombat() {
  const currentRoom = rooms[gameState.currentRoom];
  if (!currentRoom?.objects) return false;

  return currentRoom.objects.some(objectId => {
    const object = objects[objectId];
    if (!object?.combat) return false;
    const combat = gameState.combatState[objectId];
    return combat && combat.isEngaged && !combat.isDead;
  });
}

function save(name) {
  if (isInCombat()) {
    displayText("I can't save while in combat.");
    return;
  }

  const saveName = name && name.length > 0 ? name.join(" ") : null;

  if (saveName) {
    if (saveGame(gameState, saveName)) {
      displayText(`Game saved as "${saveName}".`);
    } else {
      displayText("Failed to save game.");
    }
  } else {
    if (saveGame(gameState, "quick")) {
      displayText("Game saved.");
    } else {
      displayText("Failed to save game.");
    }
  }
}

function load(name) {
  const saveName = name && name.length > 0 ? name.join(" ") : null;

  let loadedState;

  if (saveName !== null) {
    loadedState = loadGame(saveName);
  } else {
    loadedState = loadGame("quick");
  }

  if (!loadedState) {
    displayText(saveName ? `No save found with name "${saveName}".` : "No save found.");
    return;
  }

  resetGameState(loadedState);

  displayText(`Loaded save${saveName ? " \"" + saveName + "\"" : ""}.`);
  look();
}

function reset() {

  gameState.currentRoom = "start"
  gameState.previousRoom = ""
  gameState.inventory = []
  gameState.flags = []
  gameState.visitedRooms = []
  gameState.partCommand = ""
  gameState.pendingAlias = ""
  gameState.partApplyItems = []
  gameState.partAttackTarget = []
  gameState.partCraftItems = []
  gameState.combatState = {}
  gameState.healthState = 4
  gameState.roomChanges = {}
  gameState.lastCheckpoint = "start"


  deleteSave();

  location.reload();
}

function fullReset() {
  if (!confirm("This will delete all of your saves and reset the game. This cannot be undone. Are you sure you want to do this?")) {
    return;
  }

  deleteAllSaves();

  location.reload();
}
