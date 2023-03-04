import React from 'react';

import { dynamicSelector } from './ui';

import { useEdibleSearch } from '../hooks';

import { Edible } from '../types';

interface EdibleLabelProps {
  label: string;
  handleClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const EdibleLabel = ({ label, handleClick }: EdibleLabelProps) =>
    <button
      type="button"
      className="edible"
      onClick={e => handleClick(e)}
    >
      {label}
    </button>;

export default function makeEdibleSelector<Kind>() {
  return dynamicSelector<Edible<Kind>, { restrictTo?: string }>({
    placeholder: "Type to find a food or recipe...",
    useResults: (terms, props) =>
      useEdibleSearch<Kind>(
        terms, 
        props.restrictTo as Kind | undefined,
      ),
    formatResult: (edible, i, select) =>
      <EdibleLabel
        key={`${edible.type}-${edible.id}`}
        label={edible.name}
        handleClick={() => select()}
      />
  });
}