import { useMemo, useRef, useState } from "react";
import { DateTime, Interval, Settings } from "luxon";
import { PlanifyProvider } from "./contexts/Planify.context.tsx";
import { VIEWS, PlanifyEvent, PlanifyResource } from "./types.ts";
import Week from "./view/Week/Week.tsx";
import "./index.css";
import { getSlotsByDays } from "./helpers/events.ts";

Settings.defaultLocale = "fr";

const ViewsComponent = {
    [VIEWS.Week]: Week,
};

const Planify = () => {
    const [date, setDate] = useState(DateTime.now());
    const [view, setView] = useState(VIEWS.Week);
    const [showWeekEnds, setShowWeekEnds] = useState(false);
    const planifyRef = useRef<HTMLDivElement | null>(null);
    const [events, setEvents] = useState<PlanifyEvent[]>([{
        id: "1",
        start: date.startOf("week").set({ hour: 12, minute: 0 }),
        end: date.startOf("week").set({ hour: 14, minute: 0 }),
        resourceId: "1",
    }, {
        id: "1",
        start: date.startOf("week").plus({ day: 1 }).set({ hour: 12, minute: 0 }),
        end: date.startOf("week").plus({ day: 2 }).set({ hour: 14, minute: 0 }),
        resourceId: "2",
    }]);
    const [resources, setResources] = useState<PlanifyResource[]>([{
        id: "1",
        title: "Benoit Rastier",
    }, {
        id: "2",
        title: "Matthias Etchegaray"
    }, {
        id: "3",
        title: "Pierre Alain Grollaud"
    }]);

    const computedEvents = useMemo(() => {
        return getSlotsByDays(events);
    }, [events]);

    const ViewComponent = ViewsComponent[view];

    return (
        <PlanifyProvider value={{ date, events: computedEvents, planifyRef, showWeekEnds, resources, setShowWeekEnds }}>
            <div ref={planifyRef} className="planify">
                <ViewComponent />
            </div>
        </PlanifyProvider>
    )
};

export default Planify;