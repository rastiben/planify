import { DateTime, Interval } from "luxon";
import { usePlanify } from "../../../contexts/Planify.context.tsx";
import Event from "./Event.tsx";
import SelectedRange from "./SelectedRange.tsx";
import { PlanifyEvent, PlanifyResource } from "../../../types.ts";

type DayProps = {
    resource?: PlanifyResource | null;
    day: DateTime;
}

const Day = ({ day, resource }: DayProps) => {
    const { events } = usePlanify();
    const date = DateTime.now();
    const range = Interval.fromDateTimes(date.startOf("day"), date.endOf("day"));

    const daySlots: PlanifyEvent[] = events[day.toISODate() as string]?.filter(({resourceId}) => resource ? resourceId === resource.id : true);

    return (
        <div data-date={day.toISODate()} data-resource={resource?.id} className="planify-week--body--day">
            <SelectedRange day={day} resource={resource}/>
            <div className="planify-week--events">
                {daySlots?.map((event) => {
                    return <Event key={event.id} event={event} day={day}/>;
                })}
            </div>
            {range.splitBy({hour: 1}).map((hour) => {
                return <div className="planify-week--body--day-row" key={hour.toFormat("yyyy-MM-dd HH:mm")}>
                    {hour.splitBy({ minute: 15 }).splice(1).map((minute) => {
                        return <div className="planify-week--body--quarter-row" key={minute.toFormat("yyyy-MM-dd HH:mm")}></div>
                    })}
                </div>
            })}
        </div>
    )
};

export default Day;