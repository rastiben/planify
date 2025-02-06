import { createContext, PropsWithChildren, useContext, useState } from "react";
import { PlanfiyDaySlots } from "../types.ts";
import { DateTime } from "luxon";

type PlanifyContextProviderProps = {
    date: DateTime;
    events: PlanfiyDaySlots;
    showWeekEnds: boolean;
    setShowWeekEnds: (showWeekEnds: boolean) => void;
}

type PlanifyContextProps = PlanifyContextProviderProps & {
    rowHeight: number;
    setRowHeight: (rowHeight: number) => void;
    colWidth: number;
    setColWidth: (colWidth: number) => void;
    bounds: DOMRect | null;
    setBounds: (bounds: DOMRect | null) => void;
}

const PlanifyContext = createContext<PlanifyContextProps | null>(null);

export const PlanifyProvider = ({ children, value }: PropsWithChildren<{ value: PlanifyContextProviderProps }>) => {
    const [rowHeight, setRowHeight] = useState(0);
    const [colWidth, setColWidth] = useState(0);
    const [bounds, setBounds] = useState<DOMRect | null>(null);

    return (
        <PlanifyContext.Provider value={{ ...value, rowHeight, bounds, setBounds, setRowHeight, colWidth, setColWidth }}>
            {children}
        </PlanifyContext.Provider>
    )
};

export const usePlanify = () => {
    const context = useContext(PlanifyContext);
    if (!context) {
        throw new Error("PlanifyContext should be used in a PlanifyProvider");
    }
    return context;
};
