// Helper function to create and position ghost element
import { DateTime } from "luxon";

export const createGhostElement = (
    originalElement: HTMLDivElement,
    top: number,
    date: DateTime,
    resourceId: string
): HTMLDivElement => {
    const rect = originalElement.getBoundingClientRect();
    const ghost = originalElement.cloneNode(true) as HTMLDivElement;

    ghost.style.position = 'absolute';
    ghost.style.pointerEvents = 'none';
    ghost.style.width = '100%';
    ghost.style.height = `${rect.height}px`;
    ghost.style.top = `${top}px`;
    ghost.style.transform = 'none';
    ghost.style.margin = '0';
    ghost.style.zIndex = '1000';
    ghost.id = 'ghost-element';

    const day = document.querySelector(`[data-date='${date.toISODate()}'][data-resource='${resourceId}']`);

    if (day) {
        day.appendChild(ghost);
    }

    return ghost;
};