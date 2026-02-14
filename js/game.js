// Game initialization and core functionality

const gameState = {
    currentRoom: "start",
    previousRoom: "",
    inventory: [],
    flags: [],
    visitedRooms: [],
    partCommand: "",
    pendingAlias: "",
    partApplyItems: [],
    partAttackTarget: [],
    partCraftItems: [],
    combatState: {},
    healthState: 4,
    hazardState: {
        room: "",
        count: 0
    },
    poison: 0,
    itemCountdowns: {},
    roomChanges: {},
    lastCheckpoint: "start",
    disambiguationMatches: [],
    disambiguationSearchName: "",
    disambiguationOriginalCommand: ""
}

const damageMessages = {
    lowDamage: [
        "A glancing blow leaves a nasty bruise.",
        "You take a shallow cut to the arm.",
        "The strike catches your shoulder, nothing serious.",
        "A scrape across your ribs, painful but manageable."
    ],
    highDamage: [
        "A deep gash opens across your side.",
        "The blow cracks a rib, driving the air from your lungs.",
        "You feel bone crack under the impact.",
        "Blood flows from a serious wound."
    ]
};

const holdingFlags = {
    map: {
        item: "map",
        flag: "hasMap"
    }
};

// DOM element references
const outputElement = document.getElementById('output');
const inputElement = document.getElementById('input');
const gameStateDisplay = document.getElementById('game-state-display');
const roomStateDisplay = document.getElementById('room-state-display');
const gameDisplay = outputElement.parentElement; // The scrollable container

// Restore game state from save data
function resetGameState(saveData) {
    gameState.currentRoom = saveData.currentRoom;
    gameState.previousRoom = saveData.previousRoom;
    gameState.inventory = saveData.inventory;
    gameState.flags = saveData.flags;
    gameState.visitedRooms = saveData.visitedRooms;
    gameState.combatState = saveData.combatState;
    gameState.healthState = saveData.healthState;
    gameState.poison = saveData.poison || 0;
    gameState.itemCountdowns = saveData.itemCountdowns || {};
    gameState.hazardState = saveData.hazardState || { room: "", count: 0 };
    gameState.roomChanges = saveData.roomChanges;
    gameState.lastCheckpoint = saveData.lastCheckpoint;
}

// Game initialization
function initGame() {
    const autoSave = loadGame();
    if (autoSave) {
        resetGameState(autoSave);
        console.log('Auto-save loaded');
    }

    look();
    updateDebugDisplays();
    console.log('Game initialized');
}

