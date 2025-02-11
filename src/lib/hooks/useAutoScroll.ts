import { useEffect, useState } from 'react';
import { usePlanify } from "../contexts/Planify.context.tsx";

const useAutoScroll = ({
   isDragging = false,
   edgeThreshold = 50,
   scrollSpeed = 5
}) => {
    const { planifyRef } = usePlanify();
    const [isAutoScrolling, setIsAutoScrolling] = useState(false);

    useEffect(() => {
        if (!isDragging) return;
        if (!planifyRef?.current) return;

        let scrollInterval: number | null;

        const handleMouseMove = (e: MouseEvent) => {
            const container = planifyRef.current;
            if (!container) return;

            // Get container bounds
            const bounds = container.getBoundingClientRect();

            // Check if mouse is within container bounds
            const isInBounds = (
                e.clientX >= bounds.left &&
                e.clientX <= bounds.right &&
                e.clientY >= bounds.top &&
                e.clientY <= bounds.bottom
            );

            // Clear existing interval if mouse is out of bounds
            if (!isInBounds) {
                if (scrollInterval) {
                    clearInterval(scrollInterval);
                    scrollInterval = null;
                }
                setIsAutoScrolling(false);
                return;
            }

            // Calculate relative position within container
            const relativeX = e.clientX - bounds.left;
            const relativeY = e.clientY - bounds.top;

            // Check if mouse is near edges
            const isNearTopEdge = relativeY < edgeThreshold;
            const isNearBottomEdge = relativeY > bounds.height - edgeThreshold;
            const isNearLeftEdge = relativeX < edgeThreshold;
            const isNearRightEdge = relativeX > bounds.width - edgeThreshold;

            // Clear existing interval
            if (scrollInterval) {
                clearInterval(scrollInterval);
                scrollInterval = null;
            }

            // Start scrolling if near any edge
            if (isNearTopEdge || isNearBottomEdge || isNearLeftEdge || isNearRightEdge) {
                setIsAutoScrolling(true);

                scrollInterval = setInterval(() => {
                    if (isNearTopEdge) {
                        container.scrollBy(0, -scrollSpeed);
                    }
                    if (isNearBottomEdge) {
                        container.scrollBy(0, scrollSpeed);
                    }
                    if (isNearLeftEdge) {
                        container.scrollBy(-scrollSpeed, 0);
                    }
                    if (isNearRightEdge) {
                        container.scrollBy(scrollSpeed, 0);
                    }
                }, 16); // ~60fps
            } else {
                setIsAutoScrolling(false);
            }
        };

        // Add mouse move listener
        window.addEventListener('mousemove', handleMouseMove);

        // Cleanup
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (scrollInterval) {
                clearInterval(scrollInterval);
            }
        };
    }, [isDragging, edgeThreshold, planifyRef, scrollSpeed]);

    return { isAutoScrolling };
};

export default useAutoScroll;