import { useCallback, useEffect, useRef, useState } from "react";
import { DateTime, Interval } from "luxon";
import { usePlanify } from "../../contexts/Planify.context.tsx";
import { getEventSlotFromOffsets } from "../../helpers/events.ts";
import { floorDateTime } from "../../helpers/date.ts";
import { getCurrentLocation } from "../../helpers/location.ts";
import { PlanifyResource } from "../../types.ts";

const useSelection = () => {
    const { bounds, date, colWidth, planifyRef, resources } = usePlanify();
    const [selectedRange, setSelectedRange] = useState<Interval | null>(null);
    const [selectedResource, setSelectedResource] = useState<PlanifyResource | null>(null);
    const isSelecting = useRef(false);
    const selectedStart = useRef<DateTime | null>(null);

    const getSelectedLocation = useCallback(({ x, y }: { x: number; y: number }) => {
        const offset = y - (bounds?.top || 0) + (planifyRef.current?.scrollTop || 0);
        const { day, resource } = getCurrentLocation({
            date,
            resources,
            boundLeft: x - (bounds?.left || 0) + (planifyRef.current?.scrollLeft || 0),
            dayWidth: colWidth
        });

        const time = getEventSlotFromOffsets({
            height: bounds?.height,
            bottom: offset || 0,
            top: (offset || 0),
            day,
        });

        return {
            time: floorDateTime(time.start, "quarter"),
            resource,
        };
    }, [bounds?.top, bounds?.left, bounds?.height, date, resources, colWidth]);

    const onMouseDown = useCallback((e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains("planify-week--body--quarter-row")) {
            isSelecting.current = true;

            const { time: selectedDateStart, resource } = getSelectedLocation({ x: e.x, y: e.y });
            const selectedDateEnd = selectedDateStart.plus({ minute: 15 });

            selectedStart.current = selectedDateStart;
            setSelectedRange(Interval.fromDateTimes(selectedDateStart, selectedDateEnd));
            setSelectedResource(resource);
        }
    }, [getSelectedLocation, setSelectedRange]);

    const onMouseMove = useCallback((e: MouseEvent) => {
        if (!isSelecting.current) return;
        if (!selectedRange) return;
        if (!selectedStart.current) return;

        const { time: selectedDateStart } = getSelectedLocation({ x: e.x, y: e.y });

        if (!Interval.fromDateTimes(date.startOf("week"), date.endOf("week")).contains(selectedDateStart)) return;

        setSelectedRange(Interval.fromDateTimes(
            selectedDateStart < selectedStart.current ? selectedDateStart : selectedStart.current!,
            selectedDateStart >= selectedStart.current ? selectedDateStart.plus({ minute: 15 }) : (selectedStart.current!).plus({ minute: 15 })
        ));

    }, [isSelecting, selectedRange, selectedStart, getSelectedLocation, date, setSelectedRange]);

    const onMouseUp = useCallback((e: MouseEvent) => {
        const target = e.target as HTMLElement;
        isSelecting.current = false;

        if (!target.classList.contains("planify-week--body--quarter-row")) {
            setSelectedRange(null);
            setSelectedResource(null);
        }
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
        selectedRange,
        setSelectedRange,
        selectedResource
    }
};

export default useSelection;