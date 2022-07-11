import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

import TimePlot from "./TimePlot";
import ColorMarker from "../../components/TahoeMap/ColorMarker";
import ErrorMarker from "../../components/TahoeMap/ErrorMarker";
import ModuleBottomTabs from "../../components/TabGroup/ModuleBottomTabs/ModuleBottomTabs";
import "./LakeConditions.css"

import { colorScale, createLatLng, today, useForceUpdate, useIsMounted } from "../../js/util";
import { TercAPI } from "../../js/terc_api";

import APP_CONFIG from "../../static/app_config.json";

function StationChart(props) {
    //////////////////////////////////////////////////////
    // Expected props
    // data_type_name: the name of the data to display, a static member of TercAPI
    // chart_props: props to pass onto TimePlot
    // start_date: the start date of the chart
    // end_date: the end date of the chart
    const forceUpdate = useForceUpdate();
    const isMounted = useIsMounted();
    const [[map_markers, setMapMarkers, active_location_idx, setActiveLocation]] = useOutletContext();
    const [ current_station_data, setCurrentStationData ] = useState({ 
        "time": undefined, 
        "station_data": undefined 
    });
    const { time, station_data } = current_station_data;
    const is_downloading = time === undefined && station_data === undefined;
    const is_unavailable = time === null && station_data === null;

    let { data_type_name, chart_props, start_date, end_date } = props;
    chart_props = chart_props ?? {};

    const STATIONS = TercAPI.get_stations_with_data_type(data_type_name);

    ///////////////////////////////////////
    // Update current station data
    ///////////////////////////////////////
    const current_station = STATIONS[active_location_idx];
    useEffect(() => {
        if (!current_station)
            return;
        current_station
            .get_data(start_date, end_date, data_type_name)
            .then((data) => {
                let time = data[TercAPI.TIME_KEY];
                let station_data = data[data_type_name];
                setCurrentStationData({"time": time, "station_data": station_data});
            })
            .catch((err) => {
                console.log(err);
                setCurrentStationData({"time": null, "station_data": null});
            });
    }, [active_location_idx, start_date, end_date]);

    ///////////////////////////////////////
    // Setup all stations
    ///////////////////////////////////////
    useEffect(() => {
        const loading_marker = <ColorMarker
                                    key={`location-marker`}
                                    position={createLatLng(...APP_CONFIG.MAP_CENTER)}
                                    text={"Loading"}
                                    />;
        setMapMarkers([loading_marker]);

        // Download all station data           
        Promise.all(STATIONS
            .map((station) => 
                station.get_most_recent_data(start_date, end_date, data_type_name)
                    .catch(err => {
                        console.log(`Failed to download valid data from station '${station.name}'`)
                        console.log(err);
                        return null;
                    })
            )
        )
        // Set Map Markers
        .then((most_recent_data) => {
            const valid_data = most_recent_data.filter(x => typeof x === "number");
            const min_value = Math.min(...valid_data);
            const max_value = Math.max(...valid_data);
            const min_color = [57, 140, 135];
            const max_color = [4, 52, 77];
            const color_scale = colorScale([min_color, max_color]);
            const get_color = (value) => {
                const color = (min_value === max_value) ? max_color :
                    color_scale((value - min_value) / (max_value - min_value));
                return `rgb(${color.join(",")})`;
            }
            
            const station_map_markers = 
                STATIONS
                .map((station, idx) => {
                    if (most_recent_data[idx] === null)
                        return <ErrorMarker
                                key={`station-marker-${station.name}-${idx}`}
                                position={createLatLng(...station.coords)}
                                error_msg={`${station.name} temporarily unavailable`}
                                onClick={() => setActiveLocation(idx)}
                                />

                    const marker_text = most_recent_data[idx].toFixed(1);
                    return <ColorMarker
                        key={`station-marker-${station.name}-${idx}`}
                        position={createLatLng(...station.coords)}
                        text={marker_text}
                        color={get_color(most_recent_data[idx])}
                        onClick={() => setActiveLocation(idx)}
                        />  
                });

            if (isMounted())
                setMapMarkers(station_map_markers);
        })
    }, [start_date, end_date]);

    return (
        <div className="lake-conditions-chart-container"> 
            {
                (is_downloading) ? 
                    <div> 
                        Downloading data
                    </div>
                : (is_unavailable) ?
                    <div>
                        Data at {current_station.name} is temporarily unavailable
                    </div>
                : 
                    <>
                    <div className="chart-title"> {current_station.name} </div>
                    <TimePlot
                        time={time}
                        y={station_data}
                        {...chart_props}
                        />
                    </>
            }
        </div>
    );
}

export default StationChart;