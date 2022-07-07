import "./LakeConditions.css";
import "../../css/Modules.css";

import ModuleContainer from "../../components/ModuleContainer/ModuleContainer";

import MODULES from "../../static/modules.json";

function LakeConditions(props) {
    return (
        <ModuleContainer
            module={MODULES.LAKE_CONDITIONS}
            />
    );
}

export default LakeConditions;