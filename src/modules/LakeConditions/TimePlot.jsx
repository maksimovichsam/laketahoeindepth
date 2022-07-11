import { useState, useEffect } from "react";
import { useRef } from "react";
import { line, scaleLinear, select, zip } from "d3";

import "./LakeConditions.css";

import { axis_ticks_auto, DAYS_OF_WEEK, getDatesBetween, MONTHS, ONE_DAY, ONE_MONTH, ONE_YEAR, round } from "../../js/util";

function TimePlot(props) {
    ///////////////////////////////////
    // Expected props
    // time: an Array of date objects
    // y: an Array of y values corresponding to each date
    // chart_title (optional): a title for the chart
    // y_label (optional): the name of the y axis
    // max_y (optional): the maximum y, if undefined, determined dynamically
    // min_y (optional): the minimum y, if undefined, determined dynamically
    // y_ticks (optional, default=3), an Integer, the number of ticks to place on the y axis, or 
    //   an Array of y-values specifying where to place the tick
    const svg_ref = useRef();
    const [ chart_width, setChartWidth ] = useState(700);
    const [ chart_height, setChartHeight ] = useState(350);

    let { time, y, chart_title, y_label, max_y, min_y, y_ticks } = props;
    if (time.length !== y.length)
        throw new Error("Expected time and y data to have the same length");
    if (time.length < 2)
        throw new Error("Expected at least two data points")
    
    let time_as_number = time.map((t) => t.getTime());
    let min_t = time_as_number[0];
    let max_t = time_as_number[time_as_number.length - 1];
    const x_scale = scaleLinear()
        .domain([min_t, max_t])
        .range([0, chart_width]);

    max_y = max_y ?? Math.ceil(Math.max(...y));
    min_y = min_y ?? Math.floor(Math.min(...y));
    const y_scale = scaleLinear()
        .domain([min_y, max_y])
        .range([chart_height, 0]);

    y_ticks = y_ticks ?? 3;
    if (isFinite(y_ticks)) {
        y_ticks = axis_ticks_auto(min_y, max_y, undefined, y_ticks);
    }

    // Render chart
    useEffect(() => {
        let svg = select(svg_ref.current);

        // Create path
        const line_data = zip(
            time_as_number.map(t_i => x_scale(t_i)),
            y.map(y_i => y_scale(y_i))
        )
        const line_factory = line();
        svg.select("#time-plot-line")
            .attr("d", line_factory(line_data))

        // Create y labels
        svg.select("#time-plot-y-labels")
            .selectAll("text")
            .data(y_ticks)
            .join("text")
            .attr("x", -15)
            .attr("y", y_scale)
            .text((d) => round(d, 1));

        // Create x labels
        const x_tick_line1 = chart_height + 10;
        const x_tick_line2 = x_tick_line1 + 15;
        
        const x_ticks = axis_ticks_auto(min_t, max_t, [ONE_DAY, ONE_MONTH, ONE_YEAR], 8);
        const day_formatter = (d) => {
            let day = DAYS_OF_WEEK[d.getDay()].toUpperCase();
            let month = MONTHS[d.getMonth()].substring(0, 3).toUpperCase();
            let date = d.getDate();
            return [`${month} ${date}`, `${day}`];
        };
        const other_formatter = (d) => {
            let month = MONTHS[d.getMonth()].substring(0, 3).toUpperCase();
            let year = d.getFullYear();
            return [month, year];
        };

        const number_of_days = (max_t - min_t) / ONE_DAY; 
        const x_tick_formatter = (number_of_days >= 20) ? other_formatter : day_formatter;

        // getDatesBetween(new Date(min_t), new Date(max_t));
        svg.select("#time-plot-x-labels")
            .selectAll("text")
            .data(x_ticks)
            .join("text")
            .attr("x", (d) => x_scale(d))
            .attr("y", x_tick_line2)
            .text((d) => x_tick_formatter(new Date(d))[1]);
        svg.select("#time-plot-x-labels")
            .selectAll("text.day")
            .data(x_ticks)
            .join("text")
            .attr("x", (d) => x_scale(d))
            .attr("y", x_tick_line1)
            .text((d) => x_tick_formatter(new Date(d))[0]);

    }, [time, y]);

    return (
        <svg
            ref={svg_ref}
            overflow="visible"
            viewBox={`0 0 ${chart_width} ${chart_height}`}
            >

            <text
                x="0"
                y="-10"
                fill="white"
                >
                { chart_title }
            </text>

            <g transform={`translate(-70, ${0.50 * chart_height})`}>
                <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform="rotate(-90)"
                    fill="white"
                    >
                    { y_label }
                </text>
            </g>
            
            <g id="time-plot-y-labels"
                fill="white"
                dominantBaseline="middle"
                textAnchor="end"
                >
            </g>

            <g id="time-plot-x-labels"
                fill="white"
                dominantBaseline="hanging"
                textAnchor="middle"
                >
            </g>

            <g id="time-plot-axes">
                <line 
                    x1="0" 
                    y1={chart_height}
                    x2={chart_width}
                    y2={chart_height}
                    stroke="white"
                    strokeLinecap="square"
                    >
                </line>

                <line 
                    x1="0" 
                    y1="0"
                    x2="0"
                    y2={chart_height}
                    stroke="white"
                    strokeLinecap="square"
                    >
                </line>
            </g>

            <path 
                id="time-plot-line"
                stroke="white"
                fill="none"
                >
            </path>

        </svg>
    )
}

export default TimePlot;