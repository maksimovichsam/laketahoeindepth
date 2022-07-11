import ACTIVITIES from "../static/activities.json";

import { useState, useRef, useEffect, useCallback } from "react";

export const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const SEASONS = ["Spring", "Summer", "Fall", "Winter"];
export const SEASON_TIMES = [   
    ["03-21", "06-20"],
    ["06-21", "09-20"],
    ["09-21", "12-20"],
    ["01-01", "03-20"]
];

export const ONE_MINUTE = 60 * 1000;
export const ONE_HOUR = 60 * ONE_MINUTE;
export const ONE_DAY = 24 * ONE_HOUR;
export const ONE_MONTH = 31 * ONE_DAY;
export const ONE_YEAR = 356 * ONE_DAY;

export function createLatLng(lat, lon) {
    // Creates a latitude longitude object
    return { lat: lat, lon: lon};
}

export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function latLngDist([lat1, lon1], [lat2, lon2]) {
    // Returns the distance in miles, between two points of 
    // latitude and longitude
    //
    // Source: https://www.movable-type.co.uk/scripts/latlong.html
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c; // in metres
    const METERS_TO_MILES = 0.000621371;
    return d * METERS_TO_MILES; 
}

export function clusterLocationsByDistance(locations, min_distance) {
    // Groups locations by their distance to each other
    //
    // Arguments:
    // locations: a list of { location: "name", coords: [1, 2] } objects
    // min_distance: the minimum distance (in miles) for two locations to be grouped together 
    
    const in_a_group = new Set();
    const groups = [];
    for (let i = 0; i < locations.length; i++) {
        if (in_a_group.has(i))
            continue;

        const group = {
            "locations": [locations[i]], 
            "coords": [locations[i].coords]
        };
        in_a_group.add(i);

        for (let j = i + 1; j < locations.length; j++) {
            if (in_a_group.has(j))
                continue;

            const distance = latLngDist(locations[i].coords, locations[j].coords);
            if (distance < min_distance) {
                group.locations.push(locations[j]);
                group.coords.push(locations[j].coords)
                in_a_group.add(j);
            }
        }

        // Average coordinates
        group.coords = getLatLngCenter(group.coords);
        groups.push(group);
    }
    return groups;
}


function getLatLngCenter(latLngInDegr) {
    /**
     * Source: https://stackoverflow.com/a/30033564/9175592
     * @param latLngInDeg array of arrays with latitude and longtitude
     *   pairs in degrees. e.g. [[latitude1, longtitude1], [latitude2
     *   [longtitude2] ...]
     *
     * @return array with the center latitude longtitude pairs in 
     *   degrees.
     */
    var LATIDX = 0;
    var LNGIDX = 1;
    var sumX = 0;
    var sumY = 0;
    var sumZ = 0;

    for (var i=0; i<latLngInDegr.length; i++) {
        var lat = latLngInDegr[i][LATIDX] * Math.PI / 180;
        var lng = latLngInDegr[i][LNGIDX] * Math.PI / 180;
        // sum of cartesian coordinates
        sumX += Math.cos(lat) * Math.cos(lng);
        sumY += Math.cos(lat) * Math.sin(lng);
        sumZ += Math.sin(lat);
    }

    var avgX = sumX / latLngInDegr.length;
    var avgY = sumY / latLngInDegr.length;
    var avgZ = sumZ / latLngInDegr.length;

    // convert average x, y, z coordinate to latitude and longtitude
    var lng = Math.atan2(avgY, avgX);
    var hyp = Math.sqrt(avgX * avgX + avgY * avgY);
    var lat = Math.atan2(avgZ, hyp);

    return ([lat * 180 / Math.PI, lng * 180 / Math.PI]);
}

export function getActivityIcon(activity) {
    // Returns the icon for a given activity
    //
    // Arguments:
    // activity: a String, an activity name found within ACTIVITIES
    return Object.values(ACTIVITIES)
        .find((a) => a.name === activity)
        .icon;
}

