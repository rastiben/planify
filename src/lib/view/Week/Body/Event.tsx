import { PlanifyEvent } from "../../../types.ts";
import { useMemo, useState } from "react";
import {
    getEventDaySlot,
    getEventOffset,
} from "../../../helpers/events.ts";
import { DateTime, Interval } from "luxon";
import { usePlanify } from "../../../contexts/Planify.context.tsx";
import useResize from "../../../hooks/useResize.ts";
import useDraggable from "../../../hooks/useDraggable.ts";

type EventProps = {
    event: PlanifyEvent;
    day: DateTime;
}

const Event = ({ event, day }: EventProps) => {
    const { bounds, colWidth, rowHeight } = usePlanify();
    const [currentEvent, setCurrentEvent] = useState<PlanifyEvent>(event);

    const { ref, isDragging } = useDraggable({ event, grid: { x: colWidth, y: rowHeight } });

    const { ref: topResizeRef } = useResize({
        onResize: (date) => {
            let computedDate = date;

            if (computedDate >= currentEvent.end) return;

            computedDate = computedDate < day.startOf("day") ? day.startOf("day") : computedDate;

            setCurrentEvent(prev => ({
                ...prev,
                start: computedDate
            }));
        }
    });
    const { ref: bottomResizeRef } = useResize({
        onResize: (date) => {
            let computedDate = date.plus({ minutes: 15 });

            if (computedDate <= currentEvent.start) return;

            computedDate = computedDate > day.endOf("day") ? day.endOf("day") : computedDate;

            setCurrentEvent(prev => ({
                ...prev,
                end: computedDate
            }));
        }
    });

    const { start, end } = useMemo(() => {
        return getEventDaySlot(Interval.fromDateTimes(currentEvent.start, currentEvent.end), day);
    }, [day, currentEvent]);

    const offsets = useMemo(() => {
        return getEventOffset({ height: bounds?.height, start, end });
    }, [end, bounds, start]);

    const eventHeight = useMemo(() =>
            offsets?.end !== undefined && offsets?.start !== undefined
                ? offsets.end - offsets.start
                : 0
        , [offsets?.end, offsets?.start]);

    return (
        <div
            style={{
                height: `${eventHeight}px`,
                opacity: isDragging ? 0.7 : 1,
                transform: `translateY(${offsets?.start || 0}px)`,
                background: "#28bbb8"
            }}
            ref={ref}
            className="planify-week--event"
        >
            {day.hasSame(event.start, "day") && (
                <div
                    ref={topResizeRef}
                    className="planify-week--event--resizearea planify-week--event--resizearea__top"
                />
            )}
            <div className="planify-week--event--content">
                <div className="p-2">
                    {currentEvent.start.toFormat("dd-MM-yyyy")} - {currentEvent.end.toFormat("dd-MM-yyyy")}
                </div>
            </div>
            {day.hasSame(event.end, "day") && (
                <div
                    ref={bottomResizeRef}
                    className="planify-week--event--resizearea planify-week--event--resizearea__bottom"
                />
            )}
        </div>
    );
};

export default Event;