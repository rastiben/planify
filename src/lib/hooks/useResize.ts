import { usePlanify } from "../contexts/Planify.context.tsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { DateTime } from "luxon";
import { getEventSlotFromOffsets } from "../helpers/events.ts";
import { floorDateTime } from "../helpers/date.ts";

type useResizeProps = {
    onResize: (date: DateTime) => void;
}

const useResize = ({ onResize }: useResizeProps) => {
    const { date, bounds, colWidth } = usePlanify();
    const [isResizing, setIsResizing] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    const getSelectedDate = useCallback(({ x, y }: { x: number; y: number }) => {
        const offset = y - bounds?.top;
        const day = date.startOf("week").plus({ days: Math.floor((x - bounds?.left) / colWidth) });

        const time = getEventSlotFromOffsets({
            height: bounds?.height,
            bottom: offset || 0,
            top: (offset || 0),
            day,
        });

        return floorDateTime(time.start);
    }, [date, bounds, colWidth]);

    const onMouseDown = useCallback(() => {
        setIsResizing(true);
    }, []);

    const onMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing) return;

        const date = getSelectedDate({ x: e.x, y: e.y });

        onResize(date);
    }, [isResizing, getSelectedDate, onResize]);

    const onMouseUp = useCallback(() => {
        setIsResizing(false);
    }, []);

    useEffect(() => {
        ref.current?.addEventListener("mousedown", onMouseDown);
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        return () => {
            ref.current?.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        }
    }, [onMouseDown, onMouseMove, onMouseUp]);

    return {
        ref,
    };
};

export default useResize;