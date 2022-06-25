import IconMarker from "./IconMarker";
import { getActivityIcon } from "../../js/util";

function ActivityMarker(props) {
    ////////////////////////////////////////////////
    // Expected props
    // activities: a list of activities at this location; ex:
    //   { activity: 'Golfing', activity_group: 'On the Mountain', coords: Array(2), location: 'Squaw Valley Mini Golf'}
    //
    // onActivityClicked: a callback function for when an activity icon is clicked
    // position: see MyCircleMarker props
    // onClick:  see ^^^
    // showIconsInPopup (optional, default=true): whether to show icons in the Popup
    // icon (optional): url to an icon to display for the marker

    let { position, onClick, activities, onActivityClicked, showIconsInPopup } = props;
    // Set defaults
    showIconsInPopup = showIconsInPopup ?? true;
    onActivityClicked = onActivityClicked ?? (() => {});

    let activities_by_location = {};
    for (let activity of activities) {
        let { activity: activity_name, location } = activity;
        if (location in activities_by_location) {
            activities_by_location[location].push(activity_name);
        } else {
            activities_by_location[location] = [activity_name];
        }
    }

    let activity_elements = Object.entries(activities_by_location)
        .map(([location, activities]) => 
            <div
                key={`activity-marker-${location}`} 
                className="activity-marker-popup">
                { location }
                <div className="activity-icon-container">
                    { 
                        showIconsInPopup &&
                        activities.map((activity) => 
                            <img 
                                key={`activity-icon-${location}-${activity}`}
                                onClick={() => onActivityClicked(activity)}
                                src={getActivityIcon(activity)} 
                                alt={activity}
                                />
                        ) 
                    }
                </div>
            </div>
        );

    let icon = (props.icon) ? 
        `<div class="activity-icon-marker-container"> <div style="background-image: url(${props.icon})" class="activity-icon-marker"></div> </div>`
        : undefined;

    return (
        <IconMarker
            position={position}
            onClick={onClick}
            icon={icon}
            >
            { activity_elements }
        </IconMarker>
    )
}

export default ActivityMarker