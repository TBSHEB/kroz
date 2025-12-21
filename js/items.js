// ===== ITEMS =====
// Pickupable items that can go in the player's inventory

const items = {
  dungeonKey: {
    names: ["key", "keys"],
    examine: "A simple key made from chain loops",
    initialDescription: "Among the shattered remains of the hanging lantern lies a key made from chain loops.",
    description: "A key made from twisted chain loops lies here.",
    setFlag: "dungeonKeyTaken",
  },
  dungeonWood: {
    names: ["wood", "planks", "boards", "floorboards"],
    examine: "Wooden planks, quite strong",
    initialDescription: "The floor is made out of loose wooden boards.",
    description: "Wooden planks lie scattered on the floor.",
    setFlag: "dungeonWoodTaken",
  },
  stepladder: {
    names: ["stepladder", "step-ladder", "steps", "ladder", "step ladder"],
    examine: "A short stepladder. Not useful for much, but could give you a bit of extra height",
    initialDescription: "There's a short stepladder propped against the wall.",
    description: "A stepladder stands against the wall.",
    setFlag: "stepladderTaken",
    vital: true,
  },
  lantern: {
    names: ["brass lantern", "lantern", "lamp", "brass", "light"],
    primaryType: "operate",
    examine: "It is currently off",
    initialDescription: "An old brass lantern rests here.",
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
    names: ["compass"],
    examine: "I know which way north is",
    initialDescription: "A compass lies in the dust.",
    description: "A compass lies on the ground.",
    setFlag: "compassTaken",
    vital: true,
  },
  nails: {
    names: ["nails", "nail"],
    examine: "Shiny!",
    description: "Nails lie on the ground.",
    setFlag: "nailsTaken",
  },
  hammer: {
    names: ["hammer"],
    examine: "It appears to be fairly weak, better use it wisely...",
    initialDescription: "A hammer rests on a bench.",
    description: "A hammer lies on the ground.",
    setFlag: "hammerTaken",
  },
  skull: {
    names: ["skull", "head"],
    examine: "A very nice specimen, although it appears to be human",
    initialDescription: "A human skull sits ominously in the centre of the room.",
    description: "A skull rests on the floor.",
    setFlag: "skullTaken",
  },
  pick1: {
    names: ["pickaxe", "pick", "axe"],
    examine: "Frail looking, can't be good for more than one or two uses",
    initialDescription: "There's a weathered pickaxe propped in the corner.",
    description: "A pickaxe leans against the wall.",
    setFlag: "pick1Taken",
  },
  ladder: {
    names: ["ladder"],
    examine: "A tall, sturdy ladder made out of floorboards",
    initialDescription: "",
    description: "A tall ladder rests against the wall.",
    vital: true
  },
  map: {
    names: ["purple map", "map", "purple"],
    examine: "It's faintly glowing, and appears to be of a great underground empire",
    initialDescription: "",
    description: "A glowing purple map has been left here.",
  },
  sword: {
    names: ["sword", "blade", "weapon"],
    primaryType: "combat",
    examine: "Sharp, deadly, slightly sentient",
    initialDescription: "A gleaming sword leans against the wall.",
    description: "A gleaming sword rests here.",
    setFlag: "swordTaken",
  },
  pick2: {
    names: ["pickaxe", "pick", "axe"],
    examine: "Frail looking, can't be good for more than one or two uses",
    initialDescription: "A pickaxe lies among the debris.",
    description: "A pickaxe lies on the ground.",
    setFlag: "pick2Taken",
  },
  helmet: {
    names: ["helmet", "helm"],
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
    names: ["parachute", "chute", "backpack"],
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
    names: ["red cake", "cake", "dessert"],
    primaryType: "operate",
    examine: "A large cake covered in deep red frosting.",
    initialDescription: "A large, red cake sits centred on the table here.",
    description: "A large, red cake sits on the ground.",
    setFlag: "redCakeTaken",
    operate: {
      eat: {
        allowedVerbs: ["eat", "consume", "bite", "taste", "lick", "swallow"],
        message: "You eat the red cake. It tastes sweet at first, then a searing pain erupts in your stomach. It feels like it's on fire! All of a sudden, you hear a loud *BANG*, and see your guts, or at least what's left of them, flop onto the floor before falling unconscious.",
        setHealth: 0
      }
    }
  },
  greenCake: {
    names: ["green cake", "cake", "dessert"],
    primaryType: "operate",
    examine: "A large cake decorated with bright green icing.",
    initialDescription: "A large, green cake is sitting on the bench.",
    description: "A large, green cake sits on the ground.",
    setFlag: "greenCakeTaken",
    operate: {
      eat: {
        allowedVerbs: ["eat", "consume", "bite", "taste", "lick", "swallow"],
        message: "You eat the green cake. It tastes amazing, and you feel a warm, soothing sensation spread through your body. Your wounds begin to heal, and you feel completely refreshed.",
        action: "setCheckpoint",
        consumeOnOperate: true,
        setHealth: 4
      }
    }
  },
  blueCake: {
    names: ["blue cake", "cake", "dessert"],
    primaryType: "operate",
    examine: "A massive blue wedding cake, intricately decorated. Far too much for one person.",
    initialDescription: "A large, blue, wedding cake sits on the floor. Despite its colour, it looks out of place.",
    description: "A large, blue wedding cake sits on the ground.",
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
    names: ["shovel", "spade", "digging thing"],
    examine: "A sturdy metal shovel with a wooden handle. Good for digging.",
    initialDescription: "There's a sturdy looking shovel, leaning in the corner.",
    description: "A sturdy shovel has been left here.",
    setFlag: "shovelTaken",
    vital: true
  },
  wire: {
    names: ["silver wire", "wire", "silver"],
    examine: "A small coil of thin silver wire, very fine and delicate.",
    initialDescription: "Lying on the floor, randomly, in the middle of the maze is a small coil of silver wire.",
    description: "A coil of silver wire lies here.",
    setFlag: "wireTaken"
  },
  brick1: {
    names: ["brick", "stone"],
    examine: "A solid, undamaged brick. Heavy and well-made.",
    initialDescription: "Buried within the rubble, seems to be a solid, non-chipped brick.",
    description: "A solid brick lies on the ground.",
    setFlag: "brick1Taken"
  },
  brick2: {
    names: ["brick", "stone"],
    examine: "A solid, undamaged brick. Heavy and well-made.",
    initialDescription: "Underneath the first brick lies a second, clean brick.",
    description: "A clean brick lies on the ground.",
    setFlag: "brick2Taken"
  },
  greenKey1: {
    names: ["glowing green key", "green key"],
    examine: "A simple key. It's glowing green, and looks fragile.",
    initialDescription: "Centred on the floor here lies a glowing green key.",
    description: "A glowing green key lies on the ground.",
    setFlag: "greenKey1Taken"
  },
  greenKey2: {
    names: ["glowing green key", "green key"],
    examine: "A simple key. It's glowing green, and looks fragile.",
    initialDescription: "Someone left a glowing green key lying on the floor.",
    description: "A glowing green key has been dropped here.",
    setFlag: "greenKey2Taken"
  },
  greenKey3: {
    names: ["glowing green key", "green key"],
    examine: "A simple key. It's glowing green, and looks fragile.",
    initialDescription: "A glowing green key sits atop a marble pedestal.",
    description: "A glowing green key rests here.",
    setFlag: "greenKey3Taken"
  },
  greenKey4: {
    names: ["glowing green key", "green key"],
    examine: "A simple key. It's glowing green, and looks fragile.",
    initialDescription: "Wedged in a corner is a glowing green key.",
    description: "A glowing green key lies here.",
    setFlag: "greenKey4Taken"
  },
  greenKey5: {
    names: ["glowing green key", "green key"],
    examine: "A simple key. It's glowing green, and looks fragile.",
    initialDescription: "A glowing green key lies peacefully on the sanctuary floor.",
    description: "A glowing green key rests on the ground.",
    setFlag: "greenKey5Taken"
  },
  greenKey6: {
    names: ["glowing green key", "green key"],
    examine: "A simple key. It's glowing green, and looks fragile.",
    initialDescription: "Lying in the shattered remains of the glass case, is a glowing green key.",
    description: "A glowing green key has been left here.",
    setFlag: "greenKey6Taken"
  },
  greenKey7: {
    names: ["glowing green key", "green key"],
    examine: "A simple key. It's glowing green, and looks fragile.",
    initialDescription: "On the floor, underneath the ball rests a glowing green key.",
    description: "A glowing green key sits on the floor.",
    setFlag: "greenKey7Taken"
  },
  greenKey8: {
    names: ["glowing green key", "green key"],
    examine: "A simple key. It's glowing green, and looks fragile.",
    initialDescription: "A glowing green key sits in the corner of the room.",
    description: "A glowing green key lies here.",
    setFlag: "greenKey8Taken"
  },
  gum: {
    names: ["old chewing gum", "gum", "chewing gum", "old gum", "chewing-gum", "old-gum"],
    primaryType: "operate",
    examine: "Old chewing gum, hardened and discolored. Utterly repulsive.",
    initialDescription: "Someone's discarded chewing gum is stuck here. Gross.",
    description: "A wad of old chewing gum has been left here.",
    operate: {
      eat: {
        allowedVerbs: ["eat", "consume", "bite", "taste", "lick", "swallow"],
        message: "For some incomprehensible reason, you put the old chewing gum in your mouth and start chewing. It tastes absolutely awful. So bad, in fact, you start retching, and accidentally swallow the gum. It gets caught in your throat, and you're forced to taste that awful flavor while contemplating your poor life choices as you asphyxiate.",
        setHealth: 0,
      }
    }
  },
  purpleKey: {
    names: ["glowing purple key", "purple key"],
    examine: "A simple key. It's glowing purple, and looks fragile.",
    initialDescription: "Lying on the church floor is a glowing purple key.",
    description: "A glowing purple key rests here.",
    setFlag: "purpleKeyTaken"
  },
  wood: {
    names: ["wood", "planks", "boards"],
    examine: "A stack of wooden boards, surprisingly lightweight for their size.",
    initialDescription: "The wooden paneling here is loose and could be removed.",
    description: "Wooden planks lie on the ground.",
    setFlag: "woodTaken"
  },
  sawdust: {
    names: ["sawdust", "dust", "wood dust"],
    examine: "A massive pile of sawdust. It smells faintly of old wood.",
    description: "A pile of sawdust sits on the ground."
  },
  dynamite: {
    names: ["dynamite", "explosive"],
    examine: "A single stick of dynamite with a long fuse. Handle with care.",
    initialDescription: "One of the crates has been pulled out, and is sitting open on the floor. A lone stick of dynamite is inside.",
    description: "A stick of dynamite rests here.",
    setFlag: "dynamiteTaken"
  },
  litDynamite: {
    names: ["lit dynamite", "dynamite", "explosive", "lit explosive"],
    examine: "A stick of dynamite with its fuse burning rapidly. This is bad.",
    description: "A stick of lit dynamite lies on the ground, its fuse burning down rapidly.",
    vital: true
  },
  pick3: {
    names: ["pickaxe", "pick", "axe"],
    examine: "This one is much stronger, not a mar on the head. It looks quite new.",
    initialDescription: "A well-kept pickaxe has been left here, barely used.",
    description: "There's a shiny pickaxe, someone left it leaning on the wall.",
    setFlag: "pick3Taken",
  },
  screwdriver: {
    names: ["screwdriver", "driver"],
    examine: "A long flathead screwdriver. The tip is worn and rounded, barely functional anymore.",
    initialDescription: "A screwdriver rests among other tools on one of the benches.",
    description: "A screwdriver has been left here.",
    setFlag: "screwdriverTaken"
  },
  wrench: {
    names: ["wrench", "spanner"],
    examine: "A heavy adjustable wrench, well-used but still sturdy.",
    initialDescription: "There's a wrench lying on the floor under one of the shelves.",
    description: "A wrench lies here.",
    setFlag: "wrenchTaken"
  },
  battery: {
    names: ["battery", "cell", "power cell"],
    examine: "A cylindrical battery, still has some charge left.",
    initialDescription: "Stuck to one of the racks by goop is a battery.",
    description: "A battery rests on the floor.",
    setFlag: "batteryTaken"
  },
  tongs: {
    names: ["tongs"],
    examine: "A pair of metal tongs, designed for handling hot objects.",
    initialDescription: "Lying against the forge is a pair of tongs.",
    description: "A pair of tongs lies here.",
    setFlag: "tongsTaken"
  },
  coal: {
    names: ["coal", "charcoal"],
    examine: "A pile of black coal. Very good fuel for a hot fire.",
    initialDescription: "A pile of coal sits in the corner.",
    description: "A pile of coal sits on the ground.",
    setFlag: "coalTaken"
  },
  crucible: {
    names: ["crucible", "pot"],
    examine: "A small metal vessel designed for melting and pouring molten metal.",
    initialDescription: "An empty crucible sits on the anvil.",
    description: "An empty crucible lies on the ground.",
    setFlag: "crucibleTaken"
  },
  crucibleSilver: {
    names: ["crucible with silver wire", "crucible", "silver", "wire", "silver wire", "silver-wire"],
    examine: "A small crucible containing coiled silver wire.",
    description: "A crucible containing silver wire lies here."
  },
  crucibleTongs: {
    names: ["tongs holding crucible of molten silver", "tongs", "crucible", "silver"],
    examine: "The tongs grip a crucible filled with molten silver, glowing with heat.",
    description: "A pair of tongs holding a crucible of molten silver rests here."
  },
  silverMold: {
    names: ["mold with silver", "mold", "silver", "silver mold"],
    examine: "A small key-shaped mold filled with molten silver, cooling slowly.",
    description: "A mold filled with molten silver rests here."
  },
  silverKey: {
    names: ["silver key", "silver-key"],
    examine: "A simple key crafted from solid silver.",
    description: "A silver key lies on the ground."
  },
  brush: {
    names: ["hairbrush", "brush", "hair brush", "comb"],
    examine: "A silver-backed hairbrush with fine bristles.",
    initialDescription: "Someone left their hairbrush here.",
    description: "A hairbrush lies on the ground.",
    setFlag: "brushTaken"
  },
  extinguisher: {
    names: ["fire extinguisher", "extinguisher", "fire-extinguisher"],
    examine: "A fire extinguisher, the pressure gauge indicating it's ready for use.",
    initialDescription: "Mounted on the wall is a red fire extinguisher.",
    description: "A fire extinguisher sits on the ground.",
    setFlag: "extinguisherTaken"
  },
  brassHammer: {
    names: ["brass hammer", "hammer", "brass", "mallet"],
    examine: "A hammer, cast entirely from brass. Tapping it gives a nice ring",
    initialDescription: "A brass hammer lies on a workbench.",
    description: "A brass hammer rests here.",
    setFlag: "brassHammerTaken"
  },
  redKey: {
    names: ["glowing red key", "red key", "key"],
    examine: "A simple key. It's glowing red, and looks fragile.",
    initialDescription: "A glowing red key sits prominently on a stand mounted to the wall.",
    description: "A glowing red key rests here.",
    setFlag: "redKeyTaken"
  },
  blueKey: {
    names: ["glowing blue key", "blue key", "key"],
    examine: "A simple key. It's glowing blue, and looks fragile.",
    initialDescription: "A glowing blue key is sitting on a windowsill.",
    description: "A glowing blue key rests here.",
    setFlag: "blueKeyTaken"
  },
  coin: {
    names: ["gold coin", "coin", "gold", "money"],
    examine: "A solid gold coin with unfamiliar markings stamped on both sides.",
    initialDescription: "Half-buried in the dust is a single gold coin.",
    description: "A shiny gold coin glints on the floor.",
    setFlag: "coinTaken"
  },
  hamburger: {
    names: ["hamburger", "burger", "food"],
    examine: "A hamburger kept warm in the vending machine. Still looks edible.",
    initialDescription: "Sitting in the vending machine's tray is a fresh hamburger.",
    description: "A hamburger sits on the ground."
  },
  hamburgerPoisoned: {
    names: ["hamburger", "burger", "food"],
    examine: "A hamburger kept warm in the vending machine. Still looks edible.",
    initialDescription: "Sitting in the vending machine's tray is a fresh hamburger.",
    description: "A hamburger lies on the ground."
  },
  concrete: {
    names: ["concrete chunk", "concrete", "chunk"],
    examine: "A chunk of concrete. Touching it sends odd tingles through your fingers.",
    description: "A chunk of concrete rests here."
  },
  concretePowder: {
    names: ["concrete powder", "powder", "concrete", "dust"],
    examine: "Finely ground concrete powder. Touching it sends tingles through your fingers.",
    description: "A pile of fine concrete powder sits here."
  },
  cup: {
    names: ["cup of water", "water", "glass of water", "cup"],
    examine: "A cup of remarkably clear water. It doesn't look like it came from here.",
    initialDescription: "A cup of water sits in the perfect middle of the table. The dust forms a ring, ~10 cm back from the glass, suggesting it is repelled by the water.",
    description: "A cup of water has been placed here.",
    setFlag: "cupTaken"
  },
  mineralWater: {
    names: ["mineral water", "water", "mineral", "drink"],
    examine: "A cup of water filled with concrete powder. I don't have the best feeling about this.",
    description: "A cup of mineral water rests here, the liquid perfectly clear."
  },
  spentExtinguisher: {
    names: ["fire extinguisher", "extinguisher", "fire-extinguisher", "empty extinguisher"],
    examine: "An empty fire extinguisher. The pressure gauge reads zero.",
    description: "A fire extinguisher sits on the ground.",
    setFlag: "spentExtinguisherTaken"
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
