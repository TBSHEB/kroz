// ===== INFORMATION/DISPLAY COMMANDS =====

function help() {
  displayText("=== KROZ ===\n" +
    "Goal: Escape the underground maze, find your way to the forest\n\n" +
    "MOVEMENT:\n" +
    "  north (n), south (s), east (e), west (w)\n" +
    "  northeast (ne), northwest (nw), southeast (se), southwest (sw)\n" +
    "  up (u), down (d)\n\n" +
    "ACTIONS:\n" +
    "  look (l) - Examine your surroundings\n" +
    "  inventory (i, inv) - Check what you're carrying\n" +
    "  take <item> - Pick up an item\n" +
    "  drop <item> - Drop an item from inventory\n" +
    "  use <object> - Interact with objects in the room\n" +
    "  examine <item> - Look closely at something\n\n" +
    "OTHER:\n" +
    "  help (h, ?) - Display this message")
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
  displayRoomTitle(rooms[gameState.currentRoom].name);

  let look = "";
  const room = rooms[gameState.currentRoom];

  if (typeof room.look === "object") {
    if (room.look.base) {
      look += room.look.base + "\n";

    }
    for (const part of room.look.parts) {
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
  } else if (typeof room.look === "string") {
    look = room.look;
  } else if (typeof room.look === "function") {
    look = room.look();
  } else {
    look = "This room has an error...";
  }

  look += "\n";

  // Add object descriptions
  if (room.objects && room.objects.length > 0) {
    for (const objectId of room.objects) {
      const obj = objects[objectId];
      if (obj && obj.description) {
        look += obj.description + "\n";
      }
    }
  }

  if (room.passages) {
    const directions = Object.keys(room.passages);

    if (directions.length === 1) {
      const dir = directions[0];
      if (dir === "up" || dir === "down") {
        look += `There is a passage ${dir}.`;
      } else {
        look += `There is a passage to the ${dir}.`;
      }
    } else if (directions.length > 1) {
      const firstDir = directions[0];

      // Start the sentence based on first direction
      if (firstDir === "up" || firstDir === "down") {
        look += "There are passages ";
      } else {
        look += "There are passages to the ";
      }

      // Build passage list
      for (let i = 0; i < directions.length; i++) {
        const dir = directions[i];
        const isLast = (i === directions.length - 1);

        if (isLast) {
          // Last item: "and [direction]."
          if (dir === "up" || dir === "down") {
            look += `and ${dir}.`;
          } else {
            look += `and to the ${dir}.`;
          }
        } else {
          // Middle items
          if (dir === "up" || dir === "down") {
            look += `${dir}, `;
          } else {
            look += `to the ${dir}, `;
          }
        }
      }
    }
  }

  if (room.restrictedPassages) {
    const directions = Object.keys(room.restrictedPassages);
    for (const direction of directions) {
      const passage = room.restrictedPassages[direction];

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
              roomItemMet = allowedItems.some(item => room.items?.includes(item));
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
  if (room.items && room.items.length > 0) {
    let itemTexts = [];

    for (const itemId of room.items) {
      // Skip items that this room wants to handle manually
      if (room.hideItemDescriptions && room.hideItemDescriptions.includes(itemId)) {
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

function isInCombat () {
  return Object.keys(gameState.combatState).length > 0;
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
    if (saveGame(gameState, "quicksave")) {
      displayText("Game saved.");
    } else {
      displayText("Failed to save game.");
    }
  }
}

function load(name) {
  const saveName = name && name.length > 0 ? name.join(" ") : null;

  const loadedState = loadGame(saveName);

  if (!loadedState) {
    displayText(`No save found with name "${saveName}".`);
    return;
  }

  gameState.currentRoom = loadedState.currentRoom;
  gameState.previousRoom = loadedState.previousRoom;
  gameState.inventory = loadedState.inventory;
  gameState.flags = loadedState.flags;
  gameState.visitedRooms = loadedState.visitedRooms;
  gameState.combatState = loadedState.combatState;
  gameState.healthState = loadedState.healthState;
  gameState.roomItemChanges = loadedState.roomItemChanges;
  gameState.lastCheckpoint = loadedState.lastCheckpoint;

  gameState.partCommand = "";
  gameState.pendingAlias = "";
  gameState.partApplyItems = [];
  gameState.partAttackTarget = [];
  gameState.partCraftItems = [];

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
  gameState.roomItemChanges = {}
  gameState.lastCheckpoint = "start"


  applyRoomItemChanges(gameState.roomItemChanges);

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
