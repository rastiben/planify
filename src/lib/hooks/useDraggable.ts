import { useCallback, useEffect, useRef, useState } from "react";
import { PlanifyEvent } from "../types";
import { usePlanify } from "../contexts/Planify.context.tsx";
import { getCurrentLocation } from "../helpers/location.ts";
import { getEventOffset, getEventSlotFromOffsets } from "../helpers/events.ts";
import { floorDateTime } from "../helpers/date.ts";

type Position = {
    x: number;
    y: number;
};

type UseDraggableProps = {
    event: PlanifyEvent;
    grid: {
        x: number; // Width of one time slot
        y: number; // Height of one row
    };
    onPositionChange?: (newPosition: Position) => void;
};

const useDraggable = ({ event, grid, onPositionChange }: UseDraggableProps) => {
    const { date, resources, bounds, colWidth, rowHeight, planifyRef } = usePlanify();
    const ref = useRef<HTMLDivElement | null>(null);
    const ghostRef = useRef<HTMLDivElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

    // Store the initial mouse position and element offset when dragging starts
    const dragInfo = useRef({
        startX: 0,
        startY: 0,
        initialOffsetX: 0,
        initialOffsetY: 0,
    });

    const createGhostElement = useCallback((originalElement: HTMLDivElement) => {
        const rect = originalElement.getBoundingClientRect();
        const ghost = originalElement.cloneNode(true) as HTMLDivElement;
        ghost.style.position = 'fixed';
        ghost.style.pointerEvents = 'none';
        ghost.style.width = `${rect.width}px`;
        ghost.style.height = `${rect.height}px`;
        ghost.style.left = `${rect.left}px`;
        ghost.style.top = `${rect.top}px`;
        ghost.style.transform = 'none';
        ghost.style.margin = '0';
        ghost.style.zIndex = '1000';
        ghost.id = 'ghost-element';

        document.body.appendChild(ghost);
        ghostRef.current = ghost;
        return ghost;
    }, []);

    const getSelectedDate = useCallback(({ x, y }: { x: number; y: number }) => {
        const { day } = getCurrentLocation({
            date,
            boundLeft: x - (bounds?.left || 0) + (planifyRef.current?.scrollLeft || 0),
            dayWidth: colWidth
        });

        const time = getEventSlotFromOffsets({
            height: bounds?.height,
            bottom: y || 0,
            top: (y || 0),
            day,
        });

        return floorDateTime(time.start, "quarter");
    }, [bounds, planifyRef, date, colWidth]);

    const onMouseDown = useCallback((e: MouseEvent) => {
        if (!ref.current) return;
        if (!(e.target as HTMLElement).closest(".planify-week--event--content")) return;

        e.preventDefault();

        setIsDragging(true);

        // Apply opacity to original element
        ref.current.style.opacity = '0.5';

        const rect = ref.current.getBoundingClientRect();

        // Store initial positions
        dragInfo.current = {
            startX: e.clientX,
            startY: e.clientY,
            initialOffsetX: rect.left,
            initialOffsetY: rect.top,
        };

        // Create and position the ghost element
        createGhostElement(ref.current);
    }, [createGhostElement]);

    const onMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !ghostRef.current) return;

        e.preventDefault();



        const deltaY = e.clientY - dragInfo.current.startY;
        const mouseY = dragInfo.current.initialOffsetY + deltaY;

        console.log(e.clientY, mouseY);

        const day = getSelectedDate({ x: e.clientX, y: mouseY });

        let newX;

        const dayLeft = (day.weekday - 1) * colWidth;

        if (resources) {
            const resourceIdx = resources.findIndex((r) => r.id === event.resourceId);
            newX = dayLeft + (colWidth / resources.length * resourceIdx) + (bounds?.left || 0);
        } else {
            newX = dayLeft + (bounds?.left || 0);
        }

        const offset = getEventOffset({ height: bounds?.height, start: day, end: day });

        const newY = (offset?.start || 0);

        // Update position state
        setPosition({ x: newX, y: newY });

        // Call the position change callback
        onPositionChange?.({ x: newX, y: newY });

        // Update ghost element position
        ghostRef.current.style.left = `${newX}px`;
        ghostRef.current.style.top = `${newY}px`;
    }, [isDragging, date, bounds, planifyRef, colWidth, resources, rowHeight, onPositionChange, event]);

    const onMouseUp = useCallback((e: MouseEvent) => {
        setIsDragging(false);

        // Reset opacity on original element
        if (ref.current) {
            ref.current.style.opacity = '1';
        }

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