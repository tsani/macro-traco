import { NutrientName, Weight, Macros, MacroGoal, Consumer, Energy } from './types';

// The units to use for recipes, since they do not have real units.
export const RECIPE_WEIGHTS: Weight[] = [
  { seq_num: 0, name: 'grams' },
  { seq_num: -1, name: 'fraction' },
];

export const EMPTY_UNIT = { name: "", gramEquivalent: 0 };

export const MACRO_NAMES: Macros<NutrientName> = {
  protein: 'Protein',
  carbs: 'Carbohydrate, by difference',
  fat: 'Total lipid (fat)',
};

export const MACROS = Object.keys(MACRO_NAMES) as (keyof Macros<any>)[];
export const MACRO_KEYS = Object.values(MACRO_NAMES);

export const KCAL_PER_G: Macros<Energy> = {
  protein: 4,
  carbs: 4,
  fat: 9,
};

export const CONSUMER_NAMES: Consumer<string> = {
  jake: 'jake',
  eric: 'eric',
  test: 'test',
};

export const ALL_CONSUMERS = Object.keys(CONSUMER_NAMES);

export const CONSUMER_MACRO_SPLIT: Consumer<MacroGoal> = {
  eric: {
    carbs: [0.5, 0.55],
    protein: [0.3, 0.35],
    fat: [0.2, 0.25],
  },
  jake: {
    carbs: [0.5, 0.55],
    protein: [0.3, 0.35],
    fat: [0.2, 0.25],
  },
  test: {
    carbs: [0.5, 0.55],
    protein: [0.3, 0.35],
    fat: [0.2, 0.25],
  }
}

export const CONSUMER_ENERGY_TARGET: Consumer<Energy> = {
  eric: 3000,
  jake: 2600,
  test: 2000,
}
