import React from 'react';

import { dynamicSelector } from './ui';

import { useNutrientSearch } from '../hooks';
import { Nutrient } from '../types';

const NutrientSelector = dynamicSelector<Nutrient, {}>({
  useResults: useNutrientSearch,
  placeholder: "Type the name of a nutrient",
  formatResult: (nutrient, _index, select) =>
    <button
      key={nutrient.id}
      type="button"
      onClick={() => select()}
    >
      {nutrient.name} ({nutrient.unit})
    </button>,
});
export default NutrientSelector;