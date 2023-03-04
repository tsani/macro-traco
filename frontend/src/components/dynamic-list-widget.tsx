
import React from 'react';

import { Setter, Endo } from '../types';
import { deletingAt, changingAt } from '../util';

export interface DynamicListWidgetConfig<T> {
  renderOnEmpty: React.ReactElement;
  renderItems: (renderInner: () => React.ReactElement) => React.ReactElement;
  renderItem: (
    item: T,
    index: number,
    renderInner: (f: Endo<T> | null) => void,
  ) => React.ReactElement;
  renderAddItem: any;
}

export interface DynamicListWidgetProps<T> {
  items: T[];
  setItems: Setter<T[]>;
}

export type DynamicListWidget<T> =
  (props: DynamicListWidgetProps<T>) => React.ReactElement;

export default function dynamicListWidget<T>({
  renderOnEmpty, // element to render when the list is empty (optional)

  renderItems, // function that renders the list (optional)
  // If this is omitted, then the list is wrapped in a <div>
  // renderItems(renderInside)
  // - renderInside(): renders the inside of the list

  renderItem, // function that renders a single item
  // renderItem(item, index, setItem)
  // - setItem: function that replaces the item or modifies the item
  //   at this index. Passing undefined will delete the item.

  renderAddItem, // function that renders a widget to add a new item
  // renderAddItem(addItem)
  // - addItem: appends the given item to the list of items
}: DynamicListWidgetConfig<T>): DynamicListWidget<T> {
  return ({
    items, // the items to render
    setItems, // function to replace or modify the array of items
  }) => {
    if(items.length === 0 && renderOnEmpty)
      return <>
        { renderOnEmpty }
        { renderAddItem((item: T) => setItems((items: T[]): T[] => [...items, item])) }
      </>;
    else {
      return (
        <>
          {renderItems(() =>
            <>
            {items.map((item: T, index: number) =>
              renderItem(item, index, (f) =>
                setItems((items: T[]) =>
                  f === null ?
                  deletingAt(items, index) :
                  changingAt(items, index, f)
                )
              )
            )}
            </>
          )}
          { renderAddItem((item: T) =>
            setItems((items: T[]): T[] => [...items, item])
          )}
        </>
      );
    }
  };
}
