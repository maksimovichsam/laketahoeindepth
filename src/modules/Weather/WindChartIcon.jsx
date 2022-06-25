import { scaleLinear } from "d3";
import { round, militaryHourTo12Hour } from "../../js/util";

const speed_scale = scaleLinear().domain([0, 20]).range([30, 70]);

function WindChartIcon(props) {
    let { speed, direction, time } = props;

    const format_date = (d) => {
        let hours = militaryHourTo12Hour(d.getHours());
        let am_pm = (d.getHours() >= 12) ? "PM" : "AM";
        return `${hours} ${am_pm}`;
    };

    return (
        <div className="wind-chart-icon">
            <span className="wind-chart-icon-speed"> { round(speed) } mph </span>
            <i 
                className="wind-chart-icon-arrow wi wi-direction-up"
                style={{
                    "transform": `rotate(${direction + 180}deg)`,
                    "fontSize": `${speed_scale(speed)}px`
                }}
                />
            <span className="wind-chart-icon-time"> { format_date(new Date(time)) } </span>
        </div>
    )
}

export default WindChartIcon;