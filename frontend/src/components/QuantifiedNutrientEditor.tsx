import React from 'react';

import NutrientSelector from './NutrientSelector';

import { TextField } from './ui';

import { Lens, isDef } from '../util';
import { Setter } from '../types';
import { useIntParser } from '../hooks';
import { QuantifiedNutrientForm } from '../form';

export interface QuantifiedNutrientEditorProps {
  quantifiedNutrient: QuantifiedNutrientForm;
  setQuantifiedNutrient: Setter<QuantifiedNutrientForm>;
}

/**
 * An editor consisting of a flow to select a nutrient and input a quantity for
 * that nutrient in its native unit.
 * (In the USDA database, each nutrient is associated to the unit in which that nutrient is measured.
 * Unlike foods, which may have multiple different units associated, nutrients only have one unit.)
 */
export default function QuantifiedNutrientEditor(
  { quantifiedNutrient, setQuantifiedNutrient }: QuantifiedNutrientEditorProps
) {
  const lens = new Lens(quantifiedNutrient, setQuantifiedNutrient);
  const [ nutrient, setNutrient ] = lens.focus('nutrient');
  const [ amount, setAmount ] = lens.focus('amount');
  const [ amountText, setAmountText ] = useIntParser('', amount ?? 0, (x) => setAmount(() => x));

  if(!isDef(nutrient.id))
    return (
      <div className="nutrient-selector">
        <NutrientSelector onSelect={(x) => setNutrient(() => x)} />
      </div>
    );

  return (
    <div className="nutrient-selector">
      <div className="nutrient-name"> {nutrient.name} ({nutrient.unit}) </div>
      <TextField
        placeholder={`Amount in ${nutrient.unit}`}
        value={amountText}
        setValue={setAmountText} />
    </div>
  );
}
