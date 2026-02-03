// ===== OBJECTS =====
// Fixed objects in rooms that can't be picked up but can be interacted with

const objects = {
  dungeonLamp: {
    names: ["chandelier", "lamp", "light", "lantern", "fixture"],
    examine: "The chandelier looks very heavy. Its mounting looks extremely fragile.",
    primaryType: "operate",
    operate: {
      grab: {
        allowedVerbs: ["use", "pull", "yank", "break", "take", "grab"],
        message: "You reach up and grab the chandelier. Unfortunately, the chains holding it up aren't strong. They break and the chandelier falls to the floor, shattering on impact. The chain, and part of the roof also collapse.\nThe dust clears. There is a hole in the roof, and the shattered remains of chain on the floor. Within the remains of the chain appears to be a key.",
        dropItems: ["dungeonKey"],
        setFlags: ["dungeonLampTaken"],
        removeObject: true
      }
    },
    applyWith: {
      _default: {
        message: "I'm not sure how using the wood on the chandelier would help."
      }
    }
  },

  dungeonTrapdoor: {
    names: ["trapdoor", "trap-door", "door", "hatch", "floor-door"],
    examine: "It's locked, however there is a keyhole.",
    togglable: true,
    hiddenUnlessHasFlag: "dungeonWoodTaken",
    operate: {
      open: {
        allowedVerbs: ["open", "lift"],
        message: "You open the trapdoor.",
        requireNotFlags: ["dungeonTrapdoorOpen"],
        setFlags: ["dungeonTrapdoorOpen"],
        failMessage: "The trapdoor is already open."
      },
      close: {
        allowedVerbs: ["close", "shut"],
        message: "You shut the trapdoor.",
        requireFlags: ["dungeonTrapdoorOpen"],
        unsetFlags: ["dungeonTrapdoorOpen"],
        failMessage: "The trapdoor is already closed."
      }
    },
    applyWith: {
      dungeonKey: {
        requireFlags: ["dungeonWoodTaken"],
        message: "You unlock the trapdoor",
        failMessage: "What trapdoor?",
        setFlags: ["dungeonTrapdoorUnlocked"],
        consumeItem: true
      },
      _default: {
        message: "That doesn't work on the trapdoor."
      }
    }
  },

  wall: {
    names: ["wall", "walls"],
    examine: "Solid stone. Not going through that.",
    applyWith: {
      pick3: {
        message: "You chip away at the wall. A chunk of concrete falls to the ground.",
        dropItems: ["concrete"]
      },
      _default: {
        message: (item) => `You can't use the ${item.name} on the wall.`
      }
    }
  },

  troll: {
    names: ["troll", "monster", "enemy", "creature", "beast"],
    examine: "A massive, brutish troll blocks the way. Its grey skin is covered in scars, and it watches you with hungry eyes. You'll need a weapon to deal with this.",
    combat: {
      successfulWeapons: ["sword"],

      //dodging
      dodgeChance: 0.5,
      dodgeChanceDamaged: 0.75,
      damagedPlayerThreshold: 3,

      //damage
      damageToPlayer: {
        default: 1,
        lowHealth: 2,
        lowHealthThreshold: 2
      },
      playerDodgeChance: 0.25,

      //messages
      instakillMessage: [
        "The troll barely has time to raise its axe before your blade strikes.\nIt disappears in a puff of purple smoke.",
        "Your attack catches the troll completely unprepared.\nIt vanishes in a swirl of purple smoke."
      ],
      killMessage: [
        "Your blade finds its mark. The troll collapses.\nIt disappears in a cloud of purple smoke.",
        "The troll falls to the ground, defeated.\nPurple smoke rises as it fades away."
      ],
      missMessage: [
        "The troll dodges your strike.",
        "Your attack goes wide."
      ],
      counterAttackMessage: [
        "The troll swings its axe at you.",
        "The troll brings its axe down toward you."
      ],
      playerDodgeMessage: [
        "You duck under the blow.",
        "You sidestep the attack."
      ],
      hitPlayerMessage: [
        "The axe strikes you.",
        "The blow strikes home."
      ],

      //Flavoursome messages
      wrongWeaponMessage: {
        ladder: "The ladder won't help you here.",
        pick1: "The pickaxe is too fragile for combat.",
        map: "The troll squints at the map. 'These markings mean nothing to me.'",
        wood: "The troll eyes the wood. 'That will not harm me.'",
        key: "The troll looks at the key, puzzled."
      },

      //on kill
      setFlags: ["trollGone"],
      removeOnKill: true,
    },
    applyWith: {
      _default: {
        message: "Giving that to the troll is a bad idea."
      }
    }

  },

  cavein: {
    names: ["cavein", "cave-in", "blockage", "rubble", "rocks", "debris", "stones", "collapse"],
    examine: "A pile of rubble and broken rock blocks the passage. It looks like it could be cleared with the right tool.",
    removeMessage: "\nHowever, the cavein is passable now.",
    applyWith: {
      pick1: {
        requireNotFlags: ["pick1UsedOnCavein"],
        message: "You chip away at the rubble. The frail pickaxe breaks.",
        setFlags: ["pick1UsedOnCavein"],
        consumeItem: true,
        removeObjectIfAllFlags: ["pick1UsedOnCavein", "pick2UsedOnCavein"],
        setFlagsIfAllFlags: {set: ["caveinRemoved"], required: ["pick1UsedOnCavein", "pick2UsedOnCavein"]}
      },
      pick2: {
        requireNotFlags: ["pick2UsedOnCavein"],
        message: "You clear some of the rubble. Unfortunately, the pickaxe breaks.",
        setFlags: ["pick2UsedOnCavein"],
        consumeItem: true,
        removeObjectIfAllFlags: ["pick1UsedOnCavein", "pick2UsedOnCavein"],
        setFlagsIfAllFlags: {set: ["caveinRemoved"], required: ["pick1UsedOnCavein", "pick2UsedOnCavein"]}
      },
      _combinations: [
        {
          items: ["pick1", "pick2"],
          message: "You use both of the pickaxes. Somehow, they both break in the process of clearing the rubble.",
          consumeItems: ["pick1", "pick2"],
          setFlags: ["caveinRemoved", "pick1UsedOnCavein", "pick2UsedOnCavein"],
          removeObject: true
        }
      ],
      _default: {
        message: "That won't clear the cavein."
      }
    }
  },

  ogre: {
    names: ["ogre", "monster", "enemy", "giant", "creature", "beast"],
    examine: "A towering ogre stands before you, easily twice your height. Spiked knuckles glint on its massive fists. You'll need both a weapon and protection if you hope to survive.",
    combat: {
      successfulWeapons: ["sword"],
      requiredFlags: ["helmetEquipped"],
      aggressive: true,

      //dodging
      dodgeChance: 0.3,
      dodgeChanceDamaged: 0.5,
      damagedPlayerThreshold: 3,

      //damage
      damageToPlayer: {
        default: 2,
      },
      playerDodgeChance: 0.3,

      //messages
      instakillMessage: [
        "Your blade pierces the ogre's heart before it can react.\nIt crumbles to ash and dust.",
        "The ogre falls without a sound, caught off guard.\nIts body dissolves into nothing."
      ],
      killMessage: [
        "The ogre crashes to the ground, defeated.\nIt crumbles to dust as it falls.",
        "Your blade finds its mark. The ogre collapses.\nIts form dissolves into ash."
      ],
      missMessage: [
        "The ogre shifts away from your strike.",
        "Your attack misses its mark."
      ],
      counterAttackMessage: [
        "The ogre lunges forward, fists swinging.",
        "Spiked knuckles flash toward you."
      ],
      playerDodgeMessage: [
        "You roll clear of the strike.",
        "You barely avoid the crushing blow."
      ],
      hitPlayerMessage: [
        "The spiked knuckles tear into you.",
        "Sharp metal rips across your flesh."
      ],

      //Flavoursome messages
      wrongWeaponMessage: {
        ladder: "The ladder won't help against the ogre.",
        pick1: "The pickaxe won't serve as a weapon here.",
        map: "The ogre glances at the map with disinterest.",
        key: "The ogre pays no attention to the key."
      },
      missedInstakillMessage: [
        "The ogre notices you. Your advantage is lost.",
        "The moment passes. The ogre turns its attention to you."
      ],

      //on kill
      setFlags: ["ogreGone"],
      removeOnKill: true,
    },
    applyWith: {
      _default: {
        message: "Giving that to the ogre is a bad idea."
      }
    }
  },
  riddle1: {
    names: [],
    hiddenUnlessHasFlag: "hidden",
    answer: {
      answer: ["parachute", "backpack-parachute", "chute"],
      removeOnAnswer: true,
      setFlags: ["firstRiddleSolved"],
      message: "When uttering those words, the stone door to the east grinds open.",
      riddle: "Two men are lying in the desert. They both have backpacks on. One of them is dead. What is in the backpack?"
    }
  },

  toilet: {
    names: ["toilet", "bowl", "lavatory", "loo"],
    examine: "An ordinary toilet, stained with age. Functional, if needed.",
    operate: {
      useToilet: {
        allowedVerbs: ["use", "sit", "flush"],
        requireFlags: ["hamburgerEaten"],
        message: "You use the toilet.",
        failMessage: "I don't need to go."
      }
    }
  },

  sink: {
    names: ["sink", "basin", "tap", "faucet"],
    examine: "A small porcelain sink with a tarnished tap. Still functional.",
    operate: {
      wash: {
        allowedVerbs: ["use", "wash"],
        message: "You wash your hands in the sink."
      }
    }
  },

  glass: {
    names: ["glass", "window", "barrier", "pane"],
    examine: "A thick glass wall. Rather glassy looking glass if you ask me.",
    applyWith: {
      brick1: {
        message: "You throw the brick at the glass. It shatters.",
        consumeItem: true,
        setFlags: ["glassBroken"],
        removeObject: true
      },
      brick2: {
        message: "You throw the brick at the glass. It shatters.",
        consumeItem: true,
        setFlags: ["glassBroken"],
        removeObject: true
      },
      hammer: {
        message: "You swing the hammer at the glass. It bounces off without leaving a mark."
      },
      brassHammer: {
        message: "You strike the glass with the brass hammer. Not even a scratch."
      },
      sword: {
        message: "You slash at the glass with your sword. The blade glances off harmlessly."
      },
      skull: {
        message: "You throw the skull at the glass. The skull cracks but the glass remains intact."
      },
      crucibleWithMoltenSilver: {
        message: "You pour molten silver on the glass. It cools and hardens, but the glass is undamaged."
      },
      _default: {
        message: "That won't break the glass."
      }
    }
  },

  dirt: {
    names: ["dirt", "ground", "earth", "soil", "floor"],
    examine: "It's dirt. A nice change of pace to the stone floors found in every other room.",
    applyWith: {
      shovel: {
        message: "You dig through the dirt, revealing a passage down.",
        setFlags: ["holeDug"],
        removeObject: true
      },
      sword: {
        message: "You stab at the dirt with your sword. This isn't an efficient way to dig."
      },
      hammer: {
        message: "You pound the dirt with the hammer. It compacts but doesn't clear."
      },
      _default: {
        message: "That won't help you dig."
      }
    }
  },

  mirror: {
    names: ["mirror", "glass", "reflection", "surface"],
    examine: "An enormous mirror spans the entire wall. Your reflection stares back at you.",
    operate: {
      touch: {
        allowedVerbs: ["touch", "use", "enter", "step"],
        message: "You touch the mirror. It's cold.",
        teleportMap: {
          "mirror1": "mirror2",
          "mirror2": "mirror1"
        }
      }
    }
  },

  grinder: {
    names: ["grinder", "machine", "mill", "grindstone"],
    description: "A heavy stone grinder dominates the center of the room.",
    examine: "A large grinder with heavy stone wheels. Worn but still functional.",
    applyWith: {
      concrete: {
        message: "You put the concrete into the grinder. It grinds it into fine powder.",
        consumeItem: true,
        giveItems: ["concretePowder"]
      },
      _default: {
        message: "The grinder can't grind that."
      }
    }
  },

  machine: {
    names: ["machine", "pipe", "button", "device"],
    description: "A pipe-covered machine stands here. A button can be seen deep within one of the pipes.",
    examine: "A complex mechanical device covered in pipes. Deep inside a long, narrow pipe, you can see a button.",
    applyWith: {
      screwdriver: {
        message: "You use the screwdriver to push the button through the long pipe. The machine whirs to life.",
        setFlags: ["machineOn"]
      },
      wire: {
        message: "The wire is too flexible to push the button."
      },
      sword: {
        message: "The sword is too thick to fit in the pipe."
      },
      wrench: {
        message: "The wrench won't fit in the pipe."
      },
      hammer: {
        message: "The hammer is too thick to fit."
      },
      _default: {
        message: "That won't work on the machine."
      }
    }
  },

  code: {
    names: ["code", "floor", "shadows", "glass", "skylight", "pattern"],
    description: "Light filters through the coloured glass skylight, casting patterns on the floor.",
    examine: function() {
      // Generate random color code if it doesn't exist
      if (!gameState.colorCode) {
        const colors = ["red", "blue", "yellow", "green"];
        const sequence = [];

        // Copy colors array
        for (let i = 0; i < colors.length; i++) {
          sequence.push(colors[i]);
        }

        // Shuffle the sequence
        for (let i = sequence.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
        }

        gameState.colorCode = sequence;
      }

      return `Colored glass in the skylight casts shadows on the floor. The pattern shows: ${gameState.colorCode.join(", ")}.`;
    }
  },

  barricade: {
    names: ["barricaded wooden door", "barricade", "door", "wooden door"],
    examine: "A battered wooden door. It's been covered with wooden boards, and is completely unusable in its current state.",
    operate: {
      open: {
        allowedVerbs: ["open"],
        message: "The wooden planks covering the door are forcing it shut. It's not being opened without removing those."
      }
    },
    applyWith: {
      litDynamite: {
        message: "You place the lit dynamite at the base of the door.",
        consumeItem: true,
      }
    },
    destructible: true,
    onDestruct: ["roundExplosion"]

  },

  candle: {
    names: ["candle", "flame", "light", "wick"],
    description: "A thick candle burns steadily in a candlestick.",
    examine: "A thick candle burning with a steady, bright flame.",
    operate: {
      blow: {
        allowedVerbs: ["blow", "extinguish", "put-out"],
        message: "The candle won't go out."
      }
    },
    applyWith: {
      dynamite: {
        message: "You light the dynamite with the candle flame. The fuse begins to burn.",
        consumeItem: true,
        giveItems: ["litDynamite"]
      },
      _default: {
        message: "That doesn't need to be lit."
      }
    }
  },

  bolt: {
    names: ["bolt", "nut"],
    description: "A large bolt protrudes from a panel on the wall.",
    examine: "A metal bolt protruding from a panel. It appears to be rotatable.",
    operate: {
      turn: {
        allowedVerbs: ["turn", "rotate", "move", "spin"],
        message: "It's too stiff."
      }
    },
    applyWith: {
      wrench: {
        message: "You use the wrench to loosen the bolt. You hear a clanking sound from the south.",
        setFlags: ["gateOpened"]
      },
      hammer: {
        message: "Hitting the bolt with a hammer won't loosen it."
      },
      sword: {
        message: "The sword can't grip the bolt."
      },
      screwdriver: {
        message: "The screwdriver doesn't fit the bolt properly."
      },
      brassHammer: {
        message: "The brass hammer can't loosen the bolt."
      },
      _default: {
        message: "That won't work on the bolt."
      }
    }
  },

  riddle2: {
    names: [],
    hiddenUnlessHasFlag: "hidden",
    answer: {
      answer: [],
      removeOnAnswer: true,
      setFlags: ["secondRiddleSolved"],
      message: "When uttering those words, the stone door grinds open.",
      riddle: "I am not strong, yet the strongest door cannot stand in my way. I am not rich, yet I can access things of great value. I have no friends, yet people will stand in the street to wait for me. What am I?"
    }
  },

  riddle3: {
    names: [],
    hiddenUnlessHasFlag: "hidden",
    answer: {
      answer: [],
      removeOnAnswer: true,
      setFlags: ["thirdRiddleSolved"],
      message: "When uttering those words, the stone door to the northwest grinds open.",
      riddle: "What is made of wood, but cannot be cut by even the strongest saw?"
    }
  },

  chipper: {
    names: ["chipper", "woodchipper", "wood-chipper", "wood chipper", "machine"],
    description: "An industrial wood chipper sits heavily in the room.",
    examine: "A wood chipper with a wide mouth and sharp blades inside. Looks hungry for timber.",
    applyWith: {
      wood: {
        message: "You feed the wood into the chipper. It grinds it into sawdust.",
        consumeItem: true,
        giveItems: ["sawdust"]
      },
      ladder: {
        message: "You feed the ladder into the chipper. It grinds it into sawdust.",
        consumeItem: true,
        giveItems: ["sawdust"]
      },
      dungeonWood: {
        message: "The chipper can't process that."
      },
      stepladder: {
        message: "The stepladder won't fit in the chipper."
      },
      sword: {
        message: "That's not wood."
      },
      hammer: {
        message: "The chipper is for wood, not tools."
      },
      _default: {
        message: "The chipper can only process wood."
      }
    }
  },

  redButton: {
    names: ["red button", "red-button", "red"],
    examine: "A round red button on a panel mounted to the wall.",
    operate: {
      push: {
        allowedVerbs: ["push", "press", "use"],
        message: "You push the red button.",
        buttonColor: "red",
        checkSequence: true,
        successMessage: "The ball flickers and vanishes. A glowing green key drops to the floor.",
        failMessage: "Nothing happens.",
        dropItems: ["greenKey7"]
      }
    }
  },

  blueButton: {
    names: ["blue button", "blue-button", "blue"],
    examine: "A round blue button on a panel mounted to the wall.",
    operate: {
      push: {
        allowedVerbs: ["push", "press", "use"],
        message: "You push the blue button.",
        buttonColor: "blue",
        checkSequence: true,
        successMessage: "The ball flickers and vanishes. A glowing green key drops to the floor.",
        failMessage: "Nothing happens.",
        dropItems: ["greenKey7"]
      }
    }
  },

  yellowButton: {
    names: ["yellow button", "yellow-button", "yellow"],
    examine: "A round yellow button on a panel mounted to the wall.",
    operate: {
      push: {
        allowedVerbs: ["push", "press", "use"],
        message: "You push the yellow button.",
        buttonColor: "yellow",
        checkSequence: true,
        successMessage: "The ball flickers and vanishes. A glowing green key drops to the floor.",
        failMessage: "Nothing happens.",
        dropItems: ["greenKey7"]
      }
    }
  },

  greenButton: {
    names: ["green button", "green-button", "green"],
    examine: "A round green button on a panel mounted to the wall.",
    operate: {
      push: {
        allowedVerbs: ["push", "press", "use"],
        message: "You push the green button.",
        buttonColor: "green",
        checkSequence: true,
        successMessage: "The ball flickers and vanishes. A glowing green key drops to the floor.",
        failMessage: "Nothing happens.",
        dropItems: ["greenKey7"]
      }
    }
  },

  purpleDoor: {
    names: ["purple door", "purple-door", "door", "glowing door", "glowing-door"],
    description: "",
    examine: "A heavy iron door, solid and imposing, shimmering with purple energy. A keyhole glows faintly on the right side.",
    applyWith: {
      purpleKey: {
        message: "You unlock the purple door with the glowing purple key. It swings open.",
        consumeItem: true,
        setFlags: ["purpleDoorUnlocked"],
        removeObject: true
      },
      _default: {
        message: "The door is locked."
      }
    }
  },

  silverDoor: {
    names: ["silver door", "silver-door", "door"],
    examine: "A door made from silver, tarnished over time.",
    applyWith: {
      silverKey: {
        message: "You unlock the silver door with the silver key. It swings open.",
        consumeItem: true,
        setFlags: ["silverDoorUnlocked"],
        removeObject: true
      },
      _default: {
        message: "That won't do much on the silver door."
      }
    }
  },

  redDoor: {
    names: ["red door", "red-door", "door", "glowing door", "glowing-door", "glowing red door"],
    examine: "A heavy door shimmering with red energy. There is a keyhole at the side.",
    applyWith: {
      redKey: {
        message: "You unlock the glowing red door with the red key. It swings open.",
        consumeItem: true,
        setFlags: ["redDoorOpened"],
        removeObject: true
      },
      _default: {
        message: "That won't do much on the red door."
      }
    }
  },

  marshmallow: {
    names: ["marshmallow", "enemy", "creature", "monster"],
    examine: "A massive mutant marshmallow monster. It doesn't look happy that I'm in its lair.",
    operate: {
      eat: {
        allowedVerbs: ["eat", "bite", "consume"],
        eatToKill: true
      }
    },
    combat: {
      requiredEats: 4,

      // Can't dodge being eaten
      dodgeChance: 0,
      dodgeChanceDamaged: 0,

      // Damage
      damageToPlayer: {
        default: 1
      },
      hitChance: 0.6,
      playerDodgeChance: 0.4,

      // Messages
      eatMessage: [
        "You take a bite out of the marshmallow.",
        "You chomp down on the marshmallow.",
        "You eat a chunk of the marshmallow."
      ],
      killMessage: [
        "You take the final bite. The marshmallow is defeated.",
        "The marshmallow is completely eaten and gone."
      ],
      counterAttackMessage: [
        "The marshmallow swings at you.",
        "The marshmallow retaliates with a sticky blow."
      ],
      playerDodgeMessage: [
        "You dodge the attack.",
        "You avoid the gooey strike."
      ],
      hitPlayerMessage: [
        "The marshmallow hits you.",
        "The sticky blow connects."
      ],

      // Wrong weapon messages
      wrongWeaponMessage: {
        sword: "You swing your sword at the marshmallow. It gets stuck in the gooey surface."
      },

      // On kill
      setFlags: ["marshmallowGone"],
      removeOnKill: true
    },
    applyWith: {
      sword: {
        message: "You swing your sword at the marshmallow. It gets stuck in the gooey surface."
      },
      _default: {
        message: "That won't work on the marshmallow."
      }
    }
  },

  forge: {
    names: ["forge", "furnace", "fire", "hearth"],
    description: "",
    examine: "A large stone forge, currently cold. It needs fuel and heat to be useful.",
    applyWith: {
      coal: {
        message: "You place the coal in the forge.",
        consumeItem: true,
        setFlags: ["coalInFurnace"]
      },
      crucibleSilver: {
        requireFlags: ["furnaceHeated"],
        message: "You place the crucible on the heated forge. The silver wire begins to melt.",
        consumeItem: true,
        addObjects: ["crucibleMelt"],
        failMessage: "The forge needs to be heated first."
      },
      _default: {
        message: "That doesn't belong in the forge."
      }
    }
  },

  bellows: {
    names: ["bellows", "bellow", "pump", "air-pump", "air pump", "blower"],
    examine: "Heavy leather bellows attached to the forge. Used for stoking flames to extreme heat.",
    operate: {
      pump: {
        allowedVerbs: ["use", "pump", "operate"],
        requireFlags: ["coalInFurnace"],
        message: "You pump the bellows. The coal ignites and the furnace heats up.",
        setFlags: ["furnaceHeated"],
        failMessage: "There's no coal in the furnace."
      }
    }
  },

  crucibleMelt: {
    names: ["crucible", "molten silver", "molten-silver", "hot crucible", "hot-crucible", "melting crucible", "melting-crucible"],
    description: "A hot crucible sits on the forge, filled with molten silver.",
    examine: "The crucible sits on the furnace, silver bubbling and glowing white-hot inside. Too hot to touch.",
    applyWith: {
      tongs: {
        message: "You carefully pick up the hot crucible with the tongs.",
        consumeItem: true,
        giveItems: ["crucibleTongs"],
        removeObject: true
      },
      _default: {
        message: "It's too hot to handle without proper tools."
      }
    }
  },

  mold: {
    names: ["mold", "mould", "key mold", "key-mold", "key mould", "key-mould", "cast"],
    examine: "A metal casting mold in the shape of a key.",
    applyWith: {
      crucibleTongs: {
        message: "You pour the molten silver into the mold. It begins to cool and take shape.",
        consumeItem: true,
        dropItems: ["silverMold"]
      },
      _default: {
        message: "That won't fit in the mold."
      }
    }
  },

  slackTub: {
    names: ["slack tub", "slack-tub", "slacktub", "tub", "water", "bucket"],
    examine: "A deep tub filled with cool water. Used for rapidly cooling hot metal.",
    applyWith: {
      silverMold: {
        message: "You plunge the mold into the slack tub. The water hisses as the silver cools rapidly. A silver key falls out of the mold.",
        consumeItem: true,
        dropItems: ["silverKey"]
      },
      _default: {
        message: "That doesn't need to be cooled."
      }
    }
  },

  fire: {
    names: ["fire", "flames", "blaze", "inferno"],
    examine: "Intense flames roar here, making the entire room swelteringly hot. There's no way I can get through this.",
    applyWith: {
      extinguisher: {
        message: "You spray the fire extinguisher. The flames die down and extinguish.",
        consumeItem: true,
        giveItems: ["spentExtinguisher"],
        setFlags: ["fireExtinguished"],
        removeObject: true
      },
      cup: {
        message: "The cup doesn't hold nearly enough water to extinguish this fire."
      },
      parachute: {
        message: "I don't want to risk burning the parachute."
      },
      _default: {
        message: "That won't put out the fire."
      }
    }
  },

  lake: {
    names: ["lake", "water"],
    examine: "A vast underground lake of dark, still water. Far too deep and cold to cross safely.",
    applyWith: {
      sawdust: {
        message: "You drop the sawdust into the lake. There's so much, it completely fills and starts to float, creating a safe passage north.", // dont like fix
        consumeItem: true,
        setFlags: ["lakeFilled"]
      },
      _default: {
        message: "That won't help with the lake."
      }
    }
  },

  hatbox: {
    names: ["hatbox", "hat box", "hat-box", "box"],
    description: "A decorative hatbox sits in the corner.",
    examine: "A hatbox. Wonder what's inside.",
    operate: {
      open: {
        allowedVerbs: ["open", "use"],
        message: "You open the hatbox. Inside is a hidden passage leading downwards.",
        setFlags: ["hatboxOpened"]
      }
    }
  },

  cyclops: {
    names: ["cyclops", "giant", "monster", "enemy", "creature"],
    examine: "From here, I can see a pretty standard looking cyclops, and I'm not going any closer to further examine it.",
    sayTrigger: {
      word: "ulysses",
      message: "Upon hearing the name 'Ulysses', the cyclops panics and flees from the room!",
      setFlags: ["cyclopsGone"],
      removeObject: true
    },
    combat: {
      successfulWeapons: ["sword", "pick3"],

      // Dodge chances
      dodgeChance: 0.6,
      dodgeChanceDamaged: 0.6,

      // Damage - 20% chance for 2 damage, otherwise 1
      damageToPlayer: {
        default: 1,
        randomDamage: [1, 2],
        randomChance: 0.2
      },
      playerDodgeChance: 0.2,

      // Messages
      instakillMessage: [
        "Your attack catches the cyclops off guard. It falls with a thunderous crash.",
        "The cyclops collapses before it can react."
      ],
      killMessage: [
        "The cyclops falls to the ground, defeated.",
        "With a final roar, the cyclops collapses."
      ],
      missMessage: [
        "The cyclops dodges your attack.",
        "Your attack goes wide."
      ],
      counterAttackMessage: [
        "The cyclops swings its massive fist at you.",
        "The cyclops lunges forward with a crushing blow."
      ],
      playerDodgeMessage: [
        "You dodge the cyclops' attack.",
        "You narrowly avoid the crushing blow."
      ],
      hitPlayerMessage: [
        "The cyclops' fist connects with brutal force.",
        "The blow strikes you hard."
      ],

      // Wrong weapon messages
      wrongWeaponMessage: {
        hammer: "The hammer won't be effective against the cyclops.",
        ladder: "The ladder won't help you here."
      },

      // On kill
      setFlags: ["cyclopsGone"],
      removeOnKill: true
    },
    applyWith: {
      _default: {
        message: "The cyclops won't accept that."
      }
    }
  },

  bell: {
    names: ["bell", "church-bell", "tower-bell"],
    description: "A large brass bell is suspended overhead. It's missing its clapper.",
    examine: "A massive brass bell hanging from the ceiling. Tarnished with age.",
    applyWith: {
      brassHammer: {
        message: "You ring the bell with the brass hammer. The sound echoes loudly through the building. You hear the sound of shattering glass from elsewhere.",
        triggerEffects: ["case"]
      },
      hammer: {
        message: "The regular hammer doesn't produce the right tone."
      },
      _default: {
        message: "That won't ring the bell properly."
      }
    }
  },

  case: {
    names: ["case", "glass-case", "display-case", "display"],
    description: "A glass display case shows off its treasure, a glowing green key.",
    examine: "A glass trophy case. Contained inside is a glowing green key.",
    triggerEffects: {
      setFlags: ["caseShattered"],
      dropItems: ["greenKey6"],
      removeOnTrigger: true,
      room: "case"
    }
  },

  blueDoor: {
    names: ["blue door", "blue-door", "door", "stone door", "stone-door"],
    examine: "The shimmering blue wall has a keyhole visible at its centre.",
    applyWith: {
      blueKey: {
        message: "You unlock the blue door with the blue key. It swings open.",
        consumeItem: true,
        setFlags: ["blueDoorUnlocked"],
        removeObject: true
      },
      _default: {
        message: "The door is locked."
      }
    }
  },

  vendingMachine: {
    names: ["vending machine", "vending-machine", "machine", "vendor"],
    description: "An old vending machine hums quietly in the corner.",
    examine: "An old vending machine humming quietly. Inside is a singular hamburger, kept warm for whoever knows how long.",
    applyWith: {
      coin: {
        message: "You insert the coin into the machine. A hamburger drops into the dispenser tray.",
        consumeItem: true,
        dropItems: ["hamburger"],
        requireNotFlags: ["vendingMachineUsed"],
        setFlags: ["vendingMachineUsed"]
      },
      pick3: {
        message: "You jam the pickaxe into the machine's mechanism. Something falls out, but it looks... questionable.",
        dropItems: ["hamburgerPoisoned"],
        requireNotFlags: ["vendingMachineUsed"],
        setFlags: ["vendingMachineUsed"]
      },
      sword: {
        message: "Stabbing the vending machine won't get you a free snack."
      },
      hammer: {
        message: "Hitting the machine might damage it, but it won't dispense anything."
      },
      brick1: {
        message: "Smashing the machine would be vandalism, and you'd still be hungry."
      },
      brick2: {
        message: "Smashing the machine would be vandalism, and you'd still be hungry."
      },
      map: {
        message: "This machine only takes coins, not maps."
      },
      _default: {
        message: "The vending machine doesn't respond to that."
      }
    }
  },

  door: {
    names: ["door", "final door", "final-door", "eight door", "eight-door", "green door", "green-door"],
    examine: "A massive door adorned with intricate glowing green metalwork. Eight glowing keyholes are stacked vertically down the right hand side.",
    removeMessage: "\nHowever, the door is now open.",
    applyWith: {
      _progressiveCombination: {
        items: ["greenKey1", "greenKey2", "greenKey3", "greenKey4", "greenKey5", "greenKey6", "greenKey7", "greenKey8"],
        singleMessage: "You insert a green key. It clicks into place.",
        multiMessage: "You insert {count} green keys. They click into place.",
        completeMessage: "You insert the final key(s). The door unlocks with a satisfying click and swings open.",
        incompleteSuffix: " {remaining} more needed.",
        completionFlag: "doorUnlocked",
        removeOnComplete: true
      },
      _default: {
        message: "The door has eight keyholes for green keys."
      }
    }
  }
}
