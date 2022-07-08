import ModuleContainer from "../../components/ModuleContainer/ModuleContainer";

import "./RiverConditions.css";
import "../../css/Modules.css";

import MODULES from "../../static/modules.json";

function RiverConditions(props) {
    return (
        <ModuleContainer
            module={MODULES.RIVER_CONDITIONS}
            />
    );
}

export default RiverConditions;