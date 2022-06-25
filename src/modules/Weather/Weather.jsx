import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import ModuleContainer from "../../components/ModuleContainer/ModuleContainer";
import "./Weather.css";
import "../../css/Modules.css";

import WeatherService from "../../js/nws_api";
import MODULES from "../../static/modules.json";

function Weather(props) {
    const [forecasts, setForecasts] = useState(undefined);
    const [map_markers, setMapMarkers] = useOutletContext();

    const forecasts_loading = forecasts === undefined;
    const forecasts_unavailable = forecasts === null;

    //////////////////////////////////////////////////////////
    // Set Map Markers to None
    //////////////////////////////////////////////////////////
    useEffect(() => {
        setMapMarkers([]);
    }, []);
    
    //////////////////////////////////////////////////////////
    // Retrieve weather data
    //////////////////////////////////////////////////////////
    function updateForecasts() {
        WeatherService.get_forecasts()
            .then((f) => {
                setForecasts(f);
            })
            .catch(() => {
                setForecasts(null);
            });
    }

    useEffect(() => {
        updateForecasts();
    }, []);
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