import { DateTime, Interval } from "luxon";

const Time = () => {
    const date = DateTime.now();
    const range = Interval.fromDateTimes(date.startOf("day"), date.endOf("day"));

    return (
        <div className="planify-week-time">
            {range.splitBy({ hour: 1 }).map((time) => {
                return <div key={time.toFormat("yyyy-MM-dd HH:mm")}>{time?.start?.hour ? time.start?.toFormat("HH:mm") : ""}</div>
            })}
        </div>
    )
};

export default Time;