import { createContext, useContext } from "react";
import { PlanfiyDaySlots } from "../types.ts";
import { DateTime } from "luxon";

type PlanifyContextProps = {
    date: DateTime;
    events: PlanfiyDaySlots;
}

const PlanifyContext = createContext<PlanifyContextProps | null>(null);

export const PlanifyProvider = PlanifyContext.Provider;

export const usePlanify = () => {
    const context = useContext(PlanifyContext);
    if (!context) {
        throw new Error("PlanifyContext should be used in a PlanifyProvider");
    }
    return context;
};
