// ===== CRAFT HANDLER =====

// Crafting handler - checks recipes and creates items
function handleCraft(itemNames) {
  // Convert item names to IDs
  const interactables = buildInteractablesList();
  const itemIds = itemNames.map(name => {
    const found = findInteractable(name, interactables);
    return found?.id;
  }).filter(id => id !== undefined); // Remove any not found

  // Check if we have all the items (should already be validated, but double-check)
  if (itemIds.length !== itemNames.length) {
    displayText("I don't have all of those items.");
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
