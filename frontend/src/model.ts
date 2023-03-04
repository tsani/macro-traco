import { NutrientName } from "./types";

/** Parameters for a GET /nutrition-facts */
export interface GetNutritionFacts {
    id: number;
    type: 'food' | 'recipe';
    seq_num: number;
    amount: number;
}

export type GetNutritionFactsResponse = Record<NutrientName, [number, string]>;

/** Body of a POST /recipes */
export interface PostRecipes {
    name: string;
    ingredients: Array<{
        edible: {
            type: 'food',
            id: number,
        },
        weight: {
            amount: number,
            seq_num: number;
        }
    }>
}

/** The result is always an empty object. */
export interface PostRecipesResponse {}

/** Parameters for a GET /nutrients */
export interface GetNutrients {
    search: string;
}

/** Response of a GET /nutrients */
export type GetNutrientsResponse = Array<{
    id: number;
    unit: string;
    name: string;
}>;

/** Parameters for a GET /search */
export interface GetSearch {
    for: string;
    restrict_to: 'food' | 'recipe';
}

/** Response of a GET /search */
export interface GetSearchResponse {
    results: Array<{
        id: number;
        type: 'food' | 'recipe';
        name: string;
    }>;
}

/** Body of a POST /food */
export interface PostFood {
    food: {
        name: string;
        nutrients: Array<{
            /** ID of the nutrient in table `nutrition` */
            id: number;

            /** The amount of that nutrient expressed in its natural units */
            amount: number; 
        }>;
    };

    /** The reference quantity of the food.
     * The food nutrients given in food.nutrients are for this quantity of the food,
     * expressed in grams.
     */
    amount: number;

    /** The configured units available for this food. */
    units: Array<{
        name: string;

        /** The weight in grams of one of these units. */
        gramEquivalent: number;
    }>;
}

export interface PostFoodResponse {
    id: number;
}

/** Parameters for GET /eat, to retrieve macros for a given consumer in a time range. */
export interface GetEat {
    consumer: string;
    start: Date;
    end: Date;
}

/** Parameters for POST /eat, to record that a consumer ate something. */
export interface PostEat {
    consumer: string;
    edible: {
        type: 'food' | 'recipe';
        id: number;
    };
    weight: {
        seq_num: number;
        amount: number;
    };
}

export interface GetFoodWeights {
    /** The ID of the food whose weights to retrieve. */
    id: number;
}