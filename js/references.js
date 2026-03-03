// ===== REFERENCE EXAMPLES =====
// This file contains commented examples showing how to create items and objects
// Use these as templates when adding new content to your game
// IMPORTANT: No functions in data files (map.js, items.js, objects.js)
// Use structured conditionals, templates, dynamic flags, and effects instead

/*
// ===== ROOM STRUCTURE EXAMPLE =====

exampleRoom: {
  // ===== BASIC PROPERTIES =====
  name: "The Example Chamber",           // Display name (string or {base, parts} object)

  // ===== LOOK DESCRIPTION (2 formats) =====
  // Format 1: Simple string (use this if description never changes)
  look: "A simple room with stone walls.",

  // Format 2: Object with base and conditional parts (flag-dependent text)
  look: {
    base: "A chamber with ancient murals on the walls.",  // Always shown first (optional)
    parts: [
      { text: "The murals glow faintly in the light.", if: ["lanternEquipped"] },
      { text: "The murals are barely visible in the darkness.", unless: ["lanternEquipped"] },
      { text: "A hidden door is now visible.", if: ["secretRevealed"] },
      { text: "You hear water.", ifAny: ["fountainOn", "rainStarted"] },
      { text: "Quiet here.", unlessAny: ["fountainOn", "bellRung"] }
    ]
  },
  // Condition types (all take arrays of flag strings):
  //   if:        all flags must be present (AND)
  //   unless:    all flags must be absent (AND)
  //   ifAny:     at least one flag must be present (OR)
  //   unlessAny: at least one flag must be absent (OR)
  // Multiple conditions can combine on a single part (all must pass)

  // ===== PASSAGES (simple exits) =====
  passages: {
    north: "northRoom",
    south: "southRoom",
    east: "eastRoom",
    west: "westRoom",
    northeast: "neRoom",
    southeast: "seRoom",
    southwest: "swRoom",
    northwest: "nwRoom",
    up: "upperRoom",
    down: "lowerRoom"
  },

  // ===== RESTRICTED PASSAGES (conditional exits) =====
  restrictedPassages: {
    east: {
      // Requirements (checked in order)
      requirements: [
        {
          flag: "doorUnlocked",                 // Check if flag exists
          failMessage: "The door is locked.",   // Shown if requirement not met
          unmetDescription: "A locked door blocks the way east."  // Shown in look when unmet
        },
        {
          flag: "doorOpen",
          failMessage: "The door is closed.",
          unmetDescription: "A closed door stands to the east."
        },
        {
          item: "torch",                        // Check if item in inventory
          failMessage: "It's too dark to proceed.",
          unmetDescription: "Darkness blocks the eastern passage."
        },
        {
          roomItems: ["ladder", "stepladder"],  // Check if ANY of these items dynamically placed in room
          failMessage: "I can't reach that high.",
          unmetDescription: "A hole high in the wall is out of reach."
        }
      ],
      removeRequirements: ["enemyDefeated"],       // If ALL these flags present, skip all requirements
                                                  // Passage shows as normal (in direction list, no restricted description)
      room: "secretRoom",                       // Destination when all requirements met
      metDescription: "An open doorway leads east.",  // Shown in look when all requirements met
      hidden: true,                             // Don't show in look even when met (for secret passages)
      backFailMessage: "I need the key to go back."  // Custom message when returning
    }
  },

  // ===== ITEMS (pickupable objects) =====
  items: ["sword", "torch", "key"],             // Item IDs from items.js

  // ===== OBJECTS (non-pickupable interactables) =====
  objects: ["lever", "statue", "dragon"],       // Object IDs from objects.js

  // ===== HIDE ITEM DESCRIPTIONS =====
  hideItemDescriptions: ["hiddenKey", "secretNote"],  // Item descriptions won't show in look
                                                       // (useful for items hidden until discovered)

  // ===== SCENERY (non-takeable room elements) =====
  scenery: {
    // Simple string format
    "walls": "I can't take the walls.",
    "ceiling": "That's not something I can take.",

    // Object format with names, examine, and conditional text
    "chains": {
      names: ["chains", "chain"],
      message: {                                // Shown when trying to take
        parts: [
          { text: "The chains are broken.", if: ["chainsDestroyed"] },
          { text: "The chains are firmly anchored.", unless: ["chainsDestroyed"] }
        ]
      },
      examine: {                                // Shown on examine
        base: "Heavy iron chains.",
        parts: [
          { text: "They're broken and scattered.", if: ["chainsDestroyed"] },
          { text: "They suspend a chandelier.", unless: ["chainsDestroyed"] }
        ]
      },
      allIgnore: true                           // Won't appear in "take all"
    }
  },

  // ===== ENTRY MESSAGES =====
  entryMessages: {                              // Custom messages on entry (optional)
    north: "You fall through a hole.",          // String, supports {{gameState.x}} templates
    east: "It took you {{gameState.commandCount}} commands to get here."
  },

  // ===== ON EXIT =====
  onExit: {
    setFlags: ["leftRoom"]                      // Any-exit format: fires on all exits
    // OR direction-specific:
    // east: { setFlags: ["gameOver"] }         // Only fires when leaving east
  },

  // ===== HAZARD (environmental damage) =====
  hazard: {
    count: 2,                                   // Commands before damage
    damage: 1,                                  // Damage per cycle
    messages: ["The heat burns you!", "Ouch!"], // Random damage messages
    unless: "fireOut",                          // Flag that disables hazard
    killIfInventory: {                          // Items that cause instant death
      dynamite: "The dynamite explodes!"
    }
  },

  // ===== ROOM FLAGS =====
  light: true,                                  // Room has natural light (default false)
  isCheckpoint: true,                           // Safe respawn point on first visit
  mirrorDirections: true                        // Reverses movement directions
},

// ===== ITEM STRUCTURE EXAMPLES =====

// BASIC ITEM (pickupable, can be examined)
basicItem: {
  names: ["item name", "item", "thing"],  // All valid names (first is primary)
  examine: "Description when examining the item.",
  primaryType: "equipment",               // For smart routing: equipment|consumable|weapon|tool
  description: "An item lies on the ground.",     // Shown in room description
  initialDescription: "A shiny item rests here.", // Shown on first visit (optional)
  setFlag: "itemTaken",                   // Flag set when picked up (optional)
},

// ITEM WITH CONDITIONAL EXAMINE
conditionalItem: {
  names: ["brass lantern", "lantern", "lamp"],
  primaryType: "operate",
  examine: {
    base: "An old brass lantern.",
    parts: [
      { text: "It's lit and working.", if: ["lanternLit"] },
      { text: "It's completely out of battery.", if: ["lanternOut"] },
      { text: "It's off.", unlessAny: ["lanternLit", "lanternOut"] }
    ]
  },
  description: "A brass lantern rests here.",
},

// ITEM WITH OPERATE (equippable, activatable, etc.)
operableItem: {
  names: ["magical ring", "ring", "band", "magical"],
  primaryType: "operate",
  examine: "A ring that glows faintly.",
  description: "A magical ring sits on a pedestal.",
  setFlag: "ringTaken",
  togglable: true,                              // Allows "use" to cycle through actions

  operate: {
    equip: {
      allowedVerbs: ["equip", "wear", "put"],
      requireNotFlags: ["ringEquipped"],         // Can't do if flag exists
      requireFlags: [],                          // Must have these flags
      message: "You slide the ring onto your finger.",
      failMessage: "You're already wearing the ring.",
      failMessages: {                            // Flag-specific fail messages
        ringEquipped: "Already wearing it."
      },
      effects: {
        setFlags: ["ringEquipped"]
      }
    },

    unequip: {
      allowedVerbs: ["unequip", "remove", "take"],
      requireFlags: ["ringEquipped"],
      message: "You take off the ring.",
      failMessage: "You're not wearing the ring.",
      effects: {
        unsetFlags: ["ringEquipped"]
      }
    }
  }
},

// WEAPON ITEM (used in combat)
weaponItem: {
  names: ["dagger", "knife", "blade"],
  primaryType: "attack",                  // Hint that this is a weapon
  examine: "A sharp dagger with a worn handle.",
  description: "A dagger lies on the ground.",
  setFlag: "daggerTaken",
},

// ITEM WITH CANTAKE (declarative deny conditions)
restrictedItem: {
  names: ["dynamite", "explosive", "stick"],
  examine: "A stick of dynamite.",
  description: "A stick of dynamite rests here.",
  infinite: true,                                 // Stays in room after taking
  canTake: [                                      // Array of deny conditions (first match blocks)
    {
      unless: { hasItem: "dynamite" },            // Blocked when player has this item
      message: "I'm not taking more."
    },
    {
      unless: { hasFlag: "explosivesDisabled" },  // Blocked when flag exists
      message: "Explosives have been disabled."
    },
    {
      unless: { notHasFlag: "explosivesAllowed" }, // Blocked when flag absent
      message: "I'm not allowed to take that."
    },
    {
      unless: { inRoom: "dangerZone" },           // Blocked in specific room
      message: "Not here."
    },
    {
      unless: { itemPlacedAnywhere: "dynamite" }, // Blocked when item placed in any room
      message: "I've already placed one somewhere."
    }
  ],
  // Condition types: hasItem, hasFlag, notHasFlag, inRoom, itemPlacedAnywhere
},

// ITEM WITH TEMPORARY COUNTDOWN
temporaryItem: {
  names: ["lit torch", "torch"],
  primaryType: "operate",
  examine: "A lit torch.",
  description: "A lit torch rests here.",
  temporary: {                                    // Countdown config (plain object, not function)
    requireFlags: ["torchLit"],                   // Only counts when all flags present
    duration: 500,                                // Commands until expiration
    messages: {                                   // Warning messages at specific counts
      100: "The torch flickers.",
      400: "The torch is getting dim.",
      480: "The torch is nearly out."
    },
    onExpire: "extinguish",                       // Action: "extinguish" or "destroy"
    onExpireMessage: {
      inventory: "The torch goes out.",           // Message when in inventory
      floor: "The torch on the floor goes out."   // Message when in room
    },
    actionSetFlags: ["torchOut"],                 // Flags to set on expiration
    actionUnsetFlags: ["torchLit"]                // Flags to unset on expiration
  },
},

// ITEM WITH SOFTLOCKABLE (room-conditional vital)
softlockableItem: {
  names: ["purple map", "map"],
  examine: "A glowing purple map.",
  description: "A glowing purple map has been left here.",
  softlockable: {                                 // Room-conditional protection from blue cake theft
    rooms: ["start", "cellar", "five"],           // Rooms where item is protected
    reaction: "vital"                             // Treat as vital in those rooms
  },
  // Compare with unconditional protection:
  // vital: true                                  // Always protected from loseNonvitalItems
},

// ITEM WITH APPLYTO (can be used on objects)
applyItem: {
  names: ["iron key", "key"],
  primaryType: "tool",
  examine: "A heavy iron key.",
  description: "An iron key rests here.",
  applyWith: {
    lockedDoor: {
      message: "You unlock the door with the key.",
      consumeItem: true,
      effects: {
        setFlags: ["doorUnlocked"]
      }
    }
  }
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
      failMessage: "The lever is already pulled.",
      effects: {
        setFlags: ["leverPulled"]
      }
    }
  }
},

// OBJECT WITH ONEXAMINE EFFECTS
sequenceObject: {
  names: ["code", "pattern", "skylight"],
  description: "Light filters through coloured glass, casting patterns on the floor.",
  onExamine: {                                    // Effects to run before showing examine text
    generateSequence: {
      storeName: "colorCode",                     // Key in gameState.sequences
      values: ["red", "blue", "yellow", "green"]  // Shuffled on first examine
    }
  },
  examine: "The pattern shows: {{gameState.sequences.colorCode}}.",  // Template resolved at runtime
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
      consumeItem: false,               // true = item removed from inventory

      effects: {
        setFlags: ["doorUnlocked"],
        removeObjects: { objects: ["doorLock"] },
        spawnItems: { items: ["brokenKey"], room: "hallway" }
      }
    },

    // Using multiple items together on this object
    _combinations: [
      {
        items: ["plank", "nails", "hammer"],  // All required (order doesn't matter)
        requireFlags: [],
        message: "You board up the door!",
        consumeItems: ["plank", "nails"],     // Which items get consumed
        retainItems: ["hammer"],              // Which items stay in inventory
        effects: {
          setFlags: ["doorBoarded"]
        }
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

    // ===== ON KILL EFFECTS =====
    effects: {
      setFlags: ["dragonSlain"],
      unsetFlags: ["dragonAlive"],
      spawnItems: { items: ["dragonScale", "treasure"] },
      giveItems: ["experience"],
      spawnObjects: { objects: ["dragonCorpse"] }
    },
    removeOnKill: true,                     // Remove object from room
  }
},

// OBJECT WITH CHECKSEQUENCE (puzzle buttons)
puzzleButton: {
  names: ["red button", "button"],
  examine: "A red button on the wall.",

  operate: {
    push: {
      allowedVerbs: ["push", "press", "use"],
      // No message here - handled by the checkSequence effect
      effects: {
        checkSequence: {
          message: "*click*",                         // Shown when sequence exists
          sequencelessMessage: "You push the button.", // Shown when no sequence generated yet
          solveOnce: true,                            // Can only be solved once
          storeName: "buttonsPressed",                // Tracks player's input sequence
          key: "red",                                 // Value added to sequence
          correctSequenceStore: "colorCode",          // gameState.sequences key with correct answer
          duplicateCode: false,                       // Allow duplicate entries
          successMessage: "The door opens!",
          failMessage: "Wrong sequence. Try again.",
          onSuccessEffects: {
            setFlags: ["puzzleSolved"]
          }
        }
      }
    }
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
      consumeItem: true,
      effects: {
        setFlags: ["barrierCleared"],
        removeObjects: { objects: ["barrier"] }
      }
    },
    _default: {
      message: "The barrier remains solid."
    }
  }
}

*/

