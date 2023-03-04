import React, { HTMLAttributes, InputHTMLAttributes, useState } from 'react';

import dynamicListWidget from './dynamic-list-widget';
export { dynamicListWidget };

import dynamicSelector from './dynamic-selector';
export { dynamicSelector };

import { Setter } from '../types';

export function Spinner() {
  return <span className="lds-dual-ring"></span>;
}

// Component that renders an X floating to the right.
// When clicked, calls onCancel.
export const CancelButton = ({ onCancel }: { onCancel: () => void }) =>
  <span
    className="cancel-button"
    onClick={() => onCancel()}>
    X
  </span>;

export interface TextFieldProps {
  value: string;
  setValue: (text: string) => void;
}

// Creates an editable text field
export function TextField<T extends TextFieldProps>({ setValue, value, ...props }: T & InputHTMLAttributes<unknown>) {
  return <input
    value={value}
    onChange={e => setValue(e.target.value)}
    {...props} />;
}

export interface CheckBoxProps {
  setValue: (state: boolean) => void;
  value: boolean;
}

export function CheckBox<T extends CheckBoxProps>({ setValue, value, ...props }: T & InputHTMLAttributes<unknown>) {
  return <input
    type="checkbox"
    checked={value}
    onChange={e => setValue(e.target.checked)}
    {...props} />;
}