// Handle user input submission
function handleCommand() {
    const rawCommand = inputElement.value;
    const command = rawCommand.trim().toLowerCase();


    if (command) {
        let currentRoom = rooms[gameState.currentRoom];
        const oldRoom = gameState.currentRoom;
        // Display the user's command
        displayCommand(command);

        let words = command.split(" ");
        const mainCommand = words[0];

        words = replaceSplitWordsWithFullName(words);

        // List of use-system aliases
        const useAliases = Object.keys(aliasToAction);

        // If in multi-step mode but user types a recognized command, break out
        if (gameState.partCommand &&
            (simpleCommands[mainCommand] ||
             useAliases.includes(mainCommand) ||
             complicatedCommands[mainCommand] ||
             knownWords[mainCommand])) {
            // User wants to do something else - exit multi-step mode
            clearUseState();
            // Fall through to process as new command
        }

        // Handle disambiguation mode
        if (handleDisambiguation(command, mainCommand)) {
            return;
        }

        if (!gameState.partCommand) {
            if (mainCommand === "save") {
                save(words.slice(1));
                inputElement.value = "";
                saveGame(gameState);
                return;
            }
            if (mainCommand === "load") {
                load(words.slice(1));
                inputElement.value = "";
                saveGame(gameState);
                return;
            }
            // Not in multi-step mode
            if (words.length === 1) {
                if (simpleCommands[mainCommand]) {
                    simpleCommands[mainCommand].command();
                } else if (useAliases.includes(mainCommand)) {
                    // Use command with no args - start multi-step
                    handleUseCommand(mainCommand, null);
                } else if (complicatedCommands[mainCommand]) {
                    complicatedCommands[mainCommand].singleCommand(mainCommand);
                } else if (knownWords[mainCommand]) {
                    displayText(knownWords[mainCommand])
                } else if (rooms[gameState.currentRoom].objects) {
                    for (const objectId of rooms[gameState.currentRoom].objects) {
                        const object = objects[objectId];
                        if (object.answer && object.answer.answer.some(ans => ans.toLowerCase() === mainCommand)) {
                            say(mainCommand);
                            break;
                        }
                    }
                } else {
                    displayText("I don't know that word.");
                }
            } else if (simpleCommands[mainCommand]) {
                // Simple command with extra words - use failedCommand with the extra words
                const subject = words.slice(1).join(" ");
                displayText(simpleCommands[mainCommand].failedCommand(subject));
            } else if (useAliases.includes(mainCommand)) {
                // Use command with args - extract and handle
                const things = parseThingsFromWords(words, 1);
                handleUseCommand(mainCommand, things);
            } else if (complicatedCommands[mainCommand]) {
                // If the user calls the say command, pass in everything else.
                if (mainCommand === "say" || mainCommand === "speak" || mainCommand === "answer") {
                    say(rawCommand);
                } else {
                    const things = parseThingsFromWords(words, 1);
                    if ((mainCommand === "take" || complicatedCommands[mainCommand] === complicatedCommands.take) && things.length === 1 && (things[0] === "all" || things[0] === "everything")) {
                        takeAll();
                    } else {
                        complicatedCommands[mainCommand].command(things);
                    }
                }

            } else if (knownWords[mainCommand]) {
                displayText(knownWords[mainCommand]);
            } else {
                displayText("I don't know that word.");
            }
        } else {
            // In multi-step mode - continue the command
            const things = parseThingsFromWords(words);

            // Check if this is a use-system command
            if (aliasToAction[gameState.partCommand] !== undefined) {
                // Continue use command multi-step
                const alias = gameState.pendingAlias;
                const actionType = gameState.partCommand;
                let parsed = {items: [], target: []};

                // Merge with previously collected parts
                if (gameState.partApplyItems.length > 0) {
                    parsed.items = gameState.partApplyItems;
                    parsed.target = things;
                } else if (gameState.partAttackTarget.length > 0) {
                    parsed.target = gameState.partAttackTarget;
                    parsed.items = things;
                } else {
                    parsed = parseActionCommand(actionType, things);
                }

                // Execute or continue asking
                if (aliasToAction[alias] === "attack") {
                    handleUseCommand(alias, [...parsed.target, "with", ...parsed.items]);
                } else {
                    handleUseCommand(alias, [...parsed.items, 'on', ...parsed.target]);
                }
            } else {
                // Old system (take, drop, examine)
                complicatedCommands[gameState.partCommand].command(things)
                gameState.partCommand = "";
            }
        }
        //reset room in case of movement
        currentRoom = rooms[gameState.currentRoom];
        // Check hazards
        if (!checkKillIfInventory(currentRoom)) {
            processHazards(currentRoom, oldRoom);
        }

        // Update the turn count on command if there is combat in this room unless you have a part command going on
        if (currentRoom.objects && !gameState.partCommand) {
            for (const object of currentRoom.objects) {
                const enemy = objects[object];
                if (enemy.combat && gameState.combatState[object]) {
                    gameState.combatState[object].turnCount += 1;
                }
            }
        }

        // Process temporary items
        processTemporaryItems(currentRoom);

        console.log('Command entered:', command);

        // Clear input field
        inputElement.value = '';

        // Scroll to bottom after command processing
        gameDisplay.scrollTop = gameDisplay.scrollHeight;

        // Update debug displays
        updateDebugDisplays();

        // Update holding flags
        updateHoldingFlags();


        // Give the enemy a turn if they aren't dead and are aggressive or in combat
        if (currentRoom.objects) {
            for (const object of currentRoom.objects) {
                const enemy = objects[object];
                if (enemy.combat && gameState.combatState[object] && (enemy.combat.aggressive || gameState.combatState[object].isEngaged)) {
                    processEnemyTurns();
                }
            }
        }

        // Check if the player has died
        handlePlayerDeath();

        // auto save the game
        saveGame(gameState);
    }
}

