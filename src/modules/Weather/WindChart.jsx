import { useEffect, useState} from "react";
import { selectAll } from "d3";

import WindChartIcon from "./WindChartIcon";
import "./Weather.css";

import { interpolate } from "../../js/util";

const ONE_HOUR = 60 * 60 * 1000;

function WindChart(props) {
    let [chart_width, setChartWidth] = useState(638);
    let { speed, direction, time } = props;

    let t_0 = speed.time[0];
    let t_n = speed.time[speed.time.length - 1];

    let times = [];
    for (let t = t_0; t < t_n; t += ONE_HOUR * 3)
        times.push(t)
    
    let icons = times
        .map((t) => {
            let speed_at_t = interpolate(t, speed.time, speed.values);
            let direction_at_t = interpolate(t, direction.time, direction.values);
            return <WindChartIcon
                        key={`wind-chart-icon${t}`}
                        speed={speed_at_t}
                        direction={direction_at_t}
                        time={t}
                        />;
        });

    useEffect(() => {
        const width = document.querySelector(".wind-chart").clientWidth;
        setChartWidth(width);
        
        const translate_x = -1 * (time - t_0) / (ONE_HOUR * 24) * chart_width;
        selectAll(".wind-chart > *")
            .style("transform", `translate(${translate_x}px, 0px)`);
    }, [t_0, time, chart_width])


    return (
        <div className="wind-chart"> 
            {icons} 
        </div>
    )
}

export default WindChart