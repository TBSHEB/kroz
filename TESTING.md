# TESTING.md - Kroz Game Testing Guide

## Overview

This document serves as the testing prompt for the Kroz text adventure game. It contains all necessary information for conducting thorough testing sessions using browser automation and console manipulation.

## Prerequisites

**Game Server:**
- Game runs at: `http://localhost:8888/`
- Start server: `python -m http.server 8888` (or already running)
- Check status: `webctl status`

**webctl Daemon:**
- Must be running: `webctl start &` (or in separate console)
- Check status: `webctl status`
- Should show session at http://localhost:8888/

## webctl Quick Reference

### Essential Commands

```bash
# Navigation
webctl navigate http://localhost:8888/
webctl ready
webctl reload

# Observation (token-efficient with --json)
webctl html --select "#output"          # Game text output (CORRECT SELECTOR)
webctl html --select "#input"           # Input field (CORRECT SELECTOR)
webctl console --type error             # Check for JS errors
webctl screenshot save                  # Visual snapshot

# Interaction
webctl type "#input" "look"             # Type command
webctl type "#input" "look" --key Enter # Type + submit
webctl key Enter                        # Submit current input
webctl eval "gameState"                 # Inspect game state
webctl eval "rooms"                     # Inspect rooms data
webctl eval "items"                     # Inspect items data
```

### Game State Inspection

```bash
# View current game state
webctl eval "gameState"
webctl eval "gameState.currentRoom"
webctl eval "gameState.inventory"
webctl eval "gameState.flags"
webctl eval "gameState.healthState"
webctl eval "gameState.itemCountdowns"
webctl eval "gameState.combatState"

# View room/item data
webctl eval "rooms['roomId']"
webctl eval "items['itemId']"
webctl eval "objects['objectId']"
```

### Pro Tips for Clean Output

**Getting Recent Messages (most reliable):**
```bash
# Get last N elements from output div (cleanest method)
webctl eval "Array.from(document.querySelectorAll('#output > *')).slice(-5).map(el => el.textContent).join('\n')"

# Get just text content and pipe to tail
webctl eval "document.querySelector('#output').textContent" | tail -20

# Check current room name
webctl eval "document.querySelector('.room-title').textContent"
```

**Common Gotchas:**
- Output div can have rendering issues with rapid commands
- Some mechanics require dropping items (not just carrying them)
- Item names can differ between room descriptions and inventory
- Use "help" command in-game to check available commands
- Always "look" after entering a new room to see full description

## Game State Manipulation

**IMPORTANT:** Only use state manipulation when jumping to late-game content (round room and later). Early manipulation causes missing flags/items from natural progression.

### setGameState Function

```javascript
// Syntax: setGameState(field, value, adding = true)
// - field: "inventory", "flags", "visitedRooms", "currentRoom", etc.
// - value: the item/flag/room to add/change
// - adding: true = add to array, false = remove from array

// Examples:
setGameState("inventory", "lantern", true)        // Add lantern to inventory
setGameState("flags", "lanternLit", true)          // Set lanternLit flag
setGameState("flags", "lanternLit", false)         // Remove flag
setGameState("currentRoom", "roundRoom")           // Change current room
setGameState("healthState", 4)                     // Set health to full
```

### setRoomState Function

```javascript
// Syntax: setRoomState(field, value, adding = true)
// Same parameters, but modifies current room's state

// Examples:
setRoomState("items", "sword", true)     // Add sword to current room
setRoomState("items", "sword", false)    // Remove sword from current room
```

### Via webctl eval

```bash
# Add item to inventory
webctl eval "setGameState('inventory', 'lantern', true)"

# Set flag
webctl eval "setGameState('flags', 'lanternLit', true)"

# Jump to late-game room
webctl eval "setGameState('currentRoom', 'roundRoom'); look()"

# Set health
webctl eval "setGameState('healthState', 4)"

# View changes
webctl eval "gameState.inventory"
```

## Testing Modes

