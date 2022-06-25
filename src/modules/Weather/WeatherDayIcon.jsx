import WeatherService from "../../js/nws_api";
import { DAYS_OF_WEEK, round, skyCoverToIcon } from "../../js/util";

function WeatherDayIcon(props) {
    ////////////////////////////////////////////
    // Expected Props
    //  date: a Date object, the time of the weather icon 
    //  sky_cover: a percentage, 0-100
    //  high: the temperature high for the date
    //  low: the temperature low for the date
    //  is_active: whether the current icon is active
    //  onClick: callback function when icon is clicked
    let { date, sky_cover, high, low, is_active, onClick } = props;

    const day = DAYS_OF_WEEK[date.getDay()].substring(0, 3);
    sky_cover = WeatherService.categorizeSkyCover(sky_cover);
    sky_cover = skyCoverToIcon(sky_cover)
    high = round(high);
    low = round(low);
    onClick = onClick ?? (() => {});

    let class_name = "weather-day-icon";
    if (is_active)
        class_name += " weather-day-icon-active";
    
    return (
        <div className={class_name} onClick={onClick}>
            <div> { day } </div>
            <i className={`wi ${sky_cover}`}> </i>
            <div>
                <span className="weather-icon-high"> { high }° </span>
                <span className="weather-icon-low"> { low }° </span>
            </div>
        </div>
    )
}

export default WeatherDayIcon;