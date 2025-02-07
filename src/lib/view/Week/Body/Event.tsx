import { PlanifyEvent } from "../../../types.ts";
import { useMemo, useRef, useState } from "react";
import {
    getEventDaySlot,
    getEventOffset,
    getEventSlotFromOffsets,
} from "../../../helpers/events.ts";
import { DateTime, Interval } from "luxon";
import Draggable from "react-draggable";
import { usePlanify } from "../../../contexts/Planify.context.tsx";
import useResize from "../../../hooks/useResize.ts";
import { getCurrentLocation } from "../../../helpers/location.ts";

type EventProps = {
    event: PlanifyEvent;
    day: DateTime;
}

const Event = ({ event, day }: EventProps) => {
    const { date, bounds, showWeekEnds, colWidth, rowHeight } = usePlanify();
    const ref = useRef<HTMLDivElement | null>(null);
    const [currentEvent, setCurrentEvent] = useState<PlanifyEvent>(event);
    const [isDragging, setIsDragging] = useState(false);

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

    const weekday = day.weekday - 1;

    const handleDragStop = (_, data) => {
        setIsDragging(false);
        const time = getEventSlotFromOffsets({
            height: bounds?.height,
            bottom: data.y + (offsets?.end - offsets?.start),
            top: data.y,
            day,
        });
        const { day: newDay } = getCurrentLocation({ date, boundLeft: data.x, dayWidth: colWidth });

        setCurrentEvent(prev => ({
            ...prev,
            start: time.start.set({
                year: newDay.year,
                month: newDay.month,
                day: newDay.day
            }),
            end: time.end.set({
                year: newDay.year,
                month: newDay.month,
                day: newDay.day
            })
        }));
    };

    const eventHeight = useMemo(() =>
            offsets?.end !== undefined && offsets?.start !== undefined
                ? offsets.end - offsets.start
                : 0
        , [offsets?.end, offsets?.start]);

    const numberOfVisibleDays = showWeekEnds ? 6 : 4;

    return (
        <>
            <Draggable
                bounds={{
                    left: -colWidth * weekday,
                    right: (numberOfVisibleDays - weekday) * colWidth,
                    top: 0,
                    bottom: (24 * 3) * rowHeight - eventHeight
                }}
                nodeRef={ref}
                grid={[colWidth, rowHeight]}
                position={{
                    x: 0,
                    y: offsets?.start || 0
                }}
                onStart={() => setIsDragging(true)}
                onStop={handleDragStop}
                disabled={!event.start.hasSame(event.end, "day")}
                handle=".planify-week--event--content"
            >
                <div
                    ref={ref}
                    style={{
                        height: `${eventHeight}px`,
                        width: `${colWidth}px`,
                        opacity: isDragging ? 0.7 : 1,
                        background: "#28bbb8"
                    }}
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
            </Draggable>
        </>
    );
};

export default Event;