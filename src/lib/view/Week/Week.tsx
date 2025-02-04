import { usePlanify } from "../../contexts/Planify.context.ts";
import { Interval } from "luxon";
import Header from "./Header/Header.tsx";
import Time from "./Body/Time.tsx";
import Day from "./Body/Day.tsx";

const Week = () => {
    const {date} = usePlanify();
    const range = Interval.fromDateTimes(date.startOf("week"), date.endOf("week"));

    return (
    <div className="planify-week">
        <Header />
        <div className="planify-week--body">
            <Time/>
            <div className="planify-week--body--days">
                {range.splitBy({day: 1}).map((day) => {
                    return <Day key={day.toISO()} day={day.start!}/>;
                })}
            </div>
        </div>
    </div>
)
};

export default Week;