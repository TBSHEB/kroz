# AGENTS.md

## Project Overview

Kroz is a browser-based text adventure game built with vanilla JavaScript, HTML, and CSS. The game features a complete pre-written story with 100+ rooms and a full map. The implementation preserves player progress across sessions using localStorage.

**Key Characteristics:**
- Vanilla JavaScript (no frameworks or build tools)
- Minimal CSS/HTML for presentation
- Browser-based with localStorage for persistence
- Text-based adventure game mechanics
- Command-driven navigation (north, south, inventory, etc.)
- Turn-based combat system with instakill mechanics

## Project Philosophy

The project owner (Ricky) prefers to write the majority of code themselves as a learning exercise. When assisting:
- **Provide guidance and suggestions** rather than complete implementations
- **Explain approaches and trade-offs** to enable informed decisions
- **Offer code snippets as examples**, not full solutions
- **Focus on answering specific questions** and debugging issues
- **Respect the learning-by-doing approach** - this is an educational project

**Exception:** For routine/tedious tasks explicitly requested by the user (like adding aliases, filling in data structures), provide complete implementations.

## Setup Commands

**No build tools or package managers required.**

### Running the Game

**Option 1: Local development server (recommended)**
```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve

# PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000` in your browser.

**Option 2: Direct file opening**
```bash
# Open in default browser
xdg-open index.html  # Linux
open index.html      # macOS
start index.html     # Windows
```

Note: Direct file opening may cause localStorage issues in some browsers.

### Prerequisites
- A modern web browser (Chrome 60+, Firefox 54+, Safari 10.1+)
- A local web server for development (recommended to avoid CORS issues)

## Project Structure

```
Kroz/
├── index.html          # Main game page
├── css/
│   └── style.css      # Game styling
├── js/
│   ├── game.js        # Core game logic and DOM handling
│   ├── commands/      # Command system (modular)
│   │   ├── actions.js      # Action commands (take, drop, use, etc.)
│   │   ├── helpers/        # Helper functions (split by domain)
│   │   │   ├── environment.js  # State management, effects, room tracking, temp items, utilities
│   │   │   ├── mechanics.js    # Combat, recipes, riddles, hazards, processTick
│   │   │   └── parsing.js      # Input parsing, item lookup, disambiguation
│   │   ├── information.js  # Info commands (look, examine, inventory)
│   │   ├── movement.js     # Movement commands (north, south, etc.)
│   │   ├── registry.js     # Command registration and aliases
│   │   └── use/            # "use" command system (modular)
│   │       ├── attack.js      # Attack/combat use logic
│   │       ├── operate.js     # Operate verb handler
│   │       ├── apply.js       # Apply verb handler
│   │       ├── craft.js       # Craft verb handler
│   │       ├── resolution.js  # Use command resolution/routing
│   │       └── use.js         # Main use command entry point
│   ├── map.js         # Room definitions (100+ rooms)
│   ├── items.js       # Item definitions
│   ├── objects.js     # Object definitions (interactable non-items)
│   ├── references.js  # Cross-references between game elements
│   └── storage.js     # localStorage handling
├── README.md          # Human-readable project info
├── TODO.md            # Development task list
├── COMBAT.md          # Combat system design document
└── AGENTS.md          # This file
```

## Critical Script Loading Order

**IMPORTANT:** Scripts must load in this exact order in `index.html`:

