import React from 'react';

import { useConsumerNutrients } from '../hooks';
import { Consumer } from '../types';
import NutritionProgressView from './NutritionProgressView';
import { onlyMacros } from '../util';

import {
  MACRO_NAMES,
  KCAL_PER_G,
  MACROS,
  CONSUMER_MACRO_SPLIT,
  CONSUMER_ENERGY_TARGET,
} from '../constants';
import { Macros, NutritionFacts, Energy, MacroSplit, MacroGoal } from '../types';

interface PersonalDayMacrosProps {
    consumer: keyof Consumer<any>;
    date: Date | null;
}

const decomposeMacrosToEnergy = (nutritionFacts: NutritionFacts): Macros<Energy> => {
  const macroToEnergy = <K extends keyof Macros<any>>(key: K): number =>
    (nutritionFacts[MACRO_NAMES[key]]?.[0] ?? 0) * KCAL_PER_G[key];
  return {
    carbs: macroToEnergy('carbs'),
    fat: macroToEnergy('fat'),
    protein: macroToEnergy('protein'),
  }
};

const calculateMacrosEnergy = (macros: Macros<Energy>) => macros.carbs + macros.fat + macros.protein;

const macroGoalFromSplit = (totalEnergy: Energy, split: MacroSplit): MacroGoal => {
  const calc = <K extends keyof Macros<any>>(key: K): [Energy, Energy] =>
    [totalEnergy * split[key][0], totalEnergy * split[key][1]];
  return {
    protein: calc('protein'),
    fat: calc('fat'),
    carbs: calc('carbs'),
  };
};

const sumMacroGoal = (g: MacroGoal): [Energy, Energy] => [
  g.protein[0] + g.carbs[0] + g.fat[0],
  g.protein[1] + g.carbs[1] + g.fat[1],
]

interface MacroLineProps {
  name: keyof Macros<any>;
  energy: Energy;
  energyTarget: [Energy, Energy];
  totalEnergyTarget: Energy;
}

function MacroLine({ name, energy, energyTarget, totalEnergyTarget }: MacroLineProps) {
  const loPercent = energy / energyTarget[0] * 100;
  const hiPercent = energy / energyTarget[1] * 100;

  return (
    <div
      style={{ width: `{energyTarget[1] / totalEnergyTarget * 100}%`}}
      className="macro-line">
      <div className={name} style={{ width: `{hiPercent}%` }}></div>
      <div className="lo-percent" style={{ width: `{loPercent}%` }}></div>
    </div>
  );
}

function nutritionFactsFromMacroGoal(goal: MacroGoal): NutritionFacts {
  return {
    [MACRO_NAMES.fat]: [goal.fat[0] / KCAL_PER_G.fat, 'g'],
    [MACRO_NAMES.carbs]: [goal.carbs[0] / KCAL_PER_G.carbs, 'g'],
    [MACRO_NAMES.protein]: [goal.protein[0] / KCAL_PER_G.protein, 'g'],
  };
}

export default function PersonalDayMacros({ consumer, date }: PersonalDayMacrosProps) {
  const nutrition = useConsumerNutrients(consumer, date);
  const macros = decomposeMacrosToEnergy(nutrition);
  const energy = calculateMacrosEnergy(macros);
  const goal = macroGoalFromSplit(
    CONSUMER_ENERGY_TARGET[consumer],
    CONSUMER_MACRO_SPLIT[consumer],
  );
  const target = nutritionFactsFromMacroGoal(goal);
  if (!Object.keys(nutrition).length) return <>{}</>;

  return (
    <div className="personal-day-macros">
      <div>
        <span className="consumer-name">{consumer}</span>
        <span className="energy-ratio"> <span className="numerator">{Math.floor(energy)}</span> / <span className="denominator">3000</span> kcal</span>
        <NutritionProgressView
          consumed={onlyMacros(nutrition)}
          target={target}
          ofInterest={[MACRO_NAMES.protein, MACRO_NAMES.carbs, MACRO_NAMES.fat]} />
      </div>
    </div>
  );
      // // REMOVING macro line for now because it's ugly and doesn't work
      // { MACROS.map((macro) =>
      //   <MacroLine
      //     key={macro}
      //     totalEnergyTarget={CONSUMER_ENERGY_TARGET[consumer]}
      //     name={macro}
      //     energy={macros[macro]}
      //     energyTarget={goal[macro]}
      //   />)
      // }
}
