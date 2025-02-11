import { usePlanify } from "../contexts/Planify.context.tsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { DateTime } from "luxon";
import { floorDateTime } from "../helpers/date.ts";
import { getSelectedDate } from "../helpers/location.ts";

type useResizeProps = {
    onResize: (date: DateTime) => void;
}

const useResize = ({ onResize }: useResizeProps) => {
    const { date, bounds, colWidth, planifyRef } = usePlanify();
    const [isResizing, setIsResizing] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    const onMouseDown = useCallback(() => {
        setIsResizing(true);
    }, []);

    const onMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing) return;
        if (!bounds) return;

        const offset = e.y - (bounds?.top || 0) + (planifyRef.current?.scrollTop || 0);
        const date = getSelectedDate({ x: e.x, y: offset, date, colWidth, bounds, planifyRef });

        onResize(floorDateTime(date, "quarter"));
    }, [isResizing, date, onResize]);

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