```html
<script src="js/map.js"></script>                              <!-- 1. Room definitions -->
<script src="js/items.js"></script>                            <!-- 2. Item definitions -->
<script src="js/objects.js"></script>                          <!-- 3. Object definitions -->
<script src="js/commands/helpers/environment.js"></script>     <!-- 4. Helpers: state, effects, utilities -->
<script src="js/commands/helpers/mechanics.js"></script>       <!-- 5. Helpers: combat, hazards, processTick -->
<script src="js/commands/helpers/parsing.js"></script>         <!-- 6. Helpers: parsing, item lookup -->
<script src="js/commands/use/attack.js"></script>              <!-- 7. Use: attack handler -->
<script src="js/commands/use/operate.js"></script>             <!-- 8. Use: operate handler -->
<script src="js/commands/use/apply.js"></script>               <!-- 9. Use: apply handler -->
<script src="js/commands/use/craft.js"></script>               <!-- 10. Use: craft handler -->
<script src="js/commands/use/resolution.js"></script>          <!-- 11. Use: resolution/routing -->
<script src="js/commands/use/use.js"></script>                 <!-- 12. Use: main entry point -->
<script src="js/commands/actions.js"></script>                 <!-- 13. Action commands -->
<script src="js/commands/movement.js"></script>                <!-- 14. Movement commands -->
<script src="js/commands/information.js"></script>             <!-- 15. Info commands -->
<script src="js/commands/registry.js"></script>                <!-- 16. Command registry -->
<script src="js/game.js"></script>                             <!-- 17. Core game logic -->
<script src="js/storage.js"></script>                          <!-- 18. Save/load functions -->
```

Reason: `map.js` references items from `items.js` and objects from `objects.js`. Helper files load environment first (state setters used by all), then mechanics, then parsing. The use command handlers must load before the main use.js entry point. All commands must load before `game.js`. `game.js` depends on all data and command definitions.

## Code Style Guidelines

### JavaScript

- Use modern ES6+ syntax where appropriate
- Prefer `const` and `let` over `var`
- Use descriptive variable names (e.g., `currentRoom` not `cr`)
- Keep functions focused and single-purpose
- Add comments for complex game logic or story mechanics
- **ALWAYS use `===` instead of `==`** for comparisons

**Naming Conventions:**
- Variables: camelCase (`playerInventory`, `currentLocation`)
- Functions: camelCase (`saveGame()`, `processCommand()`)
- Constants: UPPER_SNAKE_CASE (`SAVE_KEY`, `MAX_INVENTORY_SIZE`)
- Classes (if used): PascalCase (`GameState`)

**Security Requirements:**
- **ALWAYS use `textContent` for user-generated content** (XSS prevention)
- Avoid `innerHTML` with unsanitized input to prevent injection attacks
- Validate all data retrieved from localStorage before use
- Avoid `eval()` or similar dynamic code execution

### HTML

- Use semantic HTML5 elements
- Keep structure minimal and clean
- Use meaningful IDs and classes

### CSS

- Keep styling simple and functional
- Use classes over IDs for styling
- Maintain readability over complex selectors

## Game Architecture

### Room Structure (map.js)

Rooms use plain objects with this structure:

```javascript
const rooms = {
  "roomId": {
    name: "Room Name",           // Display name (string or {base, parts} object)
    look: "Description text",    // What player sees (string or {base, parts} object)
    passages: {                  // Available exits
      north: "otherRoomId",
      up: "anotherRoomId"
    },
    restrictedPassages: {        // Passages requiring flags/items (optional)
      east: {
        requirements: [
          {flag: "doorOpen", failMessage: "The door is locked."}
        ],
        room: "secretRoom",
        metDescription: "An open door to the east."
      }
    },
    items: ["item1", "item2"],   // Pickupable items (IDs from items.js)
    objects: ["object1"],         // Fixed interactables (IDs from objects.js)
    roomItems: [],                // Dynamic items added via gameplay (e.g., ladder)
    light: true,                  // Room has natural light (optional, default false)
    isCheckpoint: true,           // Safe respawn point (optional)
    hazard: {                     // Environmental hazard (optional)
      count: 2,                   // Commands before damage
      damage: 1,                  // Damage per cycle
      messages: ["..."],          // Random damage messages
      unless: "flagName",         // Flag that disables hazard
      killIfInventory: {          // Instant death items
        itemId: "Death message"
      }
    },
    onExit: {                     // Flags set when leaving (optional)
      setFlags: ["leftRoom"]     // Any-exit format: fires on all exits
      // OR direction-specific:
      // east: { setFlags: ["gameOver"] }  // Only fires when leaving east
    },
    entryMessages: {              // Custom messages on entry (optional)
      north: "You fall through a hole."  // String, supports {{gameState.x}} templates
    },
    scenery: {                    // Non-takeable room elements
      "walls": "The walls are part of the structure."
    }
  }
};
```

