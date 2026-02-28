// ===== MECHANICS (COMBAT, PUZZLES, HAZARDS) =====

function initializeCombat() {
  const currentRoom = rooms[gameState.currentRoom];
  if (currentRoom.objects) {
    currentRoom.objects.forEach(objectId => {
      const object = objects[objectId];

      if (object && object.combat && !gameState.combatState[objectId]) {
        gameState.combatState[objectId] = {
          isEngaged: false,
          turnCount: 0,
        };
      }
    });
  }
}

function processEnemyTurns() {
    const currentRoom = rooms[gameState.currentRoom];

    if (currentRoom.objects) {
        for (const object of currentRoom.objects) {
            const enemy = objects[object];
            if (enemy.combat && gameState.combatState[object] && gameState.combatState[object].turnCount !== 1) {
                //The enemy gets a turn

                //Counter attack!
                if (enemy.combat.counterAttackMessage) {
                    const randomMessage = pickRandom(enemy.combat.counterAttackMessage);
                    displayText(randomMessage);
                } else {
                    displayText(`The ${object} attacks!`);
                }

                //Player can dodge
                const dodge = Math.random() <= (enemy.combat.playerDodgeChance || 0);

                if (dodge) {
                    if (enemy.combat.playerDodgeMessage) {
                        const randomMessage = pickRandom(enemy.combat.playerDodgeMessage);
                        displayText(randomMessage);
                    } else {
                        displayText("You dodge");
                    }
                } else {
                    //The enemy hits the player
                    const damage = enemy.combat.damageToPlayer;
                    let healthLost = 0
                    if (damage.lowHealth && gameState.healthState <= damage.lowHealthThreshold) {
                        healthLost = damage.lowHealth;
                    } else if (damage.randomDamage) {
                        healthLost = Math.floor(Math.random() * (damage.randomDamage[1] - damage.randomDamage[0] + 1)) + damage.randomDamage[0];
                    } else if (damage.default) {
                        healthLost = damage.default;
                    } else {
                        healthLost = 1;
                    }

                    if (gameState.healthState - healthLost < 0) {
                        gameState.healthState = 0
                    } else {
                        gameState.healthState -= healthLost
                    }

                    if (enemy.combat.hitPlayerMessage) {
                        const randomMessage = pickRandom(enemy.combat.hitPlayerMessage);
                        displayText(randomMessage);
                    } else {
                        displayText(`The ${object} hits you.`);
                    }

                    const damageMessage = getDamageMessage(healthLost);
                    if (damageMessage) {
                        displayText(damageMessage);
                    }
                }
            }
        }
    }
}

function findRecipeMatch(itemIds) {
  for (const [resultId, recipe] of Object.entries(recipes)) {
    if (arraysMatchUnordered(itemIds, recipe.requires)) {
      return {
        type: "full",
        resultId,
        recipe,
        missing: []
      };
    }

    const allItemsInRecipe = itemIds.every(id => recipe.requires.includes(id));
    const missingItems = recipe.requires.filter(id => !itemIds.includes(id));

    if (allItemsInRecipe && missingItems.length > 0) {
      return {
        type: "partial",
        resultId,
        recipe,
        missing: missingItems
      };
    }

  }

  return {type: "none"};
}

function checkCombinations(items, target) {
  if (!target.applyWith || !target.applyWith._combinations) {
    return null;
  }

  const itemIds = items.map (i => i.id);

  for (const combo of target.applyWith._combinations) {
    if (arraysMatchUnordered(itemIds, combo.items)) {
      return combo;
    }
  }

  return null;
}

function checkRiddleAnswer(potentialAnswer) {
  const currentRoom = rooms[gameState.currentRoom];

  if (!currentRoom.objects) {
    return false;
  }

  for (const objectId of currentRoom.objects) {
    const object = objects[objectId];

    if (object && object.answer) {
      const normalizedAnswer = potentialAnswer.toLowerCase().trim();
      const isCorrect = object.answer.answer.some(answer => answer.toLowerCase() === normalizedAnswer);

      if (isCorrect) {

        if (object.answer.message) {
          displayText(object.answer.message);
        }

        if (object.answer.setFlags) {
          for (const flag of object.answer.setFlags) {
            setGameState("flags", flag);
          }
        }

        if (object.answer.removeOnAnswer) {
          setRoomState("objects", objectId, false);
          trackRoomChange(objectId, "object", false);
        }

        return true;
      }
    }
  }
  return false;
}

// Process all game world ticks after a command is executed
function processTick(oldRoom) {
    const currentRoom = rooms[gameState.currentRoom];

    gameState.commandCount++;
    processTemporaryItems(currentRoom);
    evaluateDynamicFlags();

    const killed = checkKillIfInventory(currentRoom);
    if (!killed) {
        processHazards(currentRoom, oldRoom);
    }

    if (!killed && currentRoom.objects && !gameState.partCommand) {
        for (const object of currentRoom.objects) {
            const enemy = objects[object];
            if (enemy.combat && gameState.combatState[object]) {
                gameState.combatState[object].turnCount += 1;
            }
        }
    }

    if (!killed && currentRoom.objects && !gameState.partCommand) {
        const hasActiveEnemy = currentRoom.objects.some(object => {
            const enemy = objects[object];
            return enemy.combat && gameState.combatState[object] && (enemy.combat.aggressive || gameState.combatState[object].isEngaged);
        });
        if (hasActiveEnemy) {
            processEnemyTurns();
        }
    }

    handlePlayerDeath();
}

// Process environmental hazard damage
function processHazards(currentRoom, oldRoom) {
    if (gameState.currentRoom === oldRoom) {
        if (currentRoom.hazard) {
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
                        const randomMessage = pickRandom(currentRoom.hazard.messages);
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
    } else {
        gameState.hazardState.room = "";
        gameState.hazardState.count = 0;
    }
}
