import { useCallback, useEffect, useRef, useState } from "react";
import { PlanifyEvent } from "../types";
import { usePlanify } from "../contexts/Planify.context.tsx";
import { getCurrentLocation, isMouseWithinCalendarBounds } from "../helpers/location.ts";
import { getEventOffset, getEventSlotFromOffsets } from "../helpers/events.ts";
import { floorDateTime } from "../helpers/date.ts";
import useAutoScroll from "./useAutoScroll.ts";
import { DateTime } from "luxon";
import { createGhostElement } from "../helpers/draggable.ts";

type Position = {
    x: number;
    y: number;
};

type UseDraggableProps = {
    event: PlanifyEvent;
};

type DragInfo = {
    startX: number;
    startY: number;
    initialOffsetX: number;
    initialOffsetY: number;
};

const useDraggable = ({ event }: UseDraggableProps) => {
    const { date, bounds, colWidth, planifyRef } = usePlanify();
    const ref = useRef<HTMLDivElement | null>(null);
    const ghostRef = useRef<HTMLDivElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    useAutoScroll({ isDragging });
    const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

    // Store the initial mouse position and element offset when dragging starts
    const dragInfo = useRef<DragInfo>({
        startX: 0,
        startY: 0,
        initialOffsetX: 0,
        initialOffsetY: 0,
    });

    const getSelectedDate = useCallback(({ x, y }: Position) => {
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
    }, [bounds, planifyRef, date, colWidth]);

    const updateGhostElement = useCallback(({ date, top }: { date: DateTime; top: number }) => {
        if (ghostRef.current) {
            ghostRef.current.remove();
            ghostRef.current = null;
        }

        if (!ref.current) return;

        const ghost = createGhostElement(ref.current, top, date, event.resourceId);
        ghostRef.current = ghost;
        return ghost;
    }, [event.resourceId]);

    const handleCalendarDrag = useCallback((e: MouseEvent) => {
        if (!ghostRef.current) return;

        const deltaY = e.clientY - dragInfo.current.startY;
        const mouseY = dragInfo.current.initialOffsetY + deltaY + (planifyRef.current?.scrollTop || 0) - (bounds?.top || 0);

        const day = getSelectedDate({ x: e.clientX, y: mouseY });
        const offset = getEventOffset({ height: bounds?.height, start: day, end: day });
        const newY = (offset?.start || 0);

        updateGhostElement({ date: day, top: newY });
    }, [planifyRef, getSelectedDate, bounds, updateGhostElement]);

    const handleFreeDrag = useCallback((e: MouseEvent) => {
        if (!ghostRef.current) return;

        const deltaX = e.clientX - dragInfo.current.startX;
        const deltaY = e.clientY - dragInfo.current.startY;

        const newX = dragInfo.current.initialOffsetX + deltaX;
        const newY = dragInfo.current.initialOffsetY + deltaY;

        setPosition({ x: newX, y: newY });
        ghostRef.current.style.left = `${newX}px`;
        ghostRef.current.style.top = `${newY}px`;

        return { x: newX, y: newY };
    }, []);

    const onMouseDown = useCallback((e: MouseEvent) => {
        if (!ref.current) return;
        if (!(e.target as HTMLElement).closest(".planify-week--event--content")) return;

        e.preventDefault();
        setIsDragging(true);

        const rect = ref.current.getBoundingClientRect();

        // Store initial positions
        dragInfo.current = {
            startX: e.clientX,
            startY: e.clientY,
            initialOffsetX: rect.left,
            initialOffsetY: rect.top,
        };

        // Create and position the ghost element
        updateGhostElement({
            top: rect.top - (bounds?.top || 0) + (planifyRef.current?.scrollTop || 0),
            date: event.start
        });
    }, [event, planifyRef, bounds, updateGhostElement]);

    const onMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !ghostRef.current) return;
        if (!bounds) return;

        e.preventDefault();

        if (isMouseWithinCalendarBounds(bounds, planifyRef, e.clientX, e.clientY)) {
            handleCalendarDrag(e);
        } else {
            handleFreeDrag(e);
        }
    }, [isDragging, handleCalendarDrag, bounds, handleFreeDrag]);

    const onMouseUp = useCallback(() => {
        setIsDragging(false);

        // Remove the ghost element
        if (ghostRef.current) {
            ghostRef.current.remove();
            ghostRef.current = null;
        }
    }, []);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        element.addEventListener("mousedown", onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        return () => {
            element.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }, [onMouseDown, onMouseMove, onMouseUp]);

    return {
        ref,
        isDragging,
        position,
    };
};

export default useDraggable;