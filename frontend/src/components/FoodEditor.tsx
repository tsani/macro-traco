import React from 'react';

import { TextField } from './ui';

import UnitListEditor from './UnitListEditor';
import QuantifiedNutrientListEditor from './QuantifiedNutrientListEditor';

import { Lens } from '../util';
import { FoodForm } from '../form';
import { Setter } from '../types';

export interface FoodEditorProps {
  food: FoodForm;
  setFood: Setter<FoodForm>;
}

export default function QuantifiedFoodEditor({
  food,
  setFood,
}: FoodEditorProps) {
  const lens = new Lens(food, setFood);
  const [ name, setName ] = lens.focus('name');
  const [ units, setUnits ] = lens.focus('units');
  const [ nutrients, setNutrients ] = lens.focus('nutrients');

  return (
    <div className="food-editor">
      <div className="food-editor-name">
        <TextField
          value={name}
          setValue={(name) => setName(() => name)}
          placeholder="Name of food" />
      </div>
      <h3>Units</h3>
      <UnitListEditor items={units} setItems={setUnits} />
      <h3>Nutrients</h3>
      <QuantifiedNutrientListEditor items={nutrients} setItems={setNutrients} />
    </div>
  );
}
