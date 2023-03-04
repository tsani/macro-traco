import { useState, useEffect } from 'react';

import { AnyEdible, Edible, Weight, NutritionFacts, Nutrient, QuantifiedWeight } from './types';
import { RECIPE_WEIGHTS } from './constants';

import {
  getConsumerNutrients,
  getNutritionFacts,
  getSearchResults,
  getFoodWeights,
  getNutrients,
} from './api';
import { isDef } from './util';

export function useNutritionFacts<Kind extends 'food' | 'recipe'>(
    edible: Partial<Edible<Kind>>,
    weight: Partial<QuantifiedWeight>,
): NutritionFacts {
  const [ nutrients, setNutrients ] = useState<NutritionFacts>({});

  useEffect(() => {
    (async () => {
      console.log(`useNutritionFacts: ${JSON.stringify({edible, weight})}`);
      const { id, type } = edible;
      const { amount, seq_num } = weight;
      if (!isDef(id) || !isDef(type) || !isDef(amount) || !isDef(seq_num)) return;
      if (amount < 0) return;
      const nutritionFacts = await getNutritionFacts({
        id: id,
        type: type,
        seq_num: seq_num,
        amount: amount
      });

      setNutrients(() => nutritionFacts);
    })()
  }, [edible, weight]);

  return nutrients;
}

export function useConsumerNutrients(consumer: string) {
  const [ nutrients, setNutrients ] = useState({});

  useEffect(() => {
    (async () => {
      if(!consumer) return;
      const start = new Date();
      start.setHours(4, 0, 0, 0)
      const end = new Date();
      end.setHours(28, 0, 0, 0)
      setNutrients(await getConsumerNutrients({ consumer, start, end }));
    })()
  }, [consumer]);

  return nutrients;
}

export function useEdibleSearch<Kind>(searchTerms: string, restrictTo?: Kind) {
  const [edibles, setEdibles] = useState<Edible<Kind>[]>([]);

  useEffect(() => {
    if(!searchTerms || searchTerms.length < 3) return setEdibles([]);
    getSearchResults<Kind>({ for: searchTerms, restrict_to: restrictTo as any}).then(
      setEdibles,
    );
  }, [searchTerms, restrictTo]);

  return edibles;
}

export function useEdibleWeights<Kind>(edible: Partial<Edible<Kind>> | undefined) {
  const [weights, setWeights] = useState<Weight[]>([]);

  useEffect(() => {
    if ('undefined' === typeof edible) return setWeights(() => []);
    if (edible.type === 'recipe') return setWeights(() => RECIPE_WEIGHTS)

    const id = edible.id;
    if ('undefined' === typeof id) return;

    getFoodWeights({ id }).then(setWeights)
  }, [edible]);

  return weights;
}

export function useNutrientSearch(search: string) {
  const [ nutrients, setNutrients ] = useState<Nutrient[]>([]);
  useEffect(() => {
      getNutrients({ search }).then((x) => setNutrients(x))
  }, [search]);
  return nutrients;
}

function useParser<Src, Dst>(
  initialSrc: Src,
  dst: Dst,
  setDst: (x: Dst) => void,
  isSame: (x: Dst, y: Dst) => boolean,
  parse: (x: Src) => Dst | null,
): readonly [Src, (x: Src) => void] {
  const [src, setSrc] = useState(initialSrc);
  useEffect(() => {
    const newDst = parse(src);
    if (null !== newDst && !isSame(newDst, dst)) setDst(newDst);
  }, [src, setDst]);
  return [src, setSrc] as const;
}

/**
 * A wrapper around a string state that parses it to an int
 * and calls a given function each time the parse succeeds.
 * @param setInt The function to call when parsing as an int succeeds.
 * @returns
 */
export function useIntParser(
  initialText: string,
  int: number,
  setInt: (x: number) => void,
): readonly [string, (x: string) => void] {
  return useParser(
    initialText,
    int,
    setInt,
    (x, y) => x === y,
    (x) => {
      const result = parseInt(x);
      return isNaN(result) ? null : result;
    },
  );
}

export function useFloatParser(
  initialText: string,
  float: number,
  setFloat: (x: number) => void,
): readonly [string, (x: string) => void] {
  return useParser(
    initialText,
    float,
    setFloat,
    (x, y) => x === y,
    (x) => {
      const result = parseFloat(x);
      return isNaN(result) ? null : result;
    }
  )
}