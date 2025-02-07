import { DateTime } from "luxon";
import { PlanifyResource } from "../types.ts";

type GetCurrentLocationProps = {
    date: DateTime;
    boundLeft: number;
    dayWidth: number;
    resources: PlanifyResource[];
};

/*
    @return Return day and resource
 */
export const getCurrentLocation = ({ date, boundLeft, dayWidth, resources }: GetCurrentLocationProps) => {
    const day = date.startOf("week").plus({ days: Math.floor(boundLeft / dayWidth) });

    const resourceWidth = dayWidth / resources.length;
    const dayLeft = (day.weekday - 1) * dayWidth;
    const resourceIndex = Math.floor((boundLeft - dayLeft) / resourceWidth);

    return {
        day,
        resource: resources?.[resourceIndex] || null,
    }
};