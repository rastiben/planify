import { DateTime } from "luxon";

type DayProps = {
    day: DateTime;
};

const Day = ({ day }: DayProps) => {
    return (
        <div className="planify-week--header--day" data-date={day.toISODate()}>
            <div className="planify-week--header--day-name">{day.toFormat("cccc")}</div>
            <div>{day.toFormat("dd")}</div>
        </div>
    )
};

export default Day;