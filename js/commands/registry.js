// ===== COMMAND REGISTRY =====

// Maps command aliases to their action types
// null = generic "use" (we'll infer intent based on context)
const aliasToAction = {
  'use': null,              // Generic - can mean apply, attack, or craft
  'apply': 'apply',         // Explicitly using an item on something
  'attack': 'attack',       // Combat actions
  'kill': 'attack',
  'strike': 'attack',
  'stab': 'attack',
  'hit': 'attack',
  'combine': 'craft',       // Crafting/combining items
  'craft': 'craft',
  'make': 'craft',
  'create': 'craft',
  'operate': 'operate',
  'equip': 'operate',
  'wear': 'operate',
  'light': 'operate',
  'activate': 'operate',
  'unequip': 'operate',
  'remove': 'operate',
  'extinguish': 'operate',
  'deactivate': 'operate',
  'open': 'operate',
  'lift': 'operate',
  'shut': 'operate',
  'close': 'operate',
};

// Common prepositions we recognize as separators
const PREPOSITIONS = ['on', 'with', 'to', 'at', 'and', 'using', 'in', 'into'];

// Define command data with aliases and failure messages
const commandData = {
  help: {
    command: help,
    failedCommand: (subject) => `I can't help you with ${subject}`,
    aliases: ["h", "?"]
  },
  inventory: {
    command: inventory,
    failedCommand: (subject) => `I can't put ${subject} in my inventory like that`,
    aliases: ["inv", "i"]
  },
  look: {
    command: look,
    failedCommand: (subject) => `I don't see ${subject} here`,
    aliases: ["l"]
  },
  north: {
    command: () => move("north"),
    failedCommand: (subject) => `I can't go north to ${subject}`,
    aliases: ["n"]
  },
  northeast: {
    command: () => move("northeast"),
    failedCommand: (subject) => `I can't go northeast to ${subject}`,
    aliases: ["ne"]
  },
  east: {
    command: () => move("east"),
    failedCommand: (subject) => `I can't go east to ${subject}`,
    aliases: ["e"]
  },
  southeast: {
    command: () => move("southeast"),
    failedCommand: (subject) => `I can't go southeast to ${subject}`,
    aliases: ["se"]
  },
  south: {
    command: () => move("south"),
    failedCommand: (subject) => `I can't go south to ${subject}`,
    aliases: ["s"]
  },
  southwest: {
    command: () => move("southwest"),
    failedCommand: (subject) => `I can't go southwest to ${subject}`,
    aliases: ["sw"]
  },
  west: {
    command: () => move("west"),
    failedCommand: (subject) => `I can't go west to ${subject}`,
    aliases: ["w"]
  },
  northwest: {
    command: () => move("northwest"),
    failedCommand: (subject) => `I can't go northwest to ${subject}`,
    aliases: ["nw"]
  },
  up: {
    command: () => move("up"),
    failedCommand: (subject) => `I can't go up to ${subject}`,
    aliases: ["u"]
  },
  down: {
    command: () => move("down"),
    failedCommand: (subject) => `I can't go down to ${subject}`,
    aliases: ["d"]
  },
  back: {
    command: () => move("back"),
    failedCommand: (subject) => `I can't go back to ${subject}`,
    aliases: ["b"]
  },
  save: {
    command: () => save([]),
    failedCommand: (subject) => `I can't save ${subject}.`,
    aliases: [],
  },
  load: {
    command: () => load([]),
    failedCommand: (subject) => `I can't load ${subject}.`,
    aliases: [],
  },
  reset: {
    command: reset,
    failedCommand: (subject) => `I can't reset ${subject}.`,
    aliases: ["restart"],
  },
  fullReset: {
    command: fullReset,
    failedCommand: (subject) => `I can't completely reset ${subject}.`,
    aliases: ["hard-reset", "full-reset", "complete-reset", "fullreset", "hardreset"]
  }
};

// Build simpleCommands object with aliases pre-populated
const simpleCommands = {};
for (const [key, data] of Object.entries(commandData)) {
  simpleCommands[key] = data;
  // Add aliases pointing to same object
  for (const alias of data.aliases) {
    simpleCommands[alias] = data;
  }
}

// Complicated commands for future implementation
const complicatedCommands = {
  take: {
    command: (things) => take(things),
    singleCommand: (alias) => takeSingle(alias),
    failedCommand: "I can't take that.",
    aliases: ["grab", "get", "obtain", "collect", "acquire"]
  },
  drop: {
    command: (things) => drop(things),
    singleCommand: (alias) => dropSingle(alias),
    failedCommand: "I can't drop that.",
    aliases: []
  },
  examine: {
    command: (things) => examine(things),
    singleCommand: (alias) => examineSingle(alias),
    failedCommand: "I can't examine that.",
    aliases: ["x", "inspect", "check", "view"]
  },
  say: {
    command: say,
    singleCommand: (alias) => saySingle(alias),
    failedCommand: (subject) => subject,
    aliases: ["say", "speak", "answer"]
  }
};

// Build complicatedCommands with aliases
for (const [key, data] of Object.entries(complicatedCommands)) {
  if (data.aliases) {
    for (const alias of data.aliases) {
      complicatedCommands[alias] = data;
    }
  }
}

// Words that have funny responses when used as a main command
const knownWords = {
  scream: "AaaaRrgHh!",
  yell: "AaaaRrgHh!",
  shout: "Hey! ...the echoes fade into silence.",
  run: "There's nowhere to run to.",
  jump: "You jump up and down. Nothing happens.",
  leap: "You leap into the air and land back where you started.",
  dance: "I'm not in the mood for dancing.",
  sing: "La la laaaa... I should focus on escaping.",
  sleep: "I can't sleep here.",
  rest: "There's no time for rest.",
  sit: "You sit down briefly, then get back up.",
  wait: "Time passes. Nothing changes.",
  think: "I need to find a way out of here.",
  pray: "I hope someone is listening.",
  cry: "I hold back the tears.",
  laugh: "Ha ha... ha...",
  whistle: "You whistle nervously.",
  clap: "*clap clap*",
  kick: "You kick at nothing in particular.",
  punch: "You throw a punch at the air.",
  swim: "There's no water here.",
  fly: "I can't fly.",
  climb: "There's nothing to climb right now.",
  dig: "I'd need proper tools for that.",
  smell: "The air smells stale.",
  listen: "You listen carefully. Just silence and distant echoes.",
  hide: "There's nowhere to hide."
}
