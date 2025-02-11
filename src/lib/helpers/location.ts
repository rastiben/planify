import { DateTime } from "luxon";
import { PlanifyResource } from "../types.ts";
import { MutableRefObject, useCallback } from "react";
import { getEventSlotFromOffsets } from "./events.ts";
import { floorDateTime } from "./date.ts";

type GetCurrentLocationProps = {
    date: DateTime;
    boundLeft: number;
    dayWidth: number;
    resources?: PlanifyResource[] | null;
};

/*
    @return Return day and resource
 */
export const getCurrentLocation = ({ date, boundLeft, dayWidth, resources }: GetCurrentLocationProps) => {
    const day = date.startOf("week").plus({ days: Math.floor(boundLeft / dayWidth) });
    let resourceIndex = -1;

    if (resources) {
        const resourceWidth = dayWidth / resources.length;
        const dayLeft = (day.weekday - 1) * dayWidth;
        resourceIndex = Math.floor((boundLeft - dayLeft) / resourceWidth);
    }

    return {
        day,
        resource: resources?.[resourceIndex] || null,
    }
};

// Helper function to check if mouse is within calendar bounds
type IsMouseWithinCalendarBoundsParams = {
    bounds: DOMRect;
    mouseX: number;
    mouseY: number;
    eventHeight: number;
    planifyRef: React.RefObject<HTMLDivElement>;
};

// Helper function to check if mouse is within calendar bounds considering event height
export const isMouseWithinCalendarBounds = ({
     bounds,
     mouseX,
     mouseY,
     eventHeight,
     planifyRef
 }: IsMouseWithinCalendarBoundsParams): boolean => {
    if (!bounds) return false;

    const scrollLeft = planifyRef.current?.scrollLeft || 0;
    const scrollTop = planifyRef.current?.scrollTop || 0;

    return (
        mouseX >= bounds.left - scrollLeft &&
        mouseX <= bounds.right + scrollLeft &&
        mouseY >= bounds.top - scrollTop &&
        mouseY + eventHeight <= bounds.bottom - scrollTop
    );
};

export const getSelectedDate = ({
    x,
    y,
    date,
    bounds,
    planifyRef,
    colWidth
} : {
    x:number;
    y: number;
    date: DateTime;
    bounds: DOMRect;
    colWidth: number;
    planifyRef: MutableRefObject<HTMLDivElement | null>
}) => {
    const { day } = getCurrentLocation({
        date,
        boundLeft: x - (bounds?.left || 0) + (planifyRef.current?.scrollLeft || 0),
        dayWidth: colWidth
    });

    const time = getEventSlotFromOffsets({
        height: bounds?.height,
        bottom: y || 0,
        top: y || 0,
        day,
    });

    return floorDateTime(time.start, "quarter");
};