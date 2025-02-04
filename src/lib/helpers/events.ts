import { PlanfiyDaySlots, PlanifyEvent } from "../types.ts";
import { DateTime, Interval } from "luxon";
import { CALENDAR_MAX_TIME } from "../constants.ts";

export const getSlotsByDays = (events: PlanifyEvent[]) => {
    return events.reduce<PlanfiyDaySlots>((acc, event) => {
        const interval = Interval.fromDateTimes(event.start, event.end);
        interval.splitBy({ day: 1 }).forEach((day) => {
            if (!acc[(day.start!).toISODate()]) acc[(day.start!).toISODate()] = [];
            acc[(day.start!).toISODate()] = [...acc[(day.start!).toISODate()], event];
        });
        return acc;
    }, {})
};

const timeToNumber = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return DateTime.now().set({ hour: hours, minute: mins });
};

export const getEventOffset = ({ height, start, end }: { height: number | undefined; start: DateTime; end: DateTime }) => {
    if (!height) return null;

    const maxTime = timeToNumber(CALENDAR_MAX_TIME);
    const startTime = timeToNumber(start.set({ second: 0 }).toFormat("HH:mm"));
    const endTime = timeToNumber(end.set({ second: 0 }).toFormat("HH:mm"));

    const offsetStart = (startTime / maxTime) * height;
    const offsetEnd = (endTime / maxTime) * height;

    return {
        end: offsetEnd,
        start: offsetStart,
    };
};

export const getEventTimeFromOffsets = ({
    top,
    bottom,
    height
}: {
    top?: number | null;
    bottom?: number | null;
    height: number | undefined;
}) => {
    const maxTime = timeToNumber(CALENDAR_MAX_TIME);
    const offsetStart = (top * maxTime) / height;
    const offsetEnd = (bottom * maxTime) / height;

    return {
        start: minutesToTime(offsetStart),
        end: minutesToTime(offsetEnd)
    };
};


export const getEventDaySlot = (event: PlanifyEvent, date: DateTime) => {
    const isStartDate = event.start.hasSame(date, "day");
    const isEndDate = event.end.hasSame(date, "day");

    if (isStartDate && isEndDate) {
        return {
            start: event.start,
            end: event.end,
        }
    }

    if (isStartDate) {
        return {
            start: event.start,
            end: date.endOf("day"),
        }
    }

    if (isEndDate) {
        return {
            start: date.startOf("day"),
            end: event.end,
        }
    }

    return {
        start: date.startOf("day"),
        end: date.endOf("day"),
    };
};