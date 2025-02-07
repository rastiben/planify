import { useMemo } from "react";
import { DateTime, Interval } from "luxon";
import { getEventDaySlot, getEventOffset } from "../../../helpers/events.ts";
import { usePlanify } from "../../../contexts/Planify.context.tsx";
import useSelection from "../../hooks/useSelection.ts";
import { PlanifyResource } from "../../../types.ts";

type SelectedRangeProps = {
    day: DateTime;
    resource?: PlanifyResource | null;
}

const SelectedRange = ({ day, resource }: SelectedRangeProps) => {
    const { bounds } = usePlanify();
    const { selectedRange, selectedResource } = useSelection();

    const selectedRangeSlot = useMemo(() => {
        if (!selectedRange) return undefined;
        if (selectedRange?.overlaps(Interval.fromDateTimes(day.startOf("day"), day.endOf("day")))) {
            return getEventDaySlot(selectedRange, day);
        }
        return undefined;
    }, [day, selectedRange]);

    const offsets = useMemo(() => {
        if (!selectedRangeSlot) return undefined;
        return getEventOffset({ height: bounds?.height, start: selectedRangeSlot.start!, end: selectedRangeSlot.end! });
    }, [selectedRangeSlot, bounds]);

    if (!selectedRangeSlot) return null;
    if (resource && selectedResource?.id !== resource.id) return null;
    if (!offsets) return null;

    return (
        <div style={{ transform: `translateY(${offsets?.start}px)`, height: `${offsets?.end - offsets?.start}px` }} className="planify-week--selected-range" />
    )
};

export default SelectedRange;