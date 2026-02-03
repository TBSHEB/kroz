# Reformatting disallowedTakes Instructions

## Context
You are helping reformat `disallowedTakes` in map.js from the old string format to the new object format. The new format supports multiple aliases, examine text, and verb-specific error messages.

## Old Format
```javascript
disallowedTakes: {
  "moisture": "I can't take dampness.",
  "cave-in": "There's too much rubble to carry.",
  "cavein": "There's too much rubble to carry."
}
```

## New Format
```javascript
disallowedTakes: {
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

### allIgnore Property
- Set `allIgnore: true` for ambient/atmospheric elements that shouldn't appear in takeAll
- Examples: shadows, darkness, air, atmosphere, ambience
- Things that are part of the environment but not "physical" objects

### operate/apply/attack Properties
- Only add if the thing would reasonably be targeted with these verbs
- `operate` is an object: `{ verb: "error message" }`
- `apply` is an object: `{ itemId: "error message" }`
- `attack` is an object: `{ itemId: "error message" }`
- Most disallowedTakes won't need these - only add if it makes sense

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

## Process

For each room:
1. Read the room's `look` description (may be string or function returning string)
2. Identify nouns mentioned that aren't items/objects
3. Check existing disallowedTakes for that room
4. Suggest grouping similar items and adding missing ones
5. Wait for user to specify the exact format for each item
6. Update the room's disallowedTakes section

## Room Order
Process rooms in the order they appear in map.js, starting with "start".

## Current Progress
- [x] Helper functions updated to support new format
- [x] Take/examine/operate/apply/attack handlers updated
- [ ] start - **IN PROGRESS**
- [ ] cellar
- [ ] five
- [ ] (continue through all rooms...)
