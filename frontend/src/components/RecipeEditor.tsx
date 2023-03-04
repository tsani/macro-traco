import React, { useState } from 'react';

import { EnableIf } from './util';

import WeightedEdibleListEditor from './WeightedEdibleListEditor';

import { postRecipes } from '../api';
import { validateWeightedEdibleForm, WeightedEdibleForm } from '../form';
import { all, bracket } from '../util';

// A recipe is a list of foods + weights
export default function RecipeEditor() {
  const [ recipeIsSelected, setRecipeIsSelected ] = useState(false);
  const [ foods, setFoods ] = useState<WeightedEdibleForm<'food'>[]>([]);
  const [ isNewRecipe, setIsNewRecipe ] = useState(true);
  const [ newRecipeName, setNewRecipeName ] = useState('');
  const [ submitting, setSubmitting ] = useState(false);
  const [ error, setError ] = useState(false);

  const handleIsNewRecipeChange = (e: any) => setIsNewRecipe(e.target.checked);
  const handleNewRecipeNameChange = (e: any) => setNewRecipeName(e.target.value);

  const handleSubmit = async () => {
    const ingredients = all(foods.map((x) => validateWeightedEdibleForm(x)));
    if (null === ingredients) return;
    const res = await bracket(
      setSubmitting,
      () => postRecipes({ name: newRecipeName, ingredients }),
    );
    if (null === res) { setError(true); return; };
    setFoods([]);
  };

  return (
    <div className="recipe-editor">
      <h2>Add or edit recipe</h2>
      <EnableIf condition={error}>
        <p> Oops, something went wrong. </p>
      </EnableIf>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <label>
          New recipe?&nbsp;
          <input
            type="checkbox"
            name="is-new-recipe"
            checked={isNewRecipe}
            onChange={handleIsNewRecipeChange}
          />
        </label>

        <EnableIf condition={isNewRecipe}>
          <input
            type="text"
            value={newRecipeName}
            onChange={handleNewRecipeNameChange}
            placeholder="Recipe name"
          />
        </EnableIf>

        <WeightedEdibleListEditor
          items={foods}
          setItems={setFoods}
        />

        <input type="submit" value="Add this recipe" />
      </form>
    </div>
  );
}
