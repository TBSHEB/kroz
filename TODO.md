# TODO - Kroz Development

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
- [ ] Fix bug with take all taking all forms of a thing

## Code Quality
- [x] Fix look() function - replace "typeof room.look == object" with === (lines 50, 70, 72)
- [ ] Add safety checks in take() and drop() functions if items[itemId] is undefined

## Map.js Content - COMPLETED
- [x] Fix spelling errors in map.js (norhwest→northwest, crusy→crusty, entirely, extra space)
- [x] Implement all missing room names (cyclops, extinguisher, door)
- [x] Implement all missing room descriptions (14 rooms)
- [x] Complete all incomplete room descriptions (hideout, hammer2, pool, bell)
- [x] Add comprehensive disallowedTakes to all rooms (20+ rooms updated)
- [x] Complete fire room look parts and metDescription
- [x] Complete lake room metDescription
- [x] Update REQUIREDMAPDATA.md with all items and objects from lines 1251-1670

## Objects and Items
- [x] Add examine text to all objects (all required objects now have examine text)
- [x] Populate genericExamines object with descriptions for common room elements
- [ ] Add description fields to objects (16 objects have empty description: "" - grinder, machine, code, candle, bolt, chipper, bellows, crucibleMelt, mold, slackTub, hatbox, bell, case, blueDoor, vendingMachine, door)
- [ ] Expand names arrays for each object with additional relevant aliases
- [x] Implement hamburger operate logic (eat verb with consumable)
- [x] Implement hamburgerPoisoned operate logic (eat verb with poison flag)
- [x] Implement mineralWater operate logic (drink verb with consumable)

## Items/Objects Missing Mechanisms
- [ ] Implement setHealth handler in operate.js: redCake, greenCake, and gum have setHealth property but it's not processed
- [ ] Implement litDynamite placement mechanism: add applyWith handler to a room object (floor/cavein?) in round or rorrim room to place and explode litDynamite, setting roundExplosion flag
- [ ] Create barricadedDoor object: replace cave-in obstacle in rorrim room north passage with wooden door that can be destroyed (with litDynamite?)
- [ ] Add riddle1 riddle text (currently placeholder: "I'll fill this in later")
- [ ] Add riddle2 answer words (currently empty array in objects.js)
- [ ] Add riddle3 answer words (currently empty array in objects.js)
- [ ] Create silverDoor object: add to dynamite room with applyWith handler for silverKey to set silverDoorOpen flag
- [ ] Create redDoor object: add to rorrim room with mechanism to open after ball puzzle (set redDoorOpened flag when ballPuzzleSolved)
- [ ] Implement battery recharge mechanism: add applyWith handler to lantern item so battery can refill lantern power

## Special Handling
- [ ] Sand room special handling: determine approach for nails display when dropped/picked up (consider similar pattern to dungeonWood)
- [ ] Add description field to dungeonKey and dungeonWood items (requires special handling for dungeon room)
- [ ] Remove item descriptions from dungeon room's look() function to avoid duplication

## Checkpoint System
- [ ] Identify and mark checkpoint rooms with isCheckpoint: true (safe rooms where player should respawn)
- [ ] Add checkpoint save logic to movement.js or game.js to save state when entering checkpoint room for first time
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
- [ ] Test all special room mechanics (rorrim, boring, riddles, etc.)
- [ ] Test lantern power drain (should drain 1 per command when lit)
- [ ] Test lantern auto-extinguish when power reaches 0
- [ ] Test battery recharging lantern
- [ ] Test dark rooms (can't look/examine/move without lantern lit)
- [ ] Test fire room damage (1 health every 2 commands)
- [ ] Test gum room infinite gum (can take gum multiple times)
- [ ] Test silverDoor unlocking with silverKey
- [ ] Test redDoor opening after ball puzzle completion
- [ ] Test all door objects (purpleDoor, blueDoor, silverDoor, redDoor, final door)

## Lantern Power System
- [ ] Add lanternPower to gameState (default: 500, current power level)
- [ ] Implement power drain: decrease lanternPower by 1 each command when lanternLit flag is set
- [ ] Auto-extinguish lantern when lanternPower reaches 0
- [ ] Update lantern examine text to show power level and lit/off status dynamically
- [ ] Implement battery applyWith mechanism on lantern: refill lanternPower to 500, consume battery item
- [ ] Add lantern examine messages: "It is currently off" when not lit, "It glows brightly" when lit with power, "The flame flickers weakly" when power < 50

## Dark Room System
- [ ] Add lit: true property to rooms that have natural light (don't require lantern)
- [ ] Implement dark room check: if room doesn't have lit: true and lanternLit flag is false, restrict commands
- [ ] Block look command in dark rooms (show "It's too dark to see anything")
- [ ] Block examine command in dark rooms (show "It's too dark to examine anything")
- [ ] Block movement in dark rooms (show "It's too dark to navigate safely")
- [ ] Disable auto-look on room entry if room is dark and lantern is off
- [ ] Identify which rooms should be dark (currently no rooms marked with lit property)

## Special Mechanics - Not Yet Implemented
- [ ] Implement rorrim room reversed direction commands (north→south, east→west, up→down, including back command)
- [ ] Implement boring room first-visit vs revisit text logic (different messages on first entry vs subsequent looks/re-entry)
- [ ] Implement riddle2 room dynamic ordinal logic: say "second" if riddle3 not in visitedRooms, otherwise say "third"
- [ ] Implement riddle3 room dynamic ordinal logic: say "second" if riddle2 not in visitedRooms, otherwise say "third"
- [ ] Implement gum room infinite gum mechanic: allow taking unlimited gum from the room
- [ ] Implement bell room dynamic text: say "a church" if candle not in visitedRooms, otherwise say "the church"
- [ ] Implement fire room damage mechanic: lose 1 health every two commands while in room (unless fireExtinguished flag set)
- [x] Implement hideout room blue cake mechanic: items appear when blue cake is consumed (ALREADY IMPLEMENTED in operate.js)

## Low Priority Enhancements
- [ ] Differentiate ladder items: create stepladderItem/stepladderActive variants so "drop ladder" doesn't make it climbable (only "use ladder on floor" does)
- [ ] Prevent changing game data from browser console (add data validation/protection against tampering)
- [x] Implement save/load commands (functions exist in storage.js but not wired to command system)
- [ ] Document healthState values: 4 = full health, 3 = minor damage, 2 = moderate damage (triggers high dodge enemies), 1 = severely wounded, 0 = dead
- [ ] Update cyclops room restricted passage unmet description
- [ ] Add ball puzzle logic to set redDoorOpened flag when ballPuzzleSolved (currently only sets ballPuzzleSolved)

## Deferred Items
- [ ] Forrest room look description (final room, game ending mechanics need to be determined first)
