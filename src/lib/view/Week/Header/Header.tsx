import { Interval } from "luxon";
import Day from "./Day.tsx";
import { usePlanify } from "../../../contexts/Planify.context.tsx";

const Header = () => {
    const {date} = usePlanify();
    const range = Interval.fromDateTimes(date.startOf("week"), date.endOf("week"));

    return (
        <div className="planify-week--header">
            <div></div>
            <div className="planify-week--header--days">
                {range.splitBy({day: 1}).map((day) => {
                    return <Day key={day.toISO()} day={day.start!}/>;
                })}
            </div>
        </div>
    );
};

export default Header;