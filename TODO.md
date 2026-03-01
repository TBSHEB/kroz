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

24 items completed: save name sanitisation (length + character validation in save/load), structural validation on load (type checks for all fields), puzzle state persistence verified (sequences saved/restored correctly).

## Code Quality
3 items completed: helpers.js split, look() === fix, natural language verb support, softlock removal.

- [ ] Consider consolidating gameState mutations - some places use setGameState/setRoomState helpers (array operations) while others mutate directly (movement.js sets currentRoom/previousRoom, mechanics.js sets healthState, information.js reset() assigns fields directly). Not urgent but could improve debuggability if a consistent convention is established
- [x] Cache getInteractablesList() per command cycle - renamed from buildInteractablesList, cached with invalidation at start of handleCommand
- [ ] Consolidate trackRoomChange() item/object branches - environment.js:167-208 has two near-identical branches differing only in accessing changes.items vs changes.objects. Could use the type parameter to index into the changes object directly
- [ ] Extract shared checkFlagRequirements() helper - requireFlags/requireNotFlags validation is duplicated in handleApply() (apply.js:91-99), handleCombination() (apply.js:225-233), and handleOperate() (operate.js:53-95) with slightly divergent structures
- [ ] Extract shared progressive combination handler - apply.js has the same _progressiveCombination logic in both handleApply() (lines 34-79, single item) and handleCombination() (lines 134-205, multiple items). Core state mutation (flag generation, used check, consumption, completion check, message display) is identical
- [ ] Consolidate take() single/multi-item paths - actions.js has two near-identical code paths (~80 lines) differing only in output formatting (multi-item prefixes with "${thing}: "). Extract core take logic into a helper
- [ ] Consolidate examine() single/multi-item paths - actions.js:276-402 has two near-identical search cascades (objects, room items, inventory, scenery, generics) differing only in output formatting. Extract the search logic into a helper that returns examine text for a single item, then call from one loop
- [x] Extract shared checkPassageRequirements() helper - moved to environment.js, used by forward movement, back movement, and look()
- [ ] Refactor handleCommand() in game.js - 148-line dispatcher with 7 nesting levels mixing disambiguation, multi-step continuation, command routing, save/load special-casing, and riddle checking. Extract dispatch logic into a separate function that returns whether processTick should run

## Map.js Content - COMPLETED
7 items completed: spelling fixes, room names, room descriptions, incomplete descriptions, scenery, fire room, lake room.

## Objects and Items
4 items completed: examine text, genericExamines, object descriptions, item aliases, hamburger/hamburgerPoisoned/mineralWater operate logic.

- [x] Expand names arrays for objects with additional relevant aliases

## Examine System Enhancements
3 items completed: room-specific examines (covered by scenery), examine priority (current order is fine), flag-based dynamic examines (already supported via resolveConditionalText in scenery).

- [ ] Expand genericExamines with comprehensive coverage - add examines for common words: walls, floor, ceiling, dust, darkness, shadows, air, etc.
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
- [ ] Verify save/load functionality - double-check that saves are working properly, test save persistence and state restoration
- [ ] Test drop function with all rooms
- [ ] Test take function with all rooms
- [ ] Test examine function with items, objects, and inventory
- [ ] Test that dropped items appear in look() output
- [ ] Test sand room special case (nails description handling)
- [ ] Test back command with rooms where passages change destinations
- [ ] Test checkpoint system (death and respawn at correct location)
- [ ] Test litDynamite explosion mechanics
- [ ] Test rorrim room mirrored directions (all cardinal directions flip, back command flips)
- [ ] Test boring room dynamic text (first visit vs revisit, check leftBoringOnce flag triggers)
- [ ] Test riddle2 dynamic ordinal (check "second" vs "third" based on riddle3 visited)
- [ ] Test riddle3 dynamic ordinal (check "second" vs "third" based on riddle2 visited)
- [ ] Test bell room dynamic article (check "a church" vs "the church" based on candle visited)
- [ ] Test one-way passages with entryMessages (drop→hub, maze13→parachute, etc.)
- [ ] Test failedBackText in all destination rooms (hub, parachute, ezam7, nose, armory, mirrors)
- [ ] Test showAsNormal passages appear in main list but block correctly (hub north, maze13 north/west, dry north)
- [ ] Test onExit flag setting (boring room sets leftBoringOnce when leaving)
- [ ] Test lantern power drain (should drain 1 per command when lit)
- [ ] Test lantern auto-extinguish when power reaches 800 commands
- [ ] Test battery recharging lantern (craft recipe)
- [ ] Test dark rooms (can't look/examine/takeAll without lantern lit)
- [ ] Test fire room damage (1 health every 2 commands)
- [ ] Test gum room infinite gum (can take gum multiple times)
- [ ] Test dynamite room infinite dynamite (can only take one at a time, prevents if already have dynamite anywhere)
- [ ] Test litDynamite countdown and explosion (5 commands with warnings)
- [ ] Test dynamite instant explosion in fire room
- [ ] Test fire extinguisher on fire object
- [ ] Test silverDoor unlocking with silverKey
- [ ] Test redDoor unlocking with redKey
- [ ] Test all door objects (purpleDoor, blueDoor, silverDoor, redDoor, final door)
- [ ] Test teleport system (exact key, partial single match, partial multi match, unvisited room, current room, back after teleport, without teleportEnabled flag, multi-step input)

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
- [ ] Prevent changing game data from browser console (add data validation/protection against tampering)
- [ ] Document healthState values: 4 = full health, 3 = minor damage, 2 = moderate damage (triggers high dodge enemies), 1 = severely wounded, 0 = dead
- [x] Update cyclops room restricted passage unmet description

## Deferred Content
- [ ] Replace door room entryMessages.east placeholder with ending text (map.js, door room) - function receives gameState.commandCount
- [ ] Replace forrest room look placeholder with forest description (map.js, forrest room)
