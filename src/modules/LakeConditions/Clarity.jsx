import "./LakeConditions.css"
import StationChart from "./StationChart";
import { TercAPI } from "../../js/terc_api";

function Clarity(props) {
    const chart_props = {
        "y_label": "CLARITY",
        "y_ticks": 7,
    };
    return (
        <StationChart
            data_type_name={TercAPI.CLARITY_NAME}
            chart_props={chart_props}
            />
    );
}

export default Clarity;