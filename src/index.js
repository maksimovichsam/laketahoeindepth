import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

import reportWebVitals from './reportWebVitals';
import App from './App';
import './css/index.css';

import Images from './modules/Images/Images';
import Activities from './modules/Activities/Activities';
import Weather from './modules/Weather/Weather';
import CitizenScience from './modules/CitizenScience/CitizenScience';
import RiverConditions from './modules/RiverConditions/RiverConditions';
import LakeConditions from './modules/LakeConditions/LakeConditions';
import Photos from './modules/Images/Photos';
import Live from './modules/Images/Live';

import MODULES from "./static/modules.json";
import OnTheWater from './modules/Activities/OnTheWater';
import OnTheMountain from './modules/Activities/OnTheMountain';
import WeatherDisplay from './modules/Weather/WeatherDisplay';

function Redirect(to) {
    return (
        <Route
            path=""
            element={
                <Navigate 
                    to={to} 
                    replace
                    />
                }
            />
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App/>}>

                    { Redirect(`/${MODULES['IMAGES'].href}`) }

                    <Route 
                        element={<Images/>}
                        path={MODULES['IMAGES'].href}
                        >

                        { Redirect(`/${MODULES.IMAGES.href}/${MODULES.IMAGES.TABS.PHOTOS.href}`) }

                        <Route
                            index
                            element={<Photos/>}
                            path={MODULES.IMAGES.TABS.PHOTOS.href}
                            />

                        <Route
                            element={<Live/>}
                            path={MODULES.IMAGES.TABS.LIVE.href}
                            />

                    </Route>
                    
                    <Route 
                        element={<Activities/>}
                        path={MODULES['ACTIVITIES'].href}
                        >

                        { Redirect(`/${MODULES.ACTIVITIES.href}/${MODULES.ACTIVITIES.TABS.WATER.href}`) }

                        <Route
                            index
                            element={<OnTheWater/>}
                            path={MODULES.ACTIVITIES.TABS.WATER.href}
                            />

                        <Route
                            element={<OnTheMountain/>}
                            path={MODULES.ACTIVITIES.TABS.MOUNTAIN.href}
                            />

                    </Route>
                    
                    <Route 
                        element={<Weather/>}
                        path={MODULES['WEATHER'].href}
                        >

                        { Redirect(`/${MODULES.WEATHER.href}/${MODULES.WEATHER.TABS.TEMPERATURE.href}`) }

                        <Route
                            element={<WeatherDisplay/>}
                            path="*"
                            />

                    </Route>
                    
                    <Route 
                        element={<CitizenScience/>}
                        path={MODULES['CITIZEN SCIENCE'].href}
                        />
                    
                    <Route 
                        element={<RiverConditions/>}
                        path={MODULES['RIVER CONDITIONS'].href}
                        />
                    
                    <Route 
                        element={<LakeConditions/>}
                        path={MODULES['LAKE CONDITIONS'].href}
                        />

                </Route>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