**Important:**
- Room IDs (keys) must be unique - duplicate keys will overwrite previous definitions
- Passages can be non-symmetrical (going north then south might not return to start)
- Direction abbreviations: `n`, `s`, `e`, `w`, `ne`, `se`, `sw`, `nw`, `u`, `d`
- Items/objects must be defined in their respective files before being referenced
- `roomItems` is modified during gameplay (e.g., placing ladders creates new passages)
- Rooms without `light: true` are dark and block look/examine/takeAll without lantern

### Item Structure (items.js)

```javascript
const items = {
  "itemId": {
    names: ["primary name", "alias1", "alias2"],  // All valid names
    description: "Text shown when item is in room",
    examine: "Detailed examination text",  // String or {base, parts} object
    primaryType: "equipment|consumable|weapon|tool",  // For smart routing
    canTake: [                   // Array of deny conditions (optional)
      { unless: { hasItem: "x" }, message: "Denial text." }
    ],
    infinite: true,              // Stays in room after taking (optional)
    vital: true,                 // Protected from blue cake theft (optional)
    softlockable: {              // Room-conditional vital (optional)
      rooms: ["room1", "room2"],
      reaction: "vital"
    },
    temporary: {                 // Countdown config (optional)
      requireFlags: ["flagName"],  // Only counts when all flags present
      duration: 800,
      // ...
    },
    operate: {                   // Operating the item
      activate: {
        allowedVerbs: ["light", "activate"],
        message: "You activate it.",
        setFlags: ["activated"],
        requireNotFlags: ["broken"],
        failMessages: {          // Flag-specific fail messages
          broken: "It's broken.",
          activated: "Already on."
        },
        setHealth: 4,            // Set player health
        removeItem: true         // Consume item after use
      }
    },
    applyWith: {                 // Applying to objects
      itemId: {
        message: "You combine them.",
        consumeItem: true
      }
    }
  }
};
```

**Temporary Items:**
Items with `temporary` property count down while in inventory:
```javascript
temporary: {
  requireFlags: ["lanternLit"],   // Only counts when all flags present
  duration: 800,                  // Commands until expiration
  messages: {                     // Warning messages at specific counts
    100: "Getting low...",
    750: "Almost done!"
  },
  onExpire: "extinguish",         // Action: "extinguish" or "destroy"
  onExpireMessage: {
    inventory: "It goes out.",
    floor: "It fizzles out."
  },
  actionSetFlags: ["out"],        // Flags to set on expiration
  actionUnsetFlags: ["lit"]       // Flags to unset
}
```

### Object Structure (objects.js)

Objects are non-takeable interactables in rooms:

```javascript
const objects = {
  "objectId": {
    names: ["primary name", "alias1"],
    examine: "Examination text",    // String or {base, parts} object
    onExamine: {                    // Effects to run before showing examine text (optional)
      generateSequence: { storeName: "seqName", values: ["a", "b", "c"] }
    },
    onUse: {
      // Interaction logic
    },
    combatType: "enemy",  // For combat objects
    // Combat properties (see COMBAT.md)
  }
};
```

### Command System (commands/ directory)

The command system is modular:

- **helpers/ directory**: Helper functions split by domain
  - **environment.js**: State management (`setGameState`, `setRoomState`, `applyEffects`, `trackRoomChange`), temporary items, dynamic flags (`evaluateDynamicFlags`), conditional text resolver (`resolveConditionalText`, `resolveTemplates`), canTake evaluator (`evaluateCanTake`), damage messages (`getDamageMessage`), utilities (`pickRandom`, `arraysMatchUnordered`)
  - **mechanics.js**: Combat (`initializeCombat`, `processEnemyTurns`), hazards (`processHazards`, `checkKillIfInventory`), puzzles (`checkRiddleAnswer`, `findRecipeMatch`, `checkCombinations`), `processTick` (post-command game world tick)
  - **parsing.js**: Input parsing (`parseActionCommand`, `parseThingsFromWords`), item lookup (`buildInteractablesList`, `findInteractable`, `disambiguateItem`), name resolution (`replaceSplitWordsWithFullName`, `matchItemPhrase`)
