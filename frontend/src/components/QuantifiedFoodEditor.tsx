import React, { useState } from 'react';

import { CheckBox, TextField, Spinner } from './ui';
import { EnableIf } from './util';

import FoodEditor from './FoodEditor';

import { Lens, bracket } from '../util';
import { postFood } from '../api';
import { validateQuantifiedFoodForm, QUANTIFIED_FOOD_FORM } from '../form';
import { useIntParser } from '../hooks';

export default function QuantifiedFoodEditor() {
  const [ submitting, setSubmitting ] = useState(false);
  const [ error, setError ] = useState(false);
  const [ quantifiedFoodForm, setQuantifiedFoodForm ] = useState(QUANTIFIED_FOOD_FORM());

  const lens = new Lens(quantifiedFoodForm, setQuantifiedFoodForm);
  const [ food, setFood ] = lens.focus('food');
  const [ amount, setAmount ] = lens.focus('amount');

  const [ amountText, setAmountText ] = useIntParser('', amount ?? 0, (x) => setAmount(() => x));

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    const validatedForm = validateQuantifiedFoodForm(quantifiedFoodForm);
    if (null === validatedForm) return;

    const result = bracket(
      setSubmitting,
      () => postFood(validatedForm),
    );
    const error = null === result;
    setError(error);
    if(error) return;
    setQuantifiedFoodForm(QUANTIFIED_FOOD_FORM());
  };

  return (
    <form onSubmit={handleSubmit} className="food-editor-manager">
      <h2> Add a food </h2>
      <FoodEditor food={food} setFood={setFood} />
      <div className="reference-quantity">
        <label>
          Reference quantity<br/>
          <TextField
            value={amountText}
            setValue={setAmountText}/>
        </label>
      </div>
      <EnableIf condition={!submitting}>
        <button> Submit </button>
      </EnableIf>
      <EnableIf condition={submitting}>
        <Spinner />
      </EnableIf>
    </form>
  );
}
