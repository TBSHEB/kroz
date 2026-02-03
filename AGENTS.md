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
│   │   ├── helpers.js      # Parsing and utility functions
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
<script src="js/map.js"></script>                    <!-- 1. Room definitions -->
<script src="js/items.js"></script>                  <!-- 2. Item definitions -->
<script src="js/objects.js"></script>                <!-- 3. Object definitions -->
<script src="js/commands/helpers.js"></script>       <!-- 4. Command helpers -->
<script src="js/commands/use/attack.js"></script>    <!-- 5. Use: attack handler -->
<script src="js/commands/use/operate.js"></script>   <!-- 6. Use: operate handler -->
<script src="js/commands/use/apply.js"></script>     <!-- 7. Use: apply handler -->
<script src="js/commands/use/craft.js"></script>     <!-- 8. Use: craft handler -->
<script src="js/commands/use/resolution.js"></script><!-- 9. Use: resolution/routing -->
<script src="js/commands/use/use.js"></script>       <!-- 10. Use: main entry point -->
<script src="js/commands/actions.js"></script>       <!-- 11. Action commands -->
<script src="js/commands/movement.js"></script>      <!-- 12. Movement commands -->
<script src="js/commands/information.js"></script>   <!-- 13. Info commands -->
<script src="js/commands/registry.js"></script>      <!-- 14. Command registry -->
<script src="js/game.js"></script>                   <!-- 15. Core game logic -->
<script src="js/storage.js"></script>                <!-- 16. Save/load functions -->
```

Reason: `map.js` references items from `items.js` and objects from `objects.js`. The use command handlers must load before the main use.js entry point. All commands must load before `game.js`. `game.js` depends on all data and command definitions.

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
- **NEVER use `innerHTML` with unsanitized input**
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
    name: "Room Name",           // Display name (can be function for dynamic names)
    look: "Description text",    // What player sees (can be object with base/parts for dynamic text)
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
      setFlags: ["leftRoom"]
    },
    entryMessages: {              // Custom messages on entry (optional)
      north: "You fall through a hole."
    },
    disallowedTakes: {            // Items that can't be taken
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
    examine: "Detailed examination text",  // Can be function for dynamic text
    primaryType: "equipment|consumable|weapon|tool",  // For smart routing
    canTake: true,               // Or function returning true/error message
    infinite: true,              // Stays in room after taking (optional)
    vital: true,                 // Protected from blue cake theft (optional)
    temporary: () => { ... },    // Function returning countdown config (optional)
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
Items with `temporary` property (function) count down while in inventory:
```javascript
temporary: () => {
  if (gameState.flags.includes("lanternLit")) {
    return {
      duration: 800,              // Commands until expiration
      messages: {                 // Warning messages at specific counts
        100: "Getting low...",
        750: "Almost done!"
      },
      onExpire: "extinguish",     // Action: "extinguish" or "destroy"
      onExpireMessage: {
        inventory: "It goes out.",
        floor: "It fizzles out."
      },
      actionSetFlags: ["out"],    // Flags to set on expiration
      actionUnsetFlags: ["lit"]   // Flags to unset
    };
  }
  return false;  // Not active
}
```

### Object Structure (objects.js)

Objects are non-takeable interactables in rooms:

```javascript
const objects = {
  "objectId": {
    names: ["primary name", "alias1"],
    examine: "Examination text",
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

- **helpers.js**: Parsing utilities (`parseActionCommand()`, `findMatchingItem()`, etc.)
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
  lastCheckpoint: "start",        // Respawn location
  timestamp: "ISO-8601 string"
}
```

**Important:**
- Always validate loaded data (could be corrupted/tampered)
- Handle localStorage unavailable/full scenarios
- Check storage availability with `isStorageAvailable()`
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
4. Optional properties: `infinite`, `canTake` (function), `temporary` (function), `vital`
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

- `temporary` property is a function returning config when active
- Counts up each command until reaching `duration`
- Shows warning messages at specific counts
- On expiration: "extinguish" (turn off) or "destroy" (explode)
- Can set/unset flags on expiration

### Infinite Items

Items with `infinite: true` and/or `canTake` function:

- **infinite**: Item stays in room after taking
- **canTake**: Function returning `true` or error message string
- Used for gum (unlimited) and dynamite (only one at a time)

Example:
```javascript
canTake: () => {
  if (gameState.inventory.includes("dynamite")) {
    return "You already have dynamite.";
  }
  return true;
}
```

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
- Dynamic room text (function-based names/descriptions)
- Restricted passages with requirements
- Mirror room (reversed directions)

**Remaining Content:**
- Riddle answers (riddle1 text, riddle2/3 answer arrays)
- Testing all implemented systems
- Bug fixes (optional)

## Notes for AI Agents

1. **Respect autonomy:** The developer wants to learn by doing. Provide guidance, not complete solutions (unless explicitly requested for routine tasks).

2. **Keep it simple:** No frameworks, no build tools, just vanilla web technologies.

3. **Suggest, don't implement:** Offer approaches and examples rather than writing full features (unless specifically asked).

4. **Explain trade-offs:** Help the developer make informed decisions about implementation choices.

5. **Focus on fundamentals:** This is a learning project - emphasize understanding over shortcuts.

6. **Plain objects over classes:** Use plain JavaScript objects for data (easier serialization for localStorage).

7. **Script dependencies:** Always remember script loading order - dependencies must load first.

8. **No emojis:** Unless explicitly requested by the user.

9. **Security first:** Always use `textContent`, never `innerHTML` with user input.

10. **Test thoroughly:** Browser console is your friend - check for errors frequently.
