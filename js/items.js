// ===== ITEMS =====
// Pickupable items that can go in the player's inventory

const items = {
  dungeonKey: {
    name: "key",
    aliases: ["key", "keys"],
    examine: "A simple key made from chain loops",
    initialDescription: "",
    description: "A key made from twisted chain loops lies here.",
    setFlag: "dungeonKeyTaken",
  },
  dungeonWood: {
    name: "wood",
    aliases: ["wood", "planks", "boards", "floorboards"],
    examine: "Wooden planks, quite strong",
    initialDescription: "",
    description: "Wooden planks lie scattered on the floor.",
    setFlag: "dungeonWoodTaken",
  },
  stepladder: {
    name: "stepladder",
    aliases: ["stepladder", "step-ladder", "steps", "ladder", "step ladder"],
    examine: "A short stepladder. Not useful for much, but could give you a bit of extra height",
    initialDescription: "",
    description: "A stepladder stands against the wall.",
    setFlag: "stepladderTaken",
    vital: true,
  },
  lantern: {
    name: "brass lantern",
    aliases: ["lantern", "lamp", "brass", "light"],
    primaryType: "operate",
    examine: "It is currently off",
    initialDescription: "",
    description: "A brass lantern rests here.",
    setFlag: "lanternTaken",
    vital: true,
    togglable: true,
    operate: {
      activate: {
        allowedVerbs: ["light", "activate", "operate"],
        requireNotFlags: ["lanternLit"],
        message: "You light the lantern. It glows brightly.",
        setFlags: ["lanternLit"],
        failMessage: "The lantern is already lit."
      },
      deactivate: {
        allowedVerbs: ["extinguish", "deactivate"],
        requireFlags: ["lanternLit"],
        message: "You extinguish the lantern.",
        unsetFlags: ["lanternLit"],
        failMessage: "The lantern is already off."
      }
    }
  },
  compass: {
    name: "compass",
    aliases: [],
    examine: "I know which way north is",
    initialDescription: "",
    description: "A compass lies on the ground.",
    setFlag: "compassTaken",
    vital: true,
  },
  nails: {
    name: "nails",
    aliases: ["nails", "nail"],
    examine: "Shiny!",
    initialDescription: "",
    description: "Nails lie on the ground.",
    setFlag: "nailsTaken",
  },
  hammer: {
    name: "hammer",
    aliases: [],
    examine: "It appears to be fairly weak, better use it wisely...",
    initialDescription: "A hammer rests on a bench.",
    description: "A hammer lies on the ground.",
    setFlag: "hammerTaken",
  },
  skull: {
    name: "skull",
    aliases: ["skull", "head"],
    examine: "A very nice specimen, although it appears to be human",
    initialDescription: "",
    description: "A skull rests on the floor.",
    setFlag: "skullTaken",
  },
  pick1: {
    name: "pickaxe",
    aliases: ["pickaxe", "pick", "axe"],
    examine: "Frail looking, can't be good for more than one or two uses",
    initialDescription: "",
    description: "A pickaxe leans against the wall.",
    setFlag: "pick1Taken",
  },
  ladder: {
    name: "ladder",
    aliases: [],
    examine: "A tall, sturdy ladder made out of floorboards",
    initialDescription: "",
    description: "A tall ladder rests against the wall.",
    vital: true
  },
  map: {
    name: "purple map",
    aliases: ["map", "purple"],
    examine: "It's faintly glowing, and appears to be of a great underground empire",
    initialDescription: "",
    description: "A glowing purple map has been left here.",
  },
  sword: {
    name: "sword",
    aliases: ["blade", "weapon"],
    primaryType: "combat",
    examine: "Sharp, deadly, slightly sentient",
    initialDescription: "",
    description: "A gleaming sword rests here.",
    setFlag: "swordTaken",
  },
  pick2: {
    name: "pickaxe",
    aliases: ["pickaxe", "pick", "axe"],
    examine: "Frail looking, can't be good for more than one or two uses",
    initialDescription: "A pickaxe lies among the debris.",
    description: "A pickaxe lies on the ground.",
    setFlag: "pick2Taken",
  },
  helmet: {
    name: "helmet",
    aliases: ["helm"],
    primaryType: "operate",
    examine: "How is it glowing blue?",
    initialDescription: "A glowing blue helmet sits on a rack.",
    description: "A glowing blue helmet rests here.",
    setFlag: "helmetTaken",
    operate: {
      equip:{
        allowedVerbs: ["equip", "wear", "use"],
        requireNotFlags: ["helmetEquipped"],
        message: "You put the helmet on.",
        setFlags: ["helmetEquipped"],
        failMessage: "You're already wearing the helmet."
      },
      unequip:{
        allowedVerbs: ["unequip", "remove"],
        requireFlags: ["helmetEquipped"],
        message: "You take the helmet off.",
        unsetFlags: ["helmetEquipped"],
        failMessage: "You're not wearing the helmet."
      }
    }
  },
  parachute: {
    name: "parachute",
    aliases: ["chute", "backpack"],
    primaryType: "operate",
    examine: "A backpack parachute, should help me survive an otherwise deadly drop",
    initialDescription: "A parachute rests on a pedestal.",
    description: "A folded parachute lies here.",
    setFlag: "parachuteTaken",
    operate: {
      equip: {
        allowedVerbs: ["equip", "wear", "use"],
        requireNotFlags: ["parachuteEquipped"],
        message: "You strap on the parachute.",
        setFlags: ["parachuteEquipped"],
        failMessage: "You're already wearing the parachute."
      },
      unequip: {
        allowedVerbs: ["unequip", "remove"],
        requireFlags: ["parachuteEquipped"],
        message: "You take off the parachute.",
        unsetFlags: ["parachuteEquipped"],
        failMessage: "You're not wearing the parachute."
      }
    }
  },
  redCake: {
    name: "red cake",
    aliases: ["cake", "dessert"],
    primaryType: "operate",
    examine: "", // add this
    initialDescription: "A large, red cake sits centred on the table here.",
    description: "A large, red cake sits on the ground.",
    setFlag: "redCakeTaken",
    operate: {
      eat: {
        allowedVerbs: ["eat", "consume", "bite", "taste", "lick", "swallow"], // add more?
        message: "You eat the red cake. You ... something here, then, a pain in your stomache. It feels on fire! All of a sudden, you hear a loud *BANG*, and see your guts, or at least what's left of them, flop onto the floor, before falling unconsious.", // fix this. All of it
        setHealth: 0
      }
    }
  },
  greenCake: {
    name: "green cake",
    aliases: ["cake", "dessert"],
    primaryType: "operate",
    examine: "", // add this
    initialDescription: "A large, green cake is sitting on the bench.",
    description: "A large, green cake sits on the ground.",
    setFlag: "greenCakeTaken",
    operate: {
      eat: {
        allowedVerbs: ["eat", "consume", "bite", "taste", "lick", "swallow"], // add more?
        message: "You eat the green cake. It tastes amazing. You feel something or other", // fix this.
        action: "setCheckpoint",
        consumeOnOperate: true,
        sethealth: 4
      }
    }
  },
  blueCake: {
    name: "blue cake",
    aliases: ["cake", "dessert"],
    primaryType: "operate",
    examine: "", // add this
    initialDescription: "",
    description: "A large, blue, wedding cake sits on the floor. Despite it's colour, it looks out of place.",
    setFlag: "blueCakeTaken",
    operate: {
      eat: {
        allowedVerbs: ["eat", "consume", "bite", "taste", "lick", "swallow"], // add more?
        message: "You eat the entirety of the blue cake. You pig! After such a big meal, you get rather sleepy, and feel like a little nap...\nUpon waking, you notice some of your possesions have been stolen whilst sleeping!",
        action: "loseNonvitalItems",
        consumeOnOperate: true
      }
    }
  },
  shovel: {
    name: "shovel",
    aliases: ["spade", "digging thing"],
    examine: "", // add this
    initialDescription: "There's a sturdy looking shovel, leaning in the corner.",
    description: "A sturdy shovel has been left here.",
    setFlag: "shovelTaken",
    vital: true
  },
  wire: {
    name: "silver wire",
    aliases: ["wire", "silver"],
    examine: "", // add all examines
    initialDescription: "Lying on the floor, randomly, in the middle of the maze is a small coil of silver wire.",
    description: "A coil of silver wire lies here.",
    setFlag: "wireTaken"
  },
  brick1: {
    name: "brick",
    aliases: ["stone"],
    examine: "",
    initialDescription: "Buried within the rubble, seems to be a solid, non-chipped brick.",
    description: "A solid brick lies on the ground.",
    setFlag: "brick1Taken"
  },
  brick2: {
    name: "brick",
    aliases: ["stone"],
    examine: "",
    initialDescription: "Underneath the first brick lies a second, clean brick.",
    description: "A clean brick lies on the ground.",
    setFlag: "brick2Taken"
  },
  greenKey1: {
    name: "glowing green key",
    aliases: ["green key"],
    examine: "",
    initialDescription: "",
    description: "Centred on the floor here lies a glowing green key.",
    setFlag: "greenKey1Taken"
  },
  greenKey2: {
    name: "glowing green key",
    aliases: ["green key"],
    examine: "",
    description: "", // add this, found in big room
    setFlag: "greenKey2Taken"
  },
  greenKey3: {
    name: "glowing green key",
    aliases: ["green key"],
    examine: "",
    initialDescription: "Carefully placed on a pedestal is a glowing green key.", // don't really like this
    description: "A glowing green key rests here.",
    setFlag: "greenKey3Taken"
  },
  greenKey4: {
    name: "glowing green key",
    aliases: ["green key"],
    examine: "",
    initialDescription: "Wedged in a corner is a glowing green key.",
    description: "A glowing green key lies here.",
    setFlag: "greenKey4Taken"
  },
  greenKey5: {
    name: "glowing green key",
    aliases: ["green key"],
    examine: "",
    description: "", // add this, in greenKey2, the sanctuary
    setFlag: "greenKey5Taken"
  },
  greenKey6: {
    name: "glowing green key",
    aliases: ["green key"],
    examine: "",
    initialDescription: "Lying in the shattered remains of the glass case, is a glowing green key.",
    description: "A glowing green key has been left here.",
    setFlag: "greenKey6Taken"
  },
  greenKey7: {
    name: "glowing green key",
    aliases: ["green key"],
    examine: "",
    initialDescription: "On the floor, underneath the ball rests a glowing green key.",
    description: "A glowing green key sits on the floor.",
    setFlag: "greenKey7Taken"
  },
  greenKey8: {
    name: "glowing green key",
    aliases: ["green key"],
    examine: "",
    description: "", // add this, in greenKey3
    setFlag: "greenKey8Taken"
  },
  gum: {
    name: "old chewing gum",
    aliases: ["gum", "chewing gum", "old gum", "chewing-gum", "old-gum"],
    primaryType: "operate",
    examine: "",
    description: "", // not sure what to add here, as there's a special mechanic allowing for infinite gum.
    setFlag: "", //likewise
    operate: {
      eat: {
        allowedVerbs: ["eat", "consume", "bite", "taste", "lick", "swallow"], // add more?
        message: "For some *adjective here* reason, you put the old chewing gum in your mouth, and start chewing. It tastes awful. So bad, in fact, you start retching, and accidentilly swallow the gum. It gets caught in your throat, and you're forced to taste that awful flavor while contemplating eating random things you find as you asphixiate.", // this should be checked/updated/fixed
        sethealth: 0,
      }
    }
  },
  purpleKey: {
    name: "glowing purple key",
    aliases: ["purple key"],
    examine: "",
    description: "", // add this, found in the church
    setFlag: "purpleKeyTaken"
  },
  wood: {
    name: "wood",
    aliases: ["planks", "boards"],
    examine: "",
    initialDescription: "It doesn't seem *alias for stuck/nailed/glued* down, and most pieces should be mobile.", // don't like, fix
    description: "Wooden planks lie on the ground.",
    setFlag: "woodTaken"
  },
  sawdust: {
    name: "sawdust",
    aliases: ["dust", "wood dust"],
    examine: "",
    description: "A pile of sawdust sits on the ground."
  },
  dynamite: {
    name: "dynamite",
    aliases: ["explosive"],
    examine: "",
    initialDescription: "One of the crates has been pulled out, and is sitting open on the floor. A lone stick of dynamite is inside.",
    description: "A stick of dynamite rests here.",
    setFlag: "dynamiteTaken"
  },
  litDynamite: {
    name: "lit dynamite",
    aliases: ["dynamite", "explosive", "lit explosive"],
    examine: "",
    description: "A stick of lit dynamite lies on the ground, its fuse burning down rapidly.",
    vital: true
  },
  pick3: {
    name: "pickaxe",
    aliases: ["pickaxe", "pick", "axe"],
    examine: "This one is much stronger, not a mar on the head. It looks quite new.",
    initialDescription: "",
    description: "There's a shiny pickaxe, someone left it leaning on the wall.",
    setFlag: "pick3Taken",
  },
  screwdriver: {
    name: "screwdriver",
    aliases: ["driver"],
    examine: "",
    initialDescription: "A screwdriver rests among other tools on one of the benches.",
    description: "A screwdriver has been left here.",
    setFlag: "screwdriverTaken"
  },
  wrench: {
    name: "wrench",
    aliases: ["spanner"],
    examine: "",
    initialDescription: "There's a wrench lying on the floor under one of the shelves.",
    description: "A wrench lies here.",
    setFlag: "wrenchTaken"
  },
  battery: {
    name: "battery",
    aliases: ["cell", "power cell"],
    examine: "",
    initialDescription: "Stuck to one of the racks by goop is a battery.",
    description: "A battery rests on the floor.",
    setFlag: "batteryTaken"
  },
  tongs: {
    name: "tongs",
    aliases: [],
    examine: "",
    initialDescription: "Lying against the forge is a pair of tongs.",
    description: "A pair of tongs lies here.",
    setFlag: "tongsTaken"
  },
  coal: {
    name: "coal",
    aliases: ["charcoal"],
    examine: "",
    initialDescription: "A pile of coal sits in the corner.",
    description: "A pile of coal sits on the ground.",
    setFlag: "coalTaken"
  },
  crucible: {
    name: "crucible",
    aliases: ["pot"],
    examine: "",
    initialDescription: "An empty crucible sits on the anvil.",
    description: "An empty crucible lies on the ground.",
    setFlag: "crucibleTaken"
  },
  crucibleSilver: {
    name: "crucible with silver wire",
    aliases: ["crucible", "silver", "wire", "silver wire", "silver-wire"],
    examine: "",
    description: "" // just realized all these descriptions play whenever it's dropped, need to rethink
  },
  crucibleTongs: {
    name: "tongs holding crucible of molten silver",
    aliases: ["tongs", "crucible", "silver"], // add more
    examine: "",
    description: ""
  },
  silverMold: {
    name: "mold with silver",
    aliases: ["mold", "silver", "silver mold"],
    examine: "",
    description: ""
  },
  silverKey: {
    name: "silver key",
    aliases: ["silver key", "silver-key"],
    examine: "",
    description: ""
  },
  brush: {
    name: "hairbrush",
    aliases: ["brush", "hair brush", "comb"],
    examine: "",
    initialDescription: "",
    description: "A hairbrush lies on the ground.",
    setFlag: "brushTaken"
  },
  extinguisher: {
    name: "fire extinguisher",
    aliases: ["extinguisher", "fire-extinguisher"],
    examine: "",
    initialDescription: "",
    description: "A fire extinguisher sits on the ground.",
    setFlag: "extinguisherTaken"
  },
  brassHammer: {
    name: "brass hammer",
    aliases: ["hammer", "brass", "mallet"],
    examine: "",
    initialDescription: "",
    description: "A heavy brass hammer rests here, its polished surface gleaming.",
    setFlag: "brassHammerTaken"
  },
  redKey: {
    name: "glowing red key",
    aliases: ["red key", "key"],
    examine: "",
    description: "",
    setFlag: "redKeyTaken"
  },
  blueKey: {
    name: "glowing blue key",
    aliases: ["blue key", "key"],
    examine: "",
    description: "",
    setFlag: "blueKeyTaken"
  },
  coin: {
    name: "gold coin",
    aliases: ["coin", "gold", "money"],
    examine: "",
    initialDescription: "",
    description: "A shiny gold coin glints on the floor.",
    setFlag: "coinTaken"
  },
  hamburger: {
    name: "hamburger",
    aliases: ["burger", "food"],
    examine: "",
    description: "A hamburger sits on the ground."
  },
  poisonedHamburger: {
    name: "hamburger",
    aliases: ["burger", "food"],
    examine: "",
    description: "A hamburger lies on the ground."
  },
  concrete: {
    name: "concrete chunk",
    aliases: ["concrete", "chunk"],
    examine: "",
    description: "A chunk of concrete rests here."
  },
  concretePowder: {
    name: "concrete powder",
    aliases: ["powder", "concrete", "dust"],
    examine: "",
    description: "A pile of fine concrete powder sits here."
  },
  cup: {
    name: "cup of water",
    aliases: ["water", "glass of water", "cup"],
    examine: "",
    initialDescription: "A cup of water sits in the perfect middle of the table. The dust forms a ring, ~10 cm back from the glass, suggesting it is repelled by the water.",
    description: "A cup of water has been placed here.",
    setFlag: "cupTaken"
  },
  mineralWater: {
    name: "mineral water",
    aliases: ["water", "mineral", "drink"],
    examine: "",
    description: "A cup of mineral water rests here, the liquid perfectly clear."
  }
}

