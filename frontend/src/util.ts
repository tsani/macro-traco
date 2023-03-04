import { MACRO_KEYS } from "./constants";
import { Setter } from './types';

export function changingAt<T>(array: T[], i: number, f: (x: T) => T): T[] {
  const copy = [...array];
  copy[i] = f(copy[i]);
  return copy;
};

export function deletingAt<T>(array: T[], i: number): T[] {
  const dup = [...array];
  dup.splice(i, 1);
  return dup;
}

export class Lens<T extends Record<string, any>> {
  constructor(private value: T, private setter: Setter<T>) {}

  public focus<K extends keyof T>(key: K): readonly [T[K], Setter<T[K]>] {
    return [
      this.value[key],
      (f) => this.setter((obj: T): T => ({ ...obj, [key]: f(obj[key]) })),
    ] as const;
  }
}

// Filters a nutrients object to contain only macronutrients (and energy)
export const onlyMacros = <T>(nutrients: Record<string, T>) => {
  let res: Record<string, T> = {}
  for (const k of MACRO_KEYS) {
    if(k in nutrients) res[k] = nutrients[k]
  }
  return res
}

export const optionalFunction =
  <T>(f: undefined | ((x: T) => void)): (x: T) => void =>
  undefined !== f ? f : () => { return; };

export function all<T>(a: (T | null)[]): T[] | null {
  let b: T[] = [];
  for (const x of a) {
    if (null === x) return null;
    b.push(x);
  }
  return b;
}

export async function bracket<T>(setState: (state: boolean) => void, action: () => Promise<T>): Promise<T> {
  setState(true);
  try {
    return await action();
  } finally {
    setState(false);
  }
}

export function isDef<T>(x: T | undefined): x is T {
  return 'undefined' !== typeof x;
}
