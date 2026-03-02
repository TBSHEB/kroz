# TODO - Kroz Development

## Recent Session Fixes (2026-02-02)
16 items completed: keypress→keydown, eat command, passage text duplication, crafting duplication, disambiguation system, partial name aliases, ID exposure fix, grammar fix, dead enemy scenery, debug display, help command rewrite, stackId system, comprehensive softlock removal.

## High Priority - COMPLETED
6 items completed: dungeon room redo, attack/combat system, smart use detection, voice consistency, troll messages, ogre messages.

## Use Command System - COMPLETED
10 items completed: ladder placement, operate handler, helmet/parachute/lantern equip, dungeonLamp, "use X on me", operate parsing, giveItems fix, removeObject support.

## Bug Fixes
21 items completed: script loading, examine display, initGame look, examine safety checks, === replacement, damage calculation, variable leak, operate logic, apply property name, map flag, take all, crafting duplication, double periods, partial names, single-word feedback, take message format, dead enemy scenery, hammer consumption, fire passage, extinguisher, ambiguous matching.

22 items completed: punctuation pass (items.js examines, objects.js messages, map.js failMessages and scenery messages, command displayText strings, mechanics.js dodge message).

- [ ] Fix single-object take using multi-item prefix format - `take trapdoor` shows "trapdoor: You can't take that." instead of "You can't take that." (actions.js object check at line 56 always uses prefix)
- [ ] Fix multi-examine missing newline after room items and inventory items - actions.js lines 360 and 369 don't append `\n`, causing entries to run together
- [x] setGameState duplicate flags - kept as feature: multiple pushes allow multiple code paths to set the same flag, removal only needs one unset. No active duplicates occur in practice
- [ ] Make dungeonTrapdoor examine text conditional based on dungeonTrapdoorUnlocked/dungeonTrapdoorOpen flags (objects.js line 30)
- [x] Fix litDynamite warning messages not displaying when in inventory - added `gameState.inventory.includes(item)` check to environment.js line 400
- [ ] Temporary item off-by-one: duration 5 takes 6 commands to expire (counts 0 through 5 inclusive) - environment.js checks `duration === count` before incrementing, so expiry fires on tick after count reaches duration. Either change check to `duration === count + 1` or document that duration means "expires after N+1 commands"

24 items completed: save name sanitisation (length + character validation in save/load), structural validation on load (type checks for all fields), puzzle state persistence verified (sequences saved/restored correctly).

## Code Quality
8 items completed: helpers.js split, look() === fix, natural language verb support, softlock removal, cache getInteractablesList(), consolidate trackRoomChange() branches, extract checkFlagRequirements() helper, extract progressive combination handler, consolidate take() paths, consolidate examine() paths, extract checkPassageRequirements() helper.

- [ ] (Optional) Refactor handleCommand() in game.js - 148-line dispatcher with 7 nesting levels mixing disambiguation, multi-step continuation, command routing, save/load special-casing, and riddle checking. Could extract dispatch logic into a separate function, but high risk for marginal gain

## Map.js Content - COMPLETED
7 items completed: spelling fixes, room names, room descriptions, incomplete descriptions, scenery, fire room, lake room.

## Objects and Items
4 items completed: examine text, genericExamines, object descriptions, item aliases, hamburger/hamburgerPoisoned/mineralWater operate logic.

- [x] Expand names arrays for objects with additional relevant aliases

## Examine System Enhancements
3 items completed: room-specific examines (covered by scenery), examine priority (current order is fine), flag-based dynamic examines (already supported via resolveConditionalText in scenery).

- [ ] Expand genericExamines with comprehensive coverage - add examines for common words: walls, floor, ceiling, dust, darkness, shadows, air, etc. Also sync genericDisallowedItems and genericExamines so both cover the same entries (12 examine entries missing take denials, 3 take denials missing examines)
- [ ] Comprehensive content audit - ensure all nouns mentioned in look descriptions, item descriptions, examines, and other text can be examined or have take denial messages

## Items/Objects Missing Mechanisms - COMPLETED
9 items completed: setHealth handler, litDynamite placement, barricadedDoor, riddle text, riddle2/riddle3 answers, silverDoor, redDoor, battery recharge.

## Special Handling
3 items completed: sand room nails display (switched to hideItemDescriptions pattern), dungeonKey/dungeonWood descriptions (already had them), dungeon room look duplication (already handled by hideItemDescriptions).

## Checkpoint System - COMPLETED
2 items completed: checkpoint rooms marked, checkpoint save logic.