// Display text to output area
function displayText(text) {
    const line = document.createElement('div');
    line.textContent = text;
    outputElement.appendChild(line);

    // Auto-scroll to bottom
    gameDisplay.scrollTop = gameDisplay.scrollHeight;
}

// Display user command with special formatting
function displayCommand(command) {
    const line = document.createElement('div');
    line.className = 'user-command';
    line.textContent = '> ' + command;
    outputElement.appendChild(line);

    // Auto-scroll to bottom
    gameDisplay.scrollTop = gameDisplay.scrollHeight;
}

// Display room title with special formatting
function displayRoomTitle(title) {
    const titleElement = document.createElement('h2');
    titleElement.textContent = title;
    titleElement.className = 'room-title';
    outputElement.appendChild(titleElement);
    gameDisplay.scrollTop = gameDisplay.scrollHeight;
}

// Clear output area
function clearOutput() {
    outputElement.innerHTML = '';
}

// Update debug displays
function updateDebugDisplays() {
    // Only update if debug panel elements exist
    if (!gameStateDisplay || !roomStateDisplay) {
        return;
    }

    // Update game state display (excluding visitedRooms)
    const gameStateData = {
        currentRoom: gameState.currentRoom,
        previousRoom: gameState.previousRoom,
        inventory: gameState.inventory,
        flags: gameState.flags,
        partCommand: gameState.partCommand,
        pendingAlias: gameState.pendingAlias,
        partApplyItems: gameState.partApplyItems,
        partAttackTarget: gameState.partAttackTarget,
        partCraftItems: gameState.partCraftItems,
        combatState: gameState.combatState,
        healthState: gameState.healthState,
        poison: gameState.poison
    };
    gameStateDisplay.textContent = JSON.stringify(gameStateData, null, 2);

    // Update room state display
    if (typeof rooms !== 'undefined' && rooms[gameState.currentRoom]) {
        const currentRoom = rooms[gameState.currentRoom];
        const roomStateData = {
            id: gameState.currentRoom,
            passages: currentRoom.passages || {},
            items: currentRoom.items || [],
            objects: currentRoom.objects || []
        };
        roomStateDisplay.textContent = JSON.stringify(roomStateData, null, 2);
    } else {
        roomStateDisplay.textContent = 'Room data not available';
    }
}

function poisonDeath() {
    if (gameState.flags.includes("poisoned")) {
        gameState.poison += 1;

        if (gameState.poison === 3) {
            displayText("You don't feel so great. Your stomach churns uneasily.");
        } else if (gameState.poison === 5) {
            displayText("A wave of nausea hits you. Your stomach cramps painfully.");
        } else if (gameState.poison === 8) {
            displayText("Searing pain erupts in your gut. The poison finally takes its toll.");
            gameState.healthState = 0;
        }
    }
}

function handlePlayerDeath() {
    poisonDeath();

    if (gameState.healthState === 0) {
        displayText("You have died.");
        const checkpointSave = loadGame("internal checkpoint");

        if (checkpointSave) {
            resetGameState(checkpointSave);

            if (checkpointSave.roomChanges) {
                applyRoomChanges(checkpointSave.roomChanges);
            }

            look();
        } else {
            reset();
        }
    }
}

// Event listeners
inputElement.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleCommand();
    }
});

// Start game when page loads
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    inputElement.focus();
});
