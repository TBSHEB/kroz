# TODO - Kroz Development

## Recent Session Fixes (2026-02-02)
- [x] Fixed deprecated keypress event → changed to keydown
- [x] Fixed "eat" command not working → made useAliases dynamic from aliasToAction
- [x] Fixed duplicate "to the to the" in passage descriptions
- [x] Fixed crafting duplication bug → added inventory-only check for craft components
- [x] Implemented complete disambiguation system for ambiguous item matching
- [x] Added partial item name aliases to all items (keys, cakes, hammer, dynamite, cup, etc.)
- [x] Fixed internal item ID exposure → display names in multi-step prompts (resolution.js)
- [x] Fixed grammar typo → "Its mounting" not "It's mounting" (chandelier)
- [x] Fixed dead enemies in scenery → removed troll and ogre entries
- [x] Fixed debug display error → added null checks in updateDebugDisplays()
- [x] Completely rewrote help command → added progressive goals system
- [x] Added stackId system for interchangeable items (green keys, pickaxes)
- [x] **COMPLETED SOFTLOCK REMOVAL** - Comprehensive audit and fixes:
  - Made parachute undroppable to prevent one-way passage trap
  - Added function support to vital property (map conditionally vital in Section A)
  - Prevents blue cake from stealing map in starting area, avoiding permanent trap
  - Verified all other potential softlocks (dynamite, green keys, bricks, lantern/battery, routing)
  - Game is now fully softlock-free - players cannot get permanently stuck

## High Priority - COMPLETED
- [x] Redo the dungeon room (start room) - fix bugs in look() function, clean up flag-based descriptions, test all interactions
- [x] Implement attack handler and combat system
- [x] Implement smart "use" detection with primaryType routing
- [x] Fix voice consistency (first person vs second person) in genericExamines and game messages
- [x] Rewrite all troll combat messages (currently placeholders/broken)
- [x] Rewrite all ogre combat messages (currently copy-pasted from troll)

## Use Command System - COMPLETED
- [x] Implement ladder placement with roomItems-based passages
- [x] Implement operate handler with verb-specific actions
- [x] Add helmet equip/unequip functionality
- [x] Add parachute equip/unequip functionality
- [x] Add lantern light/extinguish functionality
- [x] Add dungeonLamp operate via take/use commands
- [x] Support "use X on me" for equippable items
- [x] Add operate case to parseActionCommand()
- [x] Fix giveItems bug in handleOperate
- [x] Add removeObject support in handleOperate

