import React from 'react';

import PersonalDayMacros from './PersonalDayMacros';

export type DayMacrosProps<Props> = Props & { consumers: string[], counter: number };

export default function DayMacros<Props>({ consumers, counter } : DayMacrosProps<Props>) {
    const p = { datacounter: counter };
    return <div className="day-macros" {...p} >
        { consumers.map(
            consumer =>
              <PersonalDayMacros key={consumer} consumer={consumer} />)
        }
    </div>;
}