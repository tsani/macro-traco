import React, { useState, useEffect } from 'react';

import PersonalDayMacros from './PersonalDayMacros';

import { Consumer } from '../types';

/** Creates a history of dates going back in time from the given starting date.
 * The start date is not itself included in the history.
 * The given length is the length of the returned array. */
const makeHistory = (startDate: Date, length: number) => {
    const dates = [];
    for (let i = 0; i < length; i++) {
        startDate = new Date(startDate);
        startDate.setDate(startDate.getDate() - 1);
        dates.push(startDate);
        console.log(startDate);
    }
    return dates;
};

interface HistoryProps {
    consumer: keyof Consumer<any>;
    today: Date;
    length: number;
}

export default function History({ consumer, today, length }: HistoryProps) {
    const dates = makeHistory(today, length);

    const formatDate = (d: Date) => d.toLocaleDateString(
        'en-US',
        { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' },
    );

    return <>
        <h2> History </h2>
        {dates.map((date, i) =>
            <>
            <h3> { formatDate(date) } </h3>
            <PersonalDayMacros key={i} consumer={consumer} date={date} />
            </>
        )}
    </>;
}
