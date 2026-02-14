const rooms = {
  start: {
    name: "The Dungeon",
    hideItemDescriptions: ["dungeonWood", "dungeonKey"],
    look: () => {
      let parts = [];

      // Opening - always present
      parts.push("You stand in a dimly lit stone chamber.");

      // Ceiling state
      if (gameState.flags.includes("dungeonLampTaken")) {
        parts.push("A hole gapes in the ceiling where the chandelier once hung, debris scattered on the floor below.");
      } else {
        parts.push("An ornate chandelier hangs from chains above, casting flickering shadows across the walls.");
      }

      // Floor/wood/trapdoor state
      if (gameState.flags.includes("dungeonWoodTaken")) {
        if (gameState.flags.includes("dungeonTrapdoorOpen")) {
          parts.push("The trapdoor lies open, revealing darkness below.");
        } else {
          parts.push("A trapdoor is set into the stone floor.");
        }
      } else {
        parts.push("The floor is covered with loose wooden boards.");
      }

      // Walls - only mentioned when both items taken (clears the view)
      if (gameState.flags.includes("dungeonLampTaken") &&
          gameState.flags.includes("dungeonWoodTaken")) {
        parts.push("The chamber's thick walls are ancient and weathered, crumbling to a coarse, granular texture.");
      }

      return parts.join(" ");
    },
    restrictedPassages: {
      up: {
        requirements: [
          {roomItems: ["stepladder", "ladder"], failMessage: "I can't reach that high without something to stand on.", unmetDescription: ""}
        ],
        room: "five",
        metDescription: "The ladder reaches up to the hole in the ceiling."
      },
      down: {
        requirements: [
          {flag: "dungeonWoodTaken", failMessage: "There's no way down."},
          {flag: "dungeonTrapdoorUnlocked", failMessage: "The trapdoor is locked.", unmetDescription: "There's a locked trapdoor in the floor."},
          {flag: "dungeonTrapdoorOpen", failMessage: "The trapdoor is closed.", unmetDescription: "There is a closed trapdoor in the floor."}
        ],
        room: "cellar",
        metDescription: "An unlocked trapdoor leads down."
      }
    },
    items: ["dungeonWood"],
    objects: ["dungeonLamp", "dungeonTrapdoor"],
    disallowedTakes: {
      chains: {
        names: ["chains", "chain", "chandelier chains"],
        message: () => {
          if (gameState.flags.includes("dungeonLampTaken")) {
            return "The shattered remains of the chain lie scattered on the floor, bits of twisted metal too small or sharp to bother messing with.";
          }
          return "The chains are firmly anchored to the ceiling.";
        },
        examine: () => {
          if (gameState.flags.includes("dungeonLampTaken")) {
            return "Broken links of rusted iron, twisted and scattered where they fell.";
          }
          return "Heavy iron chains suspend the ornate chandelier, links darkened with age.";
        },
        apply: {
          key: "Although I appreciate your concern for wanting to fix broken decor, putting one loop back won't do much good."
        }
      },
      hole: {
        names: ["hole", "ceiling hole", "opening", "gap"],
        message: "I can't take a hole.",
        examine: "A ragged opening in the stone ceiling where the chandelier once hung.",
        operate: {
          climb: "It's too high to reach without a ladder.",
          reach: "It's too high to reach without a ladder.",
          grab: "It's too high to reach without a ladder.",
          scale: "It's too high to reach without a ladder.",
          enter: "It's too high to reach without a ladder."
        },
        hiddenUnlessHasFlag: "dungeonLampTaken"
      },
      debris: {
        names: ["debris", "rubble", "chunks"],
        message: "The sharp edges and heavy pieces make it unwise to handle.",
        examine: "Chunks of broken ceiling scattered across the floor, remnants of where the chandelier tore free.",
        hiddenUnlessHasFlag: "dungeonLampTaken"
      }
    },
    light: true
  },
  cellar: {
    name: "The Cellar",
    look: "A damp cellar, mostly empty.",
    passages: {north: "start"},
    items: ["stepladder"],
    disallowedTakes: {
      moisture: {
        names: ["moisture", "dampness", "damp", "wetness"],
        message: "It's everywhere, but not something I can pick up.",
        examine: "A slight wetness that fills the room and gives it an old mouldy smell."
      },
      mildew: {
        names: ["mildew", "fungus", "growth", "patches"],
        message: "I'm not touching that.",
        examine: "It's covering the walls in large patches, and is giving the room an old mouldy smell."
      },
      smell: {
        names: ["smell", "odour", "odor", "stench", "mustiness", "mould", "mold", "mouldy smell", "moldy smell"],
        message: "It's a bit tricky to take the mouldy smell, unless you include the scent in my nose. That smell is coming with me anyway.",
        examine: "A mouldy, wet odour that is not altogether unpleasant. That being said, it doesn't smell great."
      }
    },
    light: true
  },
  five: {
    name: "The room with five passages",
    look: "A circular room with five passages leading in different directions.",
    passages: {northwest: "start", north: "sand", east: "pick1", southeast: "three", south: "three"},
    items: ["lantern", "compass"],
    light: true
  },
  three: {
    name: "The room with three passages",
    look: {
      base: "A triangular room with three visible passages.",
      parts: [
        {text: "The southern wall shimmers faintly, as if hiding something.", if: "hasMap"}
      ]
    },
    passages: {northwest: "hammer1", north: "five", northeast: "five"},
    restrictedPassages: {
      south: {
        requirements: [
          {item: "map", failMessage: "There's a wall there.", backFailMessage: "I can't go back without the map."}
        ],
        room: "magic",
        hidden: true
      }
    },
    items: [],
    disallowedTakes: {
      shimmer: {
        names: ["shimmer", "shimmering", "glow", "glimmer"],
        message: () => {
          if (!gameState.flags.includes("hasMap")) {
            return "I can't find that.";
          }
          return "That's the state the wall is in, not exactly something I can take.";
        },
        examine: () => {
          if (!gameState.flags.includes("hasMap")) {
            return "I can't find that.";
          }
          return "A purple sparkling glow, phasing in and out of the wall.";
        },
        allIgnore: true
      }
    },
    light: true
  },
  hammer1: {
    name: "The Hammer room",
    look: "A small workshop.",
    passages: {southwest: "deadEnd1", southeast: "three"},
    items: ["hammer"],
    disallowedTakes: {
      workshop: {
        names: ["workshop"],
        message: "I don't think the workshop would fit in my pocket.",
        examine: "It's small, but functional, built for hands-on work."
      }
    }
  },
  deadEnd1: {
    name: "A Dead end",
    look: "It doesn't look like this path will take me any further.",
    passages: {south: "hammer1"},
    items: ["skull"],
    disallowedTakes: {
      dead: {
        names: ["dead"],
        message: "Dead what?",
        examine: "I can't see ghosts!",
        allIgnore: true
      },
      end: {
        names: ["end"],
        message: "The end of what, exactly?",
        examine: "It's a room where the path stops.",
        allIgnore: true
      },
      deadEnd: {
        names: ["dead end", "deadend", "dead-end"],
        message: "If I took this with me, I'd get nowhere.",
        examine: "The passage ends. I can make no more progress here.",
        allIgnore: true
      }
    }
  },
  sand: {
    name: "The Sandy room",
    look: {
      parts: [
        {text: "This room is full of sand.", if: "nailsTaken"},
        {text: "This room is full of sand, shining in the light of my lantern.", unless: "nailsTaken"}
      ]
    },
    passages: {west: "five", northeast: "pick1"},
    items: ["nails"],
    disallowedTakes: {
      sand: {
        names: ["sand"],
        message: "If I pick that up, it will go all throughout my pocket, and I will never get rid of it.",
        examine: "Soft white sand. Exactly the sort that sticks to everything.",
        apply: {
          shovel: "You dig in the sand. It's quite shallow, revealing a stone floor beneath. You fill up the hole, can't forget about saftey!"
        }
      },
      shine: {
        names: ["shine", "shining", "glint", "glinting", "glimmer", "sparkle", "sparkling"],
        message: () => {
          if (gameState.flags.includes("nailsTaken")) {
            return "I can't find that.";
          }
          return "I can't take the shine itself, but I could probably find what it's glinting off.";
        },
        examine: () => {
          if (gameState.flags.includes("nailsTaken")) {
            return "I can't find that.";
          }
          return "Taking a closer look at the sand reveals it is full of nails! That would be what is glinting in the light.";
        },
        allIgnore: true
      },
      light: {
        names: ["light"],
        message: () => {
          if (gameState.flags.includes("nailsTaken")) {
            return "I can't find that.";
          }
          return "I've already got the lantern, and the sand isn't producing any light. Just reflecting it.";
        },
        examine: () => {
          if (gameState.flags.includes("nailsTaken")) {
            return "I can't find that.";
          }
          return "Why does light always seem brighter when reflecting off of something shiny?";
        },
        allIgnore: true
      }
    }
  },
  pick1: {
    name: "The Pickaxe room",
    look: "A bare room with little of interest.",
    passages: {west: "sand", south: "five", east: "tall"},
    items: ["pick1"],
    failedBackText: "There's no hole in the roof?!",
    disallowedTakes: {
      interest: {
        names: ["interest"],
        message: "While I say there is little of that here, what I mean is none.",
        examine: "Ooh interesting!",
        allIgnore: true
      },
      bear: {
        names: ["bear"],
        message: "While this is the room that would contain bears, unfortunately, they seem to have left.",
        examine: "Any of a family (Ursidae of the order Carnivora) of large heavy mammals of the Americas and Eurasia that have long shaggy hair, short tails, and plantigrade feet with nonretractile claws and that are mainly omnivorous but include some that are primarily carnivorous (as the polar bear) or herbivorous (as the giant panda).",
        allIgnore: true
      }
    }
  },
  tall: {
    name: "The Tall room",
    look: "A very tall room, with a roof so high you can't make it out.",
    passages: {west: "pick1"},
    restrictedPassages: {
      up: {
        requirements: [
          {roomItems: ["ladder"], failMessage: "The hole is too high to reach", unmetDescription: "A hole can be seen far above."}
        ],
        room: "sword",
        metDescription: "A tall ladder stands here, reaching up to a hole in the wall."
      }
    },
    items: [],
  },
  magic: {
    name: "The Magical room",
    look: "A plain room with bare stone walls. Nothing here suggests anything magical.",
    passages: {southwest: "drop"},
    restrictedPassages: {
      east: {
        requirements: [
          {item: "map", failMessage: "There's a wall there.", backFailMessage: "I can't go back without the map."}
        ],
        room: "three",
        hidden: true
      },
      west: {
        requirements: [
          {flag: "caveinRemoved", failMessage: "The passage west is blocked by rubble", unmetDescription: "The western passage is blocked by a cave-in."}
        ],
        room: "armory",
        metDescription: "The western passage is clear."
      },
      southeast: {
        requirements: [
          {flag: "trollGone", failMessage: "A troll blocks the southeastern passage", unmetDescription: "A troll is standing in front of the southeastern passage."}
        ],
        room: "pick2",
        metDescription: "A passage to the southeast leads over the troll's corpse."
      }
    },
    objects: ["cavein", "troll"],
    disallowedTakes: {
      "cave-in": "There's too much rubble to carry.",
      "cavein": "There's too much rubble to carry.",
      bear: {
        names: ["bear"],
        message: "While this is the room that would contain bears, unfortunately, they seem to have left.",
        examine: "Any of a family (Ursidae of the order Carnivora) of large heavy mammals of the Americas and Eurasia that have long shaggy hair, short tails, and plantigrade feet with nonretractile claws and that are mainly omnivorous but include some that are primarily carnivorous (as the polar bear) or herbivorous (as the giant panda).",
        allIgnore: true
      },
      magical: {
        names: ["magical", "magic"],
        message: "There's nothing magical here to take.",
        examine: "Sadly, there's nothing extraordinary here."
      }
    },
    items: [],
    light: true
  },
  drop: {
    name: "The Hole room",
    look: "The path ends at a gaping hole in the floor. Peering down, you see nothing but darkness far below.",
    passages: {north: "magic"},
    restrictedPassages: {
      down: {
        requirements: [
          {flag: "parachuteEquipped", failMessage: "The drop looks deadly. I need something to break my fall"}
        ],
        room: "hub",
        metDescription: "With the parachute equipped, I could safely jump down the hole."
      }
    },
    entryMessages: {
      down: "Down\nyou\ngo\n...\n\nYou decide it's probably a good idea to open your parachute, so do that.\nAfter a long decent, you land on solid ground, and put the parachute back into the pack."
    },
    items: [],
    disallowedTakes: {
      darkness: {
        names: ["darkness"],
        message: "That would require jumping down the hole. Not worth it in my opinion.",
        examine: "It's dark? I'm not sure how you expect me to see the lack of light...",
        allIgnore: true
      },
      hole: {
        names: ["hole", "gap", "pit"],
        message: "As much as I would love to place a hole on the ground and jump through any floor I want, this isn't a cartoon.",
        examine: "It's very deep, and doesn't seem like a good idea to check exactly how deep."
      }
    }
  },
  sword: {
    name: "The Sword room",
    look: "A very small room. Looks like it used to store things.",
    passages: {west: "tall"},
    restrictedPassages: {
      south: {
        requirements: [
          {flag: "helmetEquipped", failMessage: "Those sounds are terrifying! I don't want to go that way without proper protection.", unmetDescription: "Ominous grunting and heavy footsteps echo from the south."}
        ],
        room: "ogre",
        metDescription: "A passage to the south leads toward the ogre."
      }
    },
    items: ["sword"],
    disallowedTakes: {
      things: {
        names: ["things"],
        message: "There aren't any here any more.",
        examine: "There aren't any here any more.",
        allIgnore: true
      }
    }
  },
  ogre: {
    name: "The Ogre room",
    look: "The entrance to what appears to be a temple.",
    passages: {north: "sword"},
    restrictedPassages: {
      east: {
        requirements: [
          {flag: "ogreGone", failMessage: "I doubt the ogre would allow that.", unmetDescription: "A huge ogre is here glaring at me, menacingly. He starts charging."}
        ],
        room: "riddle1",
        metDescription: "The eastern passage is clear now that the ogre is dead."
      }
    },
    objects: ["ogre"],
    disallowedTakes: {
      entrance: {
        names: ["entrance"],
        message: "What do you mean? I can't just rip a doorway out of the wall like that!",
        examine: "A doorway, made from carved marble blocks.",
        allIgnore: true
      },
      temple: {
        names: ["temple"],
        message: "Hmm, yes let's just pick up this large building and put it in my pocket, yes?",
        examine: "An underground temple. It's made from carved marble blocks."
      },
      marble: {
        names: ["marble", "block"],
        message: "That's a part of the wall!",
        examine: "It's white? With streaks? What would you expect from a block of marble?",
        allIgnore: true
      }
    },
    items: [],
    light: true
  },
  riddle1: {
    name: "The Riddle room",
    look: "Ancient texts cover the walls. There's a podium in the middle of the room, with a stone tablet secured on top.",
    passages: {west: "ogre"},
    restrictedPassages: {
      east: {
        requirements: [
          {flag: "firstRiddleSolved", failMessage: "I'm not getting through that door until it opens.", unmetDescription: "A heavy stone door is barring the eastern passage."}
        ],
        room: "parachute",
        metDescription: "The stone door to the east has opened."
      }
    },
    disallowedTakes: {
      texts: {
        names: ["texts", "ancient texts", "text", "writing", "writings"],
        message: "It's carved into the stone, and I don't have the tools to make a copy.",
        examine: "It's in a language I don't understand."
      },
      podium: {
        names: ["podium"],
        message: "The podium is made from a singular block of marble, carved into shape. It would be far too heavy.",
        examine: "It's made of marble, elegantly carved."
      },
      tablet: {
        names: ["tablet", "stone tablet"],
        message: "Something's giving me the feeling I shouldn't move this...",
        examine: "The stone tablet says: \"Two men are lying in the desert. They both have backpacks on. One of them is dead. What is in the backpack?\""
      }
    },
    items: [],
    objects: ["riddle1"],
    light: true
  },
  parachute: {
    name: "The Parachute room",
    look: "This room looks like a sort of shrine, with a pedestal in the middle. There's a hole in the roof.",
    passages: {west: "riddle1"},
    failedBackText: "I can't climb up that hole.",
    items: ["parachute"],
    disallowedTakes: {
      shrine: {
        names: ["shrine"],
        message: "I can't pick up something while I'm inside of it",
        examine: "A small shrine. The pedestal in the center seems to be the focal point."
      },
      pedestal: {
        names: ["pedestal", "stand"],
        message: "The pedestal is far too heavy to pick up",
        examine: "A short pedestal, carved from a single block of marble, like everything in this place."
      },
      hole: {
        names: ["hole", "opening"],
        message: "I can't take a hole",
        examine: "As far as I can see, it goes straight up. No chance that's a path I can go.",
        allIgnore: true
      }
    },
    light: true
  },
  pick2: {
    name: "The Troll's Den",
    look: "A foul-smelling cave littered with bones.",
    passages: {north: "magic"},
    items: ["pick2"],
    disallowedTakes: {
      bones: {
        names: ["bones"],
        message: "I'd rather not touch those",
        examine: "They are a variety of sizes, and as such likely come from a variety of sources... That's a nice thought."
      },
      bone: {
        names: ["bone"],
        message: "I'd rather not touch that",
        examine: "One bone among many scattered across the floor.",
        allIgnore: true
      },
      corpse: {
        names: ["corpse", "body", "remains"],
        message: "I don't know what these bones belonged to, but I'm not touching them",
        examine: "An old set of bones, scraps of old skin holding them in shape. I don't recognize the creature it used to be."
      },
      skeleton: {
        names: ["skeleton"],
        message: "Best left alone",
        examine: "Thankfully, it doesn't seem to be human, although it's been mauled badly enough that I guess it could be?"
      },
      cave: {
        names: ["cave", "den"],
        message: "The cave is rather large to carry",
        examine: "A small cave, fashioned as a home. I don't think the resident will be making an appearance for a while."
      },
      debris: {
        names: ["debris", "rubble", "refuse"],
        message: "I'm not touching that. It is an unrecognizable pile of filth",
        examine: "An unrecognizable pile of filth."
      },
      smell: {
        names: ["smell", "stench", "odor", "reek"],
        message: "Even if I could take it I wouldn't want to",
        examine: "It smells primarily of rotting flesh, but with a hint of something you've never smelt before.",
        allIgnore: true
      },
      skin: {
        names: ["skin"],
        message: "I'd rather not touch that",
        examine: "It's dry, and stretched taut. There are little bits of fur clinging to it."
      },
      flesh: {
        names: ["flesh", "rotting flesh", "rot"],
        message: "I can't actually find any of that here, it just smells like it",
        examine: "I can't actually find any of that here, it just smells like it."
      },
      filth: {
        names: ["filth"],
        message: "Yeah no",
        examine: "It looks disgusting."
      }
    }
  },
  armory: {
    name: "The Armory",
    look: "An armory, once filled with weapons of war, now mostly empty.",
    passages: {north: "magic"},
    failedBackText: "The hole in the roof closed up, somehow.",
    items: ["helmet"],
    disallowedTakes: {
      weapons: {
        names: ["weapons"],
        message: "There are no weapons left to take",
        examine: "There's none here."
      },
      weapon: {
        names: ["weapon"],
        message: "There is no weapon left to take",
        examine: "There's none here.",
        allIgnore: true
      },
      armory: {
        names: ["armory"],
        message: "I can't take an armory",
        examine: "It looks like it used to store weapons. For what, I have no clue..."
      },
      rack: {
        names: ["rack", "stand"],
        message: "It's bolted to the wall",
        examine: "It's empty."
      }
    },
  },
  hub: {
    name :"The Hub",
    look: "A large circular shaped room, passages branching in many directions. There's a hole in the roof.",
    passages: {
      west: "toilet",
      northeast: "sink",
      east: "maze1",
      southeast: "blueCake",
      south: "greenCake",
      southwest: "redCake",
    },
    restrictedPassages: {
      north: {
        requirements: [
          {item: "map", failMessage: "There's a wall there.", backFailMessage: "I can't go back without the map."}
        ],
        room: "pick1",
        showAsNormal: true
      }
    },
    entryMessages: {
      north: "You slip down a stone slide, falling through a hole in the roof, which somehow, abruptly closes."
    },
    failedBackText: "There's no hole in the roof?..",
    items: [],
    disallowedTakes: {
      hole: {
        names: ["hole", "opening"],
        message: "I can't take a hole",
        examine: "That leads back up, although I have no way of going that way.",
        allIgnore: true
      }
    },
    isCheckpoint: true
  },
  toilet: {
    name: "The Lavatory",
    look: "A small room, with a toilet front and centre.",
    passages: {east: "hub"},
    items: [],
    objects: ["toilet"]
  },
  sink: {
    name: "The Washroom",
    look: "A small room with a sink. Good thing to have around.",
    passages: {south: "hub"},
    items: [],
    objects: ["sink"],
    disallowedTakes: {
      porcelain: {
        names: ["porcelain"],
        message: "The porcelain is part of the sink",
        examine: "White porcelain, slightly stained from age.",
        allIgnore: true
      }
    }
  },
  redCake: {
    name: "The Red Cake room",
    look: "This room is red everywhere, red lights, red walls, even the air seems red.",
    passages: {
      west: "redCake",
      north: "hub",
      northeast: "greenCake",
      east: "redCake",
      southeast: "redCake",
      south: "blueCake",
      southwest: "redCake",
    },
    items: ["redCake"],
    disallowedTakes: {
      table: {
        names: ["table"],
        message: "It's stuck to the floor with... red paint",
        examine: "A short coffee table, ideal for holding cakes."
      },
      lights: {
        names: ["lights"],
        message: "I'm not sure how you want me to accomplish that",
        examine: "The light is being filtered through red glass of some kind."
      },
      light: {
        names: ["light"],
        message: "I'm not sure how you want me to accomplish that",
        examine: "The light is being filtered through red glass of some kind.",
        allIgnore: true
      },
      red: {
        names: ["red", "redness", "color", "colour"],
        message: "You are now red",
        examine: "It's bright red, and a little overwhelming.",
        allIgnore: true
      },
      glass: {
        names: ["glass"],
        message: "It's in the wall",
        examine: "It's tinted red."
      }
    },
    light: true
  },
  greenCake: {
    name: "The Green Cake room",
    look: "Everything is green here, it's making you feel slightly nauseated.",
    passages: {
      northwest: "redCake",
      north: "hub",
      east: "blueCake"
    },
    items: ["greenCake"],
    disallowedTakes: {
      bench: {
        names: ["bench"],
        message: "It's stuck to the floor with... green paint",
        examine: "A short bench, ideal for holding cakes."
      },
      lights: {
        names: ["lights"],
        message: "I'm not sure how you want me to accomplish that",
        examine: "The light is being filtered through green glass of some kind."
      },
      light: {
        names: ["light"],
        message: "I'm not sure how you want me to accomplish that",
        examine: "The light is being filtered through green glass of some kind.",
        allIgnore: true
      },
      green: {
        names: ["green", "greenness", "color", "colour"],
        message: "You are now green",
        examine: "It's bright green, and a little overwhelming.",
        allIgnore: true
      },
      glass: {
        names: ["glass"],
        message: "It's in the wall",
        examine: "It's tinted green."
      }
    },
    light: true
  },
  blueCake: {
    name: "The Blue Cake room",
    look: "You can see nothing but blue. At least there are multiple shades of it.",
    passages: {
      north: "hub",
      southeast: "dusty",
      south: "redCake",
      southwest: "greenCake"
    },
    items: ["blueCake"],
    disallowedTakes: {
      lights: {
        names: ["lights"],
        message: "I'm not sure how you want me to accomplish that",
        examine: "The light is being filtered through blue glass of some kind."
      },
      light: {
        names: ["light"],
        message: "I'm not sure how you want me to accomplish that",
        examine: "The light is being filtered through blue glass of some kind.",
        allIgnore: true
      },
      blue: {
        names: ["blue", "blueness", "color", "colour"],
        message: "You are now blue",
        examine: "It's bright blue, and a little overwhelming.",
        allIgnore: true
      },
      glass: {
        names: ["glass"],
        message: "It's in the wall",
        examine: "It's tinted blue."
      },
      shades: {
        names: ["shades"],
        message: "You are now multiple shades",
        examine: "Various shades of blue fill the room.",
        allIgnore: true
      },
      shade: {
        names: ["shade"],
        message: "You are now a shade",
        examine: "One of many shades of blue in the room.",
        allIgnore: true
      }
    },
    light: true
  },
  dusty: {
    name: "The Dusty room",
    look: "This room is extremely dusty. It's a little hard to breathe in here.",
    passages: {
      north: "blueCake",
      northeast: "dust",
      east: "dust",
      southeast: "dust",
      south: "dust",
      southwest: "dust",
      west: "dust",
      northwest: "dust"
    },
    items: [],
    disallowedTakes: {
      dust: {
        names: ["dust"],
        message: "I'm not picking up dust",
        examine: "It's quite thick, suggesting it's been building up for quite some time."
      }
    }
  },
  dust: {
    name: "The Dust room",
    look: "This room is full of dust. Breathing isn't the easiest here.",
    passages: {
      north: "nose",
      northeast: "dusty",
      east: "dusty",
      southeast: "dusty",
      south: "dusty",
      southwest: "dusty",
      west: "dusty",
      northwest: "dusty"
    },
    items: [],
    disallowedTakes: {
      dust: {
        names: ["dust"],
        message: "I'm not picking up dust",
        examine: "It's quite thick, suggesting it's been building up for quite some time."
      }
    }
  },
  nose: {
    name: "The Nose room",
    look: "A room shaped like a nose! Who'd have thought it.",
    passages: {
      east: "dust",
      south: "topGlass",
      west: "topGlass"
    },
    failedBackText: "It's a little too high to reach, with a boost I could get up though.",
    items: [],
    restrictedPassages: {
      up: {
        requirements: [
          {roomItems: ["stepladder"], failMessage: "I am dubious about my getting up that way.", unmetDescription: "There's a hole in the ceiling, but it looks like it's for coming not going."}
        ],
        room: "greenKey1",
        metDescription: "There's a stepladder placed here, with some scrambling I reckon I could get up."
      }
    },
    items: [],
    disallowedTakes: {
      snot: {
        names: ["snot", "boogers", "booger", "mucus"],
        message: "Although this room is shaped exactly like a standard nose, there's no mucus here",
        examine: "Fortunately, there's very little of that here!",
        allIgnore: true
      },
      nosehairs: {
        names: ["nose hairs", "nose hair", "nosehairs", "nosehair", "hairs", "hair"],
        message: "Even if there were nose hairs here, I'm not going to touch those",
        examine: "Thankfully, this isn't actually a giant nose, so there are no nose hairs."
      },
      nose: {
        names: ["nose"],
        message: "I've already got one of those. I don't need another one",
        examine: "Just because it looks like a nose, doesn't mean it is one!"
      },
      hole: {
        names: ["hole", "opening"],
        message: "This hole is actually low enough I can touch it, but I still can't take holes",
        examine: "Looking up through the hole, I can see a staircase above that ends here. I might be able to climb up, but it's just out of reach."
      }
    }
  },
  topGlass: {
    name: "The Top Glass room",
    look: {
      base: "I'm in the northern half of a large rectangular room.",
      parts: [
        {text: "A large glass wall separates me from the southern side.", unless: "glassBroken"},
        {text: "There used to be a glass wall here, now there's just shattered remains.", if:"glassBroken"}
      ]
    },
    passages: {
      north: "nose",
      east: "nose"
    },
    restrictedPassages: {
      south: {
        requirements: [
          {flag: "glassBroken", failMessage: "I'm not getting through that without tearing myself to shreds.", unmetDescription: "There's a glass wall to the south, I could go there if I could break it."}
        ],
        room: "bottomGlass",
        metDescription: "I can probably pick my way around the shattered glass to the south."
      }
    },
    items: ["shovel"],
    disallowedTakes: {
      shattered: {
        names: ["shattered remains", "remains", "shards", "shattered glass", "broken glass"],
        hiddenUnlessHasFlag: "glassBroken",
        message: "I'd rather not cut my hands trying to pick it up",
        examine: "Many tiny fragments of sharp glass. I probably shouldn't touch those."
      }
    },
    objects: ["glass"]
  },
  bottomGlass: {
    name: "The Bottom Glass room",
    look: {
      base: "I'm in the southern half of a large rectangular room." ,
      parts: [
        {text: "A large glass wall separates me from the northern side.", unless: "glassBroken"},
        {text: "There used to be a glass wall here, now there's just shattered remains.", if: "glassBroken"}
      ]
    },
    passages: {
      west: "smoke",
      east: "mirror2",
      south: "smoke",
    },
    restrictedPassages: {
      north: {
        requirements: [
          {flag: "glassBroken", failMessage: "I'm not getting through that without tearing myself to shreds.", unmetDescription: "There's a glass wall to the north, I could go there if I could break it."}
        ],
        room: "topGlass",
        metDescription: "I can probably pick my way around the shattered glass to the north."
      }
    },
    items: [],
    disallowedTakes: {
      shattered: {
        names: ["shattered remains", "remains", "shards", "shattered glass", "broken glass"],
        hiddenUnlessHasFlag: "glassBroken",
        message: "I'd rather not cut my hands trying to pick it up",
        examine: "Many tiny fragments of sharp glass. I probably shouldn't touch those."
      }
    },
    objects: ["glass"]
  },
  maze1: {
    name: "The Maze",
    look: "This is a perfectly symmetrical room. No identifying features.",
    passages: {
      north: "hub",
      east: "maze2",
      south: "maze2",
      west: "maze2"
    },
    items: [],
    disallowedTakes: {
      features: {
        names: ["identifying features", "features", "feature"],
        message: "Yeah there's none of those here",
        examine: "I wish there was something to tell these rooms apart, but alas, there's not."
      }
    }
  },
  maze2: {
    name: "The Maze",
    look: "This is a perfectly symmetrical room. No identifying features.",
    passages: {
      north: "maze1",
      east: "maze1",
      south: "maze3",
      west: "maze1"
    },
    items: [],
    disallowedTakes: {
      features: {
        names: ["identifying features", "features", "feature"],
        message: "Yeah there's none of those here",
        examine: "I wish there was something to tell these rooms apart, but alas, there's not."
      }
    }
  },
  maze3: {
    name: "The Maze",
    look: "This is a perfectly symmetrical room. No identifying features.",
    passages: {
      north: "maze2",
      east: "maze4",
      south: "maze4",
      west: "maze4"
    },
    items: [],
    disallowedTakes: {
      features: {
        names: ["identifying features", "features", "feature"],
        message: "Yeah there's none of those here",
        examine: "I wish there was something to tell these rooms apart, but alas, there's not."
      }
    }
  },
  maze4: {
    name: "The Maze",
    look: "This is a perfectly symmetrical room. No identifying features.",
    passages: {
      north: "maze5",
      east: "maze3",
      south: "maze3",
      west: "maze3"
    },
    items: [],
    disallowedTakes: {
      features: {
        names: ["identifying features", "features", "feature"],
        message: "Yeah there's none of those here",
        examine: "I wish there was something to tell these rooms apart, but alas, there's not."
      }
    }
  },
  maze5: {
    name: "The Maze",
    look: "This is a perfectly symmetrical room. No identifying features.",
    passages: {
      north: "maze6",
      east: "maze6",
      south: "maze6",
      west: "maze4"
    },
    items: [],
    disallowedTakes: {
      features: {
        names: ["identifying features", "features", "feature"],
        message: "Yeah there's none of those here",
        examine: "I wish there was something to tell these rooms apart, but alas, there's not."
      }
    }
  },
  maze6: {
    name: "The Maze",
    look: "This is a perfectly symmetrical room. No identifying features.",
    passages: {
      north: "maze5",
      east: "maze7",
      south: "maze5",
      west: "maze5"
    },
    items: [],
    disallowedTakes: {
      features: {
        names: ["identifying features", "features", "feature"],
        message: "Yeah there's none of those here",
        examine: "I wish there was something to tell these rooms apart, but alas, there's not."
      }
    }
  },
  maze7: {
    name: "The Maze",
    look: "This is a perfectly symmetrical room. No identifying features.",
    passages: {
      north: "maze8",
      east: "maze10",
      south: "maze6",
      west: "maze8"
    },
    items: [],
    disallowedTakes: {
      features: {
        names: ["identifying features", "features", "feature"],
        message: "Yeah there's none of those here",
        examine: "I wish there was something to tell these rooms apart, but alas, there's not."
      }
    }
  },
  maze8: {
    name: "The Maze",
    look: "This is a perfectly symmetrical room. No identifying features.",
    passages: {
      north: "maze9",
      east: "maze7",
      south: "maze7",
      west: "maze9"
    },
    items: [],
    disallowedTakes: {
      features: {
        names: ["identifying features", "features", "feature"],
        message: "Yeah there's none of those here",
        examine: "I wish there was something to tell these rooms apart, but alas, there's not."
      }
    }
  },
  maze9: {
    name: "The Maze",
    look: "This room is less symmetrical than the others. There's an extra passage.",
    passages: {
      north: "maze9",
      east: "maze9",
      south: "maze8",
      west: "maze8",
      northwest: "dirt"
    },
    items: [],
    disallowedTakes: {
      features: {
        names: ["identifying features", "features", "feature"],
        message: "Yeah there's none of those here",
        examine: "I wish there was something to tell these rooms apart, but alas, there's not."
      }
    }
  },
  maze10: {
    name: "The Maze",
    look: "This is a perfectly symmetrical room. No identifying features.",
    passages: {
      north: "maze11",
      east: "maze12",
      south: "maze12",
      west: "maze7"
    },
    items: [],
    disallowedTakes: {
      features: {
        names: ["identifying features", "features", "feature"],
        message: "Yeah there's none of those here",
        examine: "I wish there was something to tell these rooms apart, but alas, there's not."
      }
    }
  },
  maze11: {
    name: "The Maze",
    look: "This is a perfectly symmetrical room. No identifying features.",
    passages: {
      north: "maze11",
      east: "maze10",
      south: "deadEnd2",
      west: "maze11"
    },
    items: [],
    disallowedTakes: {
      features: {
        names: ["identifying features", "features", "feature"],
        message: "Yeah there's none of those here",
        examine: "I wish there was something to tell these rooms apart, but alas, there's not."
      }
    }
  },
  maze12: {
    name: "The Maze",
    look: "This is a perfectly symmetrical room. No identifying features.",
    passages: {
      north: "maze13",
      east: "maze13",
      south: "maze10",
      west: "maze10"
    },
    items: [],
    disallowedTakes: {
      features: {
        names: ["identifying features", "features", "feature"],
        message: "Yeah there's none of those here",
        examine: "I wish there was something to tell these rooms apart, but alas, there's not."
      }
    }
  },
  maze13: {
    name: "The Maze",
    look: "This is a perfectly symmetrical room. No identifying features.",
    passages: {
      east: "maze12",
      south: "maze12"
    },
    restrictedPassages: {
      north: {
        requirements: [
          {item: "map", failMessage: "A shimmering purple energy blocks your path."}
        ],
        room: "parachute",
        showAsNormal: true
      },
      west: {
        requirements: [
          {item: "map", failMessage: "A shimmering purple energy blocks your path."}
        ],
        room: "parachute",
        showAsNormal: true
      }
    },
    entryMessages: {
      north: "You slide down a hole, falling onto the hard stone floor of",
      west: "You slide down a hole, falling onto the hard stone floor of"
    },
    items: [],
    disallowedTakes: {
      features: {
        names: ["identifying features", "features", "feature"],
        message: "Yeah there's none of those here",
        examine: "I wish there was something to tell these rooms apart, but alas, there's not."
      }
    }
  },
  deadEnd2: {
    name: "Dead end",
    look: "A dead end. A bit more dead than usual, as there is a dead person here. I guess he gave up.",
    passages: {west: "maze11"},
    items: [],
    disallowedTakes: {
      body: {
        names: ["dead person", "person", "body", "corpse"],
        message: "I don't think I should touch it",
        examine: "He's been here quite a while, there's not much left of him."
      },
      cadaver: {
        names: ["cadaver"],
        message: "No",
        examine: "I don't think this is the right situation to use that term."
      }
    }
  },
  dirt: {
    name: "The Dirt room",
    look: "A small, cramped, dark room. The floor here's made of dirt as opposed to the usual stone.",
    passages: {south: "maze9"},
    restrictedPassages: {
      down: {
        requirements: [
          {flag: "holeDug", failMessage: "Although the floor here is dirt, it's still pretty firm", unmetDescription: "With the proper tool, I reckon I could dig down."}
        ],
        room: "small",
        metDescription: "There's a hole in the ground here."
      }
    },
    items: [],
    objects: ["dirt"]
  },
  small: {
    name: "The Small room",
    look: "It's a really narrow tunnel.",
    passages: {
      east: "large",
      south: "dirt"
    },
    items: []
  },
  large: {
    name: "The Large room",
    look: "This room is quite big.",
    passages: {
      northwest: "bricks",
      north: "small",
      northeast: "mirror1",
      east: "mirror1",
      southeast: "cross",
      south: "ezam2",
      southwest: "ezam1"
    },
    items: [],
    isCheckpoint: true
  },
  bricks: {
    name: "The Brickworks",
    look: "An old brickworks, long abandoned.",
    passages: {southeast: "large"},
    items: ["brick1", "brick2"],
    disallowedTakes: {
      "machine": "What's left is degraded so much I can't touch it without it crumbling.",
      "machinery": "What's left is degraded so much I can't touch it without it crumbling.",
    },

  },
  mirror1: {
    name: "The Mirror room",
    look: "There's a massive mirror covering the wall.",
    passages: {
      east: "cross",
      south: "large",
      west: "large"
    },
    failedBackText: "You walk face first into the mirror.",
    items: [],
    disallowedTakes: {
      "mirror": "It's far too big!"
    },
    objects:["mirror"]
  },
  cross: {
    name: "The Cross room",
    look: "A crossroads. Four passages branch out in the cardinal directions.",
    passages: {
      north: "mirror1",
      east: "construction",
      south: "large",
      west: "gum"
    },
    items: ["greenKey1"]
  },
  gum: {
    name: "The Chewing gum room",
    look: "The walls here are plastered with old, hardened chewing gum. It's disgusting.",
    passages: {east: "cross"},
    items: ["gum"]
  },
  construction: {
    name: "UNDER CONSTRUCTION",
    look: "This room is incomplete, tall hoarding surrounding the walls.",
    passages: {
      north: "cross",
      east: "ezam5",
      south: "ezam4",
      west: "ezam3"
    },
    items: [],
    disallowedTakes: {
      "hoarding": "It's stuck to the wall. Besides, it would be pretty heavy."
    }
  },
  big: {
    name: "The Big room",
    look: "A nice break from the small rooms of the maze, this place is quite roomy.",
    passages: {
      northwest: "ezam1",
      southeast: "ezam12",
      southwest: "ezam9"
    },
    items: ["greenKey2"]
  },
  ezam1: {
    name: "Another Maze",
    look: "A small, twisty room. Very confusing.",
    passages: {
      north: "large",
      southeast: "big",
      southwest: "ezam7",
    },
    items: ["wire"]
  },
  ezam2: {
    name: "Another Maze",
    look: "A small, twisty room. Very confusing.",
    passages: {
      northwest: "large",
      northeast: "ezam6",
      south: "ezam12"
    },
    items: []
  },
  ezam3: {
    name: "Another Maze",
    look: "A small, twisty room. Very confusing.",
    passages: {
      north: "construction",
      east: "ezam4",
      west: "ezam6",
    },
    items: []
  },
  ezam4: {
    name: "Another Maze",
    look: "A small, twisty room. Very confusing.",
    passages: {
      west: "ezam3",
      north: "construction",
      northeast: "ezam5"
    },
    items: []
  },
  ezam5: {
    name: "Another Maze",
    look: "A small, twisty room. Very confusing.",
    passages: {
      northwest: "ezam4",
      north: "construction",
      east: "ezam6"
    },
    items: []
  },
  ezam6: {
    name: "Another Maze",
    look: "A small, twisty room. Very confusing.",
    passages: {
      northwest: "ezam2",
      north: "ezam3",
      east: "ezam5",
      southeast: "ezam13"
    },
    items: []
  },
  ezam7: {
    name: "Another Maze",
    look: "A small, twisty room. Very confusing. There's a hole in the roof.",
    passages: {
      northwest: "ezam1",
      east: "ezam8",
      southwest: "ezam10"
    },
    failedBackText: "I'm not the champion climber you think I am...",
    items: []
  },
  ezam8: {
    name: "Another Maze",
    look: "A small, twisty room. Very confusing.",
    passages: {
      south: "ezam9",
      west: "ezam7"
    },
    items: []
  },
  ezam9: {
    name: "Another Maze",
    look: "A small, twisty room. Very confusing.",
    passages: {
      north: "ezam8",
      east: "big",
    },
    items: []
  },
  ezam10: {
    name: "Another Maze",
    look: "A small, twisty room. Very confusing.",
    passages: {
      east: "ezam11",
      west: "ezam7"
    },
    items: []
  },
  ezam11: {
    name: "Another Maze",
    look: "A small, twisty room. Very confusing.",
    passages: {
      west: "ezam10",
      north: "ezam12"
    },
    items: []
  },
  ezam12: {
    name: "Another Maze",
    look: "A small, twisty room. Very confusing.",
    passages: {
      west: "ezam11",
      northwest: "big",
      north: "ezam2",
      east: "ezam13",
      south: "ezam19"
    },
    items: []
  },
  ezam13: {
    name: "Another Maze",
    look: "A small, twisty room. Very confusing.",
    passages: {
      northwest: "ezam6",
      north: "ezam14",
      south: "ezam12"
    },
    items: []
  },
  ezam14: {
    name: "Another Maze",
    look: "A small, twisty room. Very confusing.",
    passages: {
      north: "ezam13",
      northeast: "ezam15",
      southwest: "ezam16"
    },
    items: []
  },
  ezam15: {
    name: "Another Maze",
    look: "A small, twisty room. Very confusing.",
    passages: {
      southwest: "ezam14"
    },
    items: []
  },
  ezam16: {
    name: "Another Maze",
    look: "A small, twisty room. Very confusing.",
    passages: {
      north: "ezam14",
      southeast: "ezam17"
    },
    items: []
  },
  ezam17: {
    name: "Another Maze",
    look: "A small, twisty room. Very confusing.",
    passages: {
      east: "ezam18",
      southwest: "ezam16"
    },
    items: []
  },
  ezam18: {
    name: "Another Maze",
    look: "A small, twisty room. Very confusing.",
    passages: {
      east: "ezam17",
      south: "grinder",
      west: "ezam19"
    },
    items: []
  },
  ezam19: {
    name: "Another Maze",
    look: "A small, twisty room. Very confusing.",
    passages: {
      north: "ezam12",
      east: "ezam18",
      south: "machine"
    },
    items: []
  },
  grinder: {
    name: "The Grinder room",
    look: "An old mill room, long abandoned. The air is thick with the smell of ancient grain.",
    passages: {
      north: "ezam18",
      northwest: "water"
    },
    items: [],
    disallowedTakes: {
      "grain": "There's no grain left here, just the smell.",
      "mill": "The mill is far too large and heavy.",
      "stones": "The grinding stones are enormous and immovable.",
      "wheel": "The grinding wheel is massive and stuck in place.",
      "wheat": "Any wheat that was here turned to dust centuries ago."
    },
    objects: ["grinder"]
  },
  water: {
    name: "",
    look: "A bare room. There's a table bolted to the floor. Something feels mysterious here.",
    passages: {north: "grinder"},
    items: ["cup"],
    disallowedTakes: {
      "table": "It's bolted to the floor."
    },
    light: true
  },
  machine: {
    name: "The machine room",
    look: "Reminiscent of the industrial era, this place has various steampunk machines and pipes all over the place.",
    passages: {
      north: "still",
      east: "ezam19"
    },
    restrictedPassages: {
      southwest: {
        requirements: [
          {flag: "machineOn", failMessage: "The door is closed.", unmetDescription: "There's a heavy iron door to the southwest. It doesn't have a visible keyhole."}
        ],
        room: "code",
        metDescription: "There's an open doorway to the southwest."
      }
    },
    items: [],
    disallowedTakes: {
      "pipes": "They're stuck fast to the wall.",
      "steam": "What steam?"
    },
    objects: ["machine"]
  },
  code: {
    name: "The Code room",
    look: "A massive skylight reveals it's daytime. This room is super bright.",
    passages: {north: "machine"},
    items: [],
    disallowedTakes: {
      "skylight": "It's far too high.",
      "light": "As much as I'd love for there to be this much light everywhere, I'm not a wizard.",
      "glass": "It's too high to reach.",
    },
    objects: ["code"]
  },
  still: {
    name: "The Still room",
    look: "Strangely, everything seems stopped, or at least slowed in this room.",
    passages: {
      east: "machine",
      west: "boring"
    },
    items: [],
    disallowedTakes: {
      "time": "Not even here does time stay still long enough for me to grasp it.",
      "slowness": "The effect isn't something I can bring with me.",
      "effect": "Whatever causes this is beyond my understanding of physics."
    }
  },
  boring: {
    name: "The Boring room",
    look: () => {
      const base = "This room is really boring.";
      if (gameState.flags.includes("leftBoringOnce")) {
        return base + " Why am I here again?";
      } else {
        return base + " I should move on.";
      }
    },
    onExit: {
      setFlags: ["leftBoringOnce"]
    },
    passages: {
      north: "still",
      east: "round"
    },
    items: []
  },
  round: {
    name: "The Round room",
    look: "A large perfectly circular room with passages in all directions. It reminds you of a similar room, far, far away.",
    passages: {
      north: "ezam7",
      northeast: "boring",
      east: "riddle3",
      southeast: "dynamite",
      south: "gate",
      west: "riddle2",
      northwest: "candle"
    },
    restrictedPassages: {
      southwest: {
        requirements: [ // change this to a barricaded wooden door.
          {flag: "roundExplosion", failMessage: "There's a barricaded wooden door in the way.", unmetDescription: "There's also a passage to the southwest, but it's blocked by a barricaded wooden door."},
        ],
        room: "rorrim",
        metDescription: "The barricade to the southwest has been cleared by dynamite, so is passable."
      }
    },
    entryMessages: {
      north: "Tumbling down the smooth stone hole, you land with a bump in"
    },
    items: [],
    objects: ["barricade"],
    isCheckpoint: true,
    light: true
  },
  candle: {
    name: "The Church",
    look: "A religious sanctuary. Decorative banners line the wall.",
    passages: {
      east: "bolt",
      southeast: "round"
    },
    items: ["purpleKey"],
    disallowedTakes: {
      "banners": "I probably shouldn't touch those. It feels disrespectful.",
      "altar": "It's a bit heavy, plus the whole \"Don't touch the religious stuff\" feels relevant here.",
      "alter": "I can't find any alter here. There is an altar though, did you mean that?"
    },
    objects: ["candle"],
    light: true
  },
  bolt: {
    name: "The Bolt room",
    look: "This small closet seems to be the maintenance hub for the church.",
    passages: {south: "candle"},
    items: [],
    disallowedTakes: {
      "broom": "The broom handle snapped off. Only the bristle head remains, wedged in a corner.",
      "mop": "The mop is tangled around a pipe. I can't free it without breaking something.",
      "bucket": "The bucket is stuck to the floor. Something spilled and dried like cement.",
      "rags": "The rags are so filthy I don't want to touch them.",
      "supplies": "The bottles have all leaked together into an unidentifiable sludge. I'm not touching that."
    },
    objects: ["bolt"],
    light: true
  },
  riddle2: {
    name: () => {
      if (gameState.visitedRooms.includes("riddle3")) {
        return "The Third Riddle";
      } else {
        return "The Second Riddle";
      }
    },
    look: () => {
      const ordinal = gameState.visitedRooms.includes("riddle3") ? "third" : "second";
      return `Ancient symbols are etched into every surface. A ${ordinal} riddle awaits on a stone pedestal.`;
    },
    passages: {east: "round"},
    restrictedPassages: {
      northwest: {
        requirements: [
          {flag: "secondRiddleSolved", failMessage: "There's a solid stone wall that way.", unmetDescription: "The stone wall to the northwest seems different to the rest."}
        ],
        room: "greenKey1",
        metDescription: "There's a stone doorway to the northwest."
      }
    },
    items: [],
    disallowedTakes: {
      "tablet": "The stone tablet is secured to the podium.",
      "podium": "The podium is connected to the floor.",
      "inscriptions": "They're carved into the stone itself.",
      "symbols": "I can't take what's carved into the walls."
    },
    objects: ["riddle2"],
    light: true
  },
  greenKey1: {
    name: "The Key room",
    look: "This room is lined with ornate, green decorations.",
    passages: {west: "nose"},
    restrictedPassages: {
      east: {
        requirements: [
          {flag: "secondRiddleSolved", failMessage: "There's a solid stone wall that way.", unmetDescription: "The stone wall to the east is missing the lining characterizing the rest of the room."}
        ],
        room: "riddle2",
        metDescription: "There's a stone doorway to the east."
      }
    },
    entryMessages: {
      west: "You walk down a set of stairs. They end at a hole. You jump down."
    },
    items: ["greenKey3"],
    disallowedTakes: {
      "decorations": "They're stuck to the wall."
    },
    light: true
  },
  rorrim: { // Oaky, for this room, I want something special. Every command needs to be flipped. If the command is north, they go to the south room. Vise versa for east and west. However, the back command is interesting. As going back takes you in the direction that should take you back, it also needs to be flipped. So coming from the round room, "back" needs to take you south.
    name: "The rorriM room",
    look: "All of the walls here are made of shiny mirrors! It's really offputting.",
    mirrorDirections: true,
    passages: {
      north: "round",
      south: "workshop",
      west: "pick3"
    },
    restrictedPassages: {
      east: {
        requirements: [
          {flag: "redDoorOpened", failMessage: "There's a glowing red door in the way.", unmetDescription: "There's a locked, glowing red door to the east."}
        ],
        room: "ball",
        metDescription: "There's an open glowing red door to the east."
      }
    },
    items: [],
    disallowedTakes: {
      "mirror": "In order to take the mirrors, I'd have to break them first. I don't want 7 years bad luck.",
    },
    objects: ["redDoor"]
  },
  pick3: {
    name: "The Pickaxe shed",
    look: "A small, corrugated metal shed.",
    passages: {north: "rorrim"},
    items: ["pick3"]
  },
workshop: {
    name: "The Workshop",
    look: "An abandoned workshop. Benches and shelves line the walls, covered in dust and worn down by time.",
    passages: {north: "rorrim"},
    items: ["screwdriver", "wrench"],
    disallowedTakes: {
      "vise": "The vise is bolted to the bench.",
      "vice": "The vise is bolted to the bench.",
      "shelves": "They're attached to the wall.",
      "bench": "It's far too heavy to move.",
      "saw": "The saw is rusted into its mount. I can't budge it.",
      "drill": "The drill has seized up and is stuck to the bench.",
      "chisel": "Someone glued this chisel down. Why would they do that?",
      "file": "The file is welded to the workbench, bizarrely enough.",
      "pliers": "The pliers are stuck in a vise that's rusted shut.",
      "toolbox": "The toolbox is nailed to the shelf."
    }
  },
  ball: {
    name: "The Ball room",
    look: {
      base: "A domed, high-tech room.",
      parts: [
        {text: "There's a floating ball in the middle of the room. It's reflective, and refractive at the same time. You can see a green light originating from inside.", unless: "codeInput"},
      ]
    },
    passages: {west: "rorrim"},
    items: [],
    disallowedTakes: {
      "ball": "Upon touching the ball, your hand is thrown back with great velocity.",
      "energy": "You stick your hand into the energy. You recieve a sharp zap. You pull your hand away.",
      "forcefield": "You touch the force field. It pulses, throwing you back.",
      "force-field": "You touch the force field. It pulses, throwing you back.",
      "force field": "You touch the force field. It pulses, throwing you back."
    },
    objects: ["redButton", "blueButton", "yellowButton", "greenButton"],
    light: true
  },
  riddle3: {
    name: () => {
      if (gameState.visitedRooms.includes("riddle2")) {
        return "The Third Riddle";
      } else {
        return "The Second Riddle";
      }
    },
    look: () => {
      const ordinal = gameState.visitedRooms.includes("riddle2") ? "third" : "second";
      return `Ancient symbols are etched into every surface. A ${ordinal} riddle awaits on a stone pedestal.`;
    },
    passages: {north: "round"},
    restrictedPassages: {
      south: {
        requirements: [
          {flag: "thirdRiddleSolved", failMessage: "There's a heavy door in the way.", unmetDescription: "The southern wall houses a heavy looking door."}
        ],
        room: "chipper",
        metDescription: "The heavy door to the south is open."
      }
    },
    items: [],
    disallowedTakes: {
      "tablet": "The tablet is fixed firmly to the pedestal.",
      "pedestal": "The pedestal is built into the floor.",
      "inscriptions": "The inscriptions are part of the stone walls.",
      "symbols": "I can't take what's etched into the stone."
    },
    objects: ["riddle3"],
    light: true
  },
  chipper: {
    name: "The Woodworks",
    look: "A mouldy old woodworks. Most of the equipment here is too far gone to be useful.",
    passages: {northeast: "riddle3"},
    items: [],
    disallowedTakes: {
      "equipment": "Most of it is too far gone to be useful.",
      "machinery": "It's rusted solid and would crumble if I tried to move it.",
      "saw": "The saw blade is completely rusted through."
    },
    objects: ["chipper"]
  },
  gate: {
    name: "The Gateway",
    look: "A rather posh looking place, with a massive fence covering the southern half of the room.",
    passages: {east: "round"},
    restrictedPassages: {
      south: {
        requirements: [
          {flag: "gateOpened", failMessage: "The gate is shut, and reaches all the way to the roof. I'm not getting over it.", unmetDescription: "There's a gate in the centre of the fence."}
        ],
        room: "wood",
        metDescription: "An open gate leads southwards."
      }
    },
    items: [],
    disallowedTakes: {
      "fence": "Are you kidding! That thing is massive!"
    },
    light: true
  },
  wood: {
    name: "The Wooden room",
    look: {
      parts: [
        {text: "Everything here is lined with wood. Walls, floor, even the ceiling. It's a wonder there aren't termites here.", unless: "woodTaken"},
        {text: "The room has been stripped bare. There's really not much here anymore.", if: "woodTaken"}
      ]
    },
    passages: {
      west: "gate",
      east: "annoying"
    },
    items: ["wood"]
  },
  annoying: {
    name: "The Annoying room",
    look: "A honeycomb of passages dissect this room in every direction.",
    passages: {
      north: "annoying",
      northeast: "annoying",
      east: "annoying",
      southeast: "annoying",
      south: "annoying",
      southwest: "annoying",
      west: "wood",
      northwest: "annoying",
      up: "annoying",
      down: "annoying"
    },
    items: [],
    disallowedTakes: {
      "annoyance": "You are already very annoyed.",
      "frustration": "The frustration is already yours."
    }
  },
  mirror2: {
    name: "The Mirror room",
    look: "There's a massive mirror covering the wall.",
    passages: {
      west: "smoke",
      north: "bottomGlass",
      east: "case"
    },
    failedBackText: "You walk face first into the mirror.",
    items: [],
    disallowedTakes: {
      "mirror": "It's far too big!"
    },
    objects:["mirror"]
  },
  case: {
    name: "The Case room",
    look: "A luxurious room, red velvet padding lines the walls. Deep mahogany forms the highlights.",
    passages: {west: "mirror2"},
    items: [],
    disallowedTakes: {
      "velvet": "I don't want to spoil the splendor of this place!",
      "mahogany": "I'd have to destroy the room to take it. I'm not a vandal!",
      "padding": "The velvet padding is attached to the walls. I'd have to tear it off, and I'm not doing that."
    },
    objects: ["case"]
  },
  smoke: {
    name: "The Smokey room",
    look: "The floor here is made of rusted metal grates. A large amount of smoke is rising through the floor.",
    passages: {
      north: "bottomGlass",
      east: "bottomGlass",
      south: "mirror2",
      west: "slimy",
      northwest: "nose"
    },
    entryMessages: {
      northwest: "You fall down a short hole, landing in"
    },
    disallowedTakes: {
      "grates": "But then I'd have nothing to stand on!",
      "smoke": "*cough cough* The only way to take this with me is within my lungs. I might be doing that involuntarily"
    },
    light: true
  },
  slimy: {
    name: "The Slimy room",
    look: "All surfaces in this room are coated in a strange slimy substance. It reminds you of snails.",
    passages: {
      east: "smoke",
      south: "dry",
      west: "dry",
      northwest: "dry"
    },
    items: [],
    disallowedTakes: {
      "slime": "It's stuck to the walls"
    }
  },
  dry: {
    name: "The Dry room",
    look: "A desiccation chamber. The air is so dry it makes my throat itch.",
    passages: {
      northeast: "slimy",
      east: "slimy",
      south: "slimy"
    },
    restrictedPassages: {
      north: {
        requirements: [
          {item: "map", failMessage: "A shimmering purple energy blocks your path."}
        ],
        room: "armory",
        showAsNormal: true
      },
      west: {
        requirements: [
          {flag: "purpleDoorUnlocked", failMessage: "The glowing purple door is closed.", unmetDescription: "There's a glowing purple door to the west. It's locked."}
        ],
        room: "mmmm",
        metDescription: "A glowing purple door set in the western wall is ajar."
      }
    },
    entryMessages: {
      north: "You slide down a shining purple passage, landing in"
    },
    failedBackText: "The hole in the roof closed up, somehow.",
    items: [],
    disallowedTakes: {
      "vents": "They're built into the walls.",
      "vent": "It's built into the wall.",
      "moisture": "There isn't any. That's the whole point of this room."
    },
    objects: ["purpleDoor"]
  },
  mmmm: {
    name: "The Marshmallow's Lair",
    look: "A cavernous lair. Sticky marshmallow residue coats every surface, and there's an overwhelming smell of burnt sugar.",
    passages: {
      northwest: "dry",
      south: "battery"
    },
    items: [],
    disallowedTakes: {
      "residue": "It's stuck fast to everything. I'd need a chisel to scrape it off.",
      "goop": "It's hardened into a crust. Not coming off without serious effort."
    },
    objects: ["marshmallow"]
  },
  battery: {
    name: "The Battery room",
    look: "An old, tech-storage room. Abandoned server racks line the walls. Remnants of marshmallow goop can also be found.",
    passages: {
      north: "mmmm",
      east: "tiny"
    },
    items: ["battery"],
    disallowedTakes: {
      "servers": "The server racks are completely empty, save for a bit of marshmallow slime.",
      "racks": "They're mounted to the wall.",
      "tech": "There's none here.",
      "goop": "I'd rather not touch that. It looks quite old, and very crusty.",
      "slime": "I'd rather not touch that. It looks quite old, and very crusty.",
      "residue": "I'd rather not touch that. It looks quite old, and very crusty.",
      "marshmallow": "I'd rather not touch that. It looks quite old, and very crusty.",
      "crust": "I'd rather not touch that. It looks quite old, and very crusty."
    }
  },
  tiny: {
    name: "The Tiny room",
    look: "There's little room to breathe here, let alone look around.",
    passages: {
      north: "battery",
      west: "smith"
    },
    items: ["greenKey4"],
    disallowedTakes: {
      "cramps": "You've already got those, unfortunately."
    }
  },
  smith: {
    name: "The Blacksmithy",
    look: "An old blacksmithy. The forge sits cold by the wall, bellows mounted at its side. A slack tub and key-shaped mold rest on a nearby workbench.",
    passages: {
      north: "tiny",
      south: "hideout"
    },
    items: ["tongs", "coal", "crucible"],
    disallowedTakes: {
      "anvil": "That anvil must weigh at least a tonne. I'm not that strong.",
      "workbench": "It's built into the floor. Not going anywhere.",
      "bench": "It's built into the floor. Not going anywhere."
    },
    objects: ["forge", "mold", "bellows", "slackTub"],
    light: true
  },
  hideout: {
    name: "The Thief's Hideout",
    look: "A large, cluttered room. Treasure of all kinds scattered everywhere. Gold coins, jewels, and valuable trinkets are piled haphazardly in every corner. Whoever lives here has been very busy.",
    passages: {
      north: "fire",
      northeast: "brush",
      south: "smith"
    },
    items: [], // You get items here when you eat the blue cake.
    disallowedTakes: {
      "treasure": "It's clear someone still lives here. I'm quite OK with finding things, but I'm not a thief.",
      "coins": "It's clear someone still lives here. I'm quite OK with finding things, but I'm not a thief.",
      "jewels": "It's clear someone still lives here. I'm quite OK with finding things, but I'm not a thief.",
      "trinkets": "It's clear someone still lives here. I'm quite OK with finding things, but I'm not a thief.",
      "gold": "It's clear someone still lives here. I'm quite OK with finding things, but I'm not a thief.",
      "loot": "Taking someone else's collection would make me just as bad as them.",
      "valuables": "I'm not a thief, even if the owner might be."
    },
    isCheckpoint: true
  },
  brush: {
    name: "The Hair Salon",
    look: "A derilect hair salon. It still has a few hair dryers, although I would seriously doubt they work.",
    passages: {west: "hideout"},
    items: ["brush"],
    disallowedTakes: {
      "dryers": "They're mounted to the walls, and I doubt they work anyway.",
      "dryer": "It's mounted to the wall, and I doubt it works anyway.",
      "hair dryer": "It's mounted to the wall, and I doubt it works anyway.",
      "hair dryers": "They're mounted to the walls, and I doubt they work anyway.",
      "hair-dryers": "They're mounted to the walls, and I doubt they work anyway.",
      "mirrors": "The salon mirrors are built into the wall.",
      "mirror": "The salon mirror is built into the wall.",
      "chair": "The styling chair is bolted down.",
      "chairs": "The styling chairs are bolted down."
    }
  },
  fire: { // This room, you need to lose 1 health every two commands you have in the room.
    name: "The Incinerator",
    look: {
      base: "This appears to be an industrial incinerator. The walls are blackened from years of use.",
      parts: [
        {text: "The room is incredibly hot, I shouldn't stay here for too long.", unless: "fireExtinguished"},
        {text: "Now that the fire's out, I can breathe easier and the heat has dissipated.", if: "fireExtinguished"}
      ]
    },
    passages: {southeast: "hideout"},
    restrictedPassages: {
      north: {
        requirements: [
          {flag: "fireExtinguished", failMessage: "You try running through the burning fire. It doesn't go too well.", unmetDescription: "I think I can make out an exit to the north, but it's blocked by fire."}
        ],
        room: "cyclops",
        metDescription: "The northern exit is no longer blocked by flames."
      }
    },
    hazard: {
      count: 2,
      unless: "fireExtinguished",
      damage: 1,
      messages:  ["You are burned by the heat.", "The flames burn you.", "You feel a searing sensation on your skin.", "The fire is hot! Ouch!"],
      killIfInventory: {dynamite: "As you walk into the incinerator, the dynamite you carry instantly blows up, taking you with it."}
    },
    items: [],
    disallowedTakes: {
      "incinerator": "It's a room-sized installation. I can't just pick it up.",
      "grating": "The metal grating covers the ceiling. It's not coming down.",
      "grates": "The metal grating covers the ceiling. It's not coming down."
    },
    objects: ["fire"],
    light: true
  },
  cyclops: {
    name: "The Cyclops's Lair",
    look: "A dark cave with rough-hewn walls.",
    passages: {southwest: "fire"},
    restrictedPassages: {
      south: {
        requirements: [
          {flag: "cyclopsGone", failMessage: "There's a huge cyclops in the way. I don't think he'd let me past.", unmetDescription: "A large cyclops stands, guarding the southern passage. "}
        ],
        room: "spotty",
        metDescription: "With the cyclops no longer here, I can go through the southern passage."
      }
    },
    items: [],
    objects: ["cyclops"]
  },
  spotty: {
    name: "The Spotty room",
    look: "The room is completely covered in an irregular polkadot patten. I can't tell if this was intentionally decoration, or some bizarre mould growth.", // also this could be better
    passages: {
      east: "hat",
      west: "cyclops"
    },
    items: [],
    disallowedTakes: {
      "spots": "They're a part of the wall.",
      "polkadots": "I'm not sure how you want me to accomplish that. I don't have a paint scraper."
    }
  },
  hat: {
    name: "The Cloak room",
    look: "A small enclosure, shelves line the walls. Unfortunately, there's no cloaks left here. I've always loved cloaks.",
    passages: {northwest: "spotty"},
    restrictedPassages: {
      down: {
        requirements: [
          {flag: "hatBoxOpen", failMessage: "I'm not sure how you want me to go down.", unmetDescription: ""}
        ],
        room: "bell",
        metDescription: "There's a false bottom in the hat box in the middle of the room, hiding a secret tunnel."
      }
    },
    items: [],
    disallowedTakes: {
      "shelves": "They're attached to the walls.",
      "shelf": "It's attached to the wall.",
      "cloaks": "There are none left here. I've already checked thoroughly.",
      "cloak": "There are none left here. I've already checked thoroughly."
    },
    objects: ["hatbox"]
  },
  bell: {
    name: "The Bell Tower",
    look: () => {
      const article = gameState.visitedRooms.includes("candle") ? "the" : "a";
      return `Apparently, I'm at the spire of ${article} church. Through the decorative arched windows, I can see vast barren plains and distant forests stretching to the horizon.`;
    },
    passages: {
      north: "blueKey",
      southeast: "greenKey2",
      southwest: "redKey",
      down: "hat"
    },
    items: [],
    disallowedTakes: {
      "windows": "The windows are set into the stone. I'd need tools to remove them.",
      "window": "The window is set into the stone. I'd need tools to remove it.",
      "glass": "The stained glass is part of the windows. I can't remove it.",
      "beams": "The timber beams are massive and firmly anchored.",
      "beam": "The timber beam is massive and firmly anchored.",
      "timber": "The timber beams are massive and firmly anchored.",
      "plains": "They're outside, far below. I can only see them from here.",
      "forests": "They're outside, far in the distance.",
      "forest": "It's outside, far in the distance.",
      "view": "I can admire it, but I can't take it with me."
    },
    objects: ["bell"],
    light: true
  },
  blueKey: {
    name: "The Blue Sanctuary",
    look: "A peaceful blue sanctuary. Stained glass windows filter the light into soothing blue hues.",
    passages: {west: "bell"},
    items: ["blueKey"],
    disallowedTakes: {
      "windows": "The stained glass windows are set into the walls.",
      "window": "The stained glass window is set into the wall.",
      "glass": "The stained glass is part of the windows. I can't remove it.",
      "decorations": "The decorations are attached to the walls.",
      "decoration": "The decoration is attached to the wall."
    },
    light: true
  },
  greenKey2: {
    name: "The Green Sanctuary",
    look: "This small chapel is decorated entirely in green. Jade-tinted windows bathe everything in verdant light.",
    passages: {southwest: "bell"},
    items: ["greenKey5"],
    disallowedTakes: {
      "windows": "The stained glass windows are set into the walls.",
      "window": "The stained glass window is set into the wall.",
      "glass": "The stained glass is part of the windows. I can't remove it.",
      "decorations": "The decorations are attached to the walls.",
      "decoration": "The decoration is attached to the wall."
    },
    light: true
  },
  redKey: {
    name: "The Red Sanctuary",
    look: "A beautiful sanctuary. Red stained glass windows cast crimson light across ornate decorations.",
    passages: {northeast: "bell"},
    items: ["redKey"],
    disallowedTakes: {
      "windows": "The stained glass windows are set into the walls.",
      "window": "The stained glass window is set into the wall.",
      "glass": "The stained glass is part of the windows. I can't remove it.",
      "decorations": "The ornate decorations are attached to the walls.",
      "decoration": "The ornate decoration is attached to the wall."
    },
    light: true
  },
  dynamite: {
    name: "The Explosives Storehouse",
    look: "An old military storehouse. Crates marked 'EXPLOSIVES - HANDLE WITH CARE' are stacked against the walls.",
    passages: {northwest: "round"},
    restrictedPassages: {
      east: {
        requirements: [
          {flag: "silverDoorOpen", failMessage: "The door is locked.", unmetDescription: "There's a tarnished silver door in the eastern wall."}
        ],
        room: "extinguisher",
        metDescription: "There's an open silver door to the east."
      }
    },
    items: ["dynamite"],
    disallowedTakes: {
      "crates": "The other crates are nailed shut and far too heavy to carry.",
      "crate": "The other crates are nailed shut and far too heavy to carry.",
      "explosives": "The rest of the explosives are sealed in the other crates. I can't get to them.",
      "warning": "The warning signs are painted on. Can't take those.",
      "warnings": "The warning signs are painted on. Can't take those.",
      "signs": "They're attached to the walls.",
      "sign": "It's attached to the wall."
    },
    objects: ["silverDoor"]
  },
  extinguisher: {
    name: "The Fire Control Station",
    look: "A safety equipment storage room. Fire extinguishers, first aid kits, and emergency supplies line the shelves.",
    passages: {
      northwest: "dynamite",
      east: "lake"
    },
    items: ["extinguisher"],
    disallowedTakes: {
      "shelves": "They're bolted to the walls.",
      "shelf": "It's bolted to the wall."
    }
  },
  lake: {
    name: "The Lake",
    look: "I'm standing on a peninsula that protrudes into the centre of a massive underground lake.",
    passages: {south: "extinguisher"},
    restrictedPassages: {
      north: {
        requirements: [
          {flag: "lakeFilled", failMessage: "I can't swim!", unmetDescription: "On the northen bank of the lake, I can see a passage."}
        ],
        room: "hammer2",
        metDescription: "Enough sawdust has been dumped into the lake to form a makeshift causeway, extending to the northern shore."
      }
    },
    items: [],
    disallowedTakes: {
      "water": "I don't have anything to hold it in.",
      "lake": "I can't take an entire lake.",
      "peninsula": "It's made of rock and earth. I can't exactly take geography with me.",
      "shore": "I can't take a shoreline.",
      "bank": "I'm not sure money I withdraw from these banks would be worth anything."
    },
    objects: ["lake"]
  },
  hammer2: {
    name: "The Brassworks",
    look: "A metalworking shop focused on brass. The benches are worn smooth from years of use.",
    passages: {
      northeast: "greenKey3",
      east: "lake"
    },
    items: ["brassHammer"],
    disallowedTakes: {
      "benches": "The workbenches are massive and built into the floor.",
      "bench": "The workbench is massive and built into the floor.",
      "workbench": "It's massive and built into the floor.",
      "workbenches": "They're massive and built into the floor."
    }
  },
  greenKey3: {
    name: "The Key room",
    look: "An austere chamber. Subtle green trim lines the stone floor and ceiling.",
    passages: {
      east: "stone",
      south: "hammer2"
    },
    items: ["greenKey8"],
    disallowedTakes: {
      "trim": "The green trim is inlaid into the stone. It's not coming out."
    }
  },
  stone: {
    name: "The Stone room",
    look: "This room, made entirely of stone. It feels intimidating, as though time itself was staring you down in this ancient room.",
    passages: {north: "greenKey3"},
    restrictedPassages: {
      east: {
        requirements: [
          {flag: "blueDoorUnlocked", failMessage: "Although the wall is glowing blue, it's just as solid as the others.", unmetDescription: "The eastern wall is entirely covered in an ethereal, glowing blue haze. There is a small, key-shaped hole in the centre."}
        ],
        room: "pool",
        metDescription: "The glowing blue wall to the east has split, leaving a clean passage."
      }
    },
    items: [],
    disallowedTakes: {
      "haze": "You grasp the haze. It slips through your fingers.",
      "stone": "The stone blocks are ancient and massive. I couldn't budge one.",
      "stones": "The stone blocks are ancient and massive. I couldn't budge one."
    },
    objects: ["blueDoor"],
    isCheckpoint: true,
    light: true
  },
  pool: {
    name: "The Pool Hall",
    look: "A large pool table dominates the centre of the room. The felt is faded but intact.",
    passages: {
      north: "stone",
      east: "clock",
      south: "coin",
      west: "vendingMachine"
    },
    items: [],
    disallowedTakes: {
      "table": "You grab one of the legs of the pool table. After straining yourself, you decide the table is going nowhere.",
      "pool table": "You grab one of the legs of the pool table. After straining yourself, you decide the table is going nowhere.",
      "pool-table": "You grab one of the legs of the pool table. After straining yourself, you decide the table is going nowhere.",
      "felt": "The felt is attached to the table. I'd have to tear it off.",
      "chalk": "There's no chalk here. It's long since been used up or lost."
    }
  },
  coin: {
    name: "The Coin room",
    look: "A narrow alcove that looks like it was meant for storage.",
    passages: {north: "pool"},
    items: ["coin"]
  },
  vendingMachine: {
    name: "The Vending Machine room",
    look: "This looks like it was once a rest area for workers. It's pretty sparse now.",
    passages: {north: "pool"},
    items: [],
    objects: ["vendingMachine"]
  },
  clock: {
    name: "The Clock room",
    look: "Every part of every wall is covered by a clock in this room. The ticking makes it hard to think.",
    passages: {
      south: "door",
      west: "pool"
    },
    items: [],
    disallowedTakes: {
      "clock": "Tick tock.",
      "clocks": "Tick tock.",
      "ticking": "Tick tock.",
      "hands": "Tock tick.",
      "pendulum": "Tick tock.",
      "gears": "Tock tick.",
      "wall": "Tick tock.",
      "walls": "Tick tock.",
      "time": "If only I could borrow time from this place. It has plenty of its own."
    }
  },
  door: {
    name: "The Antechamber",
    look: "A magnificent hall with a vaulted ceiling and polished stone floors. The architecture here is far grander than anywhere else I've been.",
    passages: {west: "clock"},
    restrictedPassages: {
      east: {
        requirements: [
          {flag: "doorOpened", failMessage: "If there's any door I'm not getting through without keys, it's this one.", unmetDescription: "A massive door, adorned with glowing green, ornate metal designs and housing eight glowing green keyholes fills the east wall. Through the door sill, you can see slight glimmers of light."}
        ],
        room: "forrest",
        metDescription: "The massive door to the east is open. Sunlight is streaming through."
      }
    },
    items: [],
    disallowedTakes: {
      "ceiling": "The vaulted ceiling is magnificent, but I can't exactly take it with me.",
      "floor": "The polished stone floor is built into the structure.",
      "floors": "The polished stone floors are built into the structure.",
      "architecture": "The architectural features are part of the building itself.",
      "pillars": "The pillars are far too massive to move.",
      "pillar": "The pillar is far too massive to move.",
      "columns": "The columns are far too massive to move.",
      "column": "The column is far too massive to move."
    },
    objects: ["door"],
    light: true
  },
  forrest: {
    name: "The Forest",
    look: "", // I'm not sure how to end the game mechanically, so leaving this for now.
    passages: {},
    items: [],
    light: true
  }
}
