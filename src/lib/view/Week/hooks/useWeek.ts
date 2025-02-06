import useResizeObserver from "use-resize-observer";
import { usePlanify } from "../../../contexts/Planify.context.tsx";
import { CALENDAR_DAY_WIDTH, CALENDAR_QUARTER_HEIGHT } from "../../../constants.ts";
import { useRef } from "react";

const useWeek = () => {
    const { setBounds, setColWidth, setRowHeight } = usePlanify();
    const ref = useRef<HTMLDivElement | null>(null);

    useResizeObserver({
        ref: ref,
        onResize: ({ height, width }) => {
            if (!height) return;
            if (!width) return;

            const colWidth = width / 7;
            const rowHeight = height / (24 * 3);

            setColWidth(colWidth > CALENDAR_DAY_WIDTH ? colWidth : CALENDAR_DAY_WIDTH);
            setRowHeight(rowHeight > CALENDAR_QUARTER_HEIGHT ? rowHeight : CALENDAR_QUARTER_HEIGHT);
            setBounds(ref.current?.getBoundingClientRect());
        }
    });

    return {
        ref,
    }
};

export default useWeek;