export function extract_time_series(array) {
    // Helper function that extracts a time series from an array of objects 
    // with the following format. Used to make weather data in a more usable format
    //
    // Arguments:
    //  array: an array of {"validTime": ..., "value": ...} Objects see below
    //       [{
    //           "validTime": "2022-04-11T14:00:00+00:00/PT1H",
    //           "value": 0.55555555555555558
    //       },
    //       {
    //           "validTime": "2022-04-11T15:00:00+00:00/PT6H",
    //           "value": 0
    //       },
    //       {
    //           "validTime": "2022-04-11T21:00:00+00:00/PT1H",
    //           "value": -1.1111111111111112
    //       }]
    // Returns:
    // { "time": [ Date Object ] , "values": [ Number ] }
    // the time difference between any two Dates is 1 hour
    if (array === undefined)
        return [];

    let time = [];
    let values = [];
    for (let { validTime, value } of array) {
        let [date, duration] = parse_interval(validTime);
        // Round date to nearest hour as a sanity check
        date = roundDateToHour(date);
        for (let i = 0; i < duration; i++) {
            time.push(date);
            values.push(value);
            date = new Date(date.getTime() + ONE_HOUR);
        }
    }
    
    return { "time": time, "values": values }
}

export function parse_interval(interval) {
    // Utility function that parses an ISO 8601 date string with a duration of time.
    // Example:
    //   >>> let d = '2022-02-04T02:00:00+00:00/PT4H' // represents 4 hours starting from 2 am on 2022-02-04
    //   >>> parse_interval(d)
    //       [Date Object, 4]
    //
    // See https://en.wikipedia.org/wiki/ISO_8601#Time_intervals to see how ISO 8601 
    // timestamps are formatted.
    // Arguments:
    //     interval (str): an ISO 8601 date string with an interval
    // Returns:
    //     [Date Object, an integer]: time and duration (in hours)
    const solidus = '/';
    if (!interval.includes(solidus))
        return [new Date(interval), 0];

    const is_digit = (letter) => /^\d$/.test(letter);
    let [date, duration] = interval.split(solidus);
    let hours = 0;
    let integer = 0;
    for (let letter of duration) {
        if (is_digit(letter))
            integer = 10 * integer + parseInt(letter);
        else if (letter === 'P') {
            continue;
        } 
        else if (letter === 'M') {
            throw new Error("Month designator 'M' not implemented in interval parser");
        }
        else if (letter === 'W') {
            hours += integer * 24 * 7;
            integer = 0;
        }
        else if (letter === 'D') {
            hours += integer * 24;
            integer = 0;
        }
        else if (letter === 'T') {
            continue;
        }
        else if (letter === 'H') {
            hours += integer;
            integer = 0;
        } 
        else if (letter === 'M') {
            hours += Math.floor(integer / 60);
            integer = 0;
        }
        else if (letter === 'S') {
            hours += Math.floor(integer / 360);
            integer = 0;
        } else {
            throw new Error(`Unexpected character '${letter}' in interval timestamp`);
        }
    }

    return [new Date(date), hours];
}

export function roundDateToHour(date) {
    // Rounds date to nearest hour
    date.setMinutes(date.getMinutes() + 30);
    date.setMinutes(0, 0, 0);
    return date;
}

export async function http_get(url, params, headers, mode) {
    // Makes a GET request to a url and return a response
    // 
    // Arguments:
    //  url: a String, the web address to make a request to
    //  params (optional): a dictionary of queries to send with the request
    //  headers (optional): headers to attach to the request
    //  mode (optional, default "cors"): "cors", "no-cors", or "same-origin"
    headers = headers ?? { "Content-Type": "application/json" };
    mode = mode ?? "cors";

    const url_obj = new URL(url);
    if (params !== undefined)
        url_obj.search = new URLSearchParams(params).toString();

    let request = await fetch(url_obj, 
        {
            method: "GET",
            mode: mode,
            headers: headers
        }
    );
    return await request.json();
}

export function today(days) {
    // Returns 'x' days after todays date
    // Arguments:
    //  days (optional, default: 0): an integer 
    days = days ?? 0;

    let now = new Date();
    now = new Date(now.getTime() + days * ONE_DAY);
    return now;
}

export function militaryHourTo12Hour(hour) {
    // converts military hour to the 12 hour format
    // For a math explanation see https://www.desmos.com/calculator/xqlinlqtns
    // Arguments:
    //  hour: an integer between 0 and 24
    return mod(hour - 1, 12) + 1;
}

export function mod(a, b) {
    // Return a mod b; % is not the modulo operator in JS, see
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
    return ((a % b) + b) % b;
}

