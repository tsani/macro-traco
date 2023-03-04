import { Weight } from './types';

// The units to use for recipes, since they do not have real units.
export const RECIPE_WEIGHTS: Weight[] = [
  { seq_num: 0, name: 'grams' },
  { seq_num: -1, name: 'fraction' },
];

export const EMPTY_UNIT = { name: "", gramEquivalent: 0 };

export const MACRO_KEYS = [
    'Energy',
    'Protein',
    'Carbohydrate, by difference',
    'Total lipid (fat)'
  ] as const;
