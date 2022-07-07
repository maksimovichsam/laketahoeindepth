import "./LakeConditions.css"
import StationChart from "./StationChart";
import { TercAPI } from "../../js/terc_api";

function WaterTemperature(props) {
    const chart_props = {
        "y_label": "WATER TEMPERATURE (F)",
        "y_ticks": 7
    };
    return (
        <StationChart
            data_type_name={TercAPI.WATER_TEMPERATURE_NAME}
            chart_props={chart_props}
            />
    );
}

export default WaterTemperature;