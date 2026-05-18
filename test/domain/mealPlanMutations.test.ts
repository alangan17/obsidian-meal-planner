import { describe, expect, it } from "vitest";
import { addSampleEntryToPlans, sampleIngredientMarkdown, sampleRecipeMarkdown, transferEntryInPlans } from "../../src/domain/mealPlanMutations";
import type { MealPlans } from "../../src/domain/types";

describe("meal plan mutations", () => {
  it("moves within the same meal with index adjustment", () => {
    const plans: MealPlans = {
      "2026-05-18": {
        Dinner: [
          { path: "a.md", name: "A" },
          { path: "b.md", name: "B" },
          { path: "c.md", name: "C" },
        ],
      },
    };

    const result = transferEntryInPlans(plans, "2026-05-18", "Dinner", 0, "2026-05-18", "Dinner", "move", 3);

    expect(result.changed).toBe(true);
    expect(plans["2026-05-18"].Dinner.map((entry) => entry.name)).toEqual(["B", "C", "A"]);
  });

  it("copies without mutating the source entry", () => {
    const plans: MealPlans = {
      "2026-05-18": { Dinner: [{ path: "a.md", name: "A", targetServings: 2 }] },
      "2026-05-19": { Lunch: [] },
    };

    const result = transferEntryInPlans(plans, "2026-05-18", "Dinner", 0, "2026-05-19", "Lunch", "copy");

    expect(result.changed).toBe(true);
    expect(plans["2026-05-18"].Dinner).toHaveLength(1);
    expect(plans["2026-05-19"].Lunch).toEqual([{ path: "a.md", name: "A", targetServings: 2 }]);
    expect(plans["2026-05-19"].Lunch[0]).not.toBe(plans["2026-05-18"].Dinner[0]);
  });

  it("cleans up empty source meal and day after move", () => {
    const plans: MealPlans = {
      "2026-05-18": { Dinner: [{ path: "a.md", name: "A" }] },
    };

    transferEntryInPlans(plans, "2026-05-18", "Dinner", 0, "2026-05-19", "Lunch", "move");

    expect(plans["2026-05-18"]).toBeUndefined();
    expect(plans["2026-05-19"].Lunch).toEqual([{ path: "a.md", name: "A" }]);
  });

  it("reports missing source entries without creating target plans", () => {
    const plans: MealPlans = {};

    const result = transferEntryInPlans(plans, "2026-05-18", "Dinner", 0, "2026-05-19", "Lunch", "move");

    expect(result).toEqual({ changed: false, reason: "missing-source" });
    expect(plans).toEqual({});
  });

  it("adds the sample recipe to dinner for empty plans", () => {
    const plans: MealPlans = {};

    const result = addSampleEntryToPlans(plans, "2026-05-18", "recipe/Tomato Egg Rice.md");

    expect(result.added).toBe(true);
    expect(plans).toEqual({
      "2026-05-18": {
        Dinner: [{ path: "recipe/Tomato Egg Rice.md", name: "Tomato Egg Rice" }],
      },
    });
  });

  it("does not duplicate an existing sample dinner entry", () => {
    const plans: MealPlans = {
      "2026-05-18": {
        Dinner: [{ path: "recipe/Tomato Egg Rice.md", name: "Tomato Egg Rice" }],
      },
    };

    const result = addSampleEntryToPlans(plans, "2026-05-18", "recipe/Tomato Egg Rice.md");

    expect(result.added).toBe(false);
    expect(plans["2026-05-18"].Dinner).toHaveLength(1);
  });

  it("preserves unrelated meals when adding the sample entry", () => {
    const plans: MealPlans = {
      "2026-05-18": {
        Breakfast: [{ path: "recipe/Oatmeal.md", name: "Oatmeal" }],
      },
    };

    addSampleEntryToPlans(plans, "2026-05-18", "recipe/Tomato Egg Rice.md");

    expect(plans["2026-05-18"].Breakfast).toEqual([{ path: "recipe/Oatmeal.md", name: "Oatmeal" }]);
    expect(plans["2026-05-18"].Dinner).toEqual([{ path: "recipe/Tomato Egg Rice.md", name: "Tomato Egg Rice" }]);
  });

  it("generates sample recipe markdown with parseable ingredient quantities", () => {
    const text = sampleRecipeMarkdown();

    expect(text).toContain("name: Tomato Egg Rice");
    expect(text).toContain("servings: 2");
    expect(text).toContain("- [[Egg]] 4 units");
    expect(text).toContain("- [[Tomato]] 300g");
    expect(text).toContain("- [[Rice]] 300g");
    expect(text).toContain("- [[Soy Sauce]] 1 tbsp");
    expect(text).toContain("- [[Oil]] 1 tbsp");
  });

  it("generates sample ingredient metadata with pantry flags", () => {
    expect(sampleIngredientMarkdown({ category: "Seasonings", pantry: true })).toBe([
      "---",
      "category: Seasonings",
      "pantry: true",
      "---",
      "",
    ].join("\n"));
    expect(sampleIngredientMarkdown({ category: "Produce", pantry: false })).toContain("pantry: false");
  });
});
