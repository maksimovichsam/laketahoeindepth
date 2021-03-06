import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import './css/App.css';

import Header from './components/Header/Header';
import ModuleHeader from './components/ModuleHeader/ModuleHeader';
import ModuleButton from './components/TabGroup/ModuleSelector/ModuleButton';
import ModuleSelector from './components/TabGroup/ModuleSelector/ModuleSelector';
import TahoeMap from './components/TahoeMap/TahoeMap';

import MODULES from "./static/modules.json";
import { clamp } from './js/util';

function App() {
    const [module_index, setModuleIndex] = useState(0);
    const [map_markers, setMapMarkers] = useState([]);
    const [active_location_idx, setActiveLocation] = useState(0);
    
    function safelySetMapMarkers(markers) {
        setActiveLocation(clamp(active_location_idx, 0, markers.length - 1));
        setMapMarkers(markers);
    }

    /////////////////////////////////////////////////
    // Determine which module is currently active
    // by parsing the window's URL
    ////////////////////////////////////////////////
    const location = useLocation();
    useEffect(() => {
        let url = location.pathname.split('/');

        // Case where url is '/'
        if (url.length <= 1 || url[1] === '') {
            setModuleIndex(0);
            return;
        }

        let module_href = url[1];
        let m_index = Object.values(MODULES).findIndex((m) => m.href === module_href);
        if (m_index < 0)
            throw new Error(`Unable to find module for href ${location.pathname}`);
        else
            setModuleIndex(m_index);
    }, [location]);


    const active_module = Object.values(MODULES)[module_index];
    const module_buttons = Object.values(MODULES)
        .reduce((filtered, module, idx) => {
            const button = (
                <ModuleButton 
                    key={module.name}
                    active={idx === module_index}
                    name={module.name} 
                    image={module.image}
                    href={module.href}
                    onClick={() => {
                        setActiveLocation(0);
                        setModuleIndex(idx);
                    }}
                    />
                );
            
            const module_is_active = module.active !== false;
            if (module_is_active)
                filtered.push(button);
            return filtered;
        }, []);

    return (
        <div className="App">
            <div className="dashboard">
                <Header/>
                
                <div className="module-navigation">
                    <ModuleHeader module={active_module}/>
                    
                    <ModuleSelector>
                        { module_buttons }
                    </ModuleSelector>
                </div>

                <Outlet
                    context={[
                        map_markers, safelySetMapMarkers,
                        active_location_idx, setActiveLocation,
                        ]}
                    />
            </div>

            <TahoeMap>
                { map_markers }
            </TahoeMap>
        </div>
    );
}

export default App;
