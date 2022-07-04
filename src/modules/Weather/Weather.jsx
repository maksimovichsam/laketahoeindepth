import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import ModuleContainer from "../../components/ModuleContainer/ModuleContainer";
import "./Weather.css";
import "../../css/Modules.css";

import WeatherService from "../../js/nws_api";
import MODULES from "../../static/modules.json";
import WEATHER_LOCATIONS from "../../static/weather_locations.json";
import PhotoMarker from "../../components/TahoeMap/PhotoMarker";
import { createLatLng } from "../../js/util";

function Weather(props) {
    const [forecasts, setForecasts] = useState(undefined);
    const [map_markers, setMapMarkers, active_location_idx, setActiveLocation] = useOutletContext();

    const forecasts_loading = forecasts === undefined;
    const forecasts_unavailable = forecasts === null;
    const active_weather_location = WEATHER_LOCATIONS[active_location_idx];

    //////////////////////////////////////////////////////////
    // Set Weather Locations Map Markers
    //////////////////////////////////////////////////////////
    useEffect(() => {
        const WEATHER_MAP_MARKERS = WEATHER_LOCATIONS
            .map(({name, coords}, idx) =>
                <PhotoMarker
                    key={`weather-marker-${idx}`}
                    active={idx === active_location_idx}
                    position={createLatLng(...coords)}
                    location={name}
                    onClick={() => setActiveLocation(idx)}
                    />
            );

        setMapMarkers(WEATHER_MAP_MARKERS);
    }, [active_location_idx]);
    
    //////////////////////////////////////////////////////////
    // Retrieve weather data
    //////////////////////////////////////////////////////////
    function updateForecasts(office, gridX, gridY) {
        setForecasts(undefined);
        WeatherService.get_forecasts(office, gridX, gridY)
            .then((f) => {
                setForecasts(f);
            })
            .catch(() => {
                setForecasts(null);
            });
    }

    useEffect(() => {
        const {office, gridX, gridY} = active_weather_location;
        updateForecasts(office, gridX, gridY);
    }, [active_weather_location]);
    //////////////////////////////////////////////////////////

    return (
        <div className="module-container weather-container">  
            {
                forecasts_loading ? 
                    <div className="weather-message"> 
                        Loading Weather Forecasts 
                    </div> 
                    :

                forecasts_unavailable ? 
                    <div className="weather-message-error"> 
                        Weather Forecasts Unavailable
                    </div> 
                    :

                <ModuleContainer
                    module={MODULES.WEATHER}
                    context={[forecasts, updateForecasts]}
                    />
            }
        </div>
    );
}

export default Weather;