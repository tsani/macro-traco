import { number } from 'prop-types';
import { PostEat, PostFood } from './model';
import { Edible, QuantifiedNutrient, Weight, WeightedEdible, Unit, QuantifiedWeight } from './types';
import { all } from './util';

export interface FoodForm {
    name: string;
    nutrients: QuantifiedNutrientForm[];
    units: Array<Partial<{
        name: string;
        gramEquivalent: number;
    }>>;
}

// generates an empty food object, with no units and no nutrients
export const FOOD_FORM = (): FoodForm => ({
    name: '',
    units: [],
    nutrients: [],
});

/** A form of PostFood with all the necessary structure there, but all the values made optional.
 * We wish we could generate this with something like Partial<PostFood> but that's just not quite right.
 */
export interface QuantifiedFoodForm {
    food: FoodForm;

    /** The reference quantity of the food.
     * The food nutrients given in food.nutrients are for this quantity of the food,
     * expressed in grams.
     */
    amount?: number;
}

export const QUANTIFIED_FOOD_FORM = (): QuantifiedFoodForm => ({
  food: FOOD_FORM(),
});

function validateQuantifiedNutrientForm(qn: QuantifiedNutrientForm): QuantifiedNutrient | null {
    const { nutrient: { id, name, unit }, amount } = qn;
    if ('undefined' === typeof id) return null;
    if ('undefined' === typeof amount) return null;
    return { id, amount };
}

function validateUnit(u: Partial<Unit>): Unit | null {
    const { name, gramEquivalent } = u;
    if ('undefined' === typeof name) return null;
    if ('undefined' === typeof gramEquivalent) return null;
    return { name, gramEquivalent };
}

export function validateQuantifiedFoodForm(x: QuantifiedFoodForm): PostFood | null {
    const { food, amount } = x;

    if ('undefined' === typeof amount) return null;

    const { name, nutrients, units } = food;
    if ('undefined' === typeof name) return null;

    const validatedNutrients = all(
        nutrients.map((x) => validateQuantifiedNutrientForm(x)),
    );
    if (null === validatedNutrients) return null;

    const validatedUnits = all(
        units.map((x) => validateUnit(x)),
    );
    if (null === validatedUnits) return null;

    // XXX this considers that foods with no nutrients are valid...
    // Maybe we don't want this?

    return { amount, units: validatedUnits, food: { name, nutrients: validatedNutrients }};
}

export interface WeightedEdibleForm<Kind> {
    edible: Partial<Edible<Kind>>;
    weight: Partial<QuantifiedWeight>;
}

export const WEIGHTED_EDIBLE_FORM = <Kind>(): WeightedEdibleForm<Kind> => ({
  edible: {},
  weight: { seq_num: 0, amount: 0 },
});

export function validateWeightedEdibleForm<Kind>(x: WeightedEdibleForm<Kind>): WeightedEdible<Kind> | null {
    const { edible, weight } = x;

    const { type, id, name } = edible;
    if ('undefined' === typeof type) return null;
    if ('undefined' === typeof id) return null;
    if ('undefined' === typeof name) return null;

    const { seq_num, amount, } = weight;
    if ('undefined' === typeof seq_num) return null;
    if ('undefined' === typeof amount) return null;

    return {
        edible: { type, id, name }, 
        weight: { seq_num, amount },
    };
}

export interface QuantifiedNutrientForm {
    amount?: number;
    nutrient: {
        id?: number;
        name?: string;
        unit?: string;
    }
}

export const QUANTIFIED_NUTRIENT_FORM = () => ({
  nutrient: {},
  amount: 0,
});

export interface EatenForm<Kind> {
    consumer: string;
    weightedEdible: WeightedEdibleForm<Kind>;
}

export const EATEN_FORM = <Kind>(): EatenForm<Kind> => ({
    consumer: '',
    weightedEdible: WEIGHTED_EDIBLE_FORM(),
})

export function validateEatenForm(eatenForm: EatenForm<'food' | 'recipe'>): PostEat | null {
    const {
        weightedEdible: {
            edible: { id, type }, 
            weight: { seq_num, amount },
        },
        consumer
    } = eatenForm;

    if ('undefined' === typeof type) return null;
    if ('undefined' === typeof consumer || !consumer) return null;
    if ('undefined' === typeof id) return null;
    if ('undefined' === typeof seq_num) return null;
    if ('undefined' === typeof amount) return null;

    return { edible: { id, type }, weight: { seq_num, amount }, consumer };
}

export interface QuantifiedWeightForm {
    seq_num?: number;
    amount?: number;
}

export function validateQuantifiedWeightForm(qwf: QuantifiedWeightForm): QuantifiedWeight | null {
    const { seq_num, amount } = qwf;
    if ('undefined' === typeof seq_num) return null;
    if ('undefined' === typeof amount) return null;
    return { seq_num, amount };
}