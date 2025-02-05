import useResizeObserver from "use-resize-observer";
import useSelection from "../../../hooks/useSelection.ts";
import { usePlanify } from "../../../contexts/Planify.context.tsx";

const useWeek = () => {
    const { setBounds, setColWidth, setRowHeight } = usePlanify();
    const { ref } = useSelection();

    useResizeObserver({
        ref: ref,
        onResize: ({ height, width }) => {
            if (!height) return;
            if (!width) return;

            const colWidth = width / 7;
            const rowHeight = height / 24;

            setColWidth(colWidth > 200 ? colWidth : 200);
            setRowHeight(rowHeight > 30 ? rowHeight : 30);
            setBounds(ref.current?.getBoundingClientRect());
        }
    });

    return {
        ref,
    }
};

export default useWeek;
