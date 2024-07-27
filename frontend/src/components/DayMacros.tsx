import React from 'react';

import PersonalDayMacros from './PersonalDayMacros';

import { Consumer } from '../types';

export type DayMacrosProps<Props> = Props &
  { consumers: (keyof Consumer<any>)[], counter: number, date: Date | null };

export default function DayMacros<Props>({ consumers, counter, date } : DayMacrosProps<Props>) {
    const p = { datacounter: counter };
    return <div className="day-macros" {...p} >
        { consumers.map(
            consumer =>
              <PersonalDayMacros key={consumer} consumer={consumer} date={date} />)
        }
    </div>;
}
