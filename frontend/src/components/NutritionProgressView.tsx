import React from 'react';

import { NutritionFacts, NutrientName } from '../types';

interface NutritionProgressProps {
  /** Actually consumed quantities for nutrients. */
  consumed: NutritionFacts;

  /** Target quantities for nutrients. */
  target: NutritionFacts;

  /** Nutrients we actually care to display, in order.
  * For best results, all such nutrients ought to appear in the `target` list.
  * The consumed nutrients ought to be a subset of the target nutrients. */
  ofInterest: Array<NutrientName>;
}

/** Views nutrition facts as a 3-column table showing nutrient name, amount consumed, versus a
* target amount to consume. */
export default function NutritionProgressView({ consumed, target, ofInterest }: NutritionProgressProps) {
  if (!consumed || !target || !ofInterest) return null;

  const targetKeys = new Set(Object.keys(target));

  const innards = ofInterest.map((nutrientName) => {
    const consumedAmount = consumed?.[nutrientName]?.[0] ?? 0;
    const targetAmount = target?.[nutrientName]?.[0] ?? 0;
    const unit = target?.[nutrientName]?.[1] ?? '???'; // wut
    return <tr key={nutrientName} className="nutrient-list-item">
      <td className="nutrient-name"> {nutrientName} </td>
      <td className="nutrient-data">
        <span className="nutrient-amount">{consumedAmount.toFixed(0)} </span>
        <span className="nutrient-unit">{unit}</span>
      </td>
      <td className="nutrient-data">
        <span className="nutrient-amount">{targetAmount.toFixed(0)} </span>
        <span className="nutrient-unit">{unit}</span>
      </td>
    </tr>
  });

  return innards.length === 0 ? null : (
    <table className="nutrient-list">
      <tbody>
      { innards }
      </tbody>
    </table>
  );
}
