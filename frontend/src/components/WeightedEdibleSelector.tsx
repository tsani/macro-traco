import React, { useState } from 'react';

import makeEdibleSelector from './EdibleSelector';
import NutritionFacts from './NutritionFactsView';
import WeightSelector from './WeightSelector';

import { CancelButton } from './ui';
import { EnableIf } from './util';

import { Lens } from '../util';
import { useNutritionFacts, useEdibleWeights } from '../hooks';
import { Setter } from '../types';
import { WeightedEdibleForm } from '../form';

interface WeightedEdibleSelectorProps<Kind> {
  weightedEdible: WeightedEdibleForm<Kind>;
  setWeightedEdible: Setter<WeightedEdibleForm<Kind>>;
  resetWeightedEdible: () => void;
}

// Component for selecting a food or recipe and then a quantity for it.
// required props:
// - eaten, with keys 'edible' and 'weight'
export default function WeightedEdibleSelector<Kind extends 'food' | 'recipe'>({ 
  weightedEdible, 
  setWeightedEdible, 
  resetWeightedEdible 
}: WeightedEdibleSelectorProps<Kind>) {
  const weights = useEdibleWeights(weightedEdible.edible);
  const facts = useNutritionFacts<Kind>(weightedEdible.edible, weightedEdible.weight);

  const [ weightFocused, setWeightFocused ] = useState(false);
  const lens = new Lens(weightedEdible, setWeightedEdible);
  const [weight, setWeight] = lens.focus('weight');
  const [edible, setEdible] = lens.focus('edible');

  const { id } = edible;

  const EdibleSelector = makeEdibleSelector<Kind>();

  if('undefined' === typeof edible || 'undefined' === typeof id) {
    return (
      <EdibleSelector
        onSelect={(x) => setEdible(() => x)}
      />
    );
  }
  else {
    return (
      <div className="edible-selector">
        <div className="selected-edible">
          <CancelButton onCancel={() => resetWeightedEdible()}/>
          {edible.name}
        </div>
        <WeightSelector
          edibleId={id}
          quantifiedWeight={weight}
          setQuantifiedWeight={setWeight}
          handleFocus={setWeightFocused}
          weights={weights}
          ready={weights.length > 0}
        />
        <EnableIf condition={weightFocused}>
          <NutritionFacts nutrients={facts} />
        </EnableIf>
      </div>
    );
  }
}
