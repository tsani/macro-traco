import { optionalFunction } from "./util";
import { RECIPE_WEIGHTS } from "./constants";
import { Edible, Weight, NutritionFacts } from './types';

import * as model from './model';

export function makeURL(path: string, qs?: Record<string, string>): string {
  if(qs)
    return path + '?' + new URLSearchParams(qs).toString();
  else
    return path
}

export async function postFood(weightedFood: model.PostFood): Promise<{ id: number } | null> {
  const res = await fetch('/food', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(weightedFood),
  });
  if(res.ok)
    return await res.json();
  else
    return null;
}

export function getFoodWeights(req: model.GetFoodWeights): Promise<Weight[]> {
  return fetch(makeURL("/food/" + req.id + "/weights"))
    .then(res => res.json())
    .then(data => [ { seq_num: 0, name: 'gram', grams: 1 }, ...data.weights ]);
}

export async function getSearchResults<Kind>(req: model.GetSearch): Promise<Edible<Kind>[]> {
  const response = await fetch(
    makeURL(
      "/search",
       Object.assign<Record<string, string>, Record<string, string>>(
        { "for": req.for },
        req.restrict_to ? { restrictTo: req.restrict_to } : {},
      ),
    ),
  );
  const data : { results: Edible<Kind>[] } = await response.json();
  return data.results;
}

// Retrieves the nutrients for a given edible with a given quantity.
export async function getNutritionFacts(
    req: model.GetNutritionFacts,
): Promise<model.GetNutritionFactsResponse> {
  const res = await fetch(
    makeURL(
      '/nutrition-facts', {
        id: req.id.toString(),
        type: req.type,
        seq_num: req.seq_num.toString(),
        amount: req.amount.toString(),
      },
    ),
  );
  return await res.json();
}

export async function getConsumerNutrients(
  { consumer, start, end }: model.GetEat,
): Promise<NutritionFacts> {
  const res = await fetch(makeURL(
    '/eat', {
      consumer: consumer,
      start: start.toISOString(),
      end: end.toISOString(),
  }));
  return await res.json();
}

export async function getNutrients(
  req: model.GetNutrients,
): Promise<model.GetNutrientsResponse> {
  return fetch(makeURL('/nutrients', { ...req }))
    .then(res => res.json())
}

export function postEat(req: model.PostEat): ReturnType<typeof fetch> {
  return fetch('/eat', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(req),
  })
}

export function postRecipes(
  req: model.PostRecipes,
): Promise<model.PostRecipesResponse | null> {
  return fetch('/recipes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  }).then((res) => res.ok ? res.json() : null);
}