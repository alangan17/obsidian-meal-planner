# Meal Planner
Organize your recipe in an actionable way

## Shopping list

Open the Meal Planner view and switch from Calendar to Shopping. Choose a from date and to date to aggregate planned recipe ingredients into a supermarket-style list.

Ingredient notes can control shopping categories and pantry staples:

```yaml
category: Seasonings
pantry: true
```

Supported category aliases are `category`, `grocery_category`, and `shopping_category`. Supported pantry aliases are `pantry`, `staple`, and `usually_stocked`. Pantry items stay visible in a separate section so common seasonings are easy to ignore without losing them from the plan.

## Update from inside Obsidian

The plugin can check GitHub for the latest stable release from inside Obsidian:

1. Open Settings.
2. Go to Community plugins.
3. Open Meal Planner settings.
4. Select Check and install under Stable release updates.

This downloads `manifest.json`, `main.js`, and `styles.css` from the matching `release/vX.Y.Z` branch. Reload Obsidian after installing an update.
