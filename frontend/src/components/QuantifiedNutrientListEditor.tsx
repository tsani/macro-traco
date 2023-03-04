import React from 'react';

import { dynamicListWidget, CancelButton } from './ui';

import QuantifiedNutrientEditor from './QuantifiedNutrientEditor';

import { QuantifiedNutrientForm, QUANTIFIED_NUTRIENT_FORM } from '../form';

const QuantifiedNutrientListEditor = dynamicListWidget<QuantifiedNutrientForm>({
  renderOnEmpty: <p> No nutrients in this food. </p>,
  renderAddItem: (addNutrient: (x: QuantifiedNutrientForm) => void) =>
    <button
      type="button"
      onClick={() => addNutrient({ ...QUANTIFIED_NUTRIENT_FORM() })}>
      Add another nutrient
    </button>,
  renderItems: (renderInside) => <div className="food-nutrient-list">{renderInside()}</div>,
  renderItem: (weightedNutrient, index, setWeightedNutrient) =>
    <div key={index} className="food-nutrient-list-item card">
      <CancelButton onCancel={() => setWeightedNutrient(null)} />
      <h4> Nutrient #{index+1} </h4>
      <QuantifiedNutrientEditor
        quantifiedNutrient={weightedNutrient}
        setQuantifiedNutrient={setWeightedNutrient}/>
    </div>,
});
export default QuantifiedNutrientListEditor;