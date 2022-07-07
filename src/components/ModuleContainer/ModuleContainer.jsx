import { useState, useEffect } from "react";
import { Outlet, useOutletContext, useLocation } from "react-router-dom";

import ModuleTopTab from "../TabGroup/ModuleTopTabs/ModuleTopTab";
import ModuleTopTabs from "../TabGroup/ModuleTopTabs/ModuleTopTabs";

import "../../css/Modules.css";
import "./ModuleContainer.css";

function ModuleContainer(props) {
    ////////////////////////////////////////////////////////////////
    // Expected props
    // props.module: a MODULE object from modules.json
    // transparent_tabs (optional, default=false): whether to use transparent tabs
    // context: additional state information to pass to the outlet 
    let { module, transparent_tabs } = props;
    transparent_tabs = transparent_tabs ?? false;

    let [tab_index, setTabIndex] = useState(0);
    const current_tab = Object.values(module.TABS)[tab_index];

    //////////////////////////////////////////////////////////
    // Determine which tab is currently active by parsing url
    //////////////////////////////////////////////////////////
    const location = useLocation();
    useEffect(() => {
        let url = location.pathname.split('/');

        let image_index = url.indexOf(module.href);
        // Case where url is '/images/'
        if (image_index < 0 || image_index + 1 >= url.length) {
            setTabIndex(0);
            return;
        }

        let tab_href = url[image_index + 1];
        let t_index = Object.values(module.TABS).findIndex((t) => t.href === tab_href);
        if (t_index < 0)
            throw new Error(`Unable to find tab for href ${location.pathname}`);
        else
            setTabIndex(t_index);
    }, [location]);
    
    const tabs = Object.values(module.TABS).map((m, idx) => {
        return <ModuleTopTab
                    key={`module-tab-${m.name}`}
                    name={m.name}
                    href={m.href}
                    active={idx === tab_index}
                    />
    });

    const context = useOutletContext();
    const combined_context = [context, tab_index];
    if (props.context)
        combined_context.push(props.context);

    // Create image style if current tab has an image
    const background_image = current_tab.image;
    const background_image_style = (background_image) ? {
        "backgroundImage": `url(${background_image})`,
        "backgroundSize": "cover",
        "backgroundPosition": "50%"
    } : undefined;

    const tab_has_header = current_tab.desc !== undefined;

    return (
        <div className="module-container"
            style={ background_image_style }
            > 
            <div 
                className={transparent_tabs ? "transparent-top-tabs" : ""}>
                    
                <ModuleTopTabs>
                    {tabs}
                </ModuleTopTabs>

            </div>

            <div className="tab-content">
                <Outlet context={combined_context}/>

                {
                    tab_has_header &&
                    <div className="tab-header">
                        <div className="tab-title"> 
                            { current_tab.name }
                        </div>
                        <div className="tab-desc">
                            { current_tab.desc }
                        </div>
                    </div>
                }

            </div>
        </div>
    );
}

export default ModuleContainer;