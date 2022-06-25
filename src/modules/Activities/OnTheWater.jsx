import MODULES from "../../static/modules.json";
import ActivitySelector from "./ActivitySelector";

function OnTheWater(props) {
    return (
        <ActivitySelector
            activity_tab={MODULES.ACTIVITIES.TABS.WATER}
            />
    );
}

export default OnTheWater;