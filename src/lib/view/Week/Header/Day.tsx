import { DateTime } from "luxon";
import { usePlanify } from "../../../contexts/Planify.context.tsx";

type DayProps = {
    day: DateTime;
};

const Day = ({ day }: DayProps) => {
    const { resources } = usePlanify();

    return (
        <div className="planify-week--header--day" data-date={day.toISODate()}>
            <div>
            <div className="planify-week--header--day-name">{day.toFormat("cccc")}</div>
            <div>{day.toFormat("dd")}</div>
            <div className="planify-week--header--resources">
                {resources.map((resource) => {
                    return <div key={resource.id} className="planify-week--header--resource">{ resource.title }</div>
                })}
            </div>
            </div>
        </div>
    )
};

export default Day;