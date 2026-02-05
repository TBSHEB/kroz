// ===== CRAFT HANDLER =====

// Crafting handler - checks recipes and creates items
function handleCraft(itemNames) {
  // Convert item names to IDs - track which ones we find
  const interactables = buildInteractablesList();
  const foundItems = itemNames.map(name => {
    const found = findInteractable(name, interactables);
    return { name, id: found?.id };
  });

  // Check if we have all the items - show which ones are missing
  const notFound = foundItems.filter(item => item.id === undefined);
  if (notFound.length > 0) {
    const names = notFound.map(item => `the ${item.name}`);
    let itemList;
    if (names.length === 1) {
      itemList = names[0];
    } else if (names.length === 2) {
      itemList = `${names[0]} or ${names[1]}`;
    } else {
      const allButLast = names.slice(0, -1).join(', ');
      const last = names[names.length - 1];
      itemList = `${allButLast}, or ${last}`;
    }
    displayText(`I don't have ${itemList}.`);
    return false;
  }

  const itemIds = foundItems.map(item => item.id);

  // Ensure all items are in inventory (not just interactable in room)
  const notInInventory = itemIds.filter(id => !gameState.inventory.includes(id));
  if (notInInventory.length > 0) {
    const names = notInInventory.map(id => `the ${items[id].names[0] ? items[id].names[0] : objects[id].names[0] ? objects[id].names[0] : id}`);
    let itemList;
    if (names.length === 1) {
      itemList = names[0];
    } else if (names.length === 2) {
      itemList = `${names[0]} or ${names[1]}`;
    } else {
      const allButLast = names.slice(0, -1).join(', ');
      const last = names[names.length - 1];
      itemList = `${allButLast}, or ${last}`;
    }
    displayText(`I don't have ${itemList}.`);
    return false;
  }

  // Try to find a matching recipe
  for (const [resultId, recipe] of Object.entries(recipes)) {
    // Check if itemIds matches recipe.requires (order doesn't matter)
    if (arraysMatchUnordered(itemIds, recipe.requires)) {
      // Found a match! Execute the recipe

      // Remove items from inventory (except retained ones)
      recipe.requires.forEach(itemId => {
        if (!recipe.retains || !recipe.retains.includes(itemId)) {
          // Remove from inventory
          setGameState("inventory", itemId, false);
        }
      });

      // Add result item to inventory
      setGameState("inventory", resultId);

      // Set flags if specified
      if (recipe.setFlags) {
        recipe.setFlags.forEach(flag => {
          if (!gameState.flags.includes(flag)) {
            setGameState("flags", flag);
          }
        });
      }

      // Unset flags if specified
      if (recipe.unsetFlags) {
        recipe.unsetFlags.forEach(flag => {
          if (gameState.flags.includes(flag)) {
            setGameState("flags", flag, false);
          }
        })
      }

      if (recipe.resetCooldowns) {
        recipe.resetCooldowns.forEach(itemId => {
          if (gameState.itemCooldowns[itemId] !== undefined) {
            gameState.itemCountdowns[itemId] = 0;
          }
        });
      }

      // Display message
      displayText(recipe.message);
      return true;
    }
  }

  // No matching recipe found
  displayText("I can't make anything with those items.");
  return false;
}
