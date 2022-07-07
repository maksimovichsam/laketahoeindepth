import "./LakeConditions.css"
import StationChart from "./StationChart";
import { TercAPI } from "../../js/terc_api";

function Algae(props) {
    const chart_props = {
        "y_label": "ALGAE (RELATIVE)",
        "y_ticks": 7,
        "min_y": 0
    };
    return (
        <StationChart
            data_type_name={TercAPI.ALGAE_NAME}
            chart_props={chart_props}
            />
    );
}

export default Algae;