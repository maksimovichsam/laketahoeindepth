import { today, extract_time_series, http_get } from "./util";

const base_url = "https://api.weather.gov/";
const tahoe_office = "REV"
const [tahoe_gx, tahoe_gy] = [33, 87];


class WeatherService {
    static last_retrieved = undefined;
    static forecasts = undefined;
    static max_attempts = 5;

    static TEMPERATURE_KEY = "temperature";
    static PRECIPITATION_KEY = "probabilityOfPrecipitation";
    static WIND_SPEED_KEY = "windSpeed";
    static WIND_DIRECTION_KEY = "windDirection";
    static HUMIDITY_KEY = "relativeHumidity";
    static SKY_COVER_KEY = "skyCover";
    static TEMPERATURE_HIGH_KEY = "maxTemperature";
    static TEMPERATURE_LOW_KEY = "minTemperature";

    static KMH_TO_MPH = 0.621371;
    static ONE_HOUR = 5 * 1000;

    static async get_forecasts() {
        // Uses the national weather service api to retrieve forecasted weather data
        // See documentation here https://www.weather.gov/documentation/services-web-api
        // 
        // The national weather service returns a JSON object with a very specific format
        // See an example here https://api.weather.gov/gridpoints/REV/33,87 to give some
        // context on how it is structured
        let now = new Date();
        let time_since_last_retrieved = (WeatherService.last_retrieved === undefined) 
            ? 24 * WeatherService.ONE_HOUR 
            : now - WeatherService.last_retrieved;

        // Return cached result
        if (WeatherService.forecasts && time_since_last_retrieved < this.ONE_HOUR) {
            console.log("returning cached result", time_since_last_retrieved);
            return WeatherService.forecasts;
        }

        const url = `${base_url}gridpoints/${tahoe_office}/${tahoe_gx},${tahoe_gy}`;
        const headers = { "Accept": "application/geo+json" }
        
        let geo_json;
        for (let request_attempt = 1; request_attempt <= WeatherService.max_attempts; request_attempt++) {
            geo_json = await http_get(url, undefined, headers);
        
            // Extract properties
            if (!("properties" in geo_json)) {
                console.log(`Attempt ${request_attempt}: Failed to retrieve NWS data, retrying`)
                if (request_attempt === WeatherService.max_attempts)
                    throw new Error("Max number of requests exceeded. Properties not in NWS response", geo_json);
            }
            else
                break; 
        }

        WeatherService.last_retrieved = now;
        WeatherService.forecasts = geo_json;
        return geo_json;
    }

    static get_forecast(forecasts, data_name, start_date, end_date) {
        // Returns the weekly forecast for the requested data 
        //
        // Arguments:
        //  forecasts: forecasts from WeatherService.get_forecasts
        //  data_name: a String, a key inside forecasts.properties, ex: "temperature"
        //  start_date (optional, default=today): the start date of the forecasts
        //  end_date (optional, default=1 week from start_date): the maximum date of the forecasts.
        start_date = start_date ?? today(-0.5 / 24);
        end_date = end_date ?? today(8);
        if (!(data_name in forecasts.properties))
            throw new Error(`Could not find '${data_name}' in forecast properties`);
        
        const forecast_values = forecasts.properties[data_name].values;
        const time_series = extract_time_series(forecast_values);

        // Remove date less than start date
        const index_of_first_date = time_series.time.findIndex((t) => t > start_date);
        time_series.time = time_series.time.slice(index_of_first_date);
        time_series.values = time_series.values.slice(index_of_first_date);

        // Remove data greater than end date
        const index_of_last_date = time_series.time.findIndex((t) => t > end_date);
        time_series.time = time_series.time.slice(0, index_of_last_date);
        time_series.values = time_series.values.slice(0, index_of_last_date);

        // Convert date to integer
        time_series.time = time_series.time.map((date) => date.getTime());
        
        return time_series;
    }

    static categorizeSkyCover(sky_cover) {
        // Categorizes sky cover into 3 categories
        // Arguments:
        // sky_cover: a percentage, between 0-100
        sky_cover /= 100;
        if (sky_cover < (3/8)) {
            return "Sunny";
        }
        else if (sky_cover < (5/8)) {
            return "Partly Cloudy";
        }
        else {
            return "Cloudy";
        }
    }
}

export default WeatherService;