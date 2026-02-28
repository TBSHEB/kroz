# Reformatting scenery Instructions

## Context
You are helping reformat `scenery` in map.js from the old string format to the new object format. The new format supports multiple aliases, examine text, and verb-specific error messages.

## Old Format
```javascript
scenery: {
  "moisture": "I can't take dampness.",
  "cave-in": "There's too much rubble to carry.",
  "cavein": "There's too much rubble to carry."
}
```

## New Format
```javascript
scenery: {
  moisture: {
    names: ["moisture", "dampness", "mildew", "damp"],
    message: "I can't take dampness",
    examine: "The walls are slick with moisture",  // Optional
    operate: {                                      // Optional
      use: "You can't use moisture"
    },
    apply: {                                        // Optional
      bottle: "You can't bottle the moisture"
    },
    attack: {                                       // Optional
      sword: "You swing at the moisture uselessly"
    },
    allIgnore: true  // Optional - exclude from takeAll (use for ambient things)
  }
}
```

## Guidelines

### Grouping Aliases
- Group all variants of the same concept under one key (e.g., "cave-in", "cavein", "cave in" → `cavein`)
- Use the shortest/simplest form as the key
- Include common variations in the `names` array

### Message Format
- Remove trailing periods from messages (they're added automatically)
- Keep messages concise and in first person ("I can't..." not "You can't...")
- Match the game's voice and tone

### Adding examine Text
- Add `examine` property for things that deserve description
- Make examine text atmospheric and descriptive
- Use present tense ("The walls are..." not "The walls were...")
- Examine text should end with a period

### Conditional Text (message and examine)
Both `message` and `examine` can be a plain string or a `{ base, parts }` object for flag-dependent text. `base` is optional.

Condition types (all take arrays of flag strings):
- `if`: all flags must be present (AND)
- `unless`: all flags must be absent (AND)
- `ifAny`: at least one flag must be present (OR)
- `unlessAny`: at least one flag must be absent (OR)

Multiple conditions can combine on a single part (all must pass).

```javascript
examine: {
  base: "An old brass lantern.",
  parts: [
    { text: "It's lit.", if: ["lanternLit"] },
    { text: "It's dead.", if: ["lanternOut"] },
    { text: "It's off.", unlessAny: ["lanternLit", "lanternOut"] }
  ]
}
```

```javascript
message: {
  parts: [
    { text: "The chains are broken.", if: ["dungeonLampTaken"] },
    { text: "The chains are firmly anchored.", unless: ["dungeonLampTaken"] }
  ]
}
```

### allIgnore Property
- Set `allIgnore: true` for ambient/atmospheric elements that shouldn't appear in takeAll
- Examples: shadows, darkness, air, atmosphere, ambience
- Things that are part of the environment but not "physical" objects

### operate/apply/attack Properties
- Only add if the thing would reasonably be targeted with these verbs
- `operate` is an object: `{ verb: "error message" }`
- `apply` is an object: `{ itemId: "error message" }`
- `attack` is an object: `{ itemId: "error message" }`
- Most scenery won't need these - only add if it makes sense

### Common Patterns

**Ambient elements** (shadows, air, darkness):
```javascript
shadows: {
  names: ["shadow", "shadows"],
  message: "The shadows shift and move, impossible to grasp",
  examine: "Dark shapes dance across the walls",
  allIgnore: true
}
```

**Physical but untakeable** (rubble, walls, structures):
```javascript
rubble: {
  names: ["rubble", "rocks", "debris", "cave-in", "cavein", "cave in"],
  message: "There's too much rubble to carry",
  examine: "A pile of broken rocks blocks the passage"
}
```

**Liquids/substances**:
```javascript
water: {
  names: ["water", "liquid"],
  message: "I can't carry water without a container",
  examine: "Crystal clear water",
  apply: {
    bottle: "You fill the bottle with water"  // If applicable
  }
}
```

## Generic Disallowed Items

The following items have generic handlers and should NOT be suggested unless the room has a special context that makes the generic message inappropriate:

`wall`, `walls`, `floor`, `ground`, `ceiling`, `roof`, `air`, `darkness`, `stone`, `me`, `myself`, `self`

See genericDisallowedItems and genericExamines in the codebase for full list.

## Process

For each room:
1. Read the room's `look` description (may be string or function returning string)
2. Read item `initialDescription`/`description` for items in the room
3. Read object `description` for objects in the room
4. Identify all nouns from these sources (excluding generic items above)
5. Present list of candidate nouns to user
6. User specifies which to add (with or without allIgnore)
7. Suggest message and examine text for each
8. User approves or provides their own text
9. Add all approved items to map.js (operate/apply/attack interactions added later)
10. Move to next room

## Room Order
Process rooms in the order they appear in map.js, starting with "start".

## Current Progress
- [x] Helper functions updated to support new format
- [x] Take/examine/operate/apply/attack handlers updated
- [x] Rooms before parachute completed
- [ ] parachute - **IN PROGRESS**
- [ ] (remaining rooms...)
