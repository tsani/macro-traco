import React from 'react';

import { useConsumerNutrients } from '../hooks';

import NutritionFacts from './NutritionFactsView';

import { onlyMacros } from '../util';

interface PersonalDayMacrosProps {
    consumer: string
}

export default function PersonalDayMacros({ consumer }: PersonalDayMacrosProps) {
  const nutrients = useConsumerNutrients(consumer);
  if(Object.keys(nutrients).length)
    return (
      <div className="personal-day-macros">
        <p>{consumer}</p>
        <NutritionFacts nutrients={onlyMacros(nutrients)}/>
      </div>
    );
  else
    return <>{}</>;
}
