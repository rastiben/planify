// Helper function to create and position ghost element
export const createGhostElement = ({
   parent,
   originalElement,
   style,
}: {
    parent: Element;
    originalElement: HTMLDivElement;
    style: Record<string, string>;
}): HTMLDivElement => {
    const rect = originalElement.getBoundingClientRect();
    const ghost = originalElement.cloneNode(true) as HTMLDivElement;

    const defaultStyle = {
        pointerEvents: "none",
        height: `${rect.height}px`,
        transform: 'none',
        margin: 0,
        zIndex: 1000,
        ...style,
    };

    Object.assign(ghost.style, defaultStyle);

    ghost.id = 'ghost-element';

    if (parent) {
        parent.appendChild(ghost);
    }

    return ghost;
};