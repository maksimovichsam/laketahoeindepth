import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import './css/App.css';

import Header from './components/Header/Header';
import ModuleHeader from './components/ModuleHeader/ModuleHeader';
import ModuleButton from './components/TabGroup/ModuleSelector/ModuleButton';
import ModuleSelector from './components/TabGroup/ModuleSelector/ModuleSelector';
import TahoeMap from './components/TahoeMap/TahoeMap';

import MODULES from "./static/modules.json";

function App() {
    const [module_index, setModuleIndex] = useState(0);
    const [map_markers, setMapMarkers] = useState([]);
    const [active_location_idx, setActiveLocation] = useState(0);
    
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
    const module_buttons = Object.values(MODULES).map((m, idx) => 
        <ModuleButton 
            key={m.name}
            active={idx === module_index}
            name={m.name} 
            image={m.image}
            href={m.href}
            onClick={() => {
                setActiveLocation(0);
                setModuleIndex(idx);
            }}
            />
    );

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
                        map_markers, setMapMarkers,
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
