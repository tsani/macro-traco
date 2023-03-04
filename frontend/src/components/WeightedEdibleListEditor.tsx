import React from 'react';

import { dynamicListWidget, CancelButton } from './ui';

import { WeightedEdible } from '../types';
import { WeightedEdibleForm, WEIGHTED_EDIBLE_FORM } from '../form';

import WeightedEdibleSelector from './WeightedEdibleSelector';


// A dynamic list of foods together with weights for them.
// This is used to configure the ingredients of a recipe.
const WeightedEdibleListEditor = dynamicListWidget<WeightedEdibleForm<'food'>>({
  renderOnEmpty: <p> No foods in this recipe. </p>,
  renderAddItem: (addFood: (w: WeightedEdibleForm<'food'>) => void) =>
    <div>
      <button type="button" onClick={() => addFood({ ...WEIGHTED_EDIBLE_FORM() })}>
        Add another ingredient
      </button>
    </div>,
  renderItems: renderInside =>
    <div className="weighted-foods-list"> {renderInside()} </div>,
  renderItem: (weightedEdible, index, setWeightedEdible) => {
    return <div key={index} className="weighted-foods-list-item card">
      <CancelButton onCancel={() => setWeightedEdible(null)} />
      <h4>Ingredient #{index+1}</h4>
      <WeightedEdibleSelector
        weightedEdible={weightedEdible}
        setWeightedEdible={(f) => setWeightedEdible(f)}
        resetWeightedEdible={() => setWeightedEdible(() => ({ ...WEIGHTED_EDIBLE_FORM() }))}
      />
    </div>
  }
});

export default WeightedEdibleListEditor;