import React, { useState, useEffect } from 'react';

import DayMacros from './DayMacros';
import EatSomething from './EatSomething';
import History from './History';

import { Spinner }  from './ui';
import { EnableIf } from './util';

import { postEat } from '../api';
import { EATEN_FORM, EatenForm, validateEatenForm } from '../form';

export default function MacroTraco() {
  const [ eaten, setEaten ] =
    useState({ ...EATEN_FORM<'food' | 'recipe'>() });
  const [ submitting, setSubmitting ] = useState(false);
  const [ error, setError ] = useState(false);
  const [ counter, setCounter ] = useState(0);
  const [ today, setToday ] = useState(new Date());

  const handleSubmit = (eatenForm: EatenForm<'food' | 'recipe'>) => {
    const eaten = validateEatenForm(eatenForm);
    if (null === eaten) {
      console.log('fug');
      return;
    }
    postEat(eaten)
      .then(
        res => {
          setError(!res.ok);
          if(res.ok) {
            setEaten({...EATEN_FORM()});
            setCounter(x => x+1);
          }
        },
        e => { setError(true); throw e; }
      );
  };

  if(!submitting) {
    return (
      <div>
        <h1>Macro-Traco</h1>
        <DayMacros date={today} counter={counter} consumers={['jake', 'eric', 'test']}/>
        <div>
          <h2> Eat something? </h2>
          <EnableIf condition={error}>
            <p>Uh-oh, something went wrong!</p>
          </EnableIf>
          <EatSomething
            eaten={eaten}
            setEaten={setEaten}
            onSubmit={handleSubmit}
            resetEaten={() => setEaten({...EATEN_FORM()})}
          />
        </div>
        <History consumer="jake" today={today} length={7} />
      </div>
    );
  }
  else {
    return <Spinner/>
  }
}
