import React from 'react';

import { NutritionFacts } from '../types';

interface NutritionFactsProps {
    nutrients: NutritionFacts
}

/** Views nutrition facts as a 2-column table with nutrient name on the left and amount on the
 * right. */
export default function NutritionFactsView({ nutrients }: NutritionFactsProps) {
  if (!nutrients) return null;

  const innards = Object.entries(nutrients)
    .filter(([_1, [amount, _2]]) => amount >= 1)
    .map( ([nutrientName, [amount, unit]]) =>
      <tr key={nutrientName} className="nutrient-list-item">
        <td className="nutrient-name"> {nutrientName} </td>
        <td className="nutrient-amount"> {amount.toFixed(0)} </td>
        <td className="nutrient-unit"> {unit} </td>
      </tr>
    );

  return innards.length === 0 ? null : (
    <table className="nutrient-list">
      <tbody>
      { innards }
      </tbody>
    </table>
  );
}
