import { usePlanify } from "../../contexts/Planify.context.tsx";
import { Interval } from "luxon";
import Header from "./Header/Header.tsx";
import Time from "./Body/Time.tsx";
import Day from "./Body/Day.tsx";
import useWeek from "./hooks/useWeek.ts";

const Week = () => {
    const { date } = usePlanify();
    const { ref } = useWeek();
    const range = Interval.fromDateTimes(date.startOf("week"), date.endOf("week"));

    return (
        <div className="planify-week">
            <Header />
            <div className="planify-week--body">
                <Time/>
                <div ref={ref} className="planify-week--body--days">
                    {range.splitBy({day: 1}).map((day) => {
                        return <Day key={day.toISO()} day={day.start!}/>;
                    })}
                </div>
            </div>
        </div>
    )
};

export default Week;