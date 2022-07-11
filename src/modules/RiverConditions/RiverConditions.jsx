import { useState } from "react";
import ModuleContainer from "../../components/ModuleContainer/ModuleContainer";
import ModuleBottomTabs from "../../components/TabGroup/ModuleBottomTabs/ModuleBottomTabs";

import "./RiverConditions.css";
import "../../css/Modules.css";
import { parse_time_range } from "../../js/util";

import MODULES from "../../static/modules.json";

function RiverConditions(props) {
    const [bottom_tab_index, setBottomTabIndex] = useState(2);
     
    const tab_names = MODULES.LAKE_CONDITIONS.BOTTOM_TABS
        .map((tab) => tab.name);

    const chart_time_range = parse_time_range(
        MODULES.LAKE_CONDITIONS
        .BOTTOM_TABS[bottom_tab_index].time_range
    );
    
    return (
        <>
        <ModuleContainer
            module={MODULES.RIVER_CONDITIONS}
            context={chart_time_range}
            />
        <ModuleBottomTabs
            default_tab={bottom_tab_index}
            tab_names={tab_names}
            onTabChanged={(idx) => setBottomTabIndex(idx)}
            />
        </>
    );
}

export default RiverConditions;