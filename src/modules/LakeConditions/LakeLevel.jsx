import { useOutletContext } from "react-router-dom";
import "./LakeConditions.css"
import StationChart from "./StationChart";
import { TercAPI } from "../../js/terc_api";

function LakeLevel(props) {
    const [_, __, chart_time_range] = useOutletContext();
    const [chart_start_date, chart_end_date] = chart_time_range;

    const chart_props = {
        "y_label": "LAKE LEVEL (FT)",
        "y_ticks": 7,
        "min_y": 6220,
        "max_y": 6230
    };

    return (
        <StationChart
            data_type_name={TercAPI.LAKE_LEVEL_NAME}
            chart_props={chart_props}
            start_date={chart_start_date}
            end_date={chart_end_date}
            />
    );
}

export default LakeLevel;