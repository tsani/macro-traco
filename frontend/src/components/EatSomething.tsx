import React from 'react';

import WeightedEdibleSelector from './WeightedEdibleSelector';

import { EnableIf } from './util';
import { TextField } from './ui';

import { Lens } from '../util';
import { Setter } from '../types';
import { EatenForm } from '../form';

export interface EatSomethingProps {
  eaten: EatenForm<'food' | 'recipe'>;
  setEaten: Setter<EatenForm<'food' | 'recipe'>>;
  resetEaten: () => void;
  onSubmit: (eaten: EatenForm<'food' | 'recipe'>) => void;
}

export default function EatSomething({eaten, setEaten, resetEaten, onSubmit}: EatSomethingProps) {
  const lens = new Lens(eaten, setEaten);
  const [ consumer, setConsumer ] = lens.focus('consumer');
  const [ weightedEdible, setWeightedEdible] = lens.focus('weightedEdible');

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(eaten) }}>
      <WeightedEdibleSelector
        weightedEdible={weightedEdible}
        setWeightedEdible={setWeightedEdible}
        resetWeightedEdible={resetEaten}
      />
      <EnableIf
        condition={weightedEdible.edible && (weightedEdible.weight.amount ?? 0) > 0}
      >
        <label>
          <span className="label-text">Consumer</span>
          <TextField
            value={consumer}
            setValue={(x) => setConsumer(() => x)}
            placeholder="Your name" />
        </label>
        <EnableIf condition={eaten.consumer.length > 0}>
          <div><input type="submit" value="I ate it!" onSubmit={() => onSubmit(eaten)} /></div>
        </EnableIf>
      </EnableIf>
    </form>
  );
}