// ===== NOTES =====
//
// DATA-DRIVEN ENGINE:
// - No functions allowed in data files (map.js, items.js, objects.js)
// - Use structured conditionals ({ base, parts }) for flag-dependent text
// - Use templates ({{gameState.x.y}}) for runtime value substitution
// - Use dynamic flags in game.js for state-derived flags
// - Use effects for game state changes
//
// STRUCTURED CONDITIONAL TEXT:
// - Supported fields: room.name, room.look, entryMessages, item examine,
//   object examine, scenery message, scenery examine, operate action message
// - Resolved by resolveConditionalText() in environment.js
// - Conditions take arrays of flag strings, not single strings
//
// TEMPLATE SUBSTITUTION:
// - {{gameState.x.y}} resolved at runtime by resolveTemplates()
// - Arrays are auto-joined with ", "
// - Works in all fields processed by resolveConditionalText()
//
// DYNAMIC FLAGS (game.js):
// - { flag: "hasMap", ifHasItem: "map" }          // Set when item in inventory, unset when not
// - { flag: "visitedRoom", ifVisitedRoom: "room" } // Set when room visited (never unset)
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
// - Use effects.setFlags to add flags when action succeeds
// - Use effects.unsetFlags to remove flags when action succeeds
//
// MESSAGES:
// - All combat messages should be arrays (random selection)
// - failMessage is shown when requirements aren't met
// - message is shown when action succeeds (string or {base, parts} object)
//
// ITEMS VS OBJECTS:
// - Items: Can be picked up and go in inventory
// - Objects: Fixed in rooms, can't be picked up
// - Objects can have operate (use directly) and applyWith (use items on them)
//
// CANTAKE CONDITIONS:
// - Array of deny conditions, first match blocks the take
// - unless: { hasItem, hasFlag, notHasFlag, inRoom, itemPlacedAnywhere }
//
// TEMPORARY ITEMS:
// - Plain object with countdown config (not a function)
// - requireFlags: countdown only ticks when all flags present
// - onExpire: "extinguish" (turn off) or "destroy" (explode)
//
// CHECKPOINT ROOMS:
// - When player first visits a checkpoint room, it becomes their respawn point
// - On death, player returns to last checkpoint with state from that checkpoint
// - In map.js, add isCheckpoint: true to the room definition