- [ ] Test death/respawn system with multiple checkpoints throughout the game

## Map Building - COMPLETED
3 items completed: remaining rooms, hub room, all rooms added.

- [ ] Ensure all room connections are tested

## Testing
- [x] Verify save/load functionality - double-check that saves are working properly, test save persistence and state restoration
- [x] Test drop function with all rooms
- [x] Test take function with all rooms
- [x] Test examine function with items, objects, and inventory
- [x] Test that dropped items appear in look() output
- [x] Test sand room special case (nails description handling)
- [x] Test back command with rooms where passages change destinations
- [x] Test checkpoint system (death and respawn at correct location)
- [x] Test litDynamite explosion mechanics
- [x] Test rorrim room mirrored directions (all cardinal directions flip, back command flips)
- [x] Test boring room dynamic text (first visit vs revisit, check leftBoringOnce flag triggers)
- [x] Test riddle2 dynamic ordinal (check "second" vs "third" based on riddle3 visited)
- [x] Test riddle3 dynamic ordinal (check "second" vs "third" based on riddle2 visited)
- [x] Test bell room dynamic article (check "a church" vs "the church" based on candle visited)
- [x] Test one-way passages with entryMessages (drop→hub, maze13→parachute, etc.)
- [x] Test failedBackText in all destination rooms (hub, parachute, ezam7, nose, armory, mirrors)
- [x] Test showAsNormal passages appear in main list but block correctly (hub north, maze13 north/west, dry north)
- [x] Test onExit flag setting (boring room sets leftBoringOnce when leaving)
- [x] Test lantern power drain (should drain 1 per command when lit)
- [x] Test lantern auto-extinguish when power reaches 800 commands
- [x] Test battery recharging lantern (craft recipe)
- [x] Test dark rooms (can't look/examine/takeAll without lantern lit)
- [x] Test fire room damage (1 health every 2 commands)
- [x] Test gum room infinite gum (can take gum multiple times)
- [x] Test dynamite room infinite dynamite (can only take one at a time, prevents if already have dynamite anywhere)
- [x] Test litDynamite countdown and explosion (5 commands with warnings)
- [x] Test dynamite instant explosion in fire room
- [x] Test fire extinguisher on fire object
- [x] Test silverDoor unlocking with silverKey
- [x] Test redDoor unlocking with redKey
- [x] Test all door objects (purpleDoor, blueDoor, silverDoor, redDoor, final door)
- [x] Test teleport system (exact key, partial single match, partial multi match, unvisited room, current room, back after teleport, without teleportEnabled flag, multi-step input)

## Lantern Power System - COMPLETED
6 items completed: lanternPower state, power drain, auto-extinguish, dynamic examine text, battery recharge, examine messages.

## Dark Room System - COMPLETED
7 items completed: light property, dark room check, look/examine/takeAll blocking, movement in dark, dark room title.

## Movement System Enhancements - COMPLETED
9 items completed: flipDirection, mirrorDirections, entryMessages, failedBackText, hole-in-roof descriptions, showAsNormal, look merge, onExit, dynamic names/look.

## Special Mechanics - COMPLETED
13 items completed: rorrim directions, boring room text, riddle2/riddle3 ordinals, bell room article, infinite gum, fire damage, fire passage, extinguisher logic, blue cake mechanic, infinite dynamite, litDynamite countdown, dynamite fire explosion.

## Low Priority Enhancements
1 item completed: save/load commands.

- [x] Differentiate ladder items: added "tall ladder"/"tall-ladder" aliases to ladder for disambiguation from stepladder
- [x] Prevent changing game data from browser console (add data validation/protection against tampering) - implemented via Proxy with DEV_MODE flag; set DEV_MODE to false in game.js when done testing
- [ ] Document healthState values: 4 = full health, 3 = minor damage, 2 = moderate damage (triggers high dodge enemies), 1 = severely wounded, 0 = dead
- [x] Add player-facing commands to list saves and delete individual saves (underlying deleteSave/deleteSaveFromList functions exist in storage.js)
- [x] Update cyclops room restricted passage unmet description

## Scenery
- [ ] Go through each scenery item and check if it needs operate/apply/attack properties
- [ ] Add flavoursome take-denial messages to objects (currently gives generic "You can't take that.")

## Deferred Content
- [ ] Replace door room entryMessages.east placeholder with ending text (map.js, door room) - function receives gameState.commandCount
- [ ] Replace forrest room look placeholder with forest description (map.js, forrest room)
