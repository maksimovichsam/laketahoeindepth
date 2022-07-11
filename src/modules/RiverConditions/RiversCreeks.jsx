import { useOutletContext } from "react-router-dom";
import StationChart from "../LakeConditions/StationChart";
import { TercAPI } from "../../js/terc_api";
import "./RiverConditions.css";

function RiversCreeks(props) {
    const [_, __, chart_time_range] = useOutletContext();
    const [chart_start_date, chart_end_date] = chart_time_range;

    const chart_props = {
        "y_label": "DISCHARGE CUBIC FEET PER SECOND",
        "y_ticks": 7,
        "min_y": 0
    };
    return (
        <StationChart
            data_type_name={TercAPI.RIVER_DISCHARGE_NAME}
            chart_props={chart_props}
            start_date={chart_start_date}
            end_date={chart_end_date}
            />
    );
}

export default RiversCreeks;