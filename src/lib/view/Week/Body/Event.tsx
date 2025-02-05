import { PlanifyEvent } from "../../../types.ts";
import { useMemo, useRef, useState } from "react";
import { getEventDaySlot, getEventOffset, getEventTimeFromOffsets } from "../../../helpers/events.ts";
import useResizeObserver from "use-resize-observer";
import { DateTime, Interval } from "luxon";
import Draggable from "react-draggable";
import { usePlanify } from "../../../contexts/Planify.context.ts";

type EventProps = {
    event: PlanifyEvent;
    day: DateTime;
}

const Event = ({ event, day }: EventProps) => {
    const { date } = usePlanify();
    const ref = useRef<HTMLDivElement | null>(null);
    const topResizeRef = useRef<HTMLDivElement | null>(null);
    const bottomResizeRef = useRef<HTMLDivElement | null>(null);

    const [parentHeight, setParentHeight] = useState<number | undefined>(undefined);
    const [currentEvent, setCurrentEvent] = useState<PlanifyEvent>(event);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);

    const { start, end } = useMemo(() => {
        return getEventDaySlot(Interval.fromDateTimes(currentEvent.start, currentEvent.end), day);
    }, [day, currentEvent]);

    const offsets = useMemo(() => {
        return getEventOffset({ height: parentHeight, start, end });
    }, [end, parentHeight, start]);

    useResizeObserver({
        ref: document.body,
        onResize: () => {
            const height = ref.current?.parentElement?.clientHeight;
            setParentHeight(height);
        }
    });

    const dayWidth = document.querySelector(".planify-week--body--day")?.getBoundingClientRect?.()?.width || 0;
    const rowHeight = document.querySelector(".planify-week--body--day-row")?.getBoundingClientRect?.()?.height || 0;

    const weekday = day.weekday - 1;

    const handleDragStop = (_, data) => {
        setIsDragging(false);
        const time = getEventTimeFromOffsets({
            height: parentHeight,
            bottom: data.y + (offsets?.end - offsets?.start),
            top: data.y
        });
        const newDay = date.startOf("week").plus({ days: Math.round(data.x / dayWidth) });

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

    const handleResizeStart = (position: 'top' | 'bottom') => () => {
        setIsResizing(true);
    };

    const handleResize = (position: 'top' | 'bottom') => (e, data) => {
        if (position === 'bottom') {
            const time = getEventTimeFromOffsets({
                height: parentHeight,
                bottom: (offsets?.start || 0) + (offsets?.end - offsets?.start) + data.deltaY,
                top: offsets?.start || 0
            });

            setCurrentEvent(prev => ({
                ...prev,
                end: time.end
            }));
        } else {
            const time = getEventTimeFromOffsets({
                height: parentHeight,
                bottom: offsets?.end || 0,
                top: (offsets?.start || 0) + data.deltaY
            });

            setCurrentEvent(prev => ({
                ...prev,
                start: time.start
            }));
        }
    };

    const handleResizeStop = (position: 'top' | 'bottom') => () => {
        setIsResizing(false);
        // Here you can call your update function
        // onEventUpdate(currentEvent);
    };

    const height = useMemo(() =>
            offsets?.end !== undefined && offsets?.start !== undefined
                ? offsets.end - offsets.start
                : 0
        , [offsets?.end, offsets?.start]);

    return (
        <>
            <Draggable
                axis="y"
                grid={[rowHeight, rowHeight]}
                bounds={{
                    top: 0,
                    bottom: offsets?.end - rowHeight
                }}
                nodeRef={topResizeRef}
                onStart={handleResizeStart('top')}
                onDrag={handleResize('top')}
                onStop={handleResizeStop('top')}
                position={{
                    x: 0,
                    y: offsets?.start || 0
                }}
            >
                <div
                    ref={topResizeRef}
                    className="planify-week--event--resizearea planify-week--event--resizearea__top"
                    style={{
                        opacity: isResizing ? 0.5 : 0.2
                    }}
                />
            </Draggable>
            <Draggable
                bounds={{
                    left: -dayWidth * weekday,
                    right: (6 - weekday) * dayWidth,
                    top: 0,
                    bottom: 24 * rowHeight - height
                }}
                nodeRef={ref}
                grid={[dayWidth, rowHeight]}
                position={{
                    x: 0,
                    y: offsets?.start || 0
                }}
                onStart={() => setIsDragging(true)}
                onStop={handleDragStop}
                handle=".planify-week--event--content"
                disabled={isResizing}
            >
                <div
                    ref={ref}
                    style={{
                        height: `${height}px`,
                        width: `${dayWidth}px`,
                        opacity: isDragging ? 0.7 : 1,
                        background: "#28bbb8"
                    }}
                    className="planify-week--event"
                >
                    <div className="planify-week--event--content">
                        <div className="p-2">
                            {currentEvent.start.toFormat("dd-MM-yyyy")} - {currentEvent.end.toFormat("dd-MM-yyyy")}
                        </div>
                    </div>
                </div>
            </Draggable>
            <Draggable
                axis="y"
                grid={[rowHeight, rowHeight]}
                bounds={{
                    top: offsets?.start + rowHeight,
                    bottom: 24 * rowHeight
                }}
                nodeRef={bottomResizeRef}
                onStart={handleResizeStart('bottom')}
                onDrag={handleResize('bottom')}
                onStop={handleResizeStop('bottom')}
                position={{
                    x: 0,
                    y: offsets?.end || 0
                }}
            >
                <div
                    ref={bottomResizeRef}
                    className="planify-week--event--resizearea planify-week--event--resizearea__bottom"
                    style={{
                        opacity: isResizing ? 0.5 : 0.2
                    }}
                />
            </Draggable>
        </>
    );
};

export default Event;