import { celsius_to_f, format_ymd, http_get, today } from "./util";
import DATA_STATIONS from "../static/data_stations.json";

class TimedCache {
    constructor(expiration_time) {
        this.expiration_time = expiration_time;
        this.cache = {};
    }

    put(key, value) {
        this.cache[key] = {
            "value": value, 
            "time": Date.now()
        };
    }

    has(key) {
        if (!(key in this.cache))
            return false;
        
        const now = Date.now();
        const expired = (now - this.cache[key].time) >= this.expiration_time;
        return !expired;
    }

    get(key) {
        return this.cache[key].value;
    }

    get length() {
        return Object.keys(this.cache).length;
    }
}

class UnitConverter {
    static conversion_ratios = {
        "c": {
            "f": celsius_to_f
        },
        "m": {
            "ft": (m) => m * 3.28084
        },
    }

    static convert(value, units, converted_units) {
        if (units === converted_units)
            return value;
        
        if (!(units in UnitConverter.conversion_ratios &&
            converted_units in UnitConverter.conversion_ratios[units]))
            throw new Error(`Conversion from '${units}' to '${converted_units}' is not implemented`)

        return UnitConverter.conversion_ratios[units][converted_units](value);
    }
}

class DataStation {
    static TIME_UNTIL_REDOWNLOAD = 60 * 60 * 1000; // one hour
    static TIME_KEY = "TmStamp";

    constructor(url, data_types, name, id, coords) {
        this.url = url;
        this.data_types = data_types;
        this.name = name;
        this.id = id;
        this.coords = coords;

        this.download_cache = new TimedCache(DataStation.TIME_UNTIL_REDOWNLOAD);
    }

    has_data_type(data_type_name) {
        const data_type_index = this.data_types
            .findIndex((dt) => dt.name === data_type_name)
        return data_type_index !== -1;
    }

    get_data_type(data_type_name) {
        return this.data_types.find((dt) => dt.name === data_type_name);
    }

    async download_data(start_date, end_date, extra_params) {
        // Fetches the raw JSON data from the Station URL
        // Arguments:
        // start_date: a Date object, the start date of the data
        // end_date: a Date object, the end date of the data
        // extra_params (optional): params to add onto the get request
        extra_params = extra_params ?? {};

        // Return data if already downloaded
        const key = `download_data-${format_ymd(start_date)},${format_ymd(end_date)}`;
        if (this.download_cache.has(key))
            return this.download_cache.get(key);

        const params = {
            "id": this.id,
            "rptdate": format_ymd(start_date),
            "rptend": format_ymd(end_date)
        };
        Object.assign(params, extra_params);
        
        const json = await http_get(this.url, params); 
        this.download_cache.put(key, json);
        return json;
    }

    async get_data(start_date, end_date, data_type_name) {
        if (!this.has_data_type(data_type_name))
            throw new Error(`Station '${this.name}' does not have data type '${data_type_name}'`);

        // Return data if already processed
        const key = `get_data-${format_ymd(start_date)},${format_ymd(end_date)},${data_type_name}`;
        if (this.download_cache.has(key)) {
            console.log("Returning cached value ", key)
            return this.download_cache.get(key);
        }

        const parseTmStamp = (date_string) => {
            // Parses a date string in the format "YYYY-MM-DD HH:MM:SS"
            // Arguments:
            //  date_string: a String, in the format "YYYY-MM-DD HH:MM:SS"
        
            // date_string is pretty close to an ISO 8601 timestamp
            // timestamp specification see below
            // https://262.ecma-international.org/5.1/#sec-15.9.1.15
            // Convert date_string to ISO 8601 timestamp
            date_string = date_string.trim();
            date_string = date_string.replace(" ", "T");
            date_string += "Z";
        
            return new Date(date_string);
        }

        const data_type = this.get_data_type(data_type_name);
        const raw_data = await this.download_data(start_date, end_date);
        const time = raw_data.map((datum) => parseTmStamp(datum[DataStation.TIME_KEY]));
        let data = raw_data.map((datum) => parseFloat(datum[data_type.key]));

        // Data Error Checking
        const data_has_nans = data.some(isNaN);
        if (data_has_nans) {
            this.download_cache.put(key, null);
            throw new Error(`Station '${this.name}' contains NaN data`)
        }
        if (time.length <= 2) {
            this.download_cache.put(key, null);
            throw new Error(`Station '${this.name}' doesn't contain enough data points (${time.length} data points)`);
        }

        // Convert units
        let current_units = data_type.key_units;
        let converted_units = data_type.name_units;
        data = data.map((x) => UnitConverter.convert(x, current_units, converted_units));

        let res = {
            [DataStation.TIME_KEY]: time,
            [data_type_name]: data
        }
        this.download_cache.put(key, res);
        return res;
    }

    async get_most_recent_data(start_date, end_date, data_type_name) {
        let data = await this.get_data(start_date, end_date, data_type_name);
        data = data[data_type_name];
        return data[data.length - 1];
    }
}

////////////////////////////////////////////////////////////////
// Initialize Stations
////////////////////////////////////////////////////////////////

const STATIONS = Object.values(DATA_STATIONS)
    .flatMap(({URL, DATA_TYPES, STATIONS}) => {
        return STATIONS
            .map(({name, id, coords}) => {
                return new DataStation(URL, DATA_TYPES, name, id, coords);
            });
    });

class TercAPI {
    static STATIONS = STATIONS;

    static TIME_KEY               = DataStation.TIME_KEY;
    static WAVE_HEIGHT_NAME       = "Wave Height";
    static WATER_TEMPERATURE_NAME = "Water Temperature";
    static ALGAE_NAME             = "Algae";
    static CLARITY_NAME           = "Clarity";
    static LAKE_LEVEL_NAME        = "Lake Level";
    
    static get_stations_with_data_type(data_type_name) {
        return STATIONS
            .filter((station) => station.has_data_type(data_type_name));
    }
}

export { TercAPI };