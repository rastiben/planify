import { DateTime } from "luxon";

type GetCurrentLocationProps = {
    date: DateTime;
    boundLeft: number;
    dayWidth: number;
};

/*
    @return Return day and resource
 */
export const getCurrentLocation = ({ date, boundLeft, dayWidth }: GetCurrentLocationProps) => {
    // |       |       |       |       |       |       |       |
    //  R1 | R2 R1 | R2 R1 | R2 R1 | R2 R1 | R2 R1 | R2 R1 | R2
    //
    // 200px per day
    //
    // so one ressource = 200px / number of resources = here 100px
    //
    // so if x = 250px = Day 2 and resource 1
    //
    // if x = 350 = Day 2 and resource 2
    //
    // so Math.floor((x - day.left) / one ressource)
    //
    // si x = 250px and day.left = 200px so (x - day.left) = 50px and Math.floor(50 / 100) = 0 (index of the resource)
    const day = date.startOf("week").plus({ days: Math.floor(boundLeft / dayWidth) });

    return {
        day,
    }
};