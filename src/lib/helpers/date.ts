import { DateTime } from "luxon";

type RoundingInterval = 'hour' | 'quarter';

interface IntervalMap {
    [key: string]: number;
    hour: number;
    quarter: number;
}

export const roundDateTime = (date: DateTime, roundTo: RoundingInterval | number = 60): DateTime => {
    const intervals: IntervalMap = {
        'hour': 60,
        'quarter': 15
    };

    const interval = typeof roundTo === 'string'
        ? (intervals[roundTo] || 60)
        : roundTo;

    const minutes = date.minute;
    const roundedMinutes = Math.floor(minutes / interval) * interval;

    return date.set({
        minute: roundedMinutes,
        second: 0,
        millisecond: 0
    });
};