### Mode 1: General Testing / Game Flow

**When:** Testing overall gameplay, story progression, general functionality

**Approach:**
- Play as a normal player would
- Follow the natural game flow
- Avoid using state manipulation (except for late-game jumps)
- Report issues as encountered

**What to Look For:**
- **Logic inconsistencies:** Actions that don't make sense or contradict earlier events
- **Grammar/punctuation issues:** Typos, missing punctuation, awkward phrasing
- **Outdated/missing text:** References to removed features, placeholder text, incomplete descriptions
- **Functionality issues:** Commands not working, state not updating correctly
- **Progression blockers:** Unable to continue due to bugs or design issues

**Reporting:**
- Describe the issue clearly
- Include the command(s) that triggered it
- Note the room/context where it occurred
- Mention expected vs actual behavior

### Mode 2: Targeted Testing / Bug Investigation

**When:** Testing specific items, areas, systems, or reported bugs

**Approach:**
- Test methodically and try to break things
- Use state manipulation to quickly reach the relevant content
- Test edge cases and unusual input combinations
- Examine code if needed to understand the issue

**What to Test:**
- All possible interactions with the item/object
- Edge cases (using item when shouldn't, wrong combinations, etc.)
- State persistence (save/load behavior)
- Related systems (e.g., testing lantern tests both dark rooms and temporary items)

**Reporting:**
- Continue testing until you either:
  - Understand the bug well enough to explain what's happening (examine code if needed)
  - Confirm it works properly
  - Identify it as part of a larger issue
- Provide detailed reproduction steps
- Include relevant code references if applicable

## Testing Workflow

### Starting a Test Session

```bash
# 1. Check webctl is running
webctl status

# 2. Navigate to game
webctl navigate http://localhost:8888/
webctl ready

# 3. Check for console errors
webctl console --type error

# 4. Start testing (enter first command)
webctl type "#player-input" "look" --key Enter

# 5. View output
webctl html --select "#game-output"
```

### During Testing

```bash
# Send commands
webctl type "#player-input" "north" --key Enter
webctl type "#player-input" "take lantern" --key Enter
webctl type "#player-input" "inventory" --key Enter

# Check game state after actions
webctl eval "gameState.currentRoom"
webctl eval "gameState.inventory"

# Check for errors
webctl console --type error --tail 5

# Take screenshot of interesting moments
webctl screenshot save
```

### Common Test Patterns

```bash
# Test item pickup flow
webctl type "#player-input" "look" --key Enter
webctl html --select "#game-output" --find "lantern"
webctl type "#player-input" "take lantern" --key Enter
webctl eval "gameState.inventory.includes('lantern')"

# Test movement
webctl type "#player-input" "north" --key Enter
webctl eval "gameState.currentRoom"
webctl eval "gameState.previousRoom"

# Test combat (if testing combat system)
webctl eval "gameState.healthState"
webctl type "#player-input" "attack guard with sword" --key Enter
webctl eval "gameState.combatState"
webctl eval "gameState.healthState"

# Test flags
webctl eval "gameState.flags"
webctl type "#player-input" "use lantern" --key Enter
webctl eval "gameState.flags.includes('lanternLit')"
```

## Common Issues to Watch For

### Logic Issues
- Items appearing/disappearing unexpectedly
- Flags not being set/unset correctly
- Passages opening when they shouldn't (or vice versa)
- Combat state not updating properly
- Health/damage calculations incorrect
- Inventory limits not enforced

### Text Issues
- Typos and spelling errors
- Missing punctuation or capitalization errors
- Inconsistent naming (same item called different things)
- Placeholder text (e.g., "TODO", "FIXME", "[description]")
- Outdated references to removed features
- Grammar errors (subject-verb agreement, tense consistency)

### Functionality Issues
- Commands not recognized (check registry.js aliases)
- Items not takeable when they should be
- Objects not responding to interactions
- Save/load not preserving state correctly
- Temporary items (lantern, dynamite) countdown issues
- Dark room restrictions not working
- Hazards not triggering or dealing incorrect damage

### Design Issues
- Dead ends with no way forward
- Missing hints for puzzles
- Unclear command syntax
- Inconsistent game mechanics
- Balance issues (too easy/hard)

## Quick State Setup for Late-Game Testing

```bash
# Jump to round room area with typical items
webctl eval "
setGameState('currentRoom', 'roundRoom');
setGameState('inventory', 'lantern', true);
setGameState('inventory', 'sword', true);
setGameState('flags', 'lanternLit', true);
setGameState('healthState', 4);
look();
"

# View the result
webctl html --select "#game-output"
```

## Debugging Tips

### When Something Goes Wrong

1. **Check console errors:**
   ```bash
   webctl console --type error
   ```

2. **Inspect game state:**
   ```bash
   webctl eval "gameState"
   ```

3. **Check room definition:**
   ```bash
   webctl eval "rooms[gameState.currentRoom]"
   ```

4. **Verify item exists:**
   ```bash
   webctl eval "items['itemId']"
   ```

5. **Check command registry:**
   ```bash
   webctl eval "commands"
   ```

### When Behavior Is Unclear

- Read the code in relevant files (map.js, items.js, objects.js, commands/)
- Check AGENTS.md for system specifications
- Check COMBAT.md for combat mechanics
- Ask the developer for clarification

## Test Session Template

```markdown
## Test Session: [Date] - [Feature/Area Being Tested]

**Goal:** [What you're testing]
**Approach:** [General/Targeted]

### Setup
- Room: [starting room or "natural progression"]
- State modifications: [none or list changes made]

### Test Results

#### Test 1: [Description]
- Commands: [list of commands]
- Expected: [what should happen]
- Actual: [what actually happened]
- Status: ✓ PASS / ✗ FAIL / ⚠ ISSUE

#### Issues Found
1. **[Issue Title]**
   - Location: [room/file]
   - Description: [clear description]
   - Reproduction: [steps to reproduce]
   - Severity: [Low/Medium/High/Critical]

### Summary
[Overall findings and recommendations]
```

## Advanced Testing Techniques

### Rapid Command Testing

```bash
# Test multiple commands quickly
for cmd in "look" "north" "take sword" "inventory" "south"; do
  webctl type "#player-input" "$cmd" --key Enter
  sleep 0.5
done
```

### State Validation

```bash
# Verify state consistency
webctl eval "
(function() {
  const issues = [];

  // Check inventory items exist
  gameState.inventory.forEach(itemId => {
    if (!items[itemId]) issues.push('Invalid item in inventory: ' + itemId);
  });

  // Check current room exists
  if (!rooms[gameState.currentRoom]) issues.push('Invalid current room');

  // Check flags format
  if (!Array.isArray(gameState.flags)) issues.push('Flags not an array');

  return issues.length ? issues : 'State valid';
})()
"
```

### Automated Save/Load Testing

```bash
# Test save/load cycle
webctl eval "saveGame()"
webctl eval "const before = JSON.parse(JSON.stringify(gameState))"
webctl eval "loadGame()"
webctl eval "const after = gameState"
webctl eval "JSON.stringify(before) === JSON.stringify(after)"
```

## Tips for Efficient Testing

1. **Use --json flag** for structured data when needed
2. **Use --select** to filter HTML output to just game output
3. **Check console errors frequently** - catches issues early
4. **Save interesting game states** to localStorage for quick restoration
5. **Take screenshots** of visual bugs or interesting moments
6. **Test in small increments** - easier to identify what broke
7. **Keep notes** of test coverage to avoid redundant testing

## When to Ask for Clarification

- Behavior seems intentional but you're not sure
- Text could be either bad grammar or character voice
- Unclear whether something is a bug or incomplete feature
- Uncertain about expected game mechanics
- Need to know if specific content is implemented yet

---

**Last Updated:** 2026-02-04
**Testing Status:** Ready for test sessions