- **use/ directory**: Modular "use" command system
  - **attack.js**: Handles attack/combat use interactions
  - **operate.js**: Handles operate verb (levers, switches, mechanisms)
  - **apply.js**: Handles apply verb (applying items to things)
  - **craft.js**: Handles craft verb (creating items from components)
  - **resolution.js**: Routes use commands to appropriate handlers
  - **use.js**: Main use command entry point
- **actions.js**: Action commands (take, drop, etc.)
- **movement.js**: Movement commands (north, south, up, down, etc.)
- **information.js**: Info commands (look, examine, inventory)
- **registry.js**: Maps command strings to functions with aliases

```javascript
// In registry.js
const commands = {
  "inventory": inventory,
  "i": inventory,        // Alias points to same function
  "north": north
};
```

### Game State (storage.js)

Save format stored in localStorage under key `'kroz-save'`:

```javascript
{
  currentRoom: "roomId",
  previousRoom: "previousRoomId",
  inventory: ["item1", "item2"],
  visitedRooms: ["room1", "room2"],
  flags: ["flag1", "flag2"],      // Game flags
  roomChanges: {              // Tracks items added/removed from rooms
    roomId: ["item1", "item2"]
  },
  combatState: {},                // Combat tracking per enemy
  healthState: 4,                 // Player health (4 = full, 0 = dead)
  poison: 0,                      // Poison level
  hazardState: {                  // Current hazard tracking
    room: "roomId",
    count: 1
  },
  itemCountdowns: {               // Temporary item countdowns
    itemId: 350
  },
  sequences: {},                  // Puzzle sequence state (e.g., colorCode, buttonsPressed)
  commandCount: 0,                // Total commands processed (used in ending)
  lastCheckpoint: "start",        // Respawn location
  timestamp: "ISO-8601 string"
}
```

**Important:**
- Always validate loaded data (could be corrupted/tampered)
- Handle localStorage unavailable/full scenarios
- `healthState`: 4 = full health, 3 = minor damage, 2 = moderate damage, 1 = severe, 0 = dead

## Testing Instructions

### Manual Testing Checklist
- [ ] Game loads without errors in browser console (F12)
- [ ] New game starts correctly
- [ ] Save game functionality works
- [ ] Load game restores correct state
- [ ] Command input handles Enter key
- [ ] All direction commands work (north, n, south, s, etc.)
- [ ] Inventory system functions properly
- [ ] Game works after page reload
- [ ] Test in multiple browsers (Chrome, Firefox)
- [ ] Test all item interactions (take, drop, examine, use)
- [ ] Test object interactions
- [ ] Test combat system (if implemented)

### Browser Console Testing

Open DevTools (F12) → Console tab:

```javascript
// View current save data
JSON.parse(localStorage.getItem('kroz-save'));

// Clear save for testing
localStorage.removeItem('kroz-save');

// Check if storage is available
typeof(Storage) !== "undefined";

// Inspect game state
console.log(gameState);

// Test command processing
processInput("north");
```

### Debugging

Open browser DevTools (F12) → Console tab to see:
- Error messages
- `console.log()` output from game code
- localStorage contents
- Network requests (if any)

## Common Development Tasks

### Adding New Rooms
1. Define room object in `map.js`
2. Add room connections in `passages` object
3. Reference any items/objects (must exist in `items.js`/`objects.js`)
4. Test navigation to/from the room

### Adding Items
1. Define item in `items.js` with `names`, `description`, `examine`, `primaryType`
2. Place item in appropriate room's `items` array in `map.js`
3. Add any item-specific interactions in `operate` or `applyWith` properties
4. Optional properties: `infinite`, `canTake` (deny conditions array), `temporary` (countdown object), `vital`, `softlockable`
5. Test take, drop, examine, and use commands

