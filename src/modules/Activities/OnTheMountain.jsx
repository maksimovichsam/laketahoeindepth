import MODULES from "../../static/modules.json";
import ActivitySelector from "./ActivitySelector";

function OnTheMountain(props) {
    return (
        <ActivitySelector
            activity_tab={MODULES.ACTIVITIES.TABS.MOUNTAIN}
            />
    );
}

export default OnTheMountain;