import IconMarker from "./IconMarker";
import "./TahoeMap.css";

function PhotoMarker(props) {
    return (
        <IconMarker
            active={props.active}
            position={props.position}
            onClick={props.onClick}
            >
            <div className="photo-marker-popup"> {props.location} </div>
        </IconMarker>
    )
}

export default PhotoMarker