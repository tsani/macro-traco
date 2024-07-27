import fetch from 'node-fetch';


console.log("here are your meals for the week");

interface CouchReponse {
  rows: {doc: Recipe}[];

}
interface Recipe {
  name : string,
  quantity: number,
  tags : string[],
  nutrients : Nutrients,
  ingredients : { [key: string]: [number, string] }
}
type Ingredient = [number, string]

interface Nutients {
  calorie: number,
  protein: number,
  carb:number,
  fat: number
}

const fetchRecipes = async () : Promise<Recipe[]> => {
  const recipesDocs = await fetch("http://localhost:5984/recipes/_all_docs?include_docs=true");
  const docs : CouchReponse = await recipesDocs.json();
  return docs.rows.map(({doc}) => doc)
}

const getIngredients = (recipes: Recipe[]) : Set< => {
  return new Set (recipes.map({ingredients} => ingredients))
}

const printRecipes = (recipes) => {

}
