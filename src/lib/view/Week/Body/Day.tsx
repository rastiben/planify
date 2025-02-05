import { DateTime, Interval } from "luxon";
import { usePlanify } from "../../../contexts/Planify.context.ts";
import Event from "./Event.tsx";
import { useMemo, useRef, useState } from "react";
import { getEventDaySlot, getEventOffset } from "../../../helpers/events.ts";
import useResizeObserver from "use-resize-observer";

type DayProps = {
    day: DateTime;
}

const Day = ({ day }: DayProps) => {
    const { events, selectedRange } = usePlanify();
    const ref = useRef<HTMLDivElement | null>(null);
    const date = DateTime.now();
    const range = Interval.fromDateTimes(date.startOf("day"), date.endOf("day"));
    const [height, setHeight] = useState<number | undefined>(undefined);

    useResizeObserver({
        ref: document.body,
        onResize: () => {
            const height = ref.current?.parentElement?.clientHeight;
            setHeight(height);
        }
    });

    const daySlots = events[day.toISODate()];

    const selectedRangeSlot = useMemo(() => {
        if (!selectedRange) return undefined;
        if (selectedRange?.overlaps(Interval.fromDateTimes(day.startOf("day"), day.endOf("day")))) {
            return getEventDaySlot(selectedRange, day);
        }
        return undefined;
    }, [day, selectedRange]);

    const offsets = useMemo(() => {
        if (!selectedRangeSlot) return undefined;
        return getEventOffset({ height, start: selectedRangeSlot.start!, end: selectedRangeSlot.end! });
    }, [selectedRangeSlot, height]);

    return (
        <div ref={ref} className="planify-week--body--day">
            {selectedRangeSlot && (
                <div style={{ transform: `translateY(${offsets?.start}px)`, height: `${offsets?.end - offsets?.start}px` }} className="planify-week--selected-range" />
            )}
            <div className="planify-week--events">
                {daySlots?.map((event) => {
                    return <Event key={event.id} event={event} day={day}/>;
                })}
            </div>
            {range.splitBy({hour: 1}).map((time) => {
                return <div className="planify-week--body--day-row" key={time.toFormat("yyyy-MM-dd HH:mm")}></div>
            })}
        </div>
    )
};

export default Day;