### Adding Crafting Recipes
1. Define recipe in `items.js` `recipes` object
2. Structure:
   ```javascript
   resultItemId: {
     requires: ["item1", "item2"],
     creates: ["resultItem"],     // Optional, defaults to recipe key
     retains: ["item1"],           // Items not consumed
     unsetFlags: ["flag1"],        // Flags to remove
     resetCountdowns: ["itemId"],  // Reset temporary item timers
     setFlags: ["crafted"],
     message: "You craft something."
   }
   ```

### Adding Objects
1. Define object in `objects.js`
2. Add to room's `objects` array in `map.js`
3. Implement `examine` and `onUse` properties
4. Test interactions

### Adding Commands
1. Define command function in appropriate file under `commands/`
   - Movement → `movement.js`
   - Actions → `actions.js`
   - Information → `information.js`
2. Add to `commands` object in `registry.js` with any aliases:
   ```javascript
   "jump": jump,
   "j": jump
   ```

### Debugging Save/Load

```javascript
// View current save
console.log(JSON.parse(localStorage.getItem('kroz-save')));

// Manually set test state
localStorage.setItem('kroz-save', JSON.stringify({
  currentRoom: 'start',
  inventory: [],
  gameFlags: {}
}));

// Clear corrupted save
localStorage.removeItem('kroz-save');

// Test save function
saveGame();

// Test load function
loadGame();
```

## Security Considerations

### XSS Prevention

```javascript
// ✅ Good: Use textContent for user input
element.textContent = userInput;

// ❌ Bad: innerHTML with unsanitized input
// element.innerHTML = userInput;  // NEVER DO THIS
```

### localStorage Security

- Don't store sensitive information (it's not encrypted)
- Validate all data retrieved from localStorage before use
- Sanitize any user input before storing
- Be cautious with dynamic code execution

### Input Validation

- Always validate command input
- Check for undefined/null values before accessing object properties
- Use optional chaining (`?.`) where appropriate
- Validate item/object IDs exist before manipulation

## Game Systems

### Combat System

Kroz features a turn-based combat system with instakill mechanics. See `COMBAT.md` for full specification.

**Key Points:**
- First engagement with correct item = instant kill
- Wrong item or non-attack action = combat begins
- Player health: 4 states (4 = full, 3 = minor damage, 2 = moderate, 1 = severe, 0 = dead)
- Enemies have dodge chances and defensive moves
- Death respawns player at last checkpoint

**Combat Properties in objects.js:**
```javascript
{
  combatType: "enemy",
  firstStrikeKill: true,
  dodgeChance: 0.5,
  dodgeChanceDamaged: 0.7,
  defensiveChance: 0.25,
  // See COMBAT.md for full structure
}
```

### Hazard System

Rooms can have environmental hazards that damage the player:

```javascript
hazard: {
  count: 2,                    // Commands before damage
  damage: 1,                   // Damage amount
  messages: ["Ouch!", "..."],  // Random damage messages
  unless: "fireout",           // Flag that disables hazard
  killIfInventory: {           // Items that cause instant death
    dynamite: "The dynamite explodes!"
  }
}
```

- Hazards count commands while in room
- Apply damage every `count` commands
- Can be disabled with flags (e.g., extinguishing fire)
- `killIfInventory` checks on room entry and each command

### Dark Room System

Rooms without `light: true` are dark and restrict commands:

- **Blocked commands:** look, examine, takeAll (can still take if you know the item name)
- **Works normally:** movement, inventory, drop, use items
- **Lantern:** Setting `lanternLit` flag enables all commands in dark rooms
- **Display:** Dark rooms show title "A dark room" and message "It's too dark to see!"

### Checkpoint System

Rooms with `isCheckpoint: true` are safe respawn points:

- Automatically saves game state on first visit
- Player respawns here after death (healthState = 0)
- Implemented in movement.js when entering new rooms

