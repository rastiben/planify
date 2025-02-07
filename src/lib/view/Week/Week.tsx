import { usePlanify } from "../../contexts/Planify.context.tsx";
import { Interval } from "luxon";
import Header from "./Header/Header.tsx";
import Time from "./Body/Time.tsx";
import Day from "./Body/Day.tsx";
import useWeek from "./hooks/useWeek.ts";

const Week = () => {
    const { date, resources, showWeekEnds } = usePlanify();
    const { ref } = useWeek();

    const numberOfVisibleDays = showWeekEnds ? 7 : 5;
    const range = Interval.fromDateTimes(date.startOf("week"), date.startOf("week").plus({ day: numberOfVisibleDays }));

    return (
        <div className="planify-week">
            <Header />
            <div className="planify-week--body">
                <Time/>
                <div ref={ref} className="planify-week--body--days">
                    {range.splitBy({day: 1}).map((day) => {
                        return resources.map((resource) => {
                            return <Day key={`${resource.id}-${day.toISO()}`} resource={resource} day={day.start!}/>;
                        })
                    })}
                </div>
            </div>
        </div>
    )
};

export default Week;