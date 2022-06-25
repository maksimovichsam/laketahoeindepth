import ACTIVITIES from "../static/activities.json";

import { useState } from "react";

export const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const SEASONS = ["Spring", "Summer", "Fall", "Winter"];
export const SEASON_TIMES = [   
    ["03-21", "06-20"],
    ["06-21", "09-20"],
    ["09-21", "12-20"],
    ["01-01", "03-20"]
];

export const DEFAULT_ROUTE = "/images/photos?season=fall";

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

    const HOUR = 60 * 60 * 1000;
    let time = [];
    let values = [];
    for (let { validTime, value } of array) {
        let [date, duration] = parse_interval(validTime);
        // Round date to nearest hour as a sanity check
        date = roundDateToHour(date);
        for (let i = 0; i < duration; i++) {
            time.push(date);
            values.push(value);
            date = new Date(date.getTime() + HOUR);
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

    const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
    let now = new Date();
    now = new Date(now.getTime() + days * ONE_DAY_IN_MS);
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