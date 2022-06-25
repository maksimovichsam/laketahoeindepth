import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { select } from "d3";
import WeatherDayIcon from "./WeatherDayIcon";
import "./Weather.css";

import MODULES from "../../static/modules.json";
import TemperatureChart from "./TemperatureChart";
import { celsius_to_f, DAYS_OF_WEEK, round, today, militaryHourTo12Hour, interpolate, useForceUpdate } from "../../js/util";
import WeatherService from "../../js/nws_api";
import PrecipitationChart from "./PrecipitationChart";
import WindChart from "./WindChart";

function WeatherDisplay(props) {
    const forceUpdate = useForceUpdate();
    const [active_icon_idx, setActiveIconIdx] = useState(undefined);
    const [_, tab_index, [forecasts, updateForecasts]] = useOutletContext();

    const tab = Object.values(MODULES.WEATHER.TABS)[tab_index];    

    // Temperature
    const temperature = WeatherService
        .get_forecast(forecasts, WeatherService.TEMPERATURE_KEY);
    temperature.values = temperature.values.map(celsius_to_f);

    // Rain
    const precipitation = WeatherService
        .get_forecast(forecasts, WeatherService.PRECIPITATION_KEY);
    
    // Wind Speed
    const wind_speed = WeatherService
        .get_forecast(forecasts, WeatherService.WIND_SPEED_KEY);
    wind_speed.values = wind_speed.values.map((x) => x * WeatherService.KMH_TO_MPH);
    
    // Wind Direction
    const wind_direction = WeatherService
        .get_forecast(forecasts, WeatherService.WIND_DIRECTION_KEY);

    // Humidity
    const humidity = WeatherService
        .get_forecast(forecasts, WeatherService.HUMIDITY_KEY);

    // Sky Cover
    const sky_cover = WeatherService
        .get_forecast(forecasts, WeatherService.SKY_COVER_KEY);
    
    // Temperature High
    const temperature_high = WeatherService
        .get_forecast(forecasts, WeatherService.TEMPERATURE_HIGH_KEY);
    temperature_high.values = temperature_high.values.map(celsius_to_f); 

    // Temperature Low
    const temperature_low = WeatherService
        .get_forecast(forecasts, WeatherService.TEMPERATURE_LOW_KEY);
    temperature_low.values = temperature_low.values.map(celsius_to_f); 

    // Time Configuration
    const now = today();
    const format_date = (d, include_hours) => {
        let day_of_week = DAYS_OF_WEEK[d.getDay()];
        if (!include_hours)
            return `${day_of_week}`
        let hours = militaryHourTo12Hour(d.getHours());
        let minutes = String(d.getMinutes()).padStart(2, "0");
        let am_pm = (d.getHours() >= 12) ? "PM" : "AM";
        return `${day_of_week} ${hours}:${minutes} ${am_pm}`;
    };
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const days_this_week = [now.getTime()];
    for (let i = 1; i < 7; i++) {
        let next_day = new Date(now.getTime() + i * ONE_DAY); 
        // Round down to nearest day
        next_day.setHours(0, 0);
        days_this_week.push(next_day);
    }

    const date = (active_icon_idx === undefined) ? now : days_this_week[active_icon_idx];

    // Data at given date
    const temp_data = (active_icon_idx === undefined) ? temperature : temperature_high;
    const temperature_now = round( 
        interpolate(date, temp_data.time, temp_data.values)
        );
    const precipitation_now = round( 
        interpolate(date, precipitation.time, precipitation.values)
        );
    const wind_now = round( 
        interpolate(date, wind_speed.time, wind_speed.values)
        );
    const humidity_now = round( 
        interpolate(date, humidity.time, humidity.values)
        );
    const sky_cover_now = WeatherService.categorizeSkyCover(
        interpolate(date, sky_cover.time, sky_cover.values)
        );

    // Icons for days of the week
    const icons = days_this_week
        .map((date, idx) => {
            const sky_cover_at_date = interpolate(
                date, sky_cover.time, sky_cover.values
                );
            const temperature_high_at_date = interpolate(
                date, temperature_high.time, temperature_high.values
                );
            const temperature_low_at_date = interpolate(
                date, temperature_low.time, temperature_low.values
                );
            return <WeatherDayIcon
                        key={`weather-icon-${date}`}
                        date={new Date(date)}
                        sky_cover={sky_cover_at_date}
                        high={temperature_high_at_date}
                        low={temperature_low_at_date}
                        is_active={idx === active_icon_idx || (idx === 0 && active_icon_idx === undefined)}
                        onClick={() => setActiveIconIdx(idx)}
                        />
            }
        );

    // Refresh button callback
    function onRefresh() {
        // Spin refresh button
        let refresh_button = select(".weather-refresh");
        let degrees = 0;
        let animation = setInterval(() => {
            refresh_button.style("transform", `rotate(${degrees}deg)`)
            degrees += 5;
            if (degrees >= 360) {
                degrees = 0;
                clearInterval(animation);
            }
        }, 1);
        setActiveIconIdx(undefined);
        updateForecasts();
        // component would not update if active_icon_idx is already undefined
        forceUpdate();
    }

    return (
        <div 
            style={{"backgroundImage": `url(${tab.image})`}}
            className="weather-display"
            >

            <div className="weather-dashboard">
                <div className="weather-header">
                    <div className="weather-header-left">

                        <i className="weather-icon wi wi-day-sunny"></i>
                        
                        <div className="weather-header-value">
                            { temperature_now }
                        </div> 

                        <span className="weather-header-units">
                            °F
                        </span>

                        <div
                            className="weather-header-stats"
                            >
                            <span> Precipitation: {precipitation_now}% </span>
                            <span> Humidity: {humidity_now}% </span>
                            <span> Wind: {wind_now} mph  </span>
                        </div>

                        <span 
                            onClick={() => onRefresh()}
                            className="weather-refresh material-symbols-outlined"> 
                            refresh
                        </span>

                    </div>
                    
                    <div className="weather-header-right"> 
                        <span className="weather-header-location">
                            Lake Tahoe 
                        </span>
                        <span className="weather-header-date">
                            { 
                                format_date(
                                    new Date(now),
                                    active_icon_idx === undefined
                                ) 
                            } 
                        </span>
                        <span className="weather-header-conditions"> {sky_cover_now} </span>
                    </div>

                </div>

                {
                    (tab.name === "Temperature") ?
                        <TemperatureChart
                            data={temperature}
                            time={date}
                            units={"°"}
                            />
                    : (tab.name === "Precipitation") ?
                        <PrecipitationChart
                            data={precipitation}
                            time={date}
                            />
                    : (tab.name === "Wind") ? 
                        <WindChart
                            speed={wind_speed}
                            direction={wind_direction}
                            time={date}
                            />
                    : <div> Unknown tab {`${tab.name}`} </div>
                }

                <div className="weather-display-icons">
                    { icons }
                </div>

            </div>

            <div className="weather-display-header">
                <div className="weather-display-title"> 
                    { tab.name }
                </div>
                <div className="weather-display-desc">
                    { tab.desc }
                </div>
            </div>

        </div>
    );
}

export default WeatherDisplay;