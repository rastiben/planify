import { DateTime } from "luxon";

export const VIEWS = {
    "Week": "Week",
} as const;

export type View = keyof typeof VIEWS;

export type PlanifyEvent = {
    id: string;
    start: DateTime;
    end: DateTime;
}

export type PlanfiyDaySlots = {
    [k: string]: PlanifyEvent[];
};

export type PlanifyResource = {
    id: string;
    title: string;
}