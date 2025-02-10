import { useCallback, useEffect, useRef, useState } from "react";
import { PlanifyEvent } from "../types";
import { usePlanify } from "../contexts/Planify.context.tsx";

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
    const { bounds } = usePlanify();
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
    }, [bounds?.left, bounds?.top]);

    const onMouseDown = useCallback((e: MouseEvent) => {
        if (!ref.current) return;

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

        console.log(isDragging, ghostRef.current);

        // Calculate new position with offset
        const deltaX = e.clientX - dragInfo.current.startX;
        const deltaY = e.clientY - dragInfo.current.startY;

        // Calculate new position with snapping
        const mouseX = dragInfo.current.initialOffsetX + deltaX;
        const mouseY = dragInfo.current.initialOffsetY + deltaY;

        // Snap to nearest grid position
        const newX = Math.floor(mouseX / grid.x) * grid.x + (bounds?.left || 0);
        const newY = Math.round(mouseY / grid.y) * grid.y;

        // Update position state
        setPosition({ x: newX, y: newY });

        // Call the position change callback
        onPositionChange?.({ x: newX, y: newY });

        console.log(ghostRef);

        // Update ghost element position
        ghostRef.current.style.left = `${newX}px`;
        ghostRef.current.style.top = `${newY}px`;
    }, [isDragging, grid.x, grid.y, bounds, onPositionChange]);

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