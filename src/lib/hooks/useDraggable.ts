import { useCallback, useEffect, useRef, useState } from "react";
import { PlanifyEvent } from "../types";
import { usePlanify } from "../contexts/Planify.context.tsx";
import { getSelectedDate, isMouseWithinCalendarBounds } from "../helpers/location.ts";
import { getEventOffset } from "../helpers/events.ts";
import useAutoScroll from "./useAutoScroll.ts";
import { createGhostElement } from "../helpers/draggable.ts";

type UseDraggableProps = {
    event: PlanifyEvent;
    isDraggable: boolean;
};

type DragInfo = {
    startX: number;
    startY: number;
    initialOffsetX: number;
    initialOffsetY: number;
};

const useDraggable = ({ event, isDraggable }: UseDraggableProps) => {
    const { date, bounds, colWidth, planifyRef, rowHeight } = usePlanify();
    const ref = useRef<HTMLDivElement | null>(null);
    const ghostRef = useRef<HTMLDivElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    useAutoScroll({ isDragging });

    // Store the initial mouse position and element offset when dragging starts
    const dragInfo = useRef<DragInfo>({
        startX: 0,
        startY: 0,
        initialOffsetX: 0,
        initialOffsetY: 0,
    });

    const updateGhostElement = useCallback(({ parent, style }: { parent: Element; style: Record<string, string> }) => {
        if (ghostRef.current) {
            ghostRef.current.remove();
            ghostRef.current = null;
        }

        if (!ref.current) return;
        const ghost = createGhostElement({ parent, originalElement: ref.current!, style });
        ghostRef.current = ghost;
        return ghost;
    }, []);

    const handleCalendarDrag = useCallback((e: MouseEvent) => {
        if (!ghostRef.current) return;
        if (!bounds) return;

        const deltaY = e.clientY - dragInfo.current.startY;
        const mouseY = dragInfo.current.initialOffsetY + deltaY + (planifyRef.current?.scrollTop || 0) - (bounds?.top || 0);

        const day = getSelectedDate({ x: e.clientX, y: mouseY, planifyRef, bounds, colWidth, date });
        const offset = getEventOffset({ height: bounds?.height, start: day, end: day });
        const newY = (offset?.start || 0);

        const parent = document.querySelector(`[data-date='${day.toISODate()}'][data-resource='${event.resourceId}']`);
        updateGhostElement({
            parent,
            style: {
                position: 'absolute',
                top: `${newY}px`,
            },
        });
    }, [bounds, planifyRef, colWidth, date, event, updateGhostElement]);

    const handleFreeDrag = useCallback((e: MouseEvent) => {
        if (!ghostRef.current) return;

        const deltaX = e.clientX - dragInfo.current.startX;
        const deltaY = e.clientY - dragInfo.current.startY;

        const newX = dragInfo.current.initialOffsetX + deltaX;
        const newY = dragInfo.current.initialOffsetY + deltaY;

        const rect = ref.current.getBoundingClientRect();

        updateGhostElement({
            parent: document.body,
            style: {
                position: 'fixed',
                width: `${rect.width}px`,
                top: `${newY}px`,
                left: `${newX}px`,
            }
        });

        return { x: newX, y: newY };
    }, [bounds, updateGhostElement]);

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

        const parent = document.querySelector(`[data-date='${event.start.toISODate()}'][data-resource='${event.resourceId}']`);

        // Create and position the ghost element
        updateGhostElement({
            style: {
                position: 'absolute',
                top: `${rect.top - (bounds?.top || 0) + (planifyRef.current?.scrollTop || 0)}px`,
            },
            parent
        });
    }, [event, planifyRef, bounds, updateGhostElement]);

    const onMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !ghostRef.current) return;
        if (!bounds) return;

        e.preventDefault();

        const rect = ref.current.getBoundingClientRect();

        const eventHeight = rect.height;

        const deltaY = e.clientY - dragInfo.current.startY;
        const mouseY = dragInfo.current.initialOffsetY + deltaY;

        if (isMouseWithinCalendarBounds({
            bounds: bounds,
            eventHeight,
            mouseX: e.clientX,
            mouseY: mouseY,
            planifyRef,
        })) {
            handleCalendarDrag(e);
        } else {
            handleFreeDrag(e);
        }
    }, [event, rowHeight, isDragging, handleCalendarDrag, bounds, handleFreeDrag]);

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
        if (!isDraggable) return;
        if (!element) return;

        element.addEventListener("mousedown", onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        return () => {
            element.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }, [onMouseDown, isDraggable, onMouseMove, onMouseUp]);

    return {
        ref,
        isDragging,
    };
};

export default useDraggable;