## Bug Fixes
- [x] Fix script loading order (commands.js now loads before game.js)
- [x] Fix examine() function missing displayText call
- [x] Fix initGame() to call look() on startup
- [x] Add safety checks to examine() function for missing examine properties
- [x] Replace == with ===
- [x] Fix random damage calculation bug (helpers.js:268)
- [x] Fix global variable leak in helpers.js (line 478 - missing const/let/var)
- [x] Fix togglable operate logic bug (operate.js:14, 17 - .every() should be .some())
- [x] Fix wrong property name in apply.js:104 (clearedMessage → removeMessage)
- [x] Add map item setFlag to enable hasMap flag in three room
- [x] Fix bug with take all taking all forms of a thing
- [x] Fix crafting duplication bug: items in room can be used for crafting without being consumed - require all craft components to be in inventory before allowing craft
- [x] Fix double periods in messages (especially "take all" with scenery) - implement hybrid punctuation: auto-add period only if message doesn't end with ., !, or ?
- [x] Fix items not responding to partial names (e.g., "take key" fails, requires "take green key") - expand names arrays with common shortened versions
- [x] Fix single-word unrecognized commands giving no feedback - ensure error message displays for all unrecognized inputs, not just multi-word commands
- [x] Fix take message format inconsistency - single item failures should use natural format ("You can't take the cave-in"), not colon format ("cave-in: ...") which is only for "take all"
- [x] Fix dead enemies still having scenery - after killing troll/ogre/etc, "take troll" should say "I can't find a troll" not "I can't carry a troll" (remove/flag objects after combat death)
- [x] Fix hammer consumption in crafting - make hammer a reusable tool (don't consume it after crafting ladder/map)
- [x] Fix fire room north passage hazard not killing player - debug existing restricted passages system to properly block/kill on unsafe passage (IMPLEMENTED with killIfInventory hazard feature for dynamite)
- [x] Fix extinguisher not removing fire hazard - ensure "use extinguisher on fire" properly sets fireExtinguished flag and removes passage restriction
- [x] Fix ambiguous item matching - when multiple items match (e.g., "take key" with greenKey, silverKey, dungeonKey present), ask "Which key?" without listing options (applies to take, use, drop, examine, all commands)
- [ ] Fix missing punctuation across all messages - systematically add periods to examine responses, action feedback, and state messages:
  - items.js: boards examine, skull examine (if has examine property)
  - objects.js: chandelier examine, dungeonTrapdoor examine message, chain examine in scenery
  - map.js genericExamines or room-specific examines: sand examine, walls examine, floor examine, compass examine
  - commands/actions.js: "Taken." messages, "Dropped." messages, trapdoor unlock message
  - commands/use/craft.js: ladder craft success message
  - commands/movement.js: "There's solid ground beneath me", "There's nothing above me", "The hole is too high to reach", down/up blocking messages, restricted passage failure messages
  - commands/use/operate.js: helmet equip message, parachute equip message, general equip/activate messages
  - Riddle solution messages (objects.js riddle1): door opening message "When uttering those words, the stone door to the east grinds open"
  - Hole room down message: "The drop looks deadly. I need something to break my fall"
  - Pickaxe cave-in messages: "You chip away at the rubble. The frail pickaxe breaks" and "You clear some of the rubble. Unfortunately, the pickaxe breaks"
- [ ] Verify and fix save/load functionality - double-check that saves are working properly, test save persistence and state restoration
- [ ] Verify puzzle state persistence - check whether gameState.colorCode and gameState.buttonsPressed (ball room button puzzle) survive save/reload. If not, add them to saveGame/loadGame/resetGameState

## Code Quality
- [ ] Consider splitting helpers.js into focused files (e.g. combat.js, environment.js, parsing.js) - currently 896 lines covering 30+ unrelated functions
- [ ] Consider refactoring handleCommand() in game.js - 180-line nested if/else dispatcher, post-command step ordering is implicit and fragile
- [x] Fix look() function - replace "typeof room.look == object" with === (lines 50, 70, 72)
- [x] Implement natural language verb support - add parser-level recognition for verbs like eat, drink, unlock, wear, attack, etc. that route to appropriate use command handlers
- [x] Complete softlock removal - audit and fix all possible softlock scenarios in the game

## Map.js Content - COMPLETED
- [x] Fix spelling errors in map.js (norhwest→northwest, crusy→crusty, entirely, extra space)
- [x] Implement all missing room names (cyclops, extinguisher, door)
- [x] Implement all missing room descriptions (14 rooms)
- [x] Complete all incomplete room descriptions (hideout, hammer2, pool, bell)
- [x] Add comprehensive scenery to all rooms (20+ rooms updated)
- [x] Complete fire room look parts and metDescription
- [x] Complete lake room metDescription
- [x] Update REQUIREDMAPDATA.md with all items and objects from lines 1251-1670

## Objects and Items
- [x] Add examine text to all objects (all required objects now have examine text)
- [x] Populate genericExamines object with descriptions for common room elements
- [x] Add description fields to objects (16 objects have empty description: "" - grinder, machine, code, candle, bolt, chipper, bellows, crucibleMelt, mold, slackTub, hatbox, bell, case, blueDoor, vendingMachine, door)
- [x] Expand names arrays for items with additional relevant aliases (all keys, cakes, hammer, dynamite, cup)
- [ ] Expand names arrays for objects with additional relevant aliases
- [x] Implement hamburger operate logic (eat verb with consumable)
- [x] Implement hamburgerPoisoned operate logic (eat verb with poison flag)
- [x] Implement mineralWater operate logic (drink verb with consumable)

## Examine System Enhancements
- [ ] Implement room-specific examines - add examines property to rooms in map.js for room-unique examinable things
- [ ] Implement examine priority system: inventory items → room items → room objects → room examines → genericExamines → fallback message
- [ ] Add flag-based dynamic room examines - support conditional examine text based on game state (similar to look() flag system)
- [ ] Expand genericExamines with comprehensive coverage - add examines for common words: walls, floor, ceiling, dust, darkness, shadows, air, etc.
- [ ] Comprehensive content audit - ensure all nouns mentioned in look descriptions, item descriptions, examines, and other text can be examined or have take denial messages (closer to comprehensive coverage than just critical items)

## Items/Objects Missing Mechanisms - COMPLETED
- [x] Implement setHealth handler in operate.js: redCake, greenCake, and gum have setHealth property but it's not processed
- [x] Implement litDynamite placement mechanism: add applyWith handler to a room object (floor/cavein?) in round or rorrim room to place and explode litDynamite, setting roundExplosion flag (IMPLEMENTED via temporary item countdown system)
- [x] Create barricadedDoor object: replace cave-in obstacle in rorrim room north passage with wooden door that can be destroyed (with litDynamite?) (IMPLEMENTED as barricade object in round room)
- [x] Add riddle1 riddle text (currently placeholder: "I'll fill this in later")
- [x] Add riddle2 answer words (currently empty array in objects.js)
- [x] Add riddle3 answer words (currently empty array in objects.js)
- [x] Create silverDoor object: add to dynamite room with applyWith handler for silverKey to set silverDoorOpen flag (ALREADY EXISTS)
- [x] Create redDoor object: add to rorrim room with mechanism to open after ball puzzle (set redDoorOpened flag when ballPuzzleSolved) (ALREADY EXISTS)
- [x] Implement battery recharge mechanism: add applyWith handler to lantern item so battery can refill lantern power (IMPLEMENTED via craft recipe with resetCountdowns)

## Special Handling
- [ ] Sand room special handling: determine approach for nails display when dropped/picked up (consider similar pattern to dungeonWood)
- [ ] Add description field to dungeonKey and dungeonWood items (requires special handling for dungeon room)
- [ ] Remove item descriptions from dungeon room's look() function to avoid duplication

## Checkpoint System - COMPLETED
- [x] Identify and mark checkpoint rooms with isCheckpoint: true (safe rooms where player should respawn)
- [x] Add checkpoint save logic to movement.js or game.js to save state when entering checkpoint room for first time (ALREADY IMPLEMENTED)
- [ ] Test death/respawn system with multiple checkpoints throughout the game

## Map Building - COMPLETED
- [x] Add remaining rooms beyond the initial dungeon/cellar/five/three/hammer/deadEnd rooms
- [x] Add hub room (referenced in drop room's down passage but not yet defined)
- [x] All rooms added to map (no more rooms will be added)
- [ ] Ensure all room connections are tested

## Testing
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
- [ ] Test lantern power drain (should drain 1 per command when lit) - NEEDS TESTING
- [ ] Test lantern auto-extinguish when power reaches 800 commands - NEEDS TESTING
- [ ] Test battery recharging lantern (craft recipe) - NEEDS TESTING
- [ ] Test dark rooms (can't look/examine/takeAll without lantern lit) - NEEDS TESTING
- [ ] Test fire room damage (1 health every 2 commands) - NEEDS TESTING
- [ ] Test gum room infinite gum (can take gum multiple times) - NEEDS TESTING
- [ ] Test dynamite room infinite dynamite (can only take one at a time, prevents if already have dynamite anywhere) - NEEDS TESTING
- [ ] Test litDynamite countdown and explosion (5 commands with warnings) - NEEDS TESTING
- [ ] Test dynamite instant explosion in fire room - NEEDS TESTING
- [ ] Test fire extinguisher on fire object - NEEDS TESTING
- [ ] Test silverDoor unlocking with silverKey - NEEDS TESTING
- [ ] Test redDoor unlocking with redKey - NEEDS TESTING
- [ ] Test all door objects (purpleDoor, blueDoor, silverDoor, redDoor, final door)

## Lantern Power System - COMPLETED
- [x] Add lanternPower to gameState (default: 500, current power level) (IMPLEMENTED via temporary item countdown to 800)
- [x] Implement power drain: decrease lanternPower by 1 each command when lanternLit flag is set
- [x] Auto-extinguish lantern when lanternPower reaches 0
- [x] Update lantern examine text to show power level and lit/off status dynamically (function-based examine)
- [x] Implement battery applyWith mechanism on lantern: refill lanternPower to 500, consume battery item (craft recipe with resetCountdowns)
- [x] Add lantern examine messages: "It is currently off" when not lit, "It glows brightly" when lit with power, "The flame flickers weakly" when power < 50

## Dark Room System - COMPLETED
- [x] Add light: true property to rooms that have natural light (don't require lantern)
- [x] Implement dark room check: if room doesn't have light: true and lanternLit flag is false, restrict commands
- [x] Block look command in dark rooms (show "It's too dark to see anything")
- [x] Block examine command in dark rooms (show "It's too dark to examine anything")
- [x] Block takeAll in dark rooms (can still take specific items if you know what to type)
- [x] Movement works in dark rooms (no movement blocking)
- [x] Display "A dark room" title when entering dark room without lantern
- [x] Identify which rooms should be dark (currently no rooms marked with light property)

## Movement System Enhancements - COMPLETED
- [x] Add flipDirection() helper function in helpers.js for mirror rooms
- [x] Implement mirrorDirections property for rorrim room (flips all directional commands including back)
- [x] Add entryMessages system for one-way passages with custom flavor text
- [x] Add failedBackText for rooms with no back passage
- [x] Update relevant rooms with hole-in-roof descriptions (hub, parachute, ezam7, nose, armory)
- [x] Implement showAsNormal flag for restricted passages (shows in main passage list but blocks when tried)
- [x] Update look() to merge showAsNormal passages into main passage list (hub, maze13, dry)
- [x] Add onExit system for setting flags when leaving rooms (flexible, not hardcoded)
- [x] Support dynamic room names and look text using function-based properties
- [x] Update displayRoomTitle to handle both static and function-based names

## Special Mechanics - COMPLETED
- [x] Implement rorrim room reversed direction commands (north→south, east→west, including back command)
- [x] Implement boring room first-visit vs revisit text logic (different messages on first entry vs subsequent looks/re-entry)
- [x] Implement riddle2 room dynamic ordinal logic: say "second" if riddle3 not in visitedRooms, otherwise say "third"
- [x] Implement riddle3 room dynamic ordinal logic: say "second" if riddle2 not in visitedRooms, otherwise say "third"
- [x] Implement bell room dynamic text: say "a church" if candle not in visitedRooms, otherwise say "the church"
- [x] Implement gum room infinite gum mechanic: allow taking unlimited gum from the room (infinite property + canTake function)
- [x] Implement fire room damage mechanic: lose 1 health every two commands while in room (unless fireExtinguished flag set) (generic hazard system)
- [x] Implement fire room passage hazard: going north without extinguishing fire should kill player (restrictedPassages with fireExtinguished flag requirement)
- [x] Implement fire extinguisher apply logic: "use extinguisher on fire" should set fireExtinguished flag and remove passage hazard
- [x] Implement hideout room blue cake mechanic: items appear when blue cake is consumed (ALREADY IMPLEMENTED in operate.js)
- [x] Implement infinite dynamite mechanic: allow taking unlimited dynamite from dynamite room (infinite property + canTake function prevents taking if already have dynamite or litDynamite anywhere)
- [x] Implement litDynamite countdown: explodes after 5 commands with warnings at 2 and 4 (temporary item system)
- [x] Implement dynamite instant explosion in fire room: carrying dynamite into fire room causes instant explosion (killIfInventory hazard feature)

## Low Priority Enhancements
- [ ] Differentiate ladder items: create stepladderItem/stepladderActive variants so "drop ladder" doesn't make it climbable (only "use ladder on floor" does)
- [ ] Prevent changing game data from browser console (add data validation/protection against tampering)
- [x] Implement save/load commands (functions exist in storage.js but not wired to command system)
- [ ] Document healthState values: 4 = full health, 3 = minor damage, 2 = moderate damage (triggers high dodge enemies), 1 = severely wounded, 0 = dead
- [ ] Update cyclops room restricted passage unmet description

## Deferred Items
- [ ] Replace door room entryMessages.east placeholder with ending text (map.js, door room) - function receives gameState.commandCount
- [ ] Replace forrest room look placeholder with forest description (map.js, forrest room)