### Temporary Items

Items with countdown timers (lantern, litDynamite):

- `temporary` property is a plain object with countdown config
- `requireFlags` array: countdown only ticks when all flags are present
- Counts up each command until reaching `duration`
- Shows warning messages at specific counts
- On expiration: "extinguish" (turn off) or "destroy" (explode)
- Can set/unset flags on expiration

### Infinite Items

Items with `infinite: true` and/or `canTake` conditions:

- **infinite**: Item stays in room after taking
- **canTake**: Array of deny conditions, first match blocks the take
- Used for gum (unlimited) and dynamite (only one at a time)

Example:
```javascript
canTake: [
  {
    unless: { hasItem: "dynamite" },
    message: "You already have dynamite."
  }
]
```

Condition types: `hasItem`, `hasFlag`, `notHasFlag`, `inRoom`, `itemPlacedAnywhere`

### Structured Conditional Text

Many text fields accept a `{ base, parts }` object for flag-dependent text. Resolved by `resolveConditionalText()`.

Supported fields: `room.name`, `room.look`, `entryMessages`, item `examine`, object `examine`, scenery `message`, scenery `examine`, operate action `message`.

```javascript
look: {
  base: "A dimly lit chamber.",       // Optional
  parts: [
    { text: "The door is open.", if: ["doorUnlocked", "doorOpen"] },
    { text: "You hear water.", ifAny: ["fountainOn", "rainStarted"] },
    { text: "Still sealed.", unless: ["doorUnlocked"] },
    { text: "Quiet here.", unlessAny: ["fountainOn", "bellRung"] }
  ]
}
```

Condition types (all take arrays of flag strings):
- `if`: all flags must be present (AND)
- `unless`: all flags must be absent (AND)
- `ifAny`: at least one flag must be present (OR)
- `unlessAny`: at least one flag must be absent (OR)
- Multiple conditions can combine on a single part (all must pass)

### Template Substitution

Strings support `{{gameState.x.y}}` templates, resolved at runtime by `resolveTemplates()`. Arrays are auto-joined with ", ".

```javascript
examine: "The pattern shows: {{gameState.sequences.colorCode}}."
entryMessages: { east: "It took you {{gameState.commandCount}} commands." }
```

Templates work in all fields that go through `resolveConditionalText()`, including within `{ base, parts }` text values.

### Dynamic Flags

The `dynamicFlags` array in `game.js` auto-sets/unsets flags each turn based on game state. Evaluated by `evaluateDynamicFlags()` in `processTick`.

```javascript
const dynamicFlags = [
  { flag: "hasMap", ifHasItem: "map" },
  { flag: "visitedCandle", ifVisitedRoom: "candle" }
];
```

Condition types:
- `ifHasItem`: flag set when item is in inventory, unset when not
- `ifVisitedRoom`: flag set when room has been visited (never unset)

### Damage Messages

The `damageMessages` array in `game.js` uses range-based tiers. `getDamageMessage(amount)` pools messages from all matching ranges and picks one randomly.

```javascript
const damageMessages = [
  { max: 1, messages: ["A glancing blow..."] },
  { min: 2, messages: ["A deep gash..."] }
];
```

- Omit `min`: no lower bound. Omit `max`: no upper bound.
- Overlapping ranges pool their messages together.
- Supports negative damage numbers.

### Softlockable Items

Items with `softlockable` provide room-conditional protection from `loseNonvitalItems` (blue cake theft):

```javascript
softlockable: {
  rooms: ["start", "cellar", "five"],
  reaction: "vital"
}
```

- `rooms`: array of room keys where the item is protected
- `reaction: "vital"`: treat as vital in those rooms

Checked alongside `vital: true` (unconditional protection) in the `loseNonvitalItems` effect.

## Browser Compatibility

**Target:** Modern browsers with ES6+ support
- Chrome/Edge 60+
- Firefox 54+
- Safari 10.1+

**localStorage Considerations:**
- May be disabled in private/incognito mode
- Has storage quota limits (~5-10MB)
- Can be cleared by user/browser

