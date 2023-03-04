import React from 'react';

import { CancelButton, TextField } from './ui';

import { Lens } from '../util';
import { Endo, Unit } from '../types';
import { useIntParser } from '../hooks';

export interface UnitEditorProps {
  unit: Partial<Unit>;
  setUnit: (f: null | Endo<Partial<Unit>>) => void;
}

export default function UnitEditor({
  unit,
  setUnit,
}: UnitEditorProps) {
  const lens = new Lens(unit, setUnit);
  const [ name, setName ] = lens.focus('name');
  const [ gramEquivalent, setGramEquivalent ] = lens.focus('gramEquivalent');
  const [ gramEquivalentText, setGramEquivalentText ] = useIntParser(
    gramEquivalent?.toString() ?? '',
    gramEquivalent ?? 0,
    (x) => setGramEquivalent(() => x),
  );

  return (
    <div className="unit-editor-item card">
      <CancelButton onCancel={() => setUnit(null)} />
      <div>
        <label>
          Unit name<br/>
          <TextField
            className="unit-name"
            value={name ?? ''}
            setValue={(x) => setName(() => x)}
            placeholder="Unit name"
            autoFocus
          />
        </label>
      </div>
      <div>
        <label>
          Gram equivalent<br/>
          <TextField
            className="unit-gram"
            value={gramEquivalentText}
            setValue={setGramEquivalentText}
            placeholder="Gram equivalent"/>
        </label>
      </div>
    </div>
  );
}
