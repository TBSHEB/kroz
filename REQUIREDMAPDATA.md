# Required Map Data - Items, Objects, and Flags

This document lists all items, objects, and flags referenced in map.js.

## Items

### Already Implemented (in items.js)

| Item ID | Rooms Found In | Notes |
|---------|---------------|-------|
| dungeonWood | start | Hidden description, sets dungeonWoodTaken flag |
| dungeonKey | start | Hidden description, dropped by dungeonLamp, sets dungeonKeyTaken flag |
| stepladder | cellar, nose (roomItems) | Can be placed, sets stepladderTaken flag |
| lantern | five | Equippable light source, togglable |
| compass | five | Sets compassTaken flag |
| hammer | hammer | Sets hammerTaken flag |
| skull | deadEnd1 | Sets skullTaken flag, used in map recipe |
| nails | sand | Sets nailsTaken flag, used in ladder recipe |
| pick1 | pick1 | Sets pick1Taken flag |
| ladder | tall (roomItems) | **Crafted** from wood+nails+hammer |
| map | three, magic, hub (required) | **Crafted** from skull+hammer, sets hasMap flag |
| sword | sword | Primary combat weapon, sets swordTaken flag |
| pick2 | pick2 (Troll's Den) | Sets pick2Taken flag |
| helmet | armory | Equippable armor, sets helmetTaken flag |
| parachute | parachute | Equippable, sets parachuteTaken flag |
| redCake | redCake | Consumable, kills player when eaten |
| greenCake | greenCake | Consumable, heals player to full, sets checkpoint |
| blueCake | blueCake | Consumable, causes sleep and loses non-vital items |
| shovel | topGlass | Digging tool for dirt room, sets shovelTaken flag |
| wire | ezam1 | Silver wire component, sets wireTaken flag |
| brick1 | bricks | Building material, breaks glass, sets brick1Taken flag |
| brick2 | bricks | Building material, breaks glass, sets brick2Taken flag |
| greenKey1 | cross | Key for final door, sets greenKey1Taken flag |
| greenKey2 | big | Key for final door, sets greenKey2Taken flag |
| greenKey3 | greenKey1 (room) | Key for final door, sets greenKey3Taken flag |
| greenKey4 | tiny (Tiny room) | Key for final door, sets greenKey4Taken flag |
| greenKey5 | greenKey2 (Green Sanctuary) | Key for final door, sets greenKey5Taken flag |
| greenKey6 | *(created)* | **Created** by bell/case interaction, key for final door |
| greenKey7 | *(created)* | **Created** by ball room button puzzle, key for final door |
| greenKey8 | greenKey3 (Key room) | Key for final door, sets greenKey8Taken flag |
| gum | gum | Old chewing gum, kills player when eaten |
| purpleKey | candle (The Church) | Unlocks purpleDoor, sets purpleKeyTaken flag |
| wood | wood (The Wooden room) | Item, sets woodTaken flag, can be chipped into sawdust |
| sawdust | *(created)* | **Created** by chipper from wood/ladder, fills lake |
| dynamite | dynamite (Explosives Storehouse) | Explosive, sets dynamiteTaken flag |
| litDynamite | *(created)* | **Created** by candle from dynamite, explosive |
| pick3 | pick3 (Pickaxe shed) | Tool/weapon, sets pick3Taken flag |
| screwdriver | workshop | Activates machine through pipe, sets screwdriverTaken flag |
| wrench | workshop | Loosens bolt to open gate, sets wrenchTaken flag |
| battery | battery (Battery room) | Battery component, sets batteryTaken flag |
| tongs | smith (Blacksmithy) | Picks up crucibleMelt, sets tongsTaken flag |
| coal | smith (Blacksmithy) | Fuel for furnace, sets coalTaken flag |
| crucible | smith (Blacksmithy) | Container for silver, sets crucibleTaken flag |
| crucibleSilver | *(created)* | **Crafted** from crucible+wire |
| crucibleTongs | *(created)* | **Created** when tongs pick up crucibleMelt |
| silverMold | *(created)* | **Created** when crucibleTongs poured into mold |
| silverKey | *(created)* | **Created** when silverMold cooled in slackTub |
| brush | brush (Hair Salon) | Grooming item, sets brushTaken flag |
| extinguisher | extinguisher | Extinguishes fire, sets extinguisherTaken flag |
| spentExtinguisher | *(created)* | **Created** after using extinguisher on fire |
| brassHammer | hammer2 (Brassworks) | Rings bell to shatter case, sets brassHammerTaken flag |
| redKey | redKey (Red Sanctuary) | Key, sets redKeyTaken flag |
| blueKey | blueKey (Blue Sanctuary) | Unlocks blueDoor, sets blueKeyTaken flag |
| coin | coin (Coin room) | Buys hamburger from vendingMachine, sets coinTaken flag |
| hamburger | *(created)* | **Created** by vendingMachine with coin, consumable |
| hamburgerPoisoned | *(created)* | **Created** by vendingMachine with pick3, consumable |
| concrete | *(created)* | **Created** by wall when chipped with pick3 |
| concretePowder | *(created)* | **Created** by grinder from concrete |
| cup | water | Container, sets cupTaken flag |
| mineralWater | *(created)* | **Crafted** from concretePowder+cup, consumable |

### Need to be Implemented

None - all items from map.js have been implemented!

## Objects

### Already Implemented (in objects.js)

| Object ID | Room | Purpose |
|-----------|------|---------|
| dungeonLamp | start | Drops dungeonKey when operated, sets dungeonLampTaken |
| dungeonTrapdoor | start | Opens with dungeonKey, enables down passage |
| wall | start | Hidden object, use pick3 to chip concrete from wall |
| cavein | magic | Requires pick1+pick2 to clear, sets caveinRemoved |
| troll | magic | Combat enemy, sets trollGone |
| ogre | ogre | Combat enemy requiring helmet, sets ogreGone |
| riddle1 | riddle1 | Puzzle, answer: "parachute", sets firstRiddleSolved |
| toilet | toilet (The Lavatory) | Requires hamburgerEaten flag to use |
| sink | sink (The Washroom) | Interactive handwashing |
| glass | topGlass, bottomGlass | Shatters with brick1/brick2, sets glassBroken |
| dirt | dirt | Dig with shovel to reveal down passage, sets holeDug |
| mirror | mirror1, mirror2 | Teleports between mirror rooms when touched |
| grinder | grinder | Grinds concrete into concretePowder |
| machine | machine | Use screwdriver to activate, sets machineOn |
| code | code | Generates random color sequence for ball puzzle |
| candle | candle (The Church) | Lights dynamite to create litDynamite |
| bolt | bolt | Loosen with wrench, sets gateOpened |
| riddle2 | riddle2 | Puzzle, sets secondRiddleSolved |
| chipper | chipper (The Woodworks) | Chips wood/ladder into sawdust |
| redButton | ball | Ball room puzzle button, checks sequence |
| blueButton | ball | Ball room puzzle button, checks sequence |
| yellowButton | ball | Ball room puzzle button, checks sequence |
| greenButton | ball | Ball room puzzle button, checks sequence |
| riddle3 | riddle3 | Puzzle, sets thirdRiddleSolved |
| case | case (Case room) | Shatters when bell rung, drops greenKey6, sets caseShattered |
| marshmallow | mmmm (Marshmallow's Lair) | Eat-to-kill enemy, requires 4 bites, sets marshmallowGone |
| furnace | smith (Blacksmithy) | Holds coal, melts crucibleSilver when heated |
| mold | smith (Blacksmithy) | Receives molten silver from crucibleTongs |
| bellows | smith (Blacksmithy) | Pumps to heat furnace, sets furnaceHeated |
| slackTub | smith (Blacksmithy) | Cools silverMold to create silverKey |
| crucibleMelt | smith (Blacksmithy) | Spawned object, pick up with tongs |
| fire | fire (Incinerator) | Extinguish with extinguisher, sets fireExtinguished |
| cyclops | cyclops | Combat enemy, say "ulysses" to make flee, sets cyclopsGone |
| hatbox | hat (Cloak room) | Open to reveal down passage, sets hatboxOpened |
| purpleDoor | *(unknown)* | Unlock with purpleKey, sets purpleDoorUnlocked |
| bell | bell (Bell Tower) | Ring with brassHammer to trigger case shattering |
| blueDoor | stone (Stone room) | Unlock with blueKey, sets blueDoorUnlocked |
| vendingMachine | vendingMachine (Vending Machine room) | Insert coin for hamburger, use pick3 for hamburgerPoisoned |
| door | door | Final door with progressive 8 green key system, sets doorUnlocked |
| lake | lake (Lake) | Fill with sawdust to reveal north passage, sets lakeFilled |

### Need to be Implemented

None - all objects from map.js have been implemented!

## Flags

All flags are referenced in map.js restrictedPassages, room look conditions, or object interactions.

### Item-Related Flags

| Flag | Set By | Used In Rooms | Purpose |
|------|--------|---------------|---------|
| dungeonLampTaken | Taking dungeonLamp | start | Changes ceiling description |
| dungeonWoodTaken | Taking dungeonWood | start | Reveals trapdoor |
| nailsTaken | Taking nails | sand | Changes room description |
| lanternTaken | Taking lantern | five | Track lantern possession |
| compassTaken | Taking compass | five | Track compass possession |
| hammerTaken | Taking hammer | hammer | Track hammer possession |
| skullTaken | Taking skull | deadEnd1 | Track skull possession |
| pick1Taken | Taking pick1 | pick1 | Track pickaxe possession |
| swordTaken | Taking sword | sword | Track sword possession |
| pick2Taken | Taking pick2 | pick2 | Track pickaxe possession |
| helmetTaken | Taking helmet | armory | Track helmet possession |
| parachuteTaken | Taking parachute | parachute | Track parachute possession |
| stepladderTaken | Taking stepladder | cellar | Track stepladder possession |
| woodTaken | Taking wood | wood (The Wooden room) | Changes room description |

### Object/Puzzle Flags

| Flag | Set By | Used In Rooms | Purpose |
|------|--------|---------------|---------|
| dungeonTrapdoorUnlocked | Using dungeonKey on trapdoor | start | Required before opening trapdoor |
| dungeonTrapdoorOpen | Opening trapdoor | start | Enables down passage |
| caveinRemoved | Clearing cave-in with picks | magic | Opens west passage to armory |
| trollGone | Defeating troll | magic | Opens southeast passage to pick2 |
| ogreGone | Defeating ogre | ogre | Opens east passage to riddle1 |
| firstRiddleSolved | Solving riddle1 | riddle1 | Opens east passage to parachute |
| secondRiddleSolved | Solving riddle2 | riddle2, greenKey1 (room) | Opens passages between rooms |
| thirdRiddleSolved | Solving riddle3 | riddle3 | Opens northwest passage to chipper |
| glassBroken | Breaking glass with bricks | topGlass, bottomGlass | Opens passage between glass rooms |
| holeDug | Digging dirt with shovel | dirt | Opens down passage to small room |
| machineOn | Using screwdriver on machine | machine | Opens southwest passage to code room |
| roundExplosion | Using dynamite | round, rorrim | Opens southwest passage (cave-in cleared) |
| redDoorOpened | Solving ball puzzle | rorrim | Opens east passage to ball room |
| codeInput | Entering code | ball | Removes floating ball description |
| gateOpened | Loosening bolt with wrench | gate | Opens south passage to wood room |
| caseShattered | Ringing bell with brassHammer | case | Case destroyed, greenKey6 dropped |
| blueDoorUnlocked | Using blueKey on blueDoor | stone | Opens blue door passage |
| lakeFilled | Using sawdust on lake | lake | Opens north passage |
| doorUnlocked | Using all 8 green keys on door | door | Final door unlocked |
| hatboxOpened | Opening hatbox | hat | Reveals down passage |
| purpleDoorUnlocked | Using purpleKey on purpleDoor | *(unknown)* | Opens purple door |
| fireExtinguished | Using extinguisher on fire | fire | Removes fire obstacle |
| coalInFurnace | Placing coal in furnace | smith | Required for heating furnace |
| furnaceHeated | Pumping bellows with coal | smith | Required for melting silver |
| marshmallowGone | Eating marshmallow 4 times | mmmm | Removes marshmallow enemy |
| cyclopsGone | Defeating or saying "ulysses" to cyclops | cyclops | Removes cyclops enemy |
| greenKey1Used | Using greenKey1 on door | door | Tracks door progress (1/8) |
| greenKey2Used | Using greenKey2 on door | door | Tracks door progress (2/8) |
| greenKey3Used | Using greenKey3 on door | door | Tracks door progress (3/8) |
| greenKey4Used | Using greenKey4 on door | door | Tracks door progress (4/8) |
| greenKey5Used | Using greenKey5 on door | door | Tracks door progress (5/8) |
| greenKey6Used | Using greenKey6 on door | door | Tracks door progress (6/8) |
| greenKey7Used | Using greenKey7 on door | door | Tracks door progress (7/8) |
| greenKey8Used | Using greenKey8 on door | door | Tracks door progress (8/8) |

### Equipment Flags

| Flag | Set By | Used In Rooms | Purpose |
|------|--------|---------------|---------|
| parachuteEquipped | Equipping parachute | drop | Required to jump down hole to hub |
| helmetEquipped | Equipping helmet | sword | Required to enter ogre room |
| lanternLit | Operating lantern | *(future)* | Will be required for dark rooms |

### Special Flags

| Flag | Set By | Used In Rooms | Purpose |
|------|--------|---------------|---------|
| hasMap | Having map item | three | Shows shimmer text in look description |
| oneHammerUse | Crafting ladder or map | *(global)* | Tracks hammer usage |
| pick1UsedOnCavein | Using pick1 on cavein | magic | Tracks progress clearing cavein |
| pick2UsedOnCavein | Using pick2 on cavein | magic | Tracks progress clearing cavein |
| hamburgerEaten | Eating hamburger item | toilet | Required to use toilet |