// ===== RECIPES =====
// Crafting recipes for combining items

const recipes = {
  ladder: {
    requires: ["dungeonWood", "nails", "hammer"],
    retains: ["hammer"],
    message: "You make a ladder out of the hammer, nails and wood",
    setFlags: ["oneHammerUse"],
  },
  map: {
    requires: ["skull", "hammer"],
    retains: ["hammer"],
    message: "You smash the skull with the hammer. Inside is a glowing purple map \nYou now have the glowing purple map",
    setFlags: ["oneHammerUse"],
  },
}

// ===== GENERIC ITEMS =====
// Items that exist everywhere but can't be taken

const genericDisallowedItems = {
  wall: "You can't take the wall.",
  walls: "You can't take the walls.",
  floor: "You can't take the floor.",
  ground: "You can't take the ground.",
  ceiling: "You can't take the ceiling.",
  roof: "You can't take the roof.",
  air: "You can't take the air.",
  darkness: "You can't take the darkness.",
  stone: "You can't take the stone.",
  me: "You can't take yourself.",
  myself: "You can't take yourself.",
  self: "You can't take yourself.",
}

const genericExamines = {
  wall: "Solid stone. Not going through that.",
  walls: "Solid stone walls surround me.",
  floor: "Hard stone floor, worn smooth by time.",
  ground: "The ground is solid beneath my feet.",
  ceiling: "The ceiling stretches above me, barely visible in the dim light.",
  roof: "The roof is too high to reach.",
  stone: "Cold, ancient stone.",
  stones: "Rough-cut stones make up the structure.",
  rock: "Solid rock, unyielding.",
  rocks: "Various sized rocks and stones.",
  dust: "A thick layer of dust covers everything.",
  dirt: "Accumulated dirt and grime from years of neglect.",
  shadows: "Dark shadows cling to every corner.",
  darkness: "Oppressive darkness presses in from all sides.",
  air: "The air is stale and musty.",
  passage: "A dark passage leading onward.",
  corridor: "A narrow corridor stretches ahead.",
  tunnel: "A rough-hewn tunnel.",
  chamber: "This chamber seems ancient.",
  room: "Just another room in this endless maze.",
  exit: "That's the way out... I hope."
}