export function interpolate(x_interpolate, X, Y) {
    // Similar to numpy.interp, but for a single x-coordinate
    // One-dimensional linear interpolation for monotonically increasing sample points.
    // Arguments:
    //  x_interpolate: the x value at which to evaluate the interpolated point
    //  X: the x-coordinates of the data points, must be increasing
    //  Y: the y-coordinates of the data points, same length as X.
    if (X.length === 0 || Y.length === 0)
        throw new Error("Expected at least 1 data point") 
    if (X.length !== Y.length)
        throw new Error("Expected X.length === Y.length")


    const x_0 = X[0];
    const x_n = X[X.length - 1];
    const y_0 = Y[0];
    const y_n = Y[Y.length - 1];

    // Ensure x is within bounds
    if (x_interpolate < x_0) return y_0;
    if (x_interpolate > x_n) return y_n;

    // Could use bisect left here but don't want to implement
    let i = 0;
    while (X[i] <= x_interpolate) { i += 1 };

    // Interpolate between two points in time
    const x1 = X[i - 1];
    const x2 = X[i];
    const y1 = Y[i - 1];
    const y2 = Y[i];

    if (x2 === x1)
        throw new Error("Expected X to monotonically increasing");

    const slope = (y2 - y1) / (x2 - x1);
    return y1 + slope * (x_interpolate - x1);
}

export function round(x, decimals) {
    // Rounds x to the nearest decimal place
    // Arguments
    //  x: a Number
    //  decimals (optional, default=0): the number of decimal places to round to
    if (decimals === undefined)
        decimals = 0;
    return Math.round(x * 10**decimals) / 10**decimals;
}

export function celsius_to_f(c) {
    return c * (9 / 5) + 32;
}

export function skyCoverToIcon(sky_cover) {
    switch (sky_cover) {
        case "Sunny": return "wi-day-sunny";
        case "Partly Cloudy": return "wi-day-cloudy";
        case "Cloudy": return "wi-cloudy";
        default: throw new Error(`Unexpected sky_cover category '${sky_cover}'`)
    }
}

export function useForceUpdate(){
    const [value, setValue] = useState(0); // integer state
    return () => setValue(value => value + 1); // update state to force render
}

export function getDatesBetween(start_date, end_date, date_increment) {
    date_increment = date_increment ?? ONE_DAY;

    // Returns the days between start date and end date
    let start = new Date(start_date.getTime());
    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);
    start.setMilliseconds(0);
    if (start < start_date)
        start = new Date(start.getTime() + date_increment);
    let res = [];
    for (let t = start.getTime(); t < end_date.getTime(); t += date_increment)
        res.push(new Date(t));
    return res;
}

export function clamp(x, min, max) {
    if (x < min) return min;
    if (x > max) return max;
    return x;
}

