import { useState, useEffect, useRef } from "react";
import { area, curveMonotoneX, line, scaleLinear, selectAll, select } from "d3";

import "./Weather.css";

import { interpolate, militaryHourTo12Hour, round } from "../../js/util";

const ONE_HOUR = 60 * 60 * 1000;
const THREE_HOURS = 3 * ONE_HOUR;
const ONE_DAY = 24 * ONE_HOUR;

function TemperatureChart(props) {
    /////////////////////////////////////
    // Expected props
    // data: an Object of the following format
    //   { time: Array(N), values: Array(N) }
    // time (optional): an Integer, that can be used to construct a Date. Represents the
    //   beginning time of the chart's sliding window. If undefined, the first time of data is used
    // sliding_window_size (optional): an Integer, representing the number
    //   of milliseconds of the chart's window. 1 week is used by default
    // range (optional): the range of the y-axis. If not specified, range is dynamic 
    // units (optional): a String, to display next to value labels 

    let [chart_width, setChartWidth] = useState(678);
    let [chart_height, setChartHeight] = useState(115);
    let svg_ref = useRef();
    
    let { data, time, sliding_window_size, range, units } = props;
    if (!data || !data.time || data.time.length === 0)
        throw new Error("Expected at least one value in props.data.time");
    time = time ?? data.time[0];
    sliding_window_size = sliding_window_size ?? ONE_DAY;
    units = units ?? "";

    // Data bounds
    const t_0 = data.time[0];
    const t_n = data.time[data.time.length - 1];
    const y_min = Math.min(...data.values);
    const y_max = Math.max(...data.values);
    range = range ?? [y_min, y_max];

    // Converts date to x-axis value
    const x_scale = (t) =>
        scaleLinear()
        .domain([0, sliding_window_size])
        .range([0, chart_width])(t - t_0);

    // Converts data to y-axis value
    const y_padding_top = (range[1] - range[0]) * 0.25; 
    const y_padding_bottom = (range[1] - range[0]) * 0.05;
    const y_scale = scaleLinear()
        .domain([range[0] - y_padding_bottom, range[1] + y_padding_top])
        .range([chart_height, 0]);

    // Converts time value to temperature value using interpolation
    const value_at_time = (date) => interpolate(date, data.time, data.values);

    ///////////////////////////////////////////////
    // Render Chart 
    ///////////////////////////////////////////////
    useEffect(() => {
        const svg = select(svg_ref.current);
        const width = svg_ref.current.clientWidth;
        const height = svg_ref.current.clientHeight;
        setChartWidth(width);
        setChartHeight(height);

        // Create line
        const line_data = [];
        for (let i = 0; i < data.time.length; i++) {
            let x = x_scale(data.time[i]);
            let y = y_scale(data.values[i]);
            line_data.push([x, y]);
        }

        const line_factory = line().curve(curveMonotoneX);
        const area_factory = area()
            .y0(chart_height)
            .curve(curveMonotoneX);

        svg.select("#solid-line")
            .attr("d", line_factory(line_data));

        svg.select("#area-cover")
            .attr("d", area_factory(line_data));

        const translate_x = -1 * (time - t_0) / (sliding_window_size) * chart_width;
        svg.selectAll("#paths, .data-labels > *, .time-labels > *")
            .transition()
            .duration(1000)
            .attr("transform", `translate(${translate_x} 0)`);
            
        selectAll(".temperature-chart-time-label")
            .transition()
            .duration(1000)
            .style("transform", `translate(${translate_x}px, 0)`);
    }, [data, time, sliding_window_size]);

    ////////////////////////////////////////////////////////
    // Labels
    ////////////////////////////////////////////////////////
    let time_labels = [];
    let temperature_labels = [];

    const format_date = (d) => {
        let hours = militaryHourTo12Hour(d.getHours());
        let am_pm = (d.getHours() >= 12) ? "PM" : "AM";
        return `${hours} ${am_pm}`;
    };

    // Create labels for both axes
    for (let t = t_0; t < t_n; t += THREE_HOURS) {
        let date = new Date(t);
        let temperature = value_at_time(date);
        let x = x_scale(date);
        let y = y_scale(temperature);

        time_labels.push(
            <div 
                key={`time-label-${t}`}
                className="temperature-chart-time-label">
                { format_date(new Date(t + ONE_HOUR)) }
            </div>
        );

        temperature_labels.push(
            <text 
                key={`value-label${t}`}
                x={x} 
                y={y}
                fill="white"
                >
                { round(temperature) + units } 
            </text>
        )
    }

    return (
        <div className="temperature-chart">
            <svg 
                ref={svg_ref}
                viewBox={`0 0 ${chart_width} ${chart_height}`}
                shapeRendering="geometricPrecision"
                >

                <style type="text/css">
                    {`
                        @font-face {
                            font-family: 'Source Sans Pro';
                            src: url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400&display=swap');;
                        }
                        svg {
                            font-size: 13px;
                        }
                    `}
                </style>
                
                <g className="data-labels">
                    { temperature_labels }
                </g>

                <g id="paths">
                    <path 
                        id="solid-line"
                        stroke="white"
                        strokeWidth="1" 
                        fillOpacity="0"
                        >
                    </path>

                    <path 
                        id="area-cover"
                        strokeOpacity="0"
                        fill="rgba(255, 255, 255, 0.25)"
                        >
                    </path>
                </g>


            </svg>

            <div className="temperature-chart-time-labels">
                { time_labels }
            </div>
        </div>
    )
}

export default TemperatureChart;