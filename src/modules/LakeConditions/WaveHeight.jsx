import { useOutletContext } from "react-router-dom";
import { TercAPI } from "../../js/terc_api";
import StationChart from "./StationChart";

function WaveHeight(props) {
    const [_, __, chart_time_range] = useOutletContext();
    const [chart_start_date, chart_end_date] = chart_time_range;

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
            start_date={chart_start_date}
            end_date={chart_end_date}
            />
    );
}

export default WaveHeight;