export function format_ymd(date) {
    // formats date as YYYYMMDD
    const year = String(date.getUTCFullYear());
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}${month}${day}`;
}

export function colorFromHex(hex_code) {
    let res = [];
    let start_index = (hex_code[0] === '#') ? 1 : 0;
    for (let i = start_index; i < hex_code.length; i += 2)
        res.push(Number.parseInt(hex_code.substring(i, i + 2), 16));
    return res;
}

export function colorScale(colors, discrete) {
    // returns a function that maps a percent in [0, 1] to a range of colors
    // Arguments:
    //  colors: an array of 3-length rgb arrays (e.g [[0, 0, 0], [255, 255, 0]])
    //  discrete (optional, default=false): whether to create a discrete color map
    if (discrete === undefined)
        discrete = false;
    return (percent) => {
        if (percent <= 0)
            return colors[0];
        if (percent >= 1.0)
            return colors[colors.length - 1];
        if (discrete) {
            let color_index = Math.floor(percent * colors.length);
            return colors[color_index]; 
        }
        
        let color_index = Math.floor(percent * (colors.length - 1)); 
        let c1 = colors[color_index];
        let c2 = colors[color_index + 1];
        
        // Linearly interpolate between c1 and c2
        let c1_percent = color_index / (colors.length - 1);
        let c2_percent = (color_index + 1) / (colors.length - 1);
        percent = (percent - c1_percent) / (c2_percent - c1_percent);
        let res = [];
        for (let i = 0; i < c1.length; i++)
            res.push(Math.floor(c1[i] + (c2[i] - c1[i]) * percent))
        return res;
    }
}
 
export function colorGradient(c1, c2, num_colors) {
    // Breaks apart two colors into a gradient of colors between the two
    // Arguments:
    //  c1: the first color in the gradient
    //  c2: the last color in the gradient
    //  num_colors (optional, default=2): the number of colors in the result (minimum is 2)
    num_colors = num_colors ?? 2; 
    num_colors = Math.max(num_colors, 2);

    let gradient = [];
    for (let i = 0; i < num_colors; i++) {
        let percent = (i / (num_colors - 1));
        let new_color = [];
        for (let j = 0; j < c1.length; j++)
            new_color.push(c1[j] + (c2[j] - c1[j]) * percent);
        gradient.push(new_color);
    }
    return gradient;
}

// Colors taken from https://github.com/Kitware/ParaView/blob/6777e1303f9d1eb341131354616241dbc5851340/Wrapping/Python/paraview/_colorMaps.py#L1599
export const ice_to_fire_discrete = colorScale(
    [[0, 30, 77], [0, 55, 134], [14, 88, 168], [32, 126, 184], [48, 164, 202], [83, 200, 223],
    [155, 228, 239], [225, 233, 209], [243, 213, 115], [231, 176, 0], [218, 130, 0], [198, 84, 0],
    [172, 35, 0], [130, 0, 0], [76, 0, 0]], true
);

export const ice_to_fire = colorScale(
    [[0, 30, 77], [0, 55, 134], [14, 88, 168], [32, 126, 184], [48, 164, 202], [83, 200, 223],
    [155, 228, 239], [225, 233, 209], [243, 213, 115], [231, 176, 0], [218, 130, 0], [198, 84, 0],
    [172, 35, 0], [130, 0, 0], [76, 0, 0]], false
);

export function parse_time_range(range) {
    // Parses an Array of (String | Number)
    // if String it is interpreted as a date
    // if Number it is interpreted as 'x' amount of days before today's date
    return range.map((x) => {
        if (typeof x === 'number')
            return today(x);
        return new Date(x);
    })
}

export function axis_ticks_auto(x_min, x_max, acceptable_increments, max_ticks) {
    // Used to choose which values are displayed as ticks on some axis
    //
    // Arguments:
    //  x_min: the minimum value of the axis
    //  x_max: the maximum value of the axis
    //  acceptable_increments (optional): an Array of acceptable increments between ticks, monotonically increasing
    //  max_ticks (optional): the maximum number of ticks on the axis, default=7
    // Returns:
    //  an Array of x values of where to place ticks on some axis
    acceptable_increments = acceptable_increments ?? [0.1, 0.25, 0.5, 1, 2, 5, 10, 25, 50, 100, 1000];
    max_ticks = max_ticks ?? 7;

    // number of ticks for each increment
    let number_of_ticks = acceptable_increments
        .map((increment) => {
            let tick_start = increment * Math.ceil(x_min / increment);
            let tick_end = increment * Math.floor(x_max / increment);

            if (tick_start >= tick_end)
                return 0;

            let num_ticks = Math.floor((tick_end - tick_start) / increment) + 1; 
            return num_ticks;
        });

    // find the greatest number of ticks that is less than max ticks
    // could use binary search here but too lazy to implement
    let best_increment_index = number_of_ticks - 1;
    for (let i = number_of_ticks.length - 2; i >= 0; i--) {
        if (number_of_ticks[i] > max_ticks) {
            best_increment_index = i + 1;
            break;
        } else if (i == 0) {
            best_increment_index = 0;
        }
    }

    const best_increment = acceptable_increments[best_increment_index];
    const tick_start = best_increment * Math.ceil(x_min / best_increment);
    const tick_end = best_increment * Math.floor(x_max / best_increment);
    const ticks = [];
    for (let i = tick_start; i <= tick_end; i += best_increment)
        ticks.push(i)
    return ticks;
}

export function useIsMounted() {
    // https://stackoverflow.com/a/64379060/9175592
    const isMountedRef = useRef(true);
    const isMounted = useCallback(() => isMountedRef.current, []);

    useEffect(() => {
        return () => void (isMountedRef.current = false);
    }, []);

    return isMounted;
}