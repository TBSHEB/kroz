// ===== REFERENCE EXAMPLES =====
// This file contains commented examples showing how to create items and objects
// Use these as templates when adding new content to your game

/*
// ===== ITEM STRUCTURE EXAMPLES =====

// BASIC ITEM (pickupable, can be examined)
basicItem: {
  name: "item name",                    // Display name (singular)
  aliases: ["item", "thing", "object"], // All words that refer to this item
  examine: "Description when examining the item.",
  description: "A item lies on the ground.",  // Shown in room description
  setFlag: "itemTaken",                 // Optional: flag set when picked up
},

// ITEM WITH OPERATE (equippable, activatable, etc.)
operableItem: {
  name: "magical ring",
  aliases: ["ring", "band", "magical"],
  primaryType: "operate",               // Hint for use system
  examine: "A ring that glows faintly.",
  description: "A magical ring sits on a pedestal.",
  setFlag: "ringTaken",

  operate: {
    // Each action is a separate object
    equip: {
      allowedVerbs: ["equip", "wear", "use", "put"],
      requireNotFlags: ["ringEquipped"],      // Can't do if flag exists
      requireFlags: [],                       // Optional: must have these flags
      message: "You slide the ring onto your finger.",
      setFlags: ["ringEquipped"],             // Add flags
      unsetFlags: [],                         // Remove flags
      failMessage: "You're already wearing the ring.",

      // Optional outcomes:
      giveItems: [],                          // Add items to inventory
      dropItems: [],                          // Drop items in room
      removeObject: false,                    // Remove this object from room
    },

    unequip: {
      allowedVerbs: ["unequip", "remove", "take"],
      requireFlags: ["ringEquipped"],
      message: "You take off the ring.",
      unsetFlags: ["ringEquipped"],
      failMessage: "You're not wearing the ring."
    },

    activate: {
      allowedVerbs: ["activate", "use"],
      requireFlags: ["ringEquipped"],
      message: "The ring glows brightly!",
      setFlags: ["ringActivated"]
    }
  }
},

// WEAPON ITEM (used in combat)
weaponItem: {
  name: "dagger",
  aliases: ["dagger", "knife", "blade"],
  primaryType: "attack",                // Hint that this is a weapon
  examine: "A sharp dagger with a worn handle.",
  description: "A dagger lies on the ground.",
  setFlag: "daggerTaken",
},


// ===== OBJECT STRUCTURE EXAMPLES =====

// BASIC OBJECT (can examine, has operate)
basicObject: {
  names: ["lever", "switch", "handle"],  // All words that refer to this object
  examine: "A rusty lever attached to the wall.",

  operate: {
    pull: {
      allowedVerbs: ["pull", "use", "yank", "activate"],
      requireNotFlags: ["leverPulled"],
      message: "You pull the lever. Something clicks in the distance.",
      setFlags: ["leverPulled"],
      dropItems: [],                      // Optional: drop items in room
      removeObject: false,                // Optional: remove after use
      failMessage: "The lever is already pulled."
    }
  }
},

// OBJECT WITH APPLY INTERACTIONS (use items on it)
applyObject: {
  names: ["door", "wooden-door", "entrance"],
  examine: "A heavy wooden door with a keyhole.",

  applyWith: {
    // Using specific item on this object
    ironKey: {
      requireFlags: [],                 // Optional: must have these flags
      requireNotFlags: ["doorUnlocked"], // Optional: can't have these flags
      message: "You unlock the door with the iron key.",
      failMessage: "The door is already unlocked.",

      setFlags: ["doorUnlocked"],       // Add flags
      unsetFlags: [],                   // Remove flags
      consumeItem: false,               // true = item removed from inventory
      removeObject: false,              // true = remove this object from room

      giveItems: [],                    // Add items to player inventory
      dropItems: [],                    // Drop items in room

      // Remove object only if ALL these flags exist
      removeObjectIfAllFlags: ["doorUnlocked", "doorOpen"],

      // Trigger effects on OTHER objects
      triggerEffects: [
        {
          objectId: "otherObject",      // Which object to affect
          setFlags: ["flagName"],
          dropItems: ["itemId"]
        }
      ]
    },

    // Using multiple items together on this object
    _combinations: [
      {
        items: ["plank", "nails", "hammer"],  // All required (order doesn't matter)
        requireFlags: [],
        message: "You board up the door!",
        consumeItems: ["plank", "nails"],     // Which items get consumed
        retainItems: ["hammer"],              // Which items stay in inventory
        setFlags: ["doorBoarded"],
        removeObject: false
      }
    ],

    // Default response for items not specifically handled
    _default: {
      message: "That doesn't work on the door."
    }
  }
},

// COMBAT OBJECT (enemy that can be fought)
combatObject: {
  names: ["dragon", "beast", "monster", "creature"],
  examine: "A fearsome dragon guards the passage. Its scales gleam in the dim light.",

  combat: {
    // ===== WEAPONS =====
    successfulWeapons: ["sword", "spear"],  // Items that can damage this enemy

    // ===== ENEMY DODGING =====
    dodgeChance: 0.3,                       // 30% chance enemy dodges (0.0 - 1.0)
    dodgeChanceDamaged: 0.6,                // Dodge chance when player health is low
    damagedPlayerThreshold: 2,              // Health level that triggers higher dodge

    // ===== DAMAGE TO PLAYER =====
    damageToPlayer: {
      default: 1,                           // Normal damage amount
      lowHealth: 2,                         // Damage when player is low health
      lowHealthThreshold: 2,                // Health level that triggers higher damage
      randomDamage: [1, 3],                 // Optional: random between [min, max]
    },

    // ===== PLAYER DODGING =====
    playerDodgeChance: 0.25,                // 25% chance player dodges enemy attacks

    // ===== COMBAT MESSAGES =====
    // Each is an array - random message will be chosen
    instakillMessage: [                     // First turn kill (turn 1)
      "You strike before the dragon reacts!",
      "The dragon falls before it can defend itself!"
    ],
    killMessage: [                          // Normal kill (turn 2+)
      "The dragon collapses!",
      "You have slain the dragon!"
    ],
    missMessage: [                          // Player misses
      "The dragon dodges!",
      "Your weapon passes harmlessly by!"
    ],
    dodgeMessage: [                         // Enemy dodges (synonym for missMessage)
      "The dragon easily avoids your attack!"
    ],
    counterAttackMessage: [                 // Enemy attacks back
      "The dragon strikes back!",
      "The beast lunges at you!"
    ],
    hitPlayerMessage: [                     // Enemy hits player
      "The dragon's claws rake across you!",
      "You take a heavy blow!"
    ],
    playerDodgeMessage: [                   // Player dodges enemy
      "You dodge the attack!",
      "You roll out of the way!"
    ],

    // ===== FLAVOR MESSAGES =====
    wrongWeaponMessage: {                   // Using wrong items to attack
      stick: "A stick won't hurt a dragon!",
      torch: "The dragon breathes fire - it's immune!"
    },
    missedInstakillMessage: [               // Failed first-turn kill
      "The dragon sees you coming!",
      "Your element of surprise is lost!"
    ],

    // ===== COMBAT BEHAVIOR =====
    aggressive: true,                       // If true, enemy attacks every turn

    // ===== REQUIREMENTS =====
    requiredFlags: ["dragonWeakened"],      // Optional: need flags to fight
    requiredFlagsFailMessage: "The dragon is too powerful!",

    // ===== ON KILL OUTCOMES =====
    setFlags: ["dragonSlain"],              // Flags to add on death
    unsetFlags: ["dragonAlive"],            // Flags to remove on death
    removeOnKill: true,                     // Remove object from room
    dropItems: ["dragonScale", "treasure"], // Items dropped on death
    giveItems: ["experience"],              // Items given to player on death
    addObjects: ["dragonCorpse"],           // Objects added to room on death
  }
},

// NON-AGGRESSIVE COMBAT OBJECT (doesn't attack first)
passiveCombatObject: {
  names: ["guard", "sentinel", "warrior"],
  examine: "A heavily armored guard stands watch.",

  combat: {
    successfulWeapons: ["sword"],
    aggressive: false,                      // Won't counter-attack

    instakillMessage: ["The guard falls instantly!"],
    killMessage: ["The guard is defeated!"],

    removeOnKill: true,
    setFlags: ["guardDefeated"],
  }
},

// OBJECT WITH BOTH APPLY AND COMBAT
complexObject: {
  names: ["statue", "stone-warrior", "guardian"],
  examine: "An ancient stone statue. It appears dormant.",

  // Can use items on it to activate/modify
  applyWith: {
    ancientGem: {
      message: "The statue comes to life!",
      setFlags: ["statueActive"],
      consumeItem: true
    },
    _default: {
      message: "Nothing happens."
    }
  },

  // Can fight it once active
  combat: {
    requiredFlags: ["statueActive"],
    requiredFlagsFailMessage: "The statue is still dormant.",
    successfulWeapons: ["hammer"],

    aggressive: true,
    dodgeChance: 0.4,
    damageToPlayer: { default: 2 },

    instakillMessage: ["You shatter the statue!"],
    killMessage: ["The statue crumbles!"],

    removeOnKill: true,
    dropItems: ["ancientGem"],
  }
},

// OBJECT WITH CLEARED MESSAGE
progressObject: {
  names: ["barrier", "obstacle", "wall"],
  examine: "A magical barrier blocks the way.",
  clearedMessage: "\nHowever, the barrier is now passable.",  // Shown in look when removed

  applyWith: {
    crystalKey: {
      message: "The barrier flickers and fades.",
      setFlags: ["barrierCleared"],
      removeObject: true,
      consumeItem: true
    },
    _default: {
      message: "The barrier remains solid."
    }
  }
}

*/

// ===== NOTES =====
//
// COMBAT SYSTEM:
// - Turn 1 (first attack): Uses instakillMessage if hit, starts combat if miss
// - Turn 2+: Normal combat with dodging, damage, counter-attacks
// - turnCount is tracked in gameState.combatState[objectId]
// - Set aggressive: true for enemies that fight back
// - Set aggressive: false for enemies that just stand there
//
// FLAGS:
// - Use requireFlags to check if player has flags
// - Use requireNotFlags to check if player doesn't have flags
// - Use setFlags to add flags when action succeeds
// - Use unsetFlags to remove flags when action succeeds
//
// MESSAGES:
// - All combat messages should be arrays (random selection)
// - failMessage is shown when requirements aren't met
// - message is shown when action succeeds
//
// ITEMS VS OBJECTS:
// - Items: Can be picked up and go in inventory
// - Objects: Fixed in rooms, can't be picked up
// - Objects can have operate (use directly) and applyWith (use items on them)
//
// CHECKPOINT ROOMS:
// - When player first visits a checkpoint room, it becomes their respawn point
// - On death, player returns to last checkpoint with state from that checkpoint
// - In map.js, add isCheckpoint: true to the room definition:
//
//   hubRoom: {
//     name: "Central Hub",
//     look: "A safe room with passages in all directions.",
//     isCheckpoint: true,  // This is a checkpoint room
//     passages: { north: "someRoom", south: "otherRoom" }
//   }
//
// - When player enters checkpoint for first time, save to gameState.lastCheckpoint
// - On death, load state from when checkpoint was reached
//
// SAVE ITEM:
// - An item that saves the game when used (like a save crystal)
// - Example structure:
//
//   saveCrystal: {
//     name: "crystal",
//     aliases: ["crystal", "save crystal", "gem"],
//     primaryType: "operate",
//     examine: "A glowing crystal that preserves moments in time.",
//     description: "A crystal glimmers on the ground.",
//
//     operate: {
//       use: {
//         allowedVerbs: ["use", "activate", "touch"],
//         message: "The crystal glows brightly. Your progress has been saved.",
//         action: "save"  // Special action that triggers saveGame()
//       }
//     }
//   }
//
// - In the operate handler, check if action === "save" and call saveGame()
