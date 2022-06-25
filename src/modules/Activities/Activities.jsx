import ModuleContainer from "../../components/ModuleContainer/ModuleContainer";
import "./Activities.css";

import MODULES from "../../static/modules.json";

function Activities(props) {
    return (
        <ModuleContainer
            module={MODULES.ACTIVITIES}
            />
    );
}

export default Activities;