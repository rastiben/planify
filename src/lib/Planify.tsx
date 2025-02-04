import { useMemo, useState } from "react";
import { DateTime, Settings } from "luxon";
import { PlanifyProvider } from "./contexts/Planify.context.ts";
import { VIEWS, PlanifyEvent } from "./types.ts";
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
    const [events, setEvents] = useState<PlanifyEvent[]>([{
        id: "1",
        start: DateTime.now().startOf("day").set({ hour: 12, minute: 0 }),
        end: DateTime.now().startOf("day").set({ hour: 14, minute: 0 })
    }, {
        id: "1",
        start: DateTime.now().startOf("day").plus({ day: 1 }).set({ hour: 12, minute: 0 }),
        end: DateTime.now().startOf("day").plus({ day: 2 }).set({ hour: 14, minute: 0 })
    }]);

    const computedEvents = useMemo(() => {
        return getSlotsByDays(events);
    }, [events]);

    const ViewComponent = ViewsComponent[view];

    return (
        <PlanifyProvider value={{ date, events: computedEvents }}>
            <div className="planify">
                <ViewComponent />
            </div>
        </PlanifyProvider>
    )
};

export default Planify;