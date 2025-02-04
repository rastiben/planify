import { DateTime, Interval } from "luxon";
import { usePlanify } from "../../../contexts/Planify.context.ts";
import Event from "./Event.tsx";

type DayProps = {
    day: DateTime;
}

const Day = ({ day }: DayProps) => {
    const { events } = usePlanify();
    const date = DateTime.now();
    const range = Interval.fromDateTimes(date.startOf("day"), date.endOf("day"));

    const daySlots = events[day.toISODate()];

    return (
        <div className="planify-week--body--day">
            <div className="planify-events">
                {daySlots?.map((event) => {
                    return <Event key={event.id} event={event} day={day}/>;
                })}
            </div>
            {range.splitBy({hour: 1}).map((time) => {
                return <div className="planify-week--body--day-row" key={time.toFormat("yyyy-MM-dd HH:mm")}></div>
            })}
        </div>
    )
};

export default Day;