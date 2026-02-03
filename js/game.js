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
    roomItemChanges: {},
    lastCheckpoint: "start"
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

// Game initialization
function initGame() {
    const autoSave = loadGame();
    if (autoSave) {
        gameState.currentRoom = autoSave.currentRoom;
        gameState.previousRoom = autoSave.previousRoom;
        gameState.inventory = autoSave.inventory;
        gameState.flags = autoSave.flags;
        gameState.visitedRooms = autoSave.visitedRooms;
        gameState.combatState = autoSave.combatState;
        gameState.healthState = autoSave.healthState;
        gameState.poison = autoSave.poison || 0;
        gameState.roomItemChanges = autoSave.roomItemChanges;
        gameState.lastCheckpoint = autoSave.lastCheckpoint;

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

        if (!gameState.partCommand) {
            if (mainCommand === "save") {
                save(words.slice(1));
                inputElement.value = "";
                return;
            }
            if (mainCommand === "load") {
                load(words.slice(1));
                inputElement.value = "";
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
                let things = [];
                const ignoreWords = ["the", "a", "an", "and"];

                for (let i = 1; i < words.length; i++) {
                    let word = words[i].replace(/[,\.;!?]+$/, "");

                    if (word && !ignoreWords.includes(word)) {
                        things.push(word);
                    }
                }
                handleUseCommand(mainCommand, things);
            } else if (complicatedCommands[mainCommand]) {
                // If the user calls the say command, pass in everything else.
                if (mainCommand === "say" || mainCommand === "speak" || mainCommand === "answer") {
                    say(rawCommand);
                } else {
                    let things = [];
                    const ignoreWords = ["the", "a", "an", "and"];

                    for (let i = 1; i < words.length; i++) {
                        let word = words[i].replace(/[,\.;!?]+$/, "");

                        if (word && !ignoreWords.includes(word)) {
                            things.push(word);
                        }
                    }
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
            let things = [];
            const ignoreWords = ["the", "a", "an", "and"];

            for (let word of words) {
                word = word.replace(/[,\.;!?]+$/, "");

                if (word && !ignoreWords.includes(word)) {
                    things.push(word);
                }
            }

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
        let skipHazCheck = false;

        if (currentRoom?.hazard?.killIfInventory) {
            for (const [item, message] of Object.entries(currentRoom.hazard.killIfInventory)) {
                if (gameState.inventory.includes(item)) {
                    gameState.healthState = 0;
                    displayText(message);
                    skipHazCheck = true;
                }
            }
        }

        // Check for hazard damage
        if (gameState.currentRoom === oldRoom) {
            if (currentRoom.hazard && !skipHazCheck) {
                if ((currentRoom.hazard.unless && !gameState.flags.includes(currentRoom.hazard.unless)) || !currentRoom.hazard.unless) {
                    //Recieve the hazard effects
                    if (gameState.hazardState.room !== gameState.currentRoom) {
                        gameState.hazardState.room = gameState.currentRoom;
                        gameState.hazardState.count = 1;
                    } else {
                        gameState.hazardState.count += 1;
                    }

                    if (gameState.hazardState.count >= currentRoom.hazard.count) {
                        gameState.hazardState.count = 0;
                        if (currentRoom.hazard.message) {
                            displayText(currentRoom.hazard.message);
                        } else if (currentRoom.hazard.messages) {
                            const randomMessage = currentRoom.hazard.messages[Math.floor(Math.random() * currentRoom.hazard.messages.length)];
                            displayText(randomMessage);
                        }
                        if (currentRoom.hazard.damage) {
                            gameState.healthState -= currentRoom.hazard.damage;
                        }
                    }

                } else {
                    // hazard is off
                    gameState.hazardState.room = "";
                    gameState.hazardState.count = 0;
                }
            } else {
                // not in a room with a hazard, remove tracking
                gameState.hazardState.room = "";
                gameState.hazardState.count = 0;
            }
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

        // check for temporary items
        for (const itemId of gameState.inventory) {

            const tempConfig = typeof items[itemId]?.temporary === "function" ? items[itemId].temporary() : items[itemId]?.temporary;

            if (tempConfig && gameState.itemCountdowns[itemId] === undefined) {
                gameState.itemCountdowns[itemId] = 0;
            }
        }

        // increment temporary items
        for (const [item, count] of Object.entries(gameState.itemCountdowns)) {
            const tempConfig = typeof items[item]?.temporary === "function" ? items[item].temporary() : items[item]?.temporary;

            // if temporary is off, skip
            if (!tempConfig) {
                continue;
            }

            if (tempConfig.duration === count) {
                // the item "expires" do the action
                switch (tempConfig.onExpire) {
                    case "destroy":
                        // kill the player, and destroy all items in the room.
                        if (currentRoom.items.includes(item) || gameState.inventory.includes(item)) {
                            gameState.healthState = 0;
                        }

                        if (currentRoom.objects) {
                            for (const object of currentRoom.objects) {
                                if (objects[object].destructible) {
                                    setRoomState("objects", object, false)
                                }
                                if (objects[object].onDestruct) {
                                    for (const flag of objects[object].onDestruct) {
                                        setGameState("flags", flag);
                                    }
                                }
                            }
                        }

                        //display the appropriate message
                        if (currentRoom.items.includes(item)) {
                            displayText(tempConfig.onExpireMessage.floor);
                        } else if (gameState.inventory.includes(item)) {
                            displayText(tempConfig.onExpireMessage.inventory);
                        } else {
                            displayText(tempConfig.onExpireMessage.away);
                        }
                        break;

                    case "extinguish":

                        if (currentRoom.items.includes(item)) {
                            displayText(tempConfig.onExpireMessage.floor);
                        } else if (gameState.inventory.includes(item)) {
                            displayText(tempConfig.onExpireMessage.inventory);
                        }

                        if (tempConfig.actionSetFlags) {
                            for (const flag of tempConfig.actionSetFlags) {
                                setGameState("flags", flag);
                            }
                        }
                        if (tempConfig.actionUnsetFlags) {
                            for (const flag of tempConfig.actionUnsetFlags) {
                                setGameState("flags", flag, false);
                            }
                        }




                }
                delete gameState.itemCountdowns[item];
            }
            // check if the item has a message at this stage?
            if (tempConfig.messages?.[count]) {
                displayText(tempConfig.messages[count]);
            }

            // increment the count
            if (gameState.itemCountdowns[item] !== undefined) {
                gameState.itemCountdowns[item]++;
            }
        }


        console.log('Command entered:', command);

        // Clear input field
        inputElement.value = '';

        // Scroll to bottom after command processing
        gameDisplay.scrollTop = gameDisplay.scrollHeight;

        // Update debug displays
        updateDebugDisplays();

        // Update holding flags
        for (const item in holdingFlags) {
            if (gameState.inventory.includes(holdingFlags[item].item)) {
                if (!gameState.flags.includes(holdingFlags[item].flag)) {
                    setGameState("flags", holdingFlags[item].flag);
                }
            } else {
                if (gameState.flags.includes(holdingFlags[item].flag)) {
                    setGameState("flags", holdingFlags[item].flag, false);
                }
            }
        };


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
            gameState.currentRoom = checkpointSave.currentRoom;
            gameState.previousRoom = checkpointSave.previousRoom;
            gameState.inventory = checkpointSave.inventory;
            gameState.flags = checkpointSave.flags;
            gameState.visitedRooms = checkpointSave.visitedRooms;
            gameState.combatState = checkpointSave.combatState;
            gameState.healthState = checkpointSave.healthState;
            gameState.poison = checkpointSave.poison || 0;
            gameState.roomItemChanges = checkpointSave.roomItemChanges;
            gameState.lastCheckpoint = checkpointSave.lastCheckpoint;

            if (checkpointSave.roomItemChanges) {
                applyRoomItemChanges(checkpointSave.roomItemChanges);
            }

            look();
        } else {
            reset();
        }
    }
}

// Event listeners
inputElement.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        handleCommand();
    }
});

// Start game when page loads
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    inputElement.focus();
});
