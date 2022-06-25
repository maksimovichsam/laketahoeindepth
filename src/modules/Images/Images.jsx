import "./Images.css";

import MODULES from "../../static/modules.json";
import ModuleContainer from "../../components/ModuleContainer/ModuleContainer";

function Images(props) {
    return (
        <ModuleContainer
            module={MODULES.IMAGES}
            transparent_tabs={true}
            />
    );
}

export default Images;