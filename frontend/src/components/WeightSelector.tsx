import React from 'react';

import { withLoading } from "./util";
import { Spinner } from './ui';

import { Lens } from '../util';
import { Weight, Setter } from '../types';
import { QuantifiedWeightForm } from '../form';
import { useIntParser } from '../hooks';

interface WeightSelectorProps {
  handleFocus: (state: boolean) => void;
  quantifiedWeight: QuantifiedWeightForm;
  setQuantifiedWeight: Setter<QuantifiedWeightForm>;
  weights: Weight[];
  edibleId: number;
}

const WeightSelector =
  withLoading(
    Spinner,
    ({ handleFocus, quantifiedWeight, weights, setQuantifiedWeight, edibleId }: WeightSelectorProps) => {
      const lens = new Lens(quantifiedWeight, setQuantifiedWeight);
      const [ amount, setAmount ] = lens.focus('amount');
      const [ seqNum, setSeqNum ] = lens.focus('seq_num');

      const [ amountText, setAmountText ] = useIntParser('', amount ?? 0, (x) => setAmount(() => x));
      const [ seqNumText, setSeqNumText ] = useIntParser('', seqNum ?? 0, (x) => setSeqNum(() => x));

      return (
        <div className="weight-picker">
          <input
            type="text"
            name="amount"
            onFocus={() => handleFocus(true)}
            onBlur={() => handleFocus(false)}
            value={amountText}
            onChange={(e) => setAmountText(e.target.value)}
          />
          <select
            name="seq_num"
            onFocus={() => handleFocus(true)}
            onBlur={() => handleFocus(false)}
            onChange={e => setSeqNumText(e.target.value)}
          >
            { weights.map((unit: Weight) =>
              <option
                key={`${edibleId}-${unit.seq_num}`}
                value={unit.seq_num}
                onFocus={() => handleFocus(true)}
                onBlur={() => handleFocus(false)}
              >
                {unit.name}
              </option>)
            }
      </select>
    </div>
      );
    });
export default WeightSelector;