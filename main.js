/* THIS FILE IS GENERATED FROM src/main.ts. Do not edit main.js directly. */
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => MealPlannerCalendarPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian2 = require("obsidian");

// src/domain/dates.ts
function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function startOfWeek(date) {
  const start = startOfDay(date);
  start.setDate(start.getDate() - start.getDay());
  return start;
}
function addDays(date, count) {
  const next = new Date(date);
  next.setDate(next.getDate() + count);
  return next;
}
function rangeDays(start, count) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start);
    date.setDate(date.getDate() + index);
    return date;
  });
}
function formatDateKey(date) {
  const d = startOfDay(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function isDateKey(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return false;
  const date = /* @__PURE__ */ new Date(`${value}T00:00:00`);
  return Number.isFinite(date.getTime()) && formatDateKey(date) === value;
}
function rangeDateKeys(fromKey, toKey) {
  if (!isDateKey(fromKey) || !isDateKey(toKey) || fromKey > toKey) return [];
  const from = /* @__PURE__ */ new Date(`${fromKey}T00:00:00`);
  const to = /* @__PURE__ */ new Date(`${toKey}T00:00:00`);
  const count = Math.round((to.getTime() - from.getTime()) / 864e5) + 1;
  return rangeDays(from, count).map(formatDateKey);
}
function weekdayShortName(dayKey) {
  if (!isDateKey(dayKey)) return "";
  return (/* @__PURE__ */ new Date(`${dayKey}T00:00:00`)).toLocaleDateString(void 0, { weekday: "short" });
}
function clampIndex(value, length) {
  const index = Number.isInteger(value) ? Number(value) : length;
  return Math.max(0, Math.min(index, length));
}
function formatShortDate(date) {
  return date.toLocaleDateString(void 0, { month: "short", day: "numeric" });
}

// src/domain/servings.ts
function parseServingCount(servings) {
  if (typeof servings === "number" && Number.isFinite(servings) && servings > 0) return servings;
  if (!servings) return null;
  const normalized = String(servings).trim().toLowerCase();
  const range = normalized.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
  if (range) return Number(range[2]);
  const single = normalized.match(/(\d+(?:\.\d+)?)/);
  if (!single) return null;
  const parsed = Number(single[1]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
function servingTargetForEntry(entry, recipe) {
  const target = Number(entry?.targetServings);
  if (Number.isFinite(target) && target > 0) return target;
  return recipe.servingsNumber || null;
}
function servingScaleForEntry(entry, recipe) {
  const base = recipe.servingsNumber;
  const target = servingTargetForEntry(entry, recipe);
  if (!base || !target) return 1;
  return target / base;
}
function isPerServingAmount(amount) {
  if (!amount) return false;
  return /\bper\s+(portion|serving)\b|每份/.test(String(amount).toLowerCase());
}
function quantityForEntry(amount, recipe, entry = {}) {
  const quantity = parseQuantity(amount);
  if (!quantity) return null;
  const target = servingTargetForEntry(entry, recipe);
  const scale = isPerServingAmount(amount) && target ? target : servingScaleForEntry(entry, recipe);
  return { ...quantity, value: quantity.value * scale };
}
function scaledIngredientAmount(amount, recipe, entry = {}) {
  if (!amount) return "";
  const quantity = quantityForEntry(amount, recipe, entry);
  if (!quantity) return amount;
  return `${formatAmount(quantity.value)} ${displayUnit(quantity.unit)}`;
}
function parseQuantity(amount) {
  if (!amount) return null;
  const normalized = String(amount).toLowerCase().replace(/湯匙/g, "tbsp").replace(/茶匙/g, "tsp").replace(/隻/g, "unit").replace(/個/g, "unit").replace(/包/g, "pack").replace(/碗/g, "unit").replace(/份/g, "unit");
  const match = normalized.match(/(\d+(?:\.\d+)?(?:\s*\/\s*\d+(?:\.\d+)?)?)(?:\s*-\s*(\d+(?:\.\d+)?))?\s*(g|gram|grams|ml|milliliter|milliliters|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|pack|packs|unit|each|portion|portions|piece|pieces|banana|egg|eggs)?/);
  if (!match) return null;
  const first = parseNumber(match[1]);
  if (!first) return null;
  const second = match[2] ? parseNumber(match[2]) : null;
  const value = second ? (first + second) / 2 : first;
  const unit = normalizeUnit(match[3] || inferUnit(normalized));
  return { value, unit };
}
function parseNumber(value) {
  const fraction = String(value).match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
  if (fraction) return Number(fraction[1]) / Number(fraction[2]);
  return Number(value);
}
function inferUnit(text) {
  if (/\bbanana\b/.test(text)) return "unit";
  if (/\beggs?\b/.test(text)) return "unit";
  if (/\bpack\b/.test(text)) return "pack";
  return "unit";
}
function normalizeUnit(unit) {
  if (!unit) return "unit";
  if (["gram", "grams"].includes(unit)) return "g";
  if (["milliliter", "milliliters"].includes(unit)) return "ml";
  if (["tablespoon", "tablespoons"].includes(unit)) return "tbsp";
  if (["teaspoon", "teaspoons"].includes(unit)) return "tsp";
  if (["packs"].includes(unit)) return "pack";
  if (["each", "portion", "portions", "piece", "pieces", "banana", "egg", "eggs"].includes(unit)) return "unit";
  return unit;
}
function conversionFactor(quantity, base) {
  if (base === "100g" && quantity.unit === "g") return quantity.value / 100;
  if (base === "100ml" && quantity.unit === "ml") return quantity.value / 100;
  if (base === "1g" && quantity.unit === "g") return quantity.value;
  if (base === "tbsp" && quantity.unit === "tbsp") return quantity.value;
  if (base === "tsp" && quantity.unit === "tsp") return quantity.value;
  if (base === "pack" && quantity.unit === "pack") return quantity.value;
  if (base === "unit" && quantity.unit === "unit") return quantity.value;
  return 0;
}
function formatAmount(value) {
  if (value >= 100) return String(Math.round(value));
  if (value >= 10) return String(Math.round(value * 10) / 10);
  return String(Math.round(value * 100) / 100);
}
function displayUnit(unit) {
  if (unit === "unit") return "each";
  return unit;
}

// src/domain/text.ts
function normalizeArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.flat(3);
  return [value];
}
function uniqueValues(values) {
  return values.filter((value, index, list) => Boolean(value) && list.indexOf(value) === index);
}
function cleanWiki(value) {
  if (!value) return "";
  return String(value).replace(/^\[\[/, "").replace(/\]\]$/, "").split("|")[0].trim();
}
function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
function titleCaseWords(value) {
  return String(value || "").replace(/[_-]+/g, " ").split(/\s+/).filter(Boolean).map((word) => titleCase(word.toLowerCase())).join(" ");
}

// src/domain/mealPlanText.ts
function formatMealPlanText(plans, recipes, fromKey, toKey) {
  const lines = [`Meal Plan: ${fromKey} to ${toKey}`];
  const entries = mealPlanEntriesForRange(plans, fromKey, toKey);
  const recipeList = recipes || [];
  if (!entries.length) {
    lines.push("", "No planned recipes.");
    return lines.join("\n");
  }
  let currentDay = "";
  let currentMeal = "";
  entries.forEach(({ dayKey, mealName, entry }) => {
    if (dayKey !== currentDay) {
      if (currentDay) lines.push("");
      lines.push(`${dayKey} ${weekdayShortName(dayKey)}`);
      currentDay = dayKey;
      currentMeal = "";
    }
    if (mealName !== currentMeal) {
      lines.push(mealName);
      currentMeal = mealName;
    }
    const recipe = recipeList.find((item) => item.path === entry.path);
    const name = recipe?.name || entry.name || entry.path || "Untitled recipe";
    const target = Number(entry.targetServings);
    const suffix = Number.isFinite(target) && target > 0 ? ` (servings: ${formatAmount(target)})` : "";
    lines.push(`- ${name}${suffix}`);
  });
  return lines.join("\n");
}
function mealPlanEntriesForRange(plans, fromKey, toKey) {
  const entries = [];
  Object.entries(plans || {}).filter(([dayKey]) => dayKey >= fromKey && dayKey <= toKey).sort(([a], [b]) => a.localeCompare(b)).forEach(([dayKey, dayPlans]) => {
    Object.entries(dayPlans || {}).forEach(([mealName, mealEntries]) => {
      (mealEntries || []).forEach((entry, index) => {
        entries.push({ dayKey, mealName, entry, index });
      });
    });
  });
  return entries;
}
function parseMealPlanText(text, recipes, defaultMeals) {
  const entries = [];
  const warnings = [];
  const recipeList = recipes || [];
  const mealDefaults = defaultMeals || [];
  const header = String(text || "").match(/Meal Plan:\s*(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/i);
  const headerFrom = header && isDateKey(header[1]) ? header[1] : "";
  const headerTo = header && isDateKey(header[2]) ? header[2] : "";
  let currentDayKey = "";
  let currentMealName = "";
  String(text || "").split(/\r?\n/).forEach((rawLine, index) => {
    const line = rawLine.trim();
    const lineNumber = index + 1;
    if (!line) return;
    if (/^Meal Plan:/i.test(line) || /^No planned recipes\.$/i.test(line)) return;
    const dateMatch = line.match(/^(\d{4}-\d{2}-\d{2})(?:\s+.*)?$/);
    if (dateMatch) {
      if (!isDateKey(dateMatch[1])) {
        warnings.push(`Line ${lineNumber}: invalid date ${dateMatch[1]}.`);
        currentDayKey = "";
        currentMealName = "";
        return;
      }
      currentDayKey = dateMatch[1];
      currentMealName = "";
      return;
    }
    const recipeMatch = line.match(/^[-*]\s+(.+)$/);
    if (recipeMatch) {
      if (!currentDayKey) {
        warnings.push(`Line ${lineNumber}: recipe has no date and was skipped.`);
        return;
      }
      if (!currentMealName) {
        currentMealName = mealDefaults[2] || mealDefaults[0] || "Dinner";
        warnings.push(`Line ${lineNumber}: missing meal heading, imported under ${currentMealName}.`);
      }
      const parsedRecipe = parseMealPlanRecipeLine(recipeMatch[1]);
      const recipe = resolveMealPlanRecipe(parsedRecipe.name, recipeList);
      if (!recipe) warnings.push(`Line ${lineNumber}: recipe not found: ${parsedRecipe.name}.`);
      const entry = recipe ? { path: recipe.path, name: recipe.name } : { name: parsedRecipe.name };
      if (parsedRecipe.targetServings) entry.targetServings = parsedRecipe.targetServings;
      entries.push({ dayKey: currentDayKey, mealName: currentMealName, entry });
      return;
    }
    currentMealName = line;
  });
  const parsedDates = uniqueValues(entries.map((item) => item.dayKey)).sort();
  const fromKey = headerFrom || parsedDates[0] || "";
  const toKey = headerTo || parsedDates[parsedDates.length - 1] || fromKey;
  if (headerFrom && headerTo && headerFrom > headerTo) warnings.push("Header date range is reversed.");
  return {
    entries,
    warnings,
    fromKey,
    toKey,
    dayCount: parsedDates.length,
    mealCount: new Set(entries.map((item) => `${item.dayKey}::${item.mealName}`)).size
  };
}
function parseMealPlanRecipeLine(value) {
  const line = String(value || "").trim();
  const servingsMatch = line.match(/\s+\((?:servings|serving|份量|份):\s*(\d+(?:\.\d+)?)\)\s*$/i);
  if (!servingsMatch) return { name: line, targetServings: null };
  const targetServings = Number(servingsMatch[1]);
  return {
    name: line.slice(0, servingsMatch.index).trim(),
    targetServings: Number.isFinite(targetServings) && targetServings > 0 ? targetServings : null
  };
}
function resolveMealPlanRecipe(name, recipes) {
  const normalized = String(name || "").trim();
  const recipeList = recipes || [];
  if (!normalized) return null;
  return recipeList.find((recipe) => recipe.name === normalized) || recipeList.find((recipe) => recipe.path === normalized) || recipeList.find((recipe) => recipe.name.toLowerCase() === normalized.toLowerCase()) || null;
}
function mealPlanEntriesMatch(a, b) {
  return String(a?.path || "") === String(b?.path || "") && String(a?.name || "") === String(b?.name || "") && String(a?.targetServings || "") === String(b?.targetServings || "");
}

// src/domain/mealPlanMutations.ts
var SAMPLE_RECIPE_NAME = "Tomato Egg Rice";
var SAMPLE_RECIPE_FILENAME = `${SAMPLE_RECIPE_NAME}.md`;
var SAMPLE_RECIPE_INGREDIENTS = ["Egg", "Tomato", "Rice", "Soy Sauce", "Oil"];
var SAMPLE_INGREDIENT_METADATA = [
  { name: "Egg", category: "Protein", pantry: false },
  { name: "Tomato", category: "Produce", pantry: false },
  { name: "Rice", category: "Dry Goods", pantry: false },
  { name: "Soy Sauce", category: "Seasonings", pantry: true },
  { name: "Oil", category: "Seasonings", pantry: true }
];
function cloneEntry(entry) {
  return JSON.parse(JSON.stringify(entry));
}
function cleanupEmptyPlan(plans, dayKey, mealName) {
  const dayPlans = plans[dayKey];
  if (!dayPlans) return;
  if (mealName && !dayPlans[mealName]?.length) delete dayPlans[mealName];
  if (!Object.keys(dayPlans).length) delete plans[dayKey];
}
function addEntryToPlans(plans, dayKey, mealName, recipe, targetServings) {
  if (!plans[dayKey]) plans[dayKey] = {};
  if (!plans[dayKey][mealName]) plans[dayKey][mealName] = [];
  const entry = { path: recipe.path, name: recipe.name };
  if (targetServings && targetServings !== recipe.servingsNumber) {
    entry.targetServings = targetServings;
  }
  plans[dayKey][mealName].push(entry);
  return entry;
}
function addSampleEntryToPlans(plans, dayKey, recipePath) {
  const entry = { path: recipePath, name: SAMPLE_RECIPE_NAME };
  if (!plans[dayKey]) plans[dayKey] = {};
  if (!plans[dayKey].Dinner) plans[dayKey].Dinner = [];
  const existing = plans[dayKey].Dinner.find((item) => mealPlanEntriesMatch(item, entry));
  if (existing) return { entry: existing, added: false };
  plans[dayKey].Dinner.push(cloneEntry(entry));
  return { entry, added: true };
}
function sampleRecipeMarkdown() {
  return [
    "---",
    "type: recipe",
    `name: ${SAMPLE_RECIPE_NAME}`,
    "servings: 2",
    "tags:",
    "  - dinner",
    "  - sample",
    "ingredients:",
    ...SAMPLE_RECIPE_INGREDIENTS.map((name) => `  - ${name}`),
    "---",
    "",
    "## Ingredients / \u6750\u6599",
    "",
    "- [[Egg]] 4 units",
    "- [[Tomato]] 300g",
    "- [[Rice]] 300g",
    "- [[Soy Sauce]] 1 tbsp",
    "- [[Oil]] 1 tbsp",
    "",
    "## Method / \u505A\u6CD5",
    "",
    "1. Cook the rice.",
    "2. Scramble the eggs, then set them aside.",
    "3. Cook the tomato until softened, then add the eggs back.",
    "4. Season with soy sauce and serve over rice.",
    ""
  ].join("\n");
}
function sampleIngredientMarkdown(item) {
  return [
    "---",
    `category: ${item.category}`,
    `pantry: ${item.pantry ? "true" : "false"}`,
    "---",
    ""
  ].join("\n");
}
function importEntriesIntoPlans(plans, parsed, mode, rangeDateKeys2) {
  if (mode === "replace") {
    rangeDateKeys2(parsed.fromKey, parsed.toKey).forEach((dayKey) => {
      delete plans[dayKey];
    });
  }
  let imported = 0;
  let skipped = 0;
  parsed.entries.forEach(({ dayKey, mealName, entry }) => {
    if (!plans[dayKey]) plans[dayKey] = {};
    if (!plans[dayKey][mealName]) plans[dayKey][mealName] = [];
    if (mode === "merge" && plans[dayKey][mealName].some((existing) => mealPlanEntriesMatch(existing, entry))) {
      skipped += 1;
      return;
    }
    plans[dayKey][mealName].push(cloneEntry(entry));
    imported += 1;
  });
  return { imported, skipped };
}
function transferEntryInPlans(plans, sourceDayKey, sourceMealName, sourceIndex, targetDayKey, targetMealName, mode, targetIndex = null) {
  const finalMealName = String(targetMealName || sourceMealName || "").trim();
  if (!finalMealName) return { changed: false, reason: "missing-meal" };
  const sourceEntries = plans[sourceDayKey]?.[sourceMealName];
  const sourceEntry = sourceEntries?.[sourceIndex];
  if (!sourceEntry) return { changed: false, reason: "missing-source" };
  if (!plans[targetDayKey]) plans[targetDayKey] = {};
  if (!plans[targetDayKey][finalMealName]) plans[targetDayKey][finalMealName] = [];
  const targetEntries = plans[targetDayKey][finalMealName];
  const isSameMeal = sourceDayKey === targetDayKey && sourceMealName === finalMealName;
  const requestedIndex = Number.isInteger(targetIndex) ? Number(targetIndex) : targetEntries.length;
  if (mode === "copy") {
    targetEntries.splice(clampIndex(requestedIndex, targetEntries.length), 0, cloneEntry(sourceEntry));
    return { changed: true };
  }
  if (isSameMeal && (requestedIndex === sourceIndex || requestedIndex === sourceIndex + 1)) {
    return { changed: false, reason: "same-position" };
  }
  const [movedEntry] = sourceEntries.splice(sourceIndex, 1);
  let insertIndex = requestedIndex;
  if (isSameMeal && insertIndex > sourceIndex) insertIndex -= 1;
  targetEntries.splice(clampIndex(insertIndex, targetEntries.length), 0, movedEntry);
  cleanupEmptyPlan(plans, sourceDayKey, sourceMealName);
  return { changed: true };
}

// src/domain/nutrition.ts
function estimateNutrients(meta, quantity) {
  const estimates = [];
  Object.entries(meta).forEach(([key, rawValue]) => {
    const match = key.match(/^([a-z_]+)_per_(100g|100ml|1g|tbsp|tsp|pack|unit)$/);
    if (!match || typeof rawValue !== "number") return;
    const nutrientName = nutrientLabel(match[1]);
    const base = match[2];
    const factor = conversionFactor(quantity, base);
    if (!factor) return;
    estimates.push({
      name: nutrientName,
      value: rawValue * factor,
      unit: nutrientUnit(nutrientName)
    });
  });
  return estimates;
}
function nutrientLabel(key) {
  return key.split("_").map(titleCase).join(" ");
}
function nutrientUnit(name) {
  if (["Sodium", "Calcium", "Potassium"].includes(name)) return "mg";
  if (name === "Energy") return "kcal";
  return "g";
}

// src/domain/shopping.ts
function shoppingListForEntries(entries, recipes, metadataForIngredient, showPantryItems) {
  const recipeByPath = new Map(recipes.map((recipe) => [recipe.path, recipe]));
  const totals = /* @__PURE__ */ new Map();
  const unknowns = /* @__PURE__ */ new Map();
  const warnings = [];
  entries.forEach(({ dayKey, entry }) => {
    const recipe = entry.path ? recipeByPath.get(entry.path) : void 0;
    if (!recipe) {
      warnings.push(`Recipe file missing: ${entry.name || entry.path}`);
      return;
    }
    recipe.ingredientDetails.forEach((ingredient) => {
      const meta = metadataForIngredient(ingredient.name);
      const category = shoppingCategoryForIngredient(ingredient.name, meta);
      const pantry = isPantryIngredient(ingredient.name, meta, category);
      const base = {
        name: ingredient.name,
        category,
        pantry,
        recipeNames: /* @__PURE__ */ new Set([recipe.name]),
        dateKeys: /* @__PURE__ */ new Set([dayKey])
      };
      const quantity = quantityForEntry(ingredient.amount, recipe, entry);
      if (!quantity) {
        const key2 = `${ingredient.name}::unknown::${category}::${pantry}`;
        const current2 = unknowns.get(key2) || { ...base, amounts: /* @__PURE__ */ new Set(), key: "", label: "" };
        if (ingredient.amount) current2.amounts?.add(ingredient.amount);
        current2.recipeNames.add(recipe.name);
        current2.dateKeys.add(dayKey);
        unknowns.set(key2, current2);
        return;
      }
      const key = `${ingredient.name}::${quantity.unit}::${category}::${pantry}`;
      const current = totals.get(key) || { ...base, value: 0, unit: quantity.unit, key: "", label: "" };
      current.value = (current.value || 0) + quantity.value;
      current.recipeNames.add(recipe.name);
      current.dateKeys.add(dayKey);
      totals.set(key, current);
    });
  });
  const knownItems = Array.from(totals.values()).map((item) => ({
    ...item,
    label: `${formatAmount(item.value || 0)} ${displayUnit(item.unit || "")}`,
    key: shoppingItemKey(item.name, item.category, item.pantry, item.unit)
  }));
  const unknownItems = Array.from(unknowns.values()).map((item) => ({
    ...item,
    label: item.amounts?.size ? Array.from(item.amounts).join(" + ") : "as needed",
    key: shoppingItemKey(item.name, item.category, item.pantry, "unknown")
  }));
  const items = knownItems.concat(unknownItems).sort((a, b) => {
    const categoryCompare = a.category.localeCompare(b.category);
    if (categoryCompare) return categoryCompare;
    return a.name.localeCompare(b.name);
  });
  const visiblePantry = showPantryItems ? items.filter((item) => item.pantry) : [];
  const hiddenPantryCount = showPantryItems ? 0 : items.filter((item) => item.pantry).length;
  const regularItems = items.filter((item) => !item.pantry);
  const groups = [];
  const byCategory = /* @__PURE__ */ new Map();
  regularItems.forEach((item) => {
    if (!byCategory.has(item.category)) byCategory.set(item.category, []);
    byCategory.get(item.category)?.push(item);
  });
  preferredShoppingCategories().forEach((category) => {
    const categoryItems = byCategory.get(category);
    if (categoryItems?.length) {
      groups.push({ category, items: categoryItems });
      byCategory.delete(category);
    }
  });
  Array.from(byCategory.entries()).sort(([a], [b]) => a.localeCompare(b)).forEach(([category, categoryItems]) => groups.push({ category, items: categoryItems }));
  return {
    groups,
    pantry: visiblePantry.sort((a, b) => a.name.localeCompare(b.name)),
    hiddenPantryCount,
    itemCount: regularItems.length + visiblePantry.length,
    recipeCount: new Set(entries.map((item) => item.entry.path)).size,
    warnings
  };
}
function ingredientsForPlanEntries(entries, recipes) {
  const recipeByPath = new Map(recipes.map((recipe) => [recipe.path, recipe]));
  const totals = /* @__PURE__ */ new Map();
  const unknowns = /* @__PURE__ */ new Map();
  entries.forEach(({ entry }) => {
    const recipe = entry.path ? recipeByPath.get(entry.path) : void 0;
    if (!recipe) return;
    recipe.ingredientDetails.forEach((ingredient) => {
      const quantity = quantityForEntry(ingredient.amount, recipe, entry);
      if (!quantity) {
        const key2 = ingredient.name;
        const values = unknowns.get(key2) || /* @__PURE__ */ new Set();
        if (ingredient.amount) values.add(ingredient.amount);
        unknowns.set(key2, values);
        return;
      }
      const key = `${ingredient.name}::${quantity.unit}`;
      const current = totals.get(key) || { name: ingredient.name, value: 0, unit: quantity.unit };
      current.value += quantity.value;
      totals.set(key, current);
    });
  });
  const known = Array.from(totals.values()).map((item) => ({
    name: item.name,
    label: `${item.name}: ${formatAmount(item.value)} ${displayUnit(item.unit)}`
  }));
  const unknown = Array.from(unknowns.entries()).map(([name, values]) => ({
    name,
    label: values.size ? `${name}: ${Array.from(values).join(" + ")}` : `${name}: as needed`
  }));
  return known.concat(unknown).sort((a, b) => a.name.localeCompare(b.name));
}
function shoppingCategoryForIngredient(name, meta) {
  const explicit = firstValue(meta.category, meta.grocery_category, meta.shopping_category);
  if (explicit) return titleCaseWords(cleanWiki(explicit));
  const normalized = normalizeIngredientName(name);
  const rules = shoppingCategoryRules();
  const match = rules.find((rule) => rule.pattern.test(normalized));
  return match ? match.category : "Other";
}
function isPantryIngredient(name, meta, category) {
  const explicit = firstPresentValue(meta.pantry, meta.staple, meta.usually_stocked);
  if (explicit.present) return truthyFrontmatter(explicit.value);
  if (category === "Seasonings") return true;
  return pantryIngredientPattern().test(normalizeIngredientName(name));
}
function shoppingItemKey(name, category, pantry, unit) {
  return [name, category, pantry ? "pantry" : "buy", unit].map((part) => String(part || "").toLowerCase()).join("::");
}
function normalizeIngredientName(value) {
  return String(value || "").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ");
}
function truthyFrontmatter(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  return /^(true|yes|y|1|on)$/i.test(String(value || "").trim());
}
function preferredShoppingCategories() {
  return [
    "Produce",
    "Protein",
    "Seafood",
    "Dairy",
    "Dry Goods",
    "Canned & Jarred",
    "Frozen",
    "Bakery",
    "Seasonings",
    "Other"
  ];
}
function shoppingCategoryRules() {
  return [
    { category: "Seasonings", pattern: pantryIngredientPattern() },
    { category: "Produce", pattern: /vegetable|veggie|fruit|herb|mushroom|tomato|potato|onion|garlic|ginger|scallion|spring onion|cilantro|parsley|lettuce|cabbage|carrot|celery|pepper|chili|lemon|lime|banana|apple|菜|蔥|薑|蒜|菇|蘑菇|番茄|蕃茄|薯|蘿蔔|椰菜|芫茜|檸檬/ },
    { category: "Seafood", pattern: /fish|salmon|tuna|shrimp|prawn|scallop|clam|mussel|seafood|魚|蝦|帶子|蜆|青口|海鮮/ },
    { category: "Protein", pattern: /chicken|beef|pork|lamb|turkey|meat|egg|tofu|bean curd|豆腐|蛋|雞|牛|豬|羊|肉/ },
    { category: "Dairy", pattern: /milk|cream|butter|cheese|yogurt|yoghurt|kefir|奶|忌廉|牛油|芝士|乳酪/ },
    { category: "Dry Goods", pattern: /rice|noodle|pasta|flour|oat|grain|bean|lentil|麵|麵粉|飯|米|意粉|燕麥|豆/ },
    { category: "Canned & Jarred", pattern: /canned|can|jar|paste|罐|樽|醬/ },
    { category: "Frozen", pattern: /frozen|急凍|冰鮮/ },
    { category: "Bakery", pattern: /bread|bun|toast|bagel|包|麵包|多士/ }
  ];
}
function pantryIngredientPattern() {
  return /salt|pepper|oil|olive oil|soy sauce|vinegar|sugar|spice|powder|sauce|sesame|cornstarch|starch|stock|bouillon|miso|gochujang|doenjang|mustard|ketchup|mayo|mayonnaise|鹽|胡椒|油|豉油|醬油|醋|糖|香料|粉|醬|麻油|生粉|粟粉|味噌/;
}
function firstValue(...values) {
  for (const value of values) {
    const normalized = normalizeArray(value).map(String).map((item) => item.trim()).find((item) => item !== "");
    if (normalized) return normalized;
  }
  return "";
}
function firstPresentValue(...values) {
  for (const value of values) {
    if (value !== void 0 && value !== null && value !== "") return { present: true, value };
  }
  return { present: false, value: "" };
}

// src/io/updater.ts
var import_obsidian = require("obsidian");
var GITHUB_REPO = "alangan17/obsidian-meal-planner";
var RELEASE_FILES = ["manifest.json", "main.js", "styles.css"];
async function fetchLatestRelease() {
  const response = await (0, import_obsidian.requestUrl)({
    url: `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
    headers: {
      Accept: "application/vnd.github+json"
    }
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`GitHub latest release request failed (${response.status})`);
  }
  if (!response.json || !response.json.tag_name) {
    throw new Error("GitHub latest release did not include a tag name.");
  }
  return response.json;
}
async function downloadReleaseFiles(tagName, expectedVersion) {
  const branch = `release/${tagName}`;
  const entries = await Promise.all(RELEASE_FILES.map(async (file) => {
    const response = await (0, import_obsidian.requestUrl)({
      url: `https://api.github.com/repos/${GITHUB_REPO}/contents/${file}?ref=${encodeURIComponent(branch)}`,
      headers: {
        Accept: "application/vnd.github.raw"
      }
    });
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Could not download ${file} from ${branch} (${response.status})`);
    }
    if (!response.text) {
      throw new Error(`Downloaded empty ${file} from ${branch}.`);
    }
    return [file, response.text];
  }));
  const files = Object.fromEntries(entries);
  const manifest = JSON.parse(files["manifest.json"]);
  if (manifest.version !== expectedVersion) {
    throw new Error(`Release manifest version is ${manifest.version}, expected ${expectedVersion}.`);
  }
  return files;
}
function versionFromTag(tagName) {
  const version = String(tagName || "").replace(/^v/i, "");
  if (!/^\d+\.\d+\.\d+([+-][0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error(`Release tag ${tagName} is not a valid stable version.`);
  }
  return version;
}
function isNewerVersion(candidate, current) {
  const candidateParts = parseVersion(candidate);
  const currentParts = parseVersion(current);
  for (let index = 0; index < 3; index += 1) {
    if (candidateParts[index] > currentParts[index]) return true;
    if (candidateParts[index] < currentParts[index]) return false;
  }
  return false;
}
function parseVersion(version) {
  const match = String(version || "").match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return [0, 0, 0];
  return match.slice(1, 4).map((part) => Number(part));
}

// src/main.ts
var VIEW_TYPE = "meal-planner-view";
var MEAL_PLANNER_ICON = "meal-planner";
var MEAL_PLANNER_ICON_SVG = `
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="7">
  <path d="M30 10v18" />
  <path d="M70 10v18" />
  <path d="M17 38h66" />
  <rect x="14" y="20" width="72" height="68" rx="9" />
  <circle cx="50" cy="63" r="16" />
  <circle cx="50" cy="63" r="5" />
</g>
`;
var DEFAULT_SETTINGS = {
  recipeFolder: "recipe",
  ingredientsFolder: "ingredients",
  nutrientsFolder: "nutrients",
  plans: {},
  defaultMeals: ["Breakfast", "Lunch", "Dinner"]
};
var MealPlannerCalendarPlugin = class extends import_obsidian2.Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    (0, import_obsidian2.addIcon)(MEAL_PLANNER_ICON, MEAL_PLANNER_ICON_SVG);
    this.registerView(VIEW_TYPE, (leaf) => new MealPlannerView(leaf, this));
    this.addRibbonIcon(MEAL_PLANNER_ICON, "Meal planner", () => {
      this.activateView();
    });
    this.addCommand({
      id: "open-meal-planner",
      name: "Open meal planner",
      callback: () => this.activateView()
    });
    this.addCommand({
      id: "check-stable-release-update",
      name: "Check for stable release update",
      callback: () => this.checkForStableReleaseUpdate({ install: true })
    });
    this.addCommand({
      id: "create-sample-meal-plan",
      name: "Create sample meal plan",
      callback: async () => {
        const view = await this.activateView();
        if (view instanceof MealPlannerView) await view.createSampleMealPlan();
      }
    });
    this.addSettingTab(new MealPlannerSettingTab(this.app, this));
  }
  async onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE);
  }
  async activateView() {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE);
    const leaf = leaves[0] || this.app.workspace.getLeaf(true);
    await leaf.setViewState({ type: VIEW_TYPE, active: true });
    this.app.workspace.revealLeaf(leaf);
    return leaf.view;
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  getPluginDir() {
    const plugins = this.app.plugins?.plugins || {};
    const loadedDir = Object.keys(plugins).find((dir) => plugins[dir] === this);
    return loadedDir || this.manifest.dir || this.manifest.id;
  }
  getPluginAdapterPath() {
    const pluginDir = this.getPluginDir();
    if (pluginDir.startsWith(`${this.app.vault.configDir}/plugins/`)) return pluginDir;
    return `${this.app.vault.configDir}/plugins/${pluginDir}`;
  }
  async checkForStableReleaseUpdate({ install = false } = {}) {
    try {
      const release = await fetchLatestRelease();
      const remoteVersion = versionFromTag(release.tag_name);
      const currentVersion = this.manifest.version;
      if (!isNewerVersion(remoteVersion, currentVersion)) {
        new import_obsidian2.Notice(`Meal Planner is up to date (${currentVersion}).`);
        return { updated: false, currentVersion, remoteVersion };
      }
      if (!install) {
        new import_obsidian2.Notice(`Meal Planner ${remoteVersion} is available.`);
        return { updated: false, currentVersion, remoteVersion };
      }
      new import_obsidian2.Notice(`Installing Meal Planner ${remoteVersion}...`);
      const files = await downloadReleaseFiles(release.tag_name, remoteVersion);
      const pluginDir = this.getPluginAdapterPath();
      await Promise.all(RELEASE_FILES.map((file) => {
        const path = `${pluginDir}/${file}`;
        return this.app.vault.adapter.write(path, files[file]).catch((error) => {
          throw new Error(`Could not write ${path}: ${error.message || error}`);
        });
      }));
      new import_obsidian2.Notice(`Installed Meal Planner ${remoteVersion}. Reload Obsidian to finish updating.`, 1e4);
      return { updated: true, currentVersion, remoteVersion };
    } catch (error) {
      console.error("Meal Planner update failed", error);
      new import_obsidian2.Notice(`Meal Planner update failed: ${error.message || error}`);
      return { updated: false, error };
    }
  }
};
var MealPlannerSettingTab = class extends import_obsidian2.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Meal Planner" });
    new import_obsidian2.Setting(containerEl).setName("Recipe folder").setDesc("Recipes shown in the picker. New recipes are created here.").addText((text) => {
      text.setPlaceholder(DEFAULT_SETTINGS.recipeFolder).setValue(this.plugin.settings.recipeFolder).onChange(async (value) => {
        this.plugin.settings.recipeFolder = cleanFolderPath(value) || DEFAULT_SETTINGS.recipeFolder;
        await this.plugin.saveSettings();
        await this.refreshOpenViews();
      });
    });
    new import_obsidian2.Setting(containerEl).setName("Ingredients folder").setDesc("Ingredient notes used for ingredient and nutrition lookup.").addText((text) => {
      text.setPlaceholder(DEFAULT_SETTINGS.ingredientsFolder).setValue(this.plugin.settings.ingredientsFolder).onChange(async (value) => {
        this.plugin.settings.ingredientsFolder = cleanFolderPath(value) || DEFAULT_SETTINGS.ingredientsFolder;
        await this.plugin.saveSettings();
        await this.refreshOpenViews();
      });
    });
    new import_obsidian2.Setting(containerEl).setName("Default meals").setDesc("Comma-separated meal names used in the picker.").addText((text) => {
      text.setPlaceholder(DEFAULT_SETTINGS.defaultMeals.join(", ")).setValue(this.plugin.settings.defaultMeals.join(", ")).onChange(async (value) => {
        const meals = value.split(",").map((item) => item.trim()).filter(Boolean);
        this.plugin.settings.defaultMeals = meals.length ? meals : DEFAULT_SETTINGS.defaultMeals.slice();
        await this.plugin.saveSettings();
        await this.refreshOpenViews();
      });
    });
    new import_obsidian2.Setting(containerEl).setName("Stable release updates").setDesc("Check GitHub releases and install the latest stable release branch.").addButton((button) => {
      button.setButtonText("Check and install").setCta().onClick(async () => {
        button.setDisabled(true);
        button.setButtonText("Checking...");
        try {
          await this.plugin.checkForStableReleaseUpdate({ install: true });
        } finally {
          button.setDisabled(false);
          button.setButtonText("Check and install");
        }
      });
    });
  }
  async refreshOpenViews() {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE);
    await Promise.all(leaves.map(async (leaf) => {
      const view = leaf.view;
      if (view instanceof MealPlannerView) await view.render();
    }));
  }
};
var MealPlannerView = class extends import_obsidian2.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.primaryMode = "calendar";
    this.viewMode = "month";
    this.detailMode = "recipe";
    this.groupMode = "meals";
    this.cursorDate = startOfDay(/* @__PURE__ */ new Date());
    this.shoppingFromDate = formatDateKey(startOfWeek(this.cursorDate));
    this.shoppingToDate = formatDateKey(addDays(startOfWeek(this.cursorDate), 6));
    this.showPantryItems = true;
    this.shoppingCheckedItems = /* @__PURE__ */ new Set();
    this.mobileControlsOpen = false;
    this.pendingFocusDayKey = null;
    this.recipeCache = [];
    this.fileMetaCache = /* @__PURE__ */ new Map();
    this.dragPayload = null;
  }
  getViewType() {
    return VIEW_TYPE;
  }
  getDisplayText() {
    return "Meal planner";
  }
  getIcon() {
    return MEAL_PLANNER_ICON;
  }
  async onOpen() {
    this.containerEl.addClass("meal-planner-view");
    await this.render();
  }
  async onClose() {
    this.containerEl.empty();
  }
  async render() {
    this.fileMetaCache.clear();
    this.recipeCache = await this.loadRecipes();
    this.containerEl.querySelectorAll(".mp-mobile-toolbar").forEach((toolbar) => toolbar.remove());
    const viewHeader = this.containerEl.children[0];
    if (viewHeader) this.renderToolbar(viewHeader);
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("meal-planner-root");
    if (this.primaryMode === "calendar" && this.viewMode !== "day") {
      const stickyHeader = container.createDiv({ cls: "mp-sticky-header" });
      this.renderWeekHeader(stickyHeader);
    }
    if (this.primaryMode === "shopping") {
      this.renderShoppingList(container);
    } else {
      if (this.recipeCache.length === 0) this.renderSampleOnboarding(container);
      this.renderCalendar(container);
      this.focusPendingDay();
    }
  }
  renderSampleOnboarding(container) {
    const empty = container.createDiv({ cls: "mp-onboarding-empty" });
    const content = empty.createDiv({ cls: "mp-onboarding-content" });
    content.createDiv({
      cls: "mp-onboarding-title",
      text: "Create a sample recipe and shopping list to see how Meal Planner works."
    });
    content.createDiv({
      cls: "mp-onboarding-copy",
      text: "Meal Planner will add one recipe, ingredient notes, and today's dinner plan."
    });
    empty.createEl("button", { cls: "mp-button", text: "Create sample plan" }, (button) => {
      button.addEventListener("click", async () => {
        button.disabled = true;
        try {
          await this.createSampleMealPlan();
        } finally {
          button.disabled = false;
        }
      });
    });
  }
  renderToolbar(container) {
    const toolbar = container.createDiv({ cls: "mp-mobile-toolbar" });
    const nav = toolbar.createDiv({ cls: "mp-mobile-nav" });
    const actions = nav.createDiv({ cls: "mp-mobile-actions" });
    actions.createDiv({ cls: "mp-mobile-title", text: this.titleForCursor() });
    this.iconButton(actions, "chevron-left", "Previous", () => {
      this.mobileControlsOpen = false;
      if (this.primaryMode === "shopping") this.moveShoppingRange(-1);
      else this.moveCursor(-1);
    });
    actions.createEl("button", { cls: "mp-button", text: "Today" }, (button) => {
      button.addEventListener("click", () => {
        this.mobileControlsOpen = false;
        const today = startOfDay(/* @__PURE__ */ new Date());
        this.cursorDate = today;
        this.pendingFocusDayKey = this.primaryMode === "calendar" ? formatDateKey(today) : null;
        if (this.primaryMode === "shopping") this.syncShoppingRangeToCalendar();
        this.render();
      });
    });
    this.iconButton(actions, "chevron-right", "Next", () => {
      this.mobileControlsOpen = false;
      if (this.primaryMode === "shopping") this.moveShoppingRange(1);
      else this.moveCursor(1);
    });
    const menuButton = this.iconButton(actions, "more-horizontal", "Planner controls", () => {
      this.mobileControlsOpen = !this.mobileControlsOpen;
      this.render();
    });
    if (this.mobileControlsOpen) menuButton.addClass("is-active");
    if (this.mobileControlsOpen) this.renderMobileControls(toolbar);
  }
  renderMobileControls(parent) {
    const panel = parent.createDiv({ cls: "mp-mobile-menu" });
    const closeAndRender = () => {
      this.mobileControlsOpen = false;
      this.render();
    };
    this.renderMobileControlSection(panel, "View", (section) => {
      this.segmented(this.toolbarControlGroup(section), ["calendar", "shopping"], this.primaryMode, (value) => {
        this.primaryMode = value;
        if (value === "shopping") this.syncShoppingRangeToCalendar();
        closeAndRender();
      });
    });
    if (this.primaryMode === "shopping") {
      this.renderMobileControlSection(panel, "Range", (section) => {
        this.renderShoppingControls(this.toolbarControlGroup(section, "mp-toolbar-control-wide"), closeAndRender);
      });
    } else {
      this.renderMobileControlSection(panel, "Range", (section) => {
        this.segmented(this.toolbarControlGroup(section), ["month", "week", "day"], this.viewMode, (value) => {
          this.viewMode = value;
          closeAndRender();
        });
      });
      this.renderMobileControlSection(panel, "Detail", (section) => {
        this.segmented(this.toolbarControlGroup(section), ["recipe", "ingredients", "nutrition"], this.detailMode, (value) => {
          this.detailMode = value;
          closeAndRender();
        });
      });
      this.renderMobileControlSection(panel, "Grouping", (section) => {
        this.segmented(this.toolbarControlGroup(section), ["meals", "all day"], this.groupMode, (value) => {
          this.groupMode = value;
          closeAndRender();
        });
      });
    }
    this.renderMobileControlSection(panel, "Transfer", (section) => {
      this.renderPlanTransferButtons(this.toolbarControlGroup(section), closeAndRender);
    });
  }
  renderMobileControlSection(parent, label, renderContent) {
    const section = parent.createDiv({ cls: "mp-mobile-menu-section" });
    section.createDiv({ cls: "mp-mobile-menu-label", text: label });
    const content = section.createDiv({ cls: "mp-mobile-menu-content" });
    renderContent(content);
  }
  toolbarControlGroup(parent, cls = "") {
    return parent.createDiv({ cls: `mp-toolbar-control ${cls}`.trim() });
  }
  renderPlanTransferButtons(parent, onAction = null) {
    const actions = parent.createDiv({ cls: "mp-plan-transfer" });
    actions.createEl("button", { cls: "mp-button", text: "Import" }, (button) => {
      button.addEventListener("click", () => {
        if (onAction) onAction();
        new MealPlanImportModal(this.app, this).open();
      });
    });
    actions.createEl("button", { cls: "mp-button", text: "Export" }, (button) => {
      button.addEventListener("click", () => {
        if (onAction) onAction();
        new MealPlanExportModal(this.app, this).open();
      });
    });
  }
  renderShoppingControls(parent, onChangeEnd = null) {
    const dates = parent.createDiv({ cls: "mp-shopping-controls" });
    this.dateInput(dates, "From", this.shoppingFromDate, (value) => {
      this.shoppingFromDate = value;
      if (onChangeEnd) onChangeEnd();
      else this.render();
    });
    this.dateInput(dates, "To", this.shoppingToDate, (value) => {
      this.shoppingToDate = value;
      if (onChangeEnd) onChangeEnd();
      else this.render();
    });
    const label = dates.createEl("label", { cls: "mp-toggle" });
    const input = label.createEl("input", { attr: { type: "checkbox" } });
    input.checked = this.showPantryItems;
    input.addEventListener("change", () => {
      this.showPantryItems = input.checked;
      if (onChangeEnd) onChangeEnd();
      else this.render();
    });
    label.createSpan({ text: "Pantry" });
  }
  renderCalendar(container) {
    const days = this.daysForView();
    const calendar = container.createDiv({
      cls: `mp-calendar mp-${this.viewMode}`
    });
    const grid = calendar.createDiv({ cls: "mp-grid" });
    days.forEach((date) => this.renderDay(grid, date));
  }
  focusPendingDay() {
    if (!this.pendingFocusDayKey) return;
    const dayKey = this.pendingFocusDayKey;
    this.pendingFocusDayKey = null;
    window.requestAnimationFrame(() => {
      const day = this.containerEl.querySelector(`.mp-day[data-day-key="${dayKey}"]`);
      if (!(day instanceof HTMLElement)) return;
      day.focus({ preventScroll: true });
      day.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
    });
  }
  renderWeekHeader(parent) {
    const header = parent.createDiv({ cls: "mp-week-header" });
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((name) => {
      header.createDiv({ cls: "mp-weekday", text: name });
    });
  }
  renderDay(grid, date) {
    const key = formatDateKey(date);
    const dayPlans = this.plugin.settings.plans[key] || {};
    const isOtherMonth = date.getMonth() !== this.cursorDate.getMonth();
    const isToday = key === formatDateKey(/* @__PURE__ */ new Date());
    const day = grid.createDiv({
      cls: [
        "mp-day",
        isOtherMonth && this.viewMode === "month" ? "mp-muted-day" : "",
        isToday ? "mp-today" : ""
      ].filter(Boolean).join(" "),
      attr: { "data-day-key": key, tabindex: "-1" }
    });
    this.entryDropTarget(day, key, null);
    const head = day.createDiv({ cls: "mp-day-head" });
    head.createDiv({ cls: "mp-date", text: this.dayLabel(date) });
    this.iconButton(head, "plus", `Add recipe for ${key}`, () => {
      new RecipePickerModal(this.app, this, key).open();
    });
    const mealNames = this.mealNamesFor(dayPlans);
    if (mealNames.length === 0) {
      day.createDiv({ cls: "mp-empty", text: "No plan" });
      this.renderEmptyMealDropTargets(day, key, mealNames);
      return;
    }
    if (this.groupMode === "all day") {
      this.renderAllDay(day, key, dayPlans, mealNames);
      return;
    }
    mealNames.forEach((mealName) => {
      const entries = dayPlans[mealName] || [];
      if (!entries.length) return;
      const section = day.createDiv({ cls: "mp-meal" });
      this.entryDropTarget(section, key, mealName);
      section.createDiv({ cls: "mp-meal-name", text: mealName });
      entries.forEach((entry, index) => this.renderEntry(section, key, mealName, entry, index));
    });
    this.renderEmptyMealDropTargets(day, key, mealNames);
  }
  renderAllDay(day, dayKey, dayPlans, mealNames) {
    const entries = mealNames.flatMap((mealName) => {
      return (dayPlans[mealName] || []).map((entry, index) => ({ entry, mealName, index }));
    });
    if (this.detailMode === "ingredients") {
      this.renderAllDayIngredients(day, entries);
      return;
    }
    if (this.detailMode === "nutrition") {
      this.renderAllDayNutrition(day, entries);
      return;
    }
    const section = day.createDiv({ cls: "mp-meal mp-all-day" });
    this.entryDropTarget(section, dayKey, null);
    entries.forEach(({ entry, mealName, index }) => {
      this.renderEntry(section, dayKey, mealName, entry, index, { showMealLabel: true });
    });
    this.renderEmptyMealDropTargets(day, dayKey, mealNames);
  }
  renderEmptyMealDropTargets(day, dayKey, existingMealNames) {
    const existing = new Set(existingMealNames);
    const targets = this.plugin.settings.defaultMeals.filter((mealName) => !existing.has(mealName));
    if (!targets.length) return;
    const wrap = day.createDiv({ cls: "mp-empty-meal-drops" });
    targets.forEach((mealName) => {
      const target = wrap.createDiv({ cls: "mp-empty-meal-drop", text: mealName });
      this.entryDropTarget(target, dayKey, mealName);
    });
  }
  renderAllDayIngredients(day, entries) {
    const section = day.createDiv({ cls: "mp-total-block" });
    const totals = this.ingredientsForEntries(entries);
    if (!totals.length) {
      section.createDiv({ cls: "mp-empty", text: "No ingredients listed" });
      return;
    }
    totals.slice(0, this.viewMode === "day" ? 160 : 18).forEach((item) => {
      section.createSpan({ cls: "mp-pill", text: item.label });
    });
    if (totals.length > (this.viewMode === "day" ? 160 : 18)) {
      section.createSpan({ cls: "mp-more", text: `+${totals.length - (this.viewMode === "day" ? 160 : 18)}` });
    }
  }
  renderAllDayNutrition(day, entries) {
    const section = day.createDiv({ cls: "mp-total-block" });
    const totals = this.nutrientsForEntries(entries);
    if (!totals.length) {
      section.createDiv({ cls: "mp-empty", text: "No nutrition refs" });
      return;
    }
    totals.slice(0, this.viewMode === "day" ? 160 : 18).forEach((item) => {
      section.createSpan({ cls: "mp-pill mp-nutrient", text: item.label });
    });
    if (totals.length > (this.viewMode === "day" ? 160 : 18)) {
      section.createSpan({ cls: "mp-more", text: `+${totals.length - (this.viewMode === "day" ? 160 : 18)}` });
    }
  }
  renderShoppingList(container) {
    const wrap = container.createDiv({ cls: "mp-shopping" });
    if (!isDateKey(this.shoppingFromDate) || !isDateKey(this.shoppingToDate)) {
      wrap.createDiv({ cls: "mp-empty mp-warning", text: "Choose a valid date range." });
      return;
    }
    if (this.shoppingFromDate > this.shoppingToDate) {
      wrap.createDiv({ cls: "mp-empty mp-warning", text: "From date must be before To date." });
      return;
    }
    const result = this.shoppingListForRange(this.shoppingFromDate, this.shoppingToDate);
    const summary = wrap.createDiv({ cls: "mp-shopping-summary" });
    summary.createDiv({
      cls: "mp-shopping-title",
      text: `${result.itemCount} item${result.itemCount === 1 ? "" : "s"} from ${result.recipeCount} planned recipe${result.recipeCount === 1 ? "" : "s"}`
    });
    summary.createDiv({ cls: "mp-shopping-range", text: `${this.shoppingFromDate} to ${this.shoppingToDate}` });
    if (result.warnings.length) {
      const warning = wrap.createDiv({ cls: "mp-shopping-warning" });
      result.warnings.slice(0, 5).forEach((message) => warning.createDiv({ text: message }));
      if (result.warnings.length > 5) warning.createDiv({ text: `+${result.warnings.length - 5} more warning${result.warnings.length - 5 === 1 ? "" : "s"}` });
    }
    if (!result.groups.length && !result.pantry.length) {
      wrap.createDiv({ cls: "mp-empty", text: "No planned ingredients in this date range." });
      return;
    }
    result.groups.forEach((group) => this.renderShoppingCategory(wrap, group));
    if (result.pantry.length) {
      const pantry = {
        category: "Pantry / Usually stocked",
        items: result.pantry,
        pantry: true
      };
      this.renderShoppingCategory(wrap, pantry);
    } else if (!this.showPantryItems && result.hiddenPantryCount) {
      wrap.createDiv({
        cls: "mp-shopping-muted",
        text: `${result.hiddenPantryCount} pantry item${result.hiddenPantryCount === 1 ? "" : "s"} hidden.`
      });
    }
  }
  renderShoppingCategory(parent, group) {
    const section = parent.createDiv({ cls: group.pantry ? "mp-shopping-section mp-shopping-pantry" : "mp-shopping-section" });
    const head = section.createDiv({ cls: "mp-shopping-section-head" });
    head.createDiv({ cls: "mp-shopping-section-title", text: group.category });
    head.createDiv({ cls: "mp-shopping-count", text: String(group.items.length) });
    const list = section.createDiv({ cls: "mp-shopping-items" });
    group.items.forEach((item) => this.renderShoppingItem(list, item));
  }
  renderShoppingItem(parent, item) {
    const row = parent.createDiv({
      cls: this.shoppingCheckedItems.has(item.key) ? "mp-shopping-item is-checked" : "mp-shopping-item"
    });
    const checkbox = row.createEl("input", { cls: "mp-shopping-check", attr: { type: "checkbox" } });
    checkbox.checked = this.shoppingCheckedItems.has(item.key);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        this.shoppingCheckedItems.add(item.key);
        row.addClass("is-checked");
      } else {
        this.shoppingCheckedItems.delete(item.key);
        row.removeClass("is-checked");
      }
    });
    const main = row.createDiv({ cls: "mp-shopping-item-main" });
    main.createDiv({ cls: "mp-shopping-item-name", text: item.name });
    main.createDiv({
      cls: "mp-shopping-item-source",
      text: `${item.recipeNames.size} recipe${item.recipeNames.size === 1 ? "" : "s"} \xB7 ${item.dateKeys.size} day${item.dateKeys.size === 1 ? "" : "s"}`
    });
    row.createDiv({ cls: "mp-shopping-item-amount", text: item.label });
  }
  renderEntry(section, dayKey, mealName, entry, index, options = {}) {
    const recipe = this.recipeCache.find((item) => item.path === entry.path);
    const card = section.createDiv({ cls: "mp-entry" });
    this.entryDragSource(card, dayKey, mealName, index);
    this.entryDropTarget(card, dayKey, mealName, index);
    const row = card.createDiv({ cls: "mp-entry-row" });
    if (options.showMealLabel) {
      row.createSpan({ cls: "mp-meal-badge", text: mealName });
    }
    const link = row.createEl("a", {
      cls: "mp-recipe-link",
      text: recipe ? recipe.name : entry.name || entry.path,
      href: "#",
      attr: { draggable: "false" }
    });
    link.draggable = false;
    link.addEventListener("click", async (event) => {
      event.preventDefault();
      const file = this.app.vault.getAbstractFileByPath(entry.path);
      if (file instanceof import_obsidian2.TFile) await this.app.workspace.getLeaf(false).openFile(file);
    });
    this.entryMenuButton(row, recipe, entry, dayKey, mealName, index);
    if (!recipe) {
      card.createDiv({ cls: "mp-detail mp-warning", text: "Recipe file missing" });
      return;
    }
    if (this.detailMode === "recipe") {
      const imageUrl = this.recipeImageUrl(recipe);
      if (imageUrl) {
        card.addClass("mp-entry-has-image");
        card.style.setProperty("--mp-recipe-image", cssUrl(imageUrl));
      }
      this.renderRecipeDetail(card, recipe, entry);
    } else if (this.detailMode === "ingredients") {
      this.renderIngredientsDetail(card, recipe, entry);
    } else {
      this.renderNutritionDetail(card, recipe, entry);
    }
  }
  renderRecipeDetail(card, recipe, entry) {
    const meta = card.createDiv({ cls: "mp-detail" });
    const bits = [];
    const targetServings = servingTargetForEntry(entry, recipe);
    if (recipe.servings) {
      bits.push(targetServings && targetServings !== recipe.servingsNumber ? `${recipe.servings} -> ${formatAmount(targetServings)} servings` : `${recipe.servings} servings`);
    } else if (targetServings) {
      bits.push(`${formatAmount(targetServings)} servings`);
    }
    if (recipe.tags.length) bits.push(recipe.tags.slice(0, 4).join(", "));
    meta.setText(bits.join(" \xB7 ") || "Recipe linked");
  }
  renderIngredientsDetail(card, recipe, entry) {
    const detail = card.createDiv({ cls: "mp-detail" });
    const ingredients = recipe.ingredientDetails.slice(0, this.viewMode === "day" ? 80 : 10);
    if (!ingredients.length) {
      detail.setText("No ingredients listed");
      return;
    }
    ingredients.forEach((ingredient) => {
      const scaled = scaledIngredientAmount(ingredient.amount, recipe, entry);
      detail.createSpan({
        cls: "mp-pill",
        text: scaled ? `${ingredient.name}: ${scaled}` : ingredient.name
      });
    });
    if (recipe.ingredientDetails.length > ingredients.length) {
      detail.createSpan({ cls: "mp-more", text: `+${recipe.ingredientDetails.length - ingredients.length}` });
    }
  }
  renderNutritionDetail(card, recipe, entry) {
    const detail = card.createDiv({ cls: "mp-detail" });
    const nutrients = this.nutrientsForRecipe(recipe, entry);
    if (!nutrients.length) {
      detail.setText("No nutrition refs");
      return;
    }
    nutrients.slice(0, this.viewMode === "day" ? 80 : 10).forEach((nutrient) => {
      detail.createSpan({ cls: "mp-pill mp-nutrient", text: nutrient.label });
    });
  }
  nutrientsForRecipe(recipe, entry = {}) {
    const nutrientRefs = /* @__PURE__ */ new Set();
    const totals = /* @__PURE__ */ new Map();
    recipe.ingredientDetails.forEach((ingredient) => {
      const file = this.resolveIngredientFile(ingredient.name);
      if (!file) return;
      const meta = this.metaForFile(file);
      const refs = normalizeArray(meta.nutrition_ref);
      refs.forEach((ref) => {
        const name = cleanWiki(ref);
        if (name) nutrientRefs.add(name);
      });
      const quantity = quantityForEntry(ingredient.amount, recipe, entry);
      if (!quantity) return;
      this.estimateNutrients(meta, quantity).forEach((estimate) => {
        const current = totals.get(estimate.name) || { name: estimate.name, value: 0, unit: estimate.unit };
        if (current.unit === estimate.unit) {
          current.value += estimate.value;
          totals.set(estimate.name, current);
        }
      });
    });
    totals.forEach((total, name) => nutrientRefs.add(name));
    return Array.from(nutrientRefs).sort().map((name) => {
      const total = totals.get(name);
      if (!total) return { name, label: name };
      return { name, label: `${name}: ${formatAmount(total.value)} ${total.unit}` };
    });
  }
  ingredientsForEntries(entries) {
    return ingredientsForPlanEntries(entries, this.recipeCache);
  }
  shoppingListForRange(fromKey, toKey) {
    const entries = this.entriesForDateRange(fromKey, toKey);
    return shoppingListForEntries(entries, this.recipeCache, (name) => this.metadataForIngredient(name), this.showPantryItems);
  }
  entriesForDateRange(fromKey, toKey) {
    const entries = [];
    Object.entries(this.plugin.settings.plans).filter(([dayKey]) => dayKey >= fromKey && dayKey <= toKey).sort(([a], [b]) => a.localeCompare(b)).forEach(([dayKey, dayPlans]) => {
      Object.entries(dayPlans || {}).forEach(([mealName, mealEntries]) => {
        (mealEntries || []).forEach((entry, index) => {
          entries.push({ dayKey, mealName, entry, index });
        });
      });
    });
    return entries;
  }
  selectedMealPlanRange() {
    if (this.primaryMode === "shopping") {
      return {
        fromKey: this.shoppingFromDate,
        toKey: this.shoppingToDate,
        label: "selected shopping range"
      };
    }
    const days = this.daysForView();
    return {
      fromKey: formatDateKey(days[0]),
      toKey: formatDateKey(days[days.length - 1]),
      label: `${this.viewMode} view`
    };
  }
  async importMealPlan(parsed, mode) {
    if (!parsed.entries.length) {
      new import_obsidian2.Notice("No meal plan entries found.");
      return false;
    }
    if (!isDateKey(parsed.fromKey) || !isDateKey(parsed.toKey) || parsed.fromKey > parsed.toKey) {
      new import_obsidian2.Notice("Imported date range is invalid.");
      return false;
    }
    const plans = this.plugin.settings.plans;
    const { imported, skipped } = importEntriesIntoPlans(plans, parsed, mode, rangeDateKeys);
    await this.plugin.saveSettings();
    await this.render();
    new import_obsidian2.Notice(`Imported ${imported} recipe${imported === 1 ? "" : "s"}${skipped ? `, skipped ${skipped} duplicate${skipped === 1 ? "" : "s"}` : ""}.`);
    return true;
  }
  metadataForIngredient(name) {
    const file = this.resolveIngredientFile(name);
    return file ? this.metaForFile(file) : {};
  }
  shoppingCategoryForIngredient(name, meta) {
    return shoppingCategoryForIngredient(name, meta);
  }
  isPantryIngredient(name, meta, category) {
    return isPantryIngredient(name, meta, category);
  }
  nutrientsForEntries(entries) {
    const nutrientRefs = /* @__PURE__ */ new Set();
    const totals = /* @__PURE__ */ new Map();
    entries.forEach(({ entry }) => {
      const recipe = this.recipeCache.find((item) => item.path === entry.path);
      if (!recipe) return;
      recipe.ingredientDetails.forEach((ingredient) => {
        const file = this.resolveIngredientFile(ingredient.name);
        if (!file) return;
        const meta = this.metaForFile(file);
        normalizeArray(meta.nutrition_ref).forEach((ref) => {
          const name = cleanWiki(ref);
          if (name) nutrientRefs.add(name);
        });
        const quantity = quantityForEntry(ingredient.amount, recipe, entry);
        if (!quantity) return;
        this.estimateNutrients(meta, quantity).forEach((estimate) => {
          const key = `${estimate.name}::${estimate.unit}`;
          const current = totals.get(key) || { name: estimate.name, value: 0, unit: estimate.unit };
          current.value += estimate.value;
          totals.set(key, current);
          nutrientRefs.add(estimate.name);
        });
      });
    });
    const known = Array.from(totals.values()).map((item) => ({
      name: item.name,
      label: `${item.name}: ${formatAmount(item.value)} ${item.unit}`
    }));
    const knownNames = new Set(known.map((item) => item.name));
    const refsOnly = Array.from(nutrientRefs).filter((name) => !knownNames.has(name)).map((name) => ({ name, label: name }));
    return known.concat(refsOnly).sort((a, b) => a.name.localeCompare(b.name));
  }
  estimateNutrients(meta, quantity) {
    return estimateNutrients(meta, quantity);
  }
  async addEntry(dayKey, mealName, recipe, targetServings) {
    addEntryToPlans(this.plugin.settings.plans, dayKey, mealName, recipe, targetServings);
    await this.plugin.saveSettings();
    await this.render();
  }
  async transferEntry(sourceDayKey, sourceMealName, sourceIndex, targetDayKey, targetMealName, mode, targetIndex = null) {
    const finalMealName = String(targetMealName || sourceMealName || "").trim();
    if (!finalMealName) {
      new import_obsidian2.Notice("Choose a meal.");
      return false;
    }
    const sourceEntries = this.plugin.settings.plans[sourceDayKey]?.[sourceMealName];
    const sourceEntry = sourceEntries?.[sourceIndex];
    if (!sourceEntry) {
      new import_obsidian2.Notice("Recipe is no longer in this plan.");
      await this.render();
      return false;
    }
    const result = transferEntryInPlans(this.plugin.settings.plans, sourceDayKey, sourceMealName, sourceIndex, targetDayKey, finalMealName, mode, targetIndex);
    if (!result.changed && result.reason === "same-position") {
      return false;
    }
    await this.plugin.saveSettings();
    await this.render();
    new import_obsidian2.Notice(mode === "copy" ? "Recipe copied." : "Recipe moved.");
    return true;
  }
  async removeEntry(dayKey, mealName, index) {
    const entries = this.plugin.settings.plans[dayKey]?.[mealName];
    if (!entries) return;
    entries.splice(index, 1);
    this.cleanupEmptyPlan(dayKey, mealName);
    await this.plugin.saveSettings();
    await this.render();
  }
  cleanupEmptyPlan(dayKey, mealName) {
    cleanupEmptyPlan(this.plugin.settings.plans, dayKey, mealName);
  }
  async updateEntryServings(dayKey, mealName, index, recipe, targetServings) {
    const entry = this.plugin.settings.plans[dayKey]?.[mealName]?.[index];
    if (!entry) return;
    if (targetServings && targetServings !== recipe.servingsNumber) {
      entry.targetServings = targetServings;
    } else {
      delete entry.targetServings;
    }
    await this.plugin.saveSettings();
    await this.render();
  }
  async createSampleMealPlan() {
    try {
      const recipeFolder = cleanFolderPath(this.plugin.settings.recipeFolder) || DEFAULT_SETTINGS.recipeFolder;
      const ingredientsFolder = cleanFolderPath(this.plugin.settings.ingredientsFolder) || DEFAULT_SETTINGS.ingredientsFolder;
      await ensureFolder(this.app, recipeFolder);
      await ensureFolder(this.app, ingredientsFolder);
      const recipePath = `${recipeFolder}/${SAMPLE_RECIPE_FILENAME}`;
      if (!this.app.vault.getAbstractFileByPath(recipePath)) {
        await this.app.vault.create(recipePath, sampleRecipeMarkdown());
      }
      for (const item of SAMPLE_INGREDIENT_METADATA) {
        const ingredientPath = `${ingredientsFolder}/${safeFileName(item.name)}.md`;
        if (!this.app.vault.getAbstractFileByPath(ingredientPath)) {
          await this.app.vault.create(ingredientPath, sampleIngredientMarkdown(item));
        }
      }
      const todayKey = formatDateKey(/* @__PURE__ */ new Date());
      addSampleEntryToPlans(this.plugin.settings.plans, todayKey, recipePath);
      await this.plugin.saveSettings();
      this.cursorDate = startOfDay(/* @__PURE__ */ new Date());
      this.primaryMode = "shopping";
      this.viewMode = "week";
      this.syncShoppingRangeToCalendar();
      this.recipeCache = await this.loadRecipes();
      await this.render();
      new import_obsidian2.Notice(`Created sample meal plan with ${SAMPLE_RECIPE_NAME}.`);
      return true;
    } catch (error) {
      new import_obsidian2.Notice(`Could not create sample meal plan: ${error?.message || String(error)}`);
      return false;
    }
  }
  mealNamesFor(dayPlans) {
    const names = Object.keys(dayPlans);
    return names.sort((a, b) => {
      const defaults = this.plugin.settings.defaultMeals;
      const ia = defaults.indexOf(a);
      const ib = defaults.indexOf(b);
      if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      return a.localeCompare(b);
    });
  }
  async loadRecipes() {
    const folder = this.plugin.settings.recipeFolder;
    const files = this.app.vault.getMarkdownFiles().filter((file) => file.path.startsWith(`${folder}/`)).sort((a, b) => a.basename.localeCompare(b.basename));
    return Promise.all(files.map(async (file) => {
      const text = await this.app.vault.cachedRead(file);
      const cachedMeta = this.metaForFile(file);
      const meta = Object.keys(cachedMeta).length ? cachedMeta : readFrontmatter(text);
      const ingredients = normalizeArray(meta.ingredients).map(cleanWiki).filter(Boolean);
      return {
        file,
        path: file.path,
        name: meta.name || file.basename,
        servings: meta.servings,
        servingsNumber: parseServingCount(meta.servings),
        tags: normalizeArray(meta.tags).map(String),
        ingredients,
        imageRef: recipeImageRef(text, meta),
        ingredientDetails: extractIngredientDetails(text, ingredients)
      };
    }));
  }
  recipeImageUrl(recipe) {
    if (!recipe.imageRef) return "";
    if (/^https?:\/\//i.test(recipe.imageRef)) return recipe.imageRef;
    const target = this.app.metadataCache.getFirstLinkpathDest(recipe.imageRef, recipe.path) || this.app.vault.getAbstractFileByPath(recipe.imageRef);
    if (target instanceof import_obsidian2.TFile) return this.app.vault.getResourcePath(target);
    return "";
  }
  resolveIngredientFile(name) {
    const folder = this.plugin.settings.ingredientsFolder;
    return this.app.vault.getAbstractFileByPath(`${folder}/${name}.md`) || this.app.vault.getAbstractFileByPath(`${name}.md`);
  }
  metaForFile(file) {
    if (this.fileMetaCache.has(file.path)) return this.fileMetaCache.get(file.path);
    const cache = this.app.metadataCache.getFileCache(file);
    let meta = cache?.frontmatter || {};
    if (!Object.keys(meta).length && cache?.sections?.[0]?.type === "yaml") {
      const raw = this.app.vault.cachedRead(file);
      meta = raw.then ? {} : readFrontmatter(raw);
    }
    this.fileMetaCache.set(file.path, meta);
    return meta;
  }
  moveCursor(direction) {
    const next = new Date(this.cursorDate);
    if (this.viewMode === "month") next.setMonth(next.getMonth() + direction);
    if (this.viewMode === "week") next.setDate(next.getDate() + direction * 7);
    if (this.viewMode === "day") next.setDate(next.getDate() + direction);
    this.cursorDate = startOfDay(next);
    this.render();
  }
  moveShoppingRange(direction) {
    if (!isDateKey(this.shoppingFromDate) || !isDateKey(this.shoppingToDate)) return;
    const from = /* @__PURE__ */ new Date(`${this.shoppingFromDate}T00:00:00`);
    const to = /* @__PURE__ */ new Date(`${this.shoppingToDate}T00:00:00`);
    const span = Math.max(1, Math.round((to - from) / 864e5) + 1);
    this.shoppingFromDate = formatDateKey(addDays(from, direction * span));
    this.shoppingToDate = formatDateKey(addDays(to, direction * span));
    this.cursorDate = startOfDay(/* @__PURE__ */ new Date(`${this.shoppingFromDate}T00:00:00`));
    this.render();
  }
  daysForView() {
    if (this.viewMode === "day") return [this.cursorDate];
    if (this.viewMode === "week") {
      const start2 = startOfWeek(this.cursorDate);
      return rangeDays(start2, 7);
    }
    const start = startOfWeek(new Date(this.cursorDate.getFullYear(), this.cursorDate.getMonth(), 1));
    const end = startOfWeek(new Date(this.cursorDate.getFullYear(), this.cursorDate.getMonth() + 1, 0));
    return rangeDays(start, Math.max(35, Math.round((end - start) / 864e5) + 7));
  }
  titleForCursor() {
    if (this.primaryMode === "shopping") return "Shopping list";
    if (this.viewMode === "day") {
      return this.cursorDate.toLocaleDateString(void 0, { weekday: "long", month: "short", day: "numeric", year: "numeric" });
    }
    if (this.viewMode === "week") {
      const start = startOfWeek(this.cursorDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${formatShortDate(start)} - ${formatShortDate(end)}`;
    }
    return this.cursorDate.toLocaleDateString(void 0, { month: "long", year: "numeric" });
  }
  dayLabel(date) {
    if (this.viewMode === "day") {
      return date.toLocaleDateString(void 0, { weekday: "long", month: "long", day: "numeric" });
    }
    return String(date.getDate());
  }
  syncShoppingRangeToCalendar() {
    if (this.viewMode === "day") {
      this.shoppingFromDate = formatDateKey(this.cursorDate);
      this.shoppingToDate = formatDateKey(this.cursorDate);
      return;
    }
    const start = startOfWeek(this.cursorDate);
    this.shoppingFromDate = formatDateKey(start);
    this.shoppingToDate = formatDateKey(addDays(start, 6));
  }
  segmented(parent, values, active, onChange) {
    const group = parent.createDiv({ cls: "mp-segmented" });
    values.forEach((value) => {
      group.createEl("button", {
        cls: value === active ? "is-active" : "",
        text: titleCase(value)
      }, (button) => {
        button.addEventListener("click", () => onChange(value));
      });
    });
  }
  dateInput(parent, labelText, value, onChange) {
    const label = parent.createEl("label", { cls: "mp-date-control" });
    label.createSpan({ text: labelText });
    const input = label.createEl("input", { attr: { type: "date" } });
    input.value = value;
    input.addEventListener("change", () => onChange(input.value));
    return input;
  }
  iconButton(parent, icon, ariaLabel, onClick) {
    const button = parent.createEl("button", { cls: "mp-icon-button", attr: { "aria-label": ariaLabel, title: ariaLabel } });
    (0, import_obsidian2.setIcon)(button, icon);
    button.addEventListener("click", onClick);
    return button;
  }
  entryDragSource(card, dayKey, mealName, index) {
    card.draggable = true;
    card.addEventListener("dragstart", (event) => {
      this.startEntryDrag(event, card, dayKey, mealName, index);
    });
    card.addEventListener("dragend", () => {
      this.endEntryDrag(card);
    });
  }
  startEntryDrag(event, card, dayKey, mealName, index) {
    event.stopPropagation();
    this.dragPayload = { dayKey, mealName, index };
    const payload = JSON.stringify(this.dragPayload);
    if (event.dataTransfer) {
      event.dataTransfer.setData("application/x-meal-planner-entry", payload);
      event.dataTransfer.setData("text/plain", payload);
      event.dataTransfer.effectAllowed = "move";
    }
    card.addClass("is-dragging");
    this.containerEl.addClass("mp-dragging-entry");
  }
  endEntryDrag(card) {
    card.removeClass("is-dragging");
    this.containerEl.removeClass("mp-dragging-entry");
    this.containerEl.querySelectorAll(".is-drop-target").forEach((el) => el.removeClass("is-drop-target"));
    this.dragPayload = null;
  }
  entryDropTarget(target, dayKey, mealName, targetIndex = null) {
    target.addEventListener("dragover", (event) => {
      if (!this.draggedEntryPayload(event)) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
      target.addClass("is-drop-target");
    });
    target.addEventListener("dragleave", () => {
      target.removeClass("is-drop-target");
    });
    target.addEventListener("drop", async (event) => {
      const payload = this.draggedEntryPayload(event);
      if (!payload) return;
      event.preventDefault();
      event.stopPropagation();
      target.removeClass("is-drop-target");
      this.containerEl.removeClass("mp-dragging-entry");
      const insertIndex = Number.isInteger(targetIndex) ? this.dropInsertIndex(event, target, targetIndex) : null;
      await this.transferEntry(payload.dayKey, payload.mealName, payload.index, dayKey, mealName || payload.mealName, "move", insertIndex);
    });
  }
  dropInsertIndex(event, target, targetIndex) {
    const rect = target.getBoundingClientRect();
    return event.clientY > rect.top + rect.height / 2 ? targetIndex + 1 : targetIndex;
  }
  draggedEntryPayload(event) {
    if (this.dragPayload) return this.dragPayload;
    const raw = event.dataTransfer?.getData("application/x-meal-planner-entry") || event.dataTransfer?.getData("text/plain");
    if (!raw) return null;
    try {
      const payload = JSON.parse(raw);
      if (!payload.dayKey || !payload.mealName || !Number.isInteger(payload.index)) return null;
      return payload;
    } catch (error) {
      return null;
    }
  }
  entryMenuButton(parent, recipe, entry, dayKey, mealName, index) {
    return this.iconButton(parent, "more-horizontal", "Recipe actions", (event) => {
      const menu = new import_obsidian2.Menu();
      menu.addItem((item) => {
        item.setTitle("Move to...").setIcon("move-right").onClick(() => {
          new EntryTransferModal(this.app, this, "move", dayKey, mealName, index, entry).open();
        });
      });
      menu.addItem((item) => {
        item.setTitle("Copy to...").setIcon("copy").onClick(() => {
          new EntryTransferModal(this.app, this, "copy", dayKey, mealName, index, entry).open();
        });
      });
      if (recipe) {
        menu.addItem((item) => {
          item.setTitle("Set target servings").setIcon("users-round").onClick(() => {
            new ServingTargetModal(this.app, this, dayKey, mealName, index, recipe, entry).open();
          });
        });
      }
      menu.addItem((item) => {
        item.setTitle("Remove").setIcon("trash-2").onClick(async () => {
          await this.removeEntry(dayKey, mealName, index);
        });
      });
      menu.showAtMouseEvent(event);
    });
  }
};
var MealPlanExportModal = class extends import_obsidian2.Modal {
  constructor(app, view) {
    super(app);
    this.view = view;
  }
  onOpen() {
    const { contentEl } = this;
    const range = this.view.selectedMealPlanRange();
    contentEl.addClass("mp-modal");
    contentEl.createEl("h2", { text: "Export meal plan" });
    contentEl.createDiv({
      cls: "mp-transfer-summary",
      text: `${range.fromKey} to ${range.toKey} (${range.label})`
    });
    if (!isDateKey(range.fromKey) || !isDateKey(range.toKey) || range.fromKey > range.toKey) {
      contentEl.createDiv({ cls: "mp-warning", text: "Choose a valid date range before exporting." });
      return;
    }
    const text = formatMealPlanText(this.view.plugin.settings.plans, this.view.recipeCache, range.fromKey, range.toKey);
    const textarea = contentEl.createEl("textarea", { cls: "mp-transfer-textarea" });
    textarea.value = text;
    textarea.addEventListener("focus", () => textarea.select());
    new import_obsidian2.Setting(contentEl).addButton((button) => {
      button.setButtonText("Copy");
      button.setCta();
      button.onClick(async () => {
        try {
          await copyTextToClipboard(text);
          new import_obsidian2.Notice("Meal plan copied.");
        } catch (error) {
          textarea.focus();
          textarea.select();
          new import_obsidian2.Notice("Could not copy automatically. Select the text and copy it.");
        }
      });
    }).addButton((button) => {
      button.setButtonText("Close");
      button.onClick(() => this.close());
    });
  }
  onClose() {
    this.contentEl.empty();
  }
};
var MealPlanImportModal = class extends import_obsidian2.Modal {
  constructor(app, view) {
    super(app);
    this.view = view;
  }
  onOpen() {
    const { contentEl } = this;
    let mode = "merge";
    let parsed = parseMealPlanText("", this.view.recipeCache, this.view.plugin.settings.defaultMeals);
    contentEl.addClass("mp-modal");
    contentEl.createEl("h2", { text: "Import meal plan" });
    new import_obsidian2.Setting(contentEl).setName("Mode").addDropdown((dropdown) => {
      dropdown.addOption("merge", "Merge");
      dropdown.addOption("replace", "Replace date range");
      dropdown.setValue(mode);
      dropdown.onChange((value) => {
        mode = value;
        renderPreview();
      });
    });
    const textarea = contentEl.createEl("textarea", { cls: "mp-transfer-textarea" });
    textarea.placeholder = [
      "Meal Plan: 2026-05-18 to 2026-05-24",
      "",
      "2026-05-18 Mon",
      "Breakfast",
      "- Oatmeal",
      "Dinner",
      "- Salmon Pasta (servings: 2)"
    ].join("\n");
    const preview = contentEl.createDiv({ cls: "mp-import-preview" });
    const renderPreview = () => {
      parsed = parseMealPlanText(textarea.value, this.view.recipeCache, this.view.plugin.settings.defaultMeals);
      preview.empty();
      if (!textarea.value.trim()) {
        preview.createDiv({ cls: "mp-transfer-summary", text: "Paste exported meal plan text above." });
        return;
      }
      if (!parsed.entries.length) {
        preview.createDiv({ cls: "mp-warning", text: "No importable recipe lines found." });
      } else {
        const replaceNote = mode === "replace" ? " Existing plans in this range will be cleared first." : "";
        preview.createDiv({
          cls: "mp-transfer-summary",
          text: `${parsed.entries.length} recipe${parsed.entries.length === 1 ? "" : "s"} across ${parsed.dayCount} day${parsed.dayCount === 1 ? "" : "s"} and ${parsed.mealCount} meal${parsed.mealCount === 1 ? "" : "s"}. Range: ${parsed.fromKey} to ${parsed.toKey}.${replaceNote}`
        });
      }
      if (parsed.warnings.length) {
        const warnings = preview.createDiv({ cls: "mp-import-warnings" });
        parsed.warnings.slice(0, 8).forEach((message) => warnings.createDiv({ text: message }));
        if (parsed.warnings.length > 8) warnings.createDiv({ text: `+${parsed.warnings.length - 8} more warning${parsed.warnings.length - 8 === 1 ? "" : "s"}` });
      }
    };
    textarea.addEventListener("input", renderPreview);
    renderPreview();
    new import_obsidian2.Setting(contentEl).addButton((button) => {
      button.setButtonText("Import");
      button.setCta();
      button.onClick(async () => {
        parsed = parseMealPlanText(textarea.value, this.view.recipeCache, this.view.plugin.settings.defaultMeals);
        if (!textarea.value.trim()) {
          new import_obsidian2.Notice("Paste meal plan text first.");
          textarea.focus();
          return;
        }
        if (!parsed.entries.length) {
          new import_obsidian2.Notice("No importable recipe lines found.");
          textarea.focus();
          return;
        }
        const didImport = await this.view.importMealPlan(parsed, mode);
        if (didImport) this.close();
      });
    }).addButton((button) => {
      button.setButtonText("Cancel");
      button.onClick(() => this.close());
    });
  }
  onClose() {
    this.contentEl.empty();
  }
};
var EntryTransferModal = class extends import_obsidian2.Modal {
  constructor(app, view, mode, dayKey, mealName, index, entry) {
    super(app);
    this.view = view;
    this.mode = mode;
    this.dayKey = dayKey;
    this.mealName = mealName;
    this.index = index;
    this.entry = entry;
  }
  onOpen() {
    const { contentEl } = this;
    const isMove = this.mode === "move";
    let targetDayKey = this.dayKey;
    let targetMealName = this.mealName;
    let customMeal = "";
    contentEl.addClass("mp-modal");
    contentEl.createEl("h2", { text: isMove ? "Move recipe" : "Copy recipe" });
    contentEl.createDiv({
      cls: "mp-selected-recipe",
      text: this.entry.name || this.entry.path
    });
    new import_obsidian2.Setting(contentEl).setName("Day").addText((text) => {
      text.inputEl.type = "date";
      text.setValue(targetDayKey);
      text.onChange((value) => {
        targetDayKey = value.trim();
      });
    });
    const mealOptions = uniqueValues(this.view.plugin.settings.defaultMeals.concat([this.mealName]));
    new import_obsidian2.Setting(contentEl).setName("Meal").addDropdown((dropdown) => {
      mealOptions.forEach((name) => dropdown.addOption(name, name));
      dropdown.addOption("Other", "Other");
      dropdown.setValue(targetMealName);
      dropdown.onChange((value) => {
        targetMealName = value;
        otherWrap.style.display = value === "Other" ? "" : "none";
      });
    });
    const otherWrap = contentEl.createDiv({ cls: "mp-other-meal" });
    new import_obsidian2.Setting(otherWrap).setName("Custom meal").addText((text) => {
      text.setPlaceholder("Snack");
      text.onChange((value) => {
        customMeal = value.trim();
      });
    });
    otherWrap.style.display = "none";
    new import_obsidian2.Setting(contentEl).addButton((button) => {
      button.setButtonText(isMove ? "Move" : "Copy");
      button.setCta();
      button.onClick(async () => {
        if (!isDateKey(targetDayKey)) {
          new import_obsidian2.Notice("Choose a valid day.");
          return;
        }
        const finalMeal = targetMealName === "Other" ? customMeal : targetMealName;
        if (!finalMeal) {
          new import_obsidian2.Notice("Enter a meal name.");
          return;
        }
        const didTransfer = await this.view.transferEntry(this.dayKey, this.mealName, this.index, targetDayKey, finalMeal, this.mode);
        if (didTransfer) this.close();
      });
    });
  }
  onClose() {
    this.contentEl.empty();
  }
};
var RecipePickerModal = class extends import_obsidian2.Modal {
  constructor(app, view, dayKey) {
    super(app);
    this.view = view;
    this.dayKey = dayKey;
    this.selectedRecipe = view.recipeCache[0];
    this.searchQuery = "";
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.addClass("mp-modal");
    contentEl.createEl("h2", { text: `Add recipe for ${this.dayKey}` });
    let targetServings = this.selectedRecipe?.servingsNumber || null;
    let mealName = this.view.plugin.settings.defaultMeals[2] || "Dinner";
    new import_obsidian2.Setting(contentEl).setName("Meal").addDropdown((dropdown) => {
      this.view.plugin.settings.defaultMeals.forEach((name) => dropdown.addOption(name, name));
      dropdown.addOption("Other", "Other");
      dropdown.setValue(mealName);
      dropdown.onChange((value) => {
        mealName = value;
        otherWrap.style.display = value === "Other" ? "" : "none";
      });
    });
    const otherWrap = contentEl.createDiv({ cls: "mp-other-meal" });
    let customMeal = "";
    new import_obsidian2.Setting(otherWrap).setName("Custom meal").addText((text) => {
      text.setPlaceholder("Snack");
      text.onChange((value) => {
        customMeal = value.trim();
      });
    });
    otherWrap.style.display = "none";
    let servingsInput;
    let searchInput;
    let recipeList;
    let selectedText;
    const syncServingsInput = () => {
      if (!servingsInput) return;
      targetServings = this.selectedRecipe?.servingsNumber || null;
      servingsInput.setPlaceholder(this.selectedRecipe?.servings ? String(this.selectedRecipe.servings) : "Recipe default");
      servingsInput.setValue(targetServings ? String(formatAmount(targetServings)) : "");
    };
    const selectRecipe = (recipe) => {
      this.selectedRecipe = recipe;
      selectedText.setText(recipe ? `Selected: ${recipe.name}` : "No recipe selected");
      syncServingsInput();
      renderRecipeList();
    };
    const createRecipe = async () => {
      const name = this.searchQuery.trim();
      if (!name) {
        new import_obsidian2.Notice("Enter a recipe name.");
        searchInput.inputEl.focus();
        return;
      }
      try {
        const recipe = await this.createRecipeFromQuery(name);
        this.view.recipeCache = await this.view.loadRecipes();
        const refreshed = this.view.recipeCache.find((item) => item.path === recipe.path) || recipe;
        this.searchQuery = refreshed.name;
        searchInput.setValue(refreshed.name);
        selectRecipe(refreshed);
        new import_obsidian2.Notice(`Created ${refreshed.name}.`);
      } catch (error) {
        new import_obsidian2.Notice(`Could not create recipe: ${error?.message || String(error)}`);
      }
    };
    const renderRecipeList = () => {
      recipeList.empty();
      const query = this.searchQuery.trim().toLowerCase();
      const matches = this.view.recipeCache.filter((recipe) => !query || recipeSearchText(recipe).includes(query)).slice(0, 50);
      if (!matches.length) {
        recipeList.createDiv({ cls: "mp-recipe-empty", text: "No matching recipes" });
      }
      matches.forEach((recipe) => {
        const button = recipeList.createEl("button", {
          cls: recipe.path === this.selectedRecipe?.path ? "mp-recipe-option is-active" : "mp-recipe-option",
          text: recipe.name,
          attr: { type: "button" }
        });
        button.addEventListener("click", () => selectRecipe(recipe));
      });
      const createLabel = this.searchQuery.trim() ? `Create "${this.searchQuery.trim()}"` : "Create new recipe";
      const createButton = recipeList.createEl("button", {
        cls: "mp-recipe-create",
        text: createLabel,
        attr: { type: "button" }
      });
      createButton.disabled = !this.searchQuery.trim();
      createButton.addEventListener("click", createRecipe);
    };
    new import_obsidian2.Setting(contentEl).setName("Search recipe").setDesc(`Searches ${this.view.plugin.settings.recipeFolder || DEFAULT_SETTINGS.recipeFolder}. If it is missing, create it there.`).addText((text) => {
      searchInput = text;
      text.setPlaceholder("Type recipe name");
      text.onChange((value) => {
        this.searchQuery = value;
        renderRecipeList();
      });
    });
    selectedText = contentEl.createDiv({
      cls: "mp-selected-recipe",
      text: this.selectedRecipe ? `Selected: ${this.selectedRecipe.name}` : "No recipe selected"
    });
    recipeList = contentEl.createDiv({ cls: "mp-recipe-list" });
    new import_obsidian2.Setting(contentEl).setName("Target servings").setDesc("Leave blank to use the recipe's original serving size.").addText((text) => {
      servingsInput = text;
      text.inputEl.type = "number";
      text.inputEl.min = "0.25";
      text.inputEl.step = "0.25";
      text.setPlaceholder(this.selectedRecipe?.servings ? String(this.selectedRecipe.servings) : "Recipe default");
      if (targetServings) text.setValue(String(formatAmount(targetServings)));
      text.onChange((value) => {
        const parsed = Number(value);
        targetServings = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
      });
    });
    renderRecipeList();
    new import_obsidian2.Setting(contentEl).addButton((button) => {
      button.setButtonText("Add");
      button.setCta();
      button.onClick(async () => {
        const finalMeal = mealName === "Other" ? customMeal : mealName;
        if (!finalMeal) {
          new import_obsidian2.Notice("Enter a meal name.");
          return;
        }
        if (!this.selectedRecipe) {
          new import_obsidian2.Notice("Select a recipe.");
          return;
        }
        await this.view.addEntry(this.dayKey, finalMeal, this.selectedRecipe, targetServings);
        this.close();
      });
    });
  }
  async createRecipeFromQuery(name) {
    const folder = cleanFolderPath(this.view.plugin.settings.recipeFolder) || DEFAULT_SETTINGS.recipeFolder;
    await ensureFolder(this.app, folder);
    const filename = safeFileName(name);
    let path = `${folder}/${filename}.md`;
    let suffix = 2;
    while (this.app.vault.getAbstractFileByPath(path)) {
      path = `${folder}/${filename} ${suffix}.md`;
      suffix += 1;
    }
    const body = [
      "---",
      "type: recipe",
      `name: ${yamlString(name)}`,
      "servings: ",
      "tags: []",
      "ingredients: []",
      "---",
      "",
      "## Ingredients / \u6750\u6599",
      "",
      "## Method / \u505A\u6CD5",
      ""
    ].join("\n");
    const file = await this.app.vault.create(path, body);
    return {
      file,
      path: file.path,
      name,
      servings: null,
      servingsNumber: null,
      tags: [],
      ingredients: [],
      imageRef: "",
      ingredientDetails: []
    };
  }
  onClose() {
    this.contentEl.empty();
  }
};
var ServingTargetModal = class extends import_obsidian2.Modal {
  constructor(app, view, dayKey, mealName, index, recipe, entry) {
    super(app);
    this.view = view;
    this.dayKey = dayKey;
    this.mealName = mealName;
    this.index = index;
    this.recipe = recipe;
    this.entry = entry;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.addClass("mp-modal");
    contentEl.createEl("h2", { text: "Set target servings" });
    let targetServings = servingTargetForEntry(this.entry, this.recipe);
    new import_obsidian2.Setting(contentEl).setName(this.recipe.name).setDesc(this.recipe.servings ? `Recipe default: ${this.recipe.servings} servings` : "Recipe default not set").addText((text) => {
      text.inputEl.type = "number";
      text.inputEl.min = "0.25";
      text.inputEl.step = "0.25";
      if (targetServings) text.setValue(String(formatAmount(targetServings)));
      text.onChange((value) => {
        const parsed = Number(value);
        targetServings = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
      });
    });
    new import_obsidian2.Setting(contentEl).addButton((button) => {
      button.setButtonText("Use default");
      button.onClick(async () => {
        await this.view.updateEntryServings(this.dayKey, this.mealName, this.index, this.recipe, null);
        this.close();
      });
    }).addButton((button) => {
      button.setButtonText("Save");
      button.setCta();
      button.onClick(async () => {
        await this.view.updateEntryServings(this.dayKey, this.mealName, this.index, this.recipe, targetServings);
        this.close();
      });
    });
  }
  onClose() {
    this.contentEl.empty();
  }
};
function cleanFolderPath(value) {
  return String(value || "").trim().replace(/^\/+|\/+$/g, "");
}
async function ensureFolder(app, folderPath) {
  const parts = cleanFolderPath(folderPath).split("/").filter(Boolean);
  let current = "";
  for (const part of parts) {
    current = current ? `${current}/${part}` : part;
    const existing = app.vault.getAbstractFileByPath(current);
    if (existing instanceof import_obsidian2.TFile) {
      throw new Error(`${current} is a file, not a folder`);
    }
    if (!existing) {
      await app.vault.createFolder(current);
    }
  }
}
function safeFileName(value) {
  const cleaned = String(value || "").replace(/[\\/#^[\]|:]/g, " ").replace(/\s+/g, " ").trim();
  return cleaned || "Untitled Recipe";
}
function yamlString(value) {
  return JSON.stringify(String(value || ""));
}
function recipeSearchText(recipe) {
  return [
    recipe.name,
    recipe.path,
    recipe.tags.join(" "),
    recipe.ingredients.join(" ")
  ].join(" ").toLowerCase();
}
async function copyTextToClipboard(text) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  throw new Error("Clipboard API is not available.");
}
function recipeImageRef(text, meta) {
  const frontmatterRef = firstValue2(meta.image, meta.cover, meta.thumbnail, meta.banner);
  if (frontmatterRef) return cleanImageRef(frontmatterRef);
  const embed = text.match(/!\[\[([^\]|#]+)(?:[#|][^\]]*)?\]\]/);
  if (embed) return cleanImageRef(embed[1]);
  const markdownImage = text.match(/!\[[^\]]*]\(([^)]+)\)/);
  if (markdownImage) return cleanImageRef(markdownImage[1]);
  return "";
}
function firstValue2(...values) {
  for (const value of values) {
    const normalized = normalizeArray(value).map(cleanImageRef).find((item) => item !== "");
    if (normalized) return normalized;
  }
  return "";
}
function cleanImageRef(value) {
  if (!value) return "";
  return String(value).replace(/^!\[\[/, "").replace(/^\[\[/, "").replace(/\]\]$/, "").split("|")[0].trim();
}
function cssUrl(value) {
  return `url("${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}")`;
}
function extractIngredientDetails(text, ingredients) {
  const details = /* @__PURE__ */ new Map();
  ingredients.forEach((name) => details.set(name, { name, amount: "" }));
  text.split("\n").forEach((line) => {
    const match = line.match(/^\s*-\s+\[\[([^\]|]+)(?:\|[^\]]+)?\]\]\s*(.*)$/);
    if (!match) return;
    const name = match[1].trim();
    if (!details.has(name)) return;
    const amount = cleanIngredientAmount(match[2]);
    if (amount && !details.get(name).amount) {
      details.set(name, { name, amount });
    }
  });
  return Array.from(details.values());
}
function cleanIngredientAmount(raw) {
  return raw.replace(/\s{2,}.*$/, "").replace(/\[\[[^\]]+\]\]/g, "").replace(/\s+/g, " ").trim().replace(/[,，]$/, "");
}
function readFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  try {
    return (0, import_obsidian2.parseYaml)(match[1]) || {};
  } catch (error) {
    return {};
  }
}
