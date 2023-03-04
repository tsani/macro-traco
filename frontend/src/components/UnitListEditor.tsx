import React from 'react';

import { dynamicListWidget } from './ui';
import UnitEditor from './UnitEditor';

import { Unit } from '../types';
import { EMPTY_UNIT } from '../constants';

// Widget for constructing a list of units for a food, with gram equivalents.
const UnitListEditor = dynamicListWidget<Partial<Unit>>({
  renderOnEmpty: <p> No units in this food. </p>,
  renderAddItem: (addUnit: (u: Partial<Unit>) => void) =>
    <button
      type="button"
      onClick={() => addUnit({...EMPTY_UNIT})}>
      Add another unit
    </button>,
  renderItems: renderInside => <div className="unit-editor-list">{renderInside()}</div>,
  renderItem: (unit, index, setUnit) =>
    <UnitEditor key={index} unit={unit} setUnit={setUnit} />,
});
export default UnitListEditor;