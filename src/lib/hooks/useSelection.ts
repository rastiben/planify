import { usePlanify } from "../contexts/Planify.context.ts";
import { useCallback, useEffect, useRef, useState } from "react";
import { DateTime, Interval } from "luxon";
import { getEventTimeFromOffsets } from "../helpers/events.ts";
import { roundDateTime } from "../helpers/date.ts";

const useSelection = () => {
    const { date, selectedRange, setSelectedRange } = usePlanify();
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedStart, setSelectedStart] = useState<DateTime | null>(null);
    const ref = useRef<HTMLDivElement | null>(null);

    const getSelectedDate = useCallback(({ x, y }: { x: number; y: number }) => {
        const dayWidth = document.querySelector(".planify-week--body--day")?.getBoundingClientRect?.()?.width || 0;
        const bounds: DOMRect | null = ref.current?.getBoundingClientRect();
        const offset = y - bounds?.top;
        const day = date.startOf("week").plus({ days: Math.floor((x - bounds?.left) / dayWidth) });

        const time = getEventTimeFromOffsets({
            height: ref.current?.offsetHeight,
            bottom: offset || 0,
            top: (offset || 0)
        });
        const start = roundDateTime(time.start);

        return day.set({ hour: start.hour, minute: start.minute, second: start.second, millisecond: start.millisecond });
    }, [date]);

    const onMouseDown = useCallback((e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains("planify-week--body--day-row")) {
            setIsSelecting(true);

            const selectedDateStart = getSelectedDate({ x: e.x, y: e.y });
            const selectedDateEnd = selectedDateStart.plus({ hour: 1 });

            setSelectedStart(selectedDateStart);
            setSelectedRange(Interval.fromDateTimes(selectedDateStart, selectedDateEnd));
        }
    }, [getSelectedDate, setSelectedRange]);

    const onMouseMove = useCallback((e: MouseEvent) => {
        if (!isSelecting) return;
        if (!selectedRange) return;
        if (!selectedStart) return;

        const selectedDateStart = getSelectedDate({ x: e.x, y: e.y });

        if (!Interval.fromDateTimes(date.startOf("week"), date.endOf("week")).contains(selectedDateStart)) return;

        setSelectedRange(Interval.fromDateTimes(
            selectedDateStart < selectedStart ? selectedDateStart : selectedStart,
            selectedDateStart >= selectedStart ? selectedDateStart.plus({ hour: 1 }) : selectedRange.end!
        ));

    }, [isSelecting, selectedRange, getSelectedDate, date, setSelectedRange]);

    const onMouseUp = useCallback((e: MouseEvent) => {
        const target = e.target as HTMLElement;
        setIsSelecting(false);

        if (!target.classList.contains("planify-week--body--day-row")) setSelectedRange(null);
    }, [setSelectedRange]);

    useEffect(() => {
        document.addEventListener("mousedown", onMouseDown);
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        return () => {
            document.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        }
    }, [onMouseDown, onMouseMove, onMouseUp]);

    return {
        ref
    };
};

export default useSelection;