import { TercAPI } from "../../js/terc_api";
import StationChart from "./StationChart";

function WaveHeight(props) {
    const chart_props = {
        "y_label": "WAVE HEIGHT (FT)",
        "min_y": 0,
        "max_y": 3,
        "y_ticks": 7
    };
    return (
        <StationChart
            data_type_name={TercAPI.WAVE_HEIGHT_NAME}
            chart_props={chart_props}
            />
    );
}

export default WaveHeight;