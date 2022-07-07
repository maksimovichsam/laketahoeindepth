import "./LakeConditions.css"
import StationChart from "./StationChart";
import { TercAPI } from "../../js/terc_api";

function LakeLevel(props) {
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
            />
    );
}

export default LakeLevel;