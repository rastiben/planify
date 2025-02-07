import { DateTime } from "luxon";
import { PlanifyResource } from "../types.ts";

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