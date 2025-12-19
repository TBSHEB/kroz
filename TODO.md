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
- [ ] Fix bug with take all taking all forms of a thing.

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
- [ ] Add examines and descriptions to objects that are lacking (many objects have empty examine: "" and description: "")
- [ ] Expand names arrays for each object with additional relevant aliases
- [x] Populate genericExamines object with descriptions for common room elements
- [ ] Fix dungeonLamp examine text (contradictory: "very heavy and rather flimsy")

## Special Handling
- [ ] Sand room special handling: determine approach for nails display when dropped/picked up (consider similar pattern to dungeonWood)
- [ ] Add description field to dungeonKey and dungeonWood items (requires special handling for dungeon room)
- [ ] Remove item descriptions from dungeon room's look() function to avoid duplication

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

## Special Mechanics
- [ ] Implement rorrim room reversed direction commands (north→south, east→west, including back command)
- [ ] Implement boring room first-visit vs revisit text logic (different messages on first entry vs subsequent looks/re-entry)
- [ ] Implement riddle2 room dynamic ordinal logic: say "second" if riddle3 not in visitedRooms, otherwise say "third"
- [ ] Implement riddle3 room dynamic ordinal logic: say "second" if riddle2 not in visitedRooms, otherwise say "third"
- [ ] Implement lantern lighting requirement system: rooms need "lit" flag or equipped lantern to see/navigate properly
- [ ] Change round room southwest passage requirement from cave-in to barricaded wooden door
- [ ] Implement gum room infinite gum mechanic: allow taking unlimited gum from the room
- [ ] Implement bell room dynamic text: say "a church" if candle not in visitedRooms, otherwise say "the church"
- [ ] Implement fire room damage mechanic: lose 1 health every two commands while in room (unless fireout flag set)
- [ ] Implement hideout room blue cake mechanic: items appear when blue cake is consumed

## Low Priority Enhancements
- [ ] Differentiate ladder items: create stepladderItem/stepladderActive variants so "drop ladder" doesn't make it climbable (only "use ladder on floor" does)
- [ ] Prevent changing game data from browser console (add data validation/protection against tampering)
- [x] Implement save/load commands (functions exist in storage.js but not wired to command system)
- [ ] Add healthState descriptions/documentation (what do values 0-4 represent?)
- [ ] Fill in riddle1 riddle text (currently says "I'll fill this in later")
- [ ] Update cyclops room restricted passage unmet description

## Deferred Items
- [ ] Forrest room look description (final room, game ending mechanics need to be determined first)
