import { useEffect } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";

import ModuleBottomTabs from "../../components/TabGroup/ModuleBottomTabs/ModuleBottomTabs";

import "../../css/Modules.css";
import "./Images.css";

import PHOTOS from "../../static/photos.json";
import { capitalizeFirstLetter, createLatLng, SEASONS } from "../../js/util";
import PhotoMarker from "../../components/TahoeMap/PhotoMarker";

function Photos(props) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [[map_markers, setMapMarkers, active_location_idx, setActiveLocation]] = useOutletContext();
    
    function onSeasonChanged(idx) {
        const season = SEASONS[idx];
        searchParams.set("season", season.toLowerCase());
        setSearchParams(searchParams);
    }

    ///////////////////////////////////////////////////////////////
    // Set Photo Map Markers
    ///////////////////////////////////////////////////////////////
    const PHOTO_MAP_MARKERS = PHOTOS
        .map(({location, coords}, idx) => 
            <PhotoMarker
                key={`photo-marker-${idx}`}
                position={createLatLng(...coords)}
                location={location}
                onClick={() => setActiveLocation(idx)}
                />
        );
        
    useEffect(() => {
        setMapMarkers(PHOTO_MAP_MARKERS);
    }, []);
    ///////////////////////////////////////////////////////////////
    
    const active_location = PHOTOS[active_location_idx];
    const season = capitalizeFirstLetter(searchParams.get("season") ?? SEASONS[0]);
    const photos = active_location.photos[season]

    let img;
    if (photos.length >= 1) {
        let { filename, credit } = photos[0];
        let file_path = `/static/img/photos/${filename}`

        img = (
            <div className="photos-container">
                <div 
                    className="photos-img" 
                    style={{'backgroundImage': `url(${file_path})`}} 
                    alt={active_location.location}
                    />
                <div className="photos-location"> { active_location.location } </div>
                <div className="photos-credit"> { credit }</div>
            </div>
        ); 
    } else {
        // Case 'Image not found'
        img = (
            <div className="photos-container">
                <div className="photos-location"> { active_location.location } </div>
                <div className="photos-placeholder"> 
                    No image found
                </div>
            </div>
        );
    }

    return (
        <div className="module-container">
            <div className="module-content">
                { img }
            </div>
            
            <ModuleBottomTabs
                onTabChanged={onSeasonChanged}
                tab_names={SEASONS}
                />
        </div>
    );
}

export default Photos;