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
import WaveHeight from './modules/LakeConditions/WaveHeight';
import WaterTemperature from './modules/LakeConditions/WaterTemperature';
import Algae from './modules/LakeConditions/Algae';
import Clarity from './modules/LakeConditions/Clarity';
import LakeLevel from './modules/LakeConditions/LakeLevel';
import RiversCreeks from './modules/RiverConditions/RiversCreeks';

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
    <BrowserRouter basename='laketahoeindepth'>
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
                    path={MODULES.CITIZEN_SCIENCE.href}
                    />
                
                <Route 
                    element={<RiverConditions/>}
                    path={MODULES.RIVER_CONDITIONS.href}
                    >
                    
                    { Redirect(`/${MODULES.RIVER_CONDITIONS.href}/${MODULES.RIVER_CONDITIONS.TABS.RIVERS_CREEKS.href}`) }

                    <Route
                        element={<RiversCreeks/>}
                        path={MODULES.RIVER_CONDITIONS.TABS.RIVERS_CREEKS.href}
                        />

                </Route>

                <Route 
                    element={<LakeConditions/>}
                    path={MODULES.LAKE_CONDITIONS.href}
                    >

                    { Redirect(`/${MODULES.LAKE_CONDITIONS.href}/${MODULES.LAKE_CONDITIONS.TABS.WAVE_HEIGHT.href}`) }

                    <Route
                        element={<WaveHeight/>}
                        path={MODULES.LAKE_CONDITIONS.TABS.WAVE_HEIGHT.href}
                        />

                    <Route
                        element={<WaterTemperature/>}
                        path={MODULES.LAKE_CONDITIONS.TABS.WATER_TEMPERATURE.href}
                        />

                    <Route
                        element={<Algae/>}
                        path={MODULES.LAKE_CONDITIONS.TABS.ALGAE.href}
                        />

                    <Route
                        element={<Clarity/>}
                        path={MODULES.LAKE_CONDITIONS.TABS.CLARITY.href}
                        />
                    
                    <Route
                        element={<LakeLevel/>}
                        path={MODULES.LAKE_CONDITIONS.TABS.LAKE_LEVEL.href}
                        />

                </Route>

            </Route>
        </Routes>
    </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
