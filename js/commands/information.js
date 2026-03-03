// ===== INFORMATION/DISPLAY COMMANDS =====

function help() {
  // Progressive goal logic
  let goal;

  // Count green keys found
  const greenKeysFound = [
    "greenKey1Taken",
    "greenKey2Taken",
    "greenKey3Taken",
    "greenKey4Taken",
    "greenKey5Taken",
    "greenKey6Taken",
    "greenKey7Taken",
    "greenKey8Taken"
  ].filter((flag) => gameState.flags.includes(flag)).length;

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

  displayText(
    "=== KROZ ===\n" +
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
      "  saves - List your saved games\n" +
      "  delete <name> - Delete a saved game\n" +
      "  reset - Restart from the beginning\n" +
      "  help (h) (?) - Display this message\n\n" +
      "These are all required commands, but there are more commands. Try things out!"
  );
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

  if (isDark()) {
    displayRoomTitle("A dark room");
    displayText("It's too dark to see!");
    return;
  }
  displayRoomTitle(resolveConditionalText(currentRoom.name));

  let look = resolveConditionalText(currentRoom.look);

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
      const passage = currentRoom.restrictedPassages[direction];
      const removed = passage.removeRequirements?.every((f) => gameState.flags.includes(f));
      if (passage.showAsNormal === true || removed) {
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
        const isLast = i === allDirections.length - 1;

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
      const removed = passage.removeRequirements?.every((f) => gameState.flags.includes(f));
      if (passage.showAsNormal === true || removed) {
        continue;
      }

      if (passage.hidden !== true) {
        const result = passage.requirements
          ? checkPassageRequirements(passage.requirements, currentRoom)
          : { met: true, firstUnmet: null };

        if (result.met && passage.metDescription) {
          look += `\n${passage.metDescription}`;
        } else if (!result.met && result.firstUnmet?.unmetDescription) {
          look += `\n${result.firstUnmet.unmetDescription}`;
        }
      }
    }
  }

  // Add item descriptions
  if (currentRoom.items && currentRoom.items.length > 0) {
    let itemTexts = [];

    for (const itemId of currentRoom.items) {
      const item = items[itemId];
      if (item) {
        let desc = "";

        // Check if item has been taken by looking at its setFlag
        const itemTaken = item.setFlag && gameState.flags.includes(item.setFlag);
        const hideInitial = currentRoom.hideItemDescriptions && currentRoom.hideItemDescriptions.includes(itemId);

        // Use initialDescription if item hasn't been taken and it exists
        if (!itemTaken && item.initialDescription) {
          if (!hideInitial) {
            desc = item.initialDescription;
          }
        } else if (item.description) {
          if (itemTaken || !hideInitial) {
            desc = item.description;
          }
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

  displayText("\n" + look);
}

function isInCombat() {
  const currentRoom = rooms[gameState.currentRoom];
  if (!currentRoom?.objects) return false;

  return currentRoom.objects.some((objectId) => {
    const object = objects[objectId];
    if (!object?.combat) return false;
    const combat = gameState.combatState[objectId];
    return combat && combat.isEngaged && !combat.isDead;
  });
}

function saves(words) {
  const saveList = getSaveList();

  if (saveList.length === 0) {
    displayText('No saved games found.');
    return;
  }

  if (words.length > 0) {
    const query = words.join(' ');
    const filtered = saveList.filter((name) => name.toLowerCase().includes(query.toLowerCase()));

    if (filtered.length === 0) {
      displayText(`No saves found matching "${query}".`);
      return;
    }

    displayText('Saved games:\n' + filtered.join('\n'));
    return;
  }

  displayText('Saved games:\n' + saveList.join('\n'));
}

function deleteSaveCommand(words) {
  if (words.length === 0) {
    displayText('Which save would you like to delete?');
    return;
  }

  const saveName = words.join(' ');
  const saveList = getSaveList();

  if (!saveList.includes(saveName)) {
    displayText(`No save found with name "${saveName}".`);
    return;
  }

  if (deleteSave(saveName)) {
    displayText(`Deleted save "${saveName}".`);
  } else {
    displayText('Failed to delete save.');
  }
}

function save(name) {
  if (isInCombat()) {
    displayText("I can't save while in combat.");
    return;
  }

  const saveName = name && name.length > 0 ? name.join(" ") : null;

  if (saveName) {
    const nameError = validateSaveName(saveName);
    if (nameError) {
      displayText(nameError);
      return;
    }
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

  if (saveName !== null) {
    const nameError = validateSaveName(saveName);
    if (nameError) {
      displayText(nameError);
      return;
    }
  }

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

  displayText(`Loaded save${saveName ? ' "' + saveName + '"' : ""}.`);
  look();
}

function reset() {
  gameState.currentRoom = "start";
  gameState.previousRoom = "";
  gameState.inventory = [];
  gameState.flags = [];
  gameState.visitedRooms = [];
  gameState.partCommand = "";
  gameState.pendingAlias = "";
  gameState.partApplyItems = [];
  gameState.partAttackTarget = [];
  gameState.partCraftItems = [];
  gameState.combatState = {};
  gameState.healthState = 4;
  gameState.poison = 0;
  gameState.hazardState = { room: "", count: 0 };
  gameState.itemCountdowns = {};
  gameState.sequences = {};
  gameState.commandCount = 0;
  gameState.lastCheckpoint = "start";
  gameState.cheatCount = 0;
  gameState.cheatText = "";

  reverseRoomChanges(gameState.roomChanges);
  gameState.roomChanges = {};

  deleteSave();

  location.reload();
}

function fullReset() {
  if (
    !confirm(
      "This will delete all of your saves and reset the game. This cannot be undone. Are you sure you want to do this?"
    )
  ) {
    return;
  }

  deleteAllSaves();

  location.reload();
}
