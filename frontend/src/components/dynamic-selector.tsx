import React, { useState } from 'react';

export interface DynamicSelectorConfig<T, Props> {
    useResults(search: string, props: Props): T[];
    formatResult(obj: T, index: number, select: () => void): React.ReactElement;
    placeholder: string;
}

export type DynamicSelectorProps<T, Props> = Props & {
    onSelect: (x: T) => void;
}

// generates a _dynamic selector_, which is a text field that obtains
// a list of options from a data source.
// options:
// - useResults (function)
//   1. search terms (a string) and generates the list of choices
//   2. the whole props dictionary received by the generated component,
//      for further restricting the search results (statically)
// - formatResult (function)
//   formatResult(object, index, select)
//   - object: the object to format as HTML
//   - index: of the object
//   - select(): function that triggers selection of this object
// - placeholder (string)
//   The text to display as a placeholder in the input field.
//
// The generated component requires the following props:
// - onSelect (function)
//   receives the object selected by the user.
export default function dynamicSelector<T, Props>(
    { useResults, formatResult, placeholder }: DynamicSelectorConfig<T, Props>
) {
  return (props: DynamicSelectorProps<T, Props>) => {
    const [searchTerms, setSearchTerms] = useState('');
    const results = useResults(searchTerms, props);

    return (
      <div className="dynamic-selector">
        <div className="dropdown">
          <input
            autoFocus
            type="text"
            placeholder={placeholder}
            onChange={e => setSearchTerms(e.target.value)}
            value={searchTerms} />
        </div>
        <div
          tabIndex={-1}
          className={
            `dropdown-values ${!results.length ? 'dropdown-values-empty' : ''} `
          }
        >
          { results.map((result: T, i) =>
            formatResult(result, i, () => props.onSelect(result)))
          }
        </div>
      </div>
    );
  }
}