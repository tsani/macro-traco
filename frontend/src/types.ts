import React from "react";

export interface Weight {
    /** The name of this unit of weight. */
    name: string;

    /** An identifier for this unit in the backend. */
    seq_num: number;

    // /** The equivalent of one of these units in grams. */
    // grams?: number;
}

export interface QuantifiedWeight {
    seq_num: number;
    amount: number;
}

export type UnitName = string;

export interface Unit {
    name: UnitName;
    gramEquivalent: number;
}

export type NutrientName = string

export interface Nutrient {
    id: number;
    name: string;
    unit: string;
}

export type NutritionFacts = Record<NutrientName, [number, UnitName]>

export interface QuantifiedNutrient {
    id: number; // the ID of the nutrient
    amount: number;
}

export interface Food {
    id?: number;
    name: string;
    units: Unit[];
    nutrients: Nutrient[];
}

export interface Edible<Kind> {
    type: Kind,
    id: number;
    name: string;
}

export type AnyEdible = Edible<'food' | 'recipe'>;
export type RecipeEdible = Edible<'recipe'>;
export type FoodEdible = Edible<'food'>;

export interface WeightedEdible<Kind> {
    edible: Edible<Kind>;
    weight: QuantifiedWeight;
}

export type Endo<T> = (x : T) => T
export type Setter<T> = (x: Endo<T>) => void;

export type Component<Props> = (props: Props) => React.ReactElement;

/** A record of macronutrients. */
export interface Macros<T> {
  protein: T;
  carbs: T;
  fat: T;
}

export type Energy = number;
export type Fraction = number; // between 0 and 1.
export type MacroSplit = Macros<[Fraction, Fraction]>; // a lo-hi range of the total fraction of energy consumed per macro
export type MacroGoal = Macros<[Energy, Energy]>;

export interface Consumer<T> {
  jake: T;
  eric: T;
  test: T;
}
