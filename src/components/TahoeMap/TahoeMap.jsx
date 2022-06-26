import { MapContainer, TileLayer } from "react-leaflet";
import "./TahoeMap.css";

import { createLatLng } from "../../js/util";
import MAP_LABELS from "../../static/map_labels.json";
import APP_CONFIG from "../../static/app_config.json";
import TextMarker from "./TextMarker";

///////////////////////////////////////////////////
// Static Constants
///////////////////////////////////////////////////
const MAP_BOUNDS = APP_CONFIG.MAP_BOUNDS;
const MAP_LABEL_MARKERS = MAP_LABELS.map((label) => {
    return (
        <TextMarker
            key={`map-marker-${label.name}`}
            text={label.name}
            position={createLatLng(...label.loc)}
            />
    );
});

function TahoeMap(props) {
    return (
        <div className="tahoe-map">
            <MapContainer 
                style={{height: "100%", width: "100%"}}
                center={APP_CONFIG.MAP_CENTER}
                zoom={11}
                dragging={false}
                zoomControl={false}
                scrollWheelZoom={false}
                touchZoom={false}
                doubleClickZoom={false}
                >

                <TileLayer
                    url="http://sm.mapstack.stamen.com/($809380[@p],(terrain-background,$a79880[hsl-color])[overlay@80],toner-lines[multiply@40],(mapbox-water,$000[@20],$04344d[hsl-color]))/{z}/{x}/{y}.png"
                    />

                { MAP_LABEL_MARKERS }

                { props.children }

            </MapContainer>

        </div>
    );
}

export default TahoeMap;