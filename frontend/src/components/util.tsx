import React, { PropsWithChildren } from 'react';
import { Component } from '../types';

// Basic component that renders its children only when a condition is
// true.
export const EnableIf = (props: PropsWithChildren<{ condition: boolean }>) => {
  if (props.condition)
    return <>{props.children}</>;
  else
    return <></>;
};

export type LoadingProps<Props> = Props & { ready: boolean };

// Higher-order component that provides a "loading" behaviour.
// When the prop "ready" is falsy, the LoadingComponent is rendered.
// When the prop "ready" is truthy, the LoadedComponent is rendered.
export function withLoading<Props>(
  LoadingComponent: Component<LoadingProps<Props>>,
  LoadedComponent: Component<LoadingProps<Props>>,
) {
  return (props: LoadingProps<Props>) => {
    if (props.ready)
      return <LoadedComponent {...props} />;
    else
      return <LoadingComponent {...props} />;
  }
}

