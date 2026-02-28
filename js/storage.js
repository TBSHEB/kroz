// localStorage handling for save/load functionality

const SAVE_PREFIX = "kroz-save-";
const AUTO_SAVE_KEY = "kroz-save-auto";
const SAVE_LIST_KEY = "kroz-save-list";

// Save game state to localStorage
function saveGame(gameState, saveName = null) {
  try {
    const saveData = {
      currentRoom: gameState.currentRoom,
      previousRoom: gameState.previousRoom,
      inventory: gameState.inventory,
      flags: gameState.flags,
      visitedRooms: gameState.visitedRooms,
      combatState: gameState.combatState,
      healthState: gameState.healthState,
      poison: gameState.poison,
      itemCountdowns: gameState.itemCountdowns,
      hazardState: gameState.hazardState,
      roomChanges: gameState.roomChanges,
      sequences: gameState.sequences,
      commandCount: gameState.commandCount,
      lastCheckpoint: gameState.lastCheckpoint,
      timestamp: new Date().toISOString()
    };

    const saveKey = saveName ? SAVE_PREFIX + saveName : AUTO_SAVE_KEY;

    localStorage.setItem(saveKey, JSON.stringify(saveData));

    if (saveName) {
      addToSaveList(saveName);
    }
    return true;
  } catch (error) {
    console.error("Failed to save game:", error);
    return false;
  }
}

// Load game state from localStorage
function loadGame(saveName = null) {
  try {
    const saveData = localStorage.getItem(saveName ? SAVE_PREFIX + saveName : AUTO_SAVE_KEY);

    if (!saveData) {
      return null; // No save exists
    }

    const loadedState = JSON.parse(saveData);

    if (!loadedState.currentRoom || !loadedState.inventory) {
      console.error("Invalid save data structure");
      return null;
    }

    reverseRoomChanges(gameState.roomChanges);
    if (loadedState.roomChanges) {
      applyRoomChanges(loadedState.roomChanges);
    }

    return loadedState;
  } catch (error) {
    console.error("Failed to load game:", error);
    return null;
  }
}

function reverseRoomChanges(roomChanges) {
  for (const roomId in roomChanges) {
    const itemChanges = roomChanges[roomId].items || { added: [], removed: [] };
    const objectChanges = roomChanges[roomId].objects || { added: [], removed: [] };
    const room = rooms[roomId];

    if (!room) continue;

    if (!room.items) room.items = [];
    if (!room.objects) room.objects = [];

    for (const itemId of itemChanges.added) {
      const index = room.items.indexOf(itemId);
      if (index > -1) {
        room.items.splice(index, 1);
      }
    }

    for (const itemId of itemChanges.removed) {
      if (!room.items.includes(itemId)) {
        room.items.push(itemId);
      }
    }

    for (const objectId of objectChanges.added) {
      const index = room.objects.indexOf(objectId);
      if (index > -1) {
        room.objects.splice(index, 1);
      }
    }

    for (const objectId of objectChanges.removed) {
      if (!room.objects.includes(objectId)) {
        room.objects.push(objectId);
      }
    }
  }
}

function applyRoomChanges(roomChanges) {
  for (const roomId in roomChanges) {
    const itemChanges = roomChanges[roomId].items || { added: [], removed: [] };
    const objectChanges = roomChanges[roomId].objects || { added: [], removed: [] };
    const room = rooms[roomId];

    if (!room) continue;

    if (!room.items) room.items = [];
    if (!room.objects) room.objects = [];

    for (const itemId of itemChanges.removed) {
      const index = room.items.indexOf(itemId);
      if (index > -1) {
        room.items.splice(index, 1);
      }
    }

    for (const itemId of itemChanges.added) {
      if (!room.items.includes(itemId)) {
        room.items.push(itemId);
      }
    }

    for (const objectId of objectChanges.removed) {
      const index = room.objects.indexOf(objectId);
      if (index > -1) {
        room.objects.splice(index, 1);
      }
    }

    for (const objectId of objectChanges.added) {
      if (!room.objects.includes(objectId)) {
        room.objects.push(objectId);
      }
    }
  }
}

// Check if a saved game exists
function hasSavedGame(saveName = null) {
  const saveKey = saveName ? SAVE_PREFIX + saveName : AUTO_SAVE_KEY;
  return localStorage.getItem(saveKey) !== null;
}

// Delete saved game
function deleteSave(saveName = null) {
  try {
    const saveKey = saveName ? SAVE_PREFIX + saveName : AUTO_SAVE_KEY;
    localStorage.removeItem(saveKey);

    if (saveName) {
      deleteSaveFromList(saveName);
    }
    return true;
  } catch (error) {
    console.error("Failed to delete save:", error);
    return false;
  }
}

function deleteAllSaves() {
  try {
    const saveList = getSaveList();
    for (const saveName of saveList) {
      localStorage.removeItem(SAVE_PREFIX + saveName);
    }

    localStorage.removeItem(AUTO_SAVE_KEY);
    localStorage.removeItem(SAVE_LIST_KEY);

    return true;
  } catch (error) {
    console.error("Failed to delete all saves:", error);
    return false;
  }
}

function addToSaveList(saveName) {
  try {
    const saveListData = localStorage.getItem(SAVE_LIST_KEY);
    const saveList = saveListData ? JSON.parse(saveListData) : [];

    if (!saveList.includes(saveName)) {
      saveList.push(saveName);
      localStorage.setItem(SAVE_LIST_KEY, JSON.stringify(saveList));
    }
  } catch (error) {
    console.error("Failed to update save list:", error);
  }
}

function getSaveList() {
  try {
    const saveListData = localStorage.getItem(SAVE_LIST_KEY);
    return saveListData ? JSON.parse(saveListData) : [];
  } catch (error) {
    console.error("Failed to get save list:", error);
    return [];
  }
}

function deleteSaveFromList(saveName) {
  try {
    const saveList = getSaveList();
    const index = saveList.indexOf(saveName);
    if (index > -1) {
      saveList.splice(index, 1);
      localStorage.setItem(SAVE_LIST_KEY, JSON.stringify(saveList));
    }
  } catch (error) {
    console.error("Failed to delete from save list:", error);
  }
}