## Troubleshooting

### localStorage Not Working
- Check if browser is in private/incognito mode
- Verify storage quota isn't exceeded
- Test: `typeof(Storage) !== "undefined"`
- Check browser console for quota errors

### Game Won't Load Saved State
1. Open browser console (F12) → check for errors
2. Verify save format: `JSON.parse(localStorage.getItem('kroz-save'))`
3. Clear corrupted save: `localStorage.removeItem('kroz-save')`
4. Check for JSON parsing errors

### CORS Errors with Direct File Opening
- Don't open HTML with `file://` protocol for development
- Use local web server instead (see Setup Commands)

### Script Load Order Issues
- Verify `<script>` tags in `index.html` follow correct order
- Check browser console for "undefined" errors
- Ensure dependencies load before dependent scripts

### Undefined Item/Object Errors
- Check that item/object IDs match exactly (case-sensitive)
- Verify item/object is defined in `items.js`/`objects.js`
- Ensure script loading order is correct

## Current Development Status

See `TODO.md` for current task list and priorities.

**Major Systems Completed:**
- Use command system with verb routing (attack, apply, operate, craft)
- Combat system with instakill mechanics
- Equipment system (helmet, parachute, lantern)
- Hazard system (fire room damage, dynamic hazards)
- Dark room system (rooms require lantern for look/examine)
- Lantern power system (800 command countdown, battery recharge)
- Temporary item countdown system (litDynamite explosion timer)
- Checkpoint system (safe respawn points)
- Infinite items (gum, dynamite with restrictions)
- Ladder placement mechanics
- Dynamic room text (data-driven via structured conditionals and templates)
- Restricted passages with requirements
- Mirror room (reversed directions)
- Sequence puzzle system (generic checkSequence effect in applyEffects)
- Game ending system (gameOver flag disables input, command counter tracks total commands)
- Post-command tick system (processTick handles world state advancement)
- Directional onExit support (direction-specific or any-exit flag setting)
- Data-driven engine: all game data is declarative (no functions in data files)
- Structured conditional text system (`resolveConditionalText` with if/unless/ifAny/unlessAny)
- Template substitution (`{{gameState.x.y}}` in text strings)
- Dynamic flags system (`evaluateDynamicFlags` with ifHasItem/ifVisitedRoom)
- Range-based damage messages (`getDamageMessage`)
- Declarative canTake deny conditions (`evaluateCanTake`)
- Softlockable item property (room-conditional vital)
- Temporary item requireFlags (countdown gated by flags)
- Object onExamine effects (generateSequence)
- checkSequence message/sequencelessMessage support

**Remaining Content:**
- Door room ending text (placeholder)
- Forrest room look description (placeholder)
- Testing all implemented systems
- Bug fixes (optional)

## Notes for AI Agents

1. **Respect autonomy:** The developer wants to learn by doing. Provide guidance, not complete solutions (unless explicitly requested for routine tasks).

2. **Keep it simple:** No frameworks, no build tools, just vanilla web technologies.

3. **Suggest, don't implement:** Offer approaches and examples rather than writing full features (unless specifically asked).

4. **Explain trade-offs:** Help the developer make informed decisions about implementation choices.

5. **Focus on fundamentals:** This is a learning project - emphasize understanding over shortcuts.

6. **Plain objects over classes:** Use plain JavaScript objects for data (easier serialization for localStorage).

7. **No functions in data files:** `map.js`, `items.js`, and `objects.js` must contain only declarative data (strings, numbers, arrays, plain objects). Use structured conditionals (`{ base, parts }`), templates (`{{gameState.x}}`), dynamic flags, and effects instead of functions. This is required for the adventure-maker editor/generator.

8. **Script dependencies:** Always remember script loading order - dependencies must load first.

9. **No emojis:** Unless explicitly requested by the user.

10. **Security first:** Always use `textContent`, never `innerHTML` with user input.

11. **Test thoroughly:** Browser console is your friend - check for errors frequently.
