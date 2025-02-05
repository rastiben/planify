import { DateTime } from "luxon";

type RoundingInterval = 'hour' | 'quarter';

interface IntervalMap {
    [key: string]: number;
    hour: number;
    quarter: number;
}

const intervals: IntervalMap = {
    'hour': 60,
    'quarter': 15
};

export const getIntervalToRoundTo = (roundTo: RoundingInterval | number = 60) => {
    return typeof roundTo === 'string'
        ? (intervals[roundTo] || 60)
        : roundTo;
};

export const getUpdatedRoundedDate = (date: DateTime, roundedMinutes: number) => {
    return date.set({
        minute: roundedMinutes,
        second: 0,
        millisecond: 0
    });
};

export const floorDateTime = (date: DateTime, roundTo: RoundingInterval | number = 60): DateTime => {
    const interval = getIntervalToRoundTo(roundTo);

    const minutes = date.minute;
    const roundedMinutes = Math.floor(minutes / interval) * interval;

    return getUpdatedRoundedDate(date, roundedMinutes)
};

export const ceilDateTime = (date: DateTime, roundTo: RoundingInterval | number = 60): DateTime => {
    const interval = getIntervalToRoundTo(roundTo);

    const minutes = date.minute;
    const roundedMinutes = Math.ceil(minutes / interval) * interval;

    return getUpdatedRoundedDate(date, roundedMinutes)
};