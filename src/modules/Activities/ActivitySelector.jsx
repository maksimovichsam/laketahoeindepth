import { useEffect, useState } from "react";
import { useSearchParams, useOutletContext } from "react-router-dom";

import ModuleBottomTabs from "../../components/TabGroup/ModuleBottomTabs/ModuleBottomTabs";

import { SEASONS, clusterLocationsByDistance, createLatLng } from "../../js/util";
import ACTIVITIES from "../../static/activities.json";
import ACTIVITY_LOCATIONS from "../../static/activity_locations.json";
import Activity from "./Activity";
import ActivityButton from "./ActivityButton";

import APP_CONFIG from "../../static/app_config.json";
import ActivityMarker from "../../components/TahoeMap/ActivityMarker";

const CLUSTER_DISTANCE = APP_CONFIG.ACTIVITY_CLUSTER_DISTANCE; // in miles

function ActivitySelector(props) {
    ////////////////////////////////////////////////////////////
    // Expected props
    // activity_tab: one of the objects within MODULES.ACTIVITIES.TABS
    const { activity_tab } = props;

    const [searchParams, setSearchParams] = useSearchParams();
    const [displayed_activity_index, setDisplayedActivityIndex] = useState(null);
    const [[map_markers, setMapMarkers]] = useOutletContext();

    ////////////////////////////////////////////////////////////
    // Search Params (seasons)
    ////////////////////////////////////////////////////////////
    function onSeasonChanged(idx) {
        const season = SEASONS[idx];
        searchParams.set("season", season.toLowerCase());
        setSearchParams(searchParams);
    }

    let season = searchParams.get("season") ?? SEASONS[0];
    season = season.toLowerCase();
    
    const activities = activity_tab.times[season]
        .map((activity_name) =>
            ACTIVITIES[activity_name]
        );

    ////////////////////////////////////////////////////////////
    // Set map locations based on selected activity
    ////////////////////////////////////////////////////////////
    function onActivityClicked(activity_name) {
        let activity_index = activities.findIndex((a) => a.name === activity_name);
        if (activity_index >= 0)
            setDisplayedActivityIndex(activity_index);        
        else
            setDisplayedActivityIndex(null);
    }

    function createActivityMarkers(activities, icon) {
        // Arguments:
        // activities: a list of activities to display on the map
        // icon (optional): an icon to display for the marker
        const clusters = clusterLocationsByDistance(activities, CLUSTER_DISTANCE);
        return clusters
            .map((cluster) => 
                <ActivityMarker
                    key={`activity-marker-${cluster.coords}`}
                    activities={cluster.locations}
                    position={createLatLng(...cluster.coords)}
                    onActivityClicked={onActivityClicked}
                    showIconsInPopup={icon === undefined}
                    icon={icon}
                    />
            )
    }

    useEffect(() => {
        // Filter activities to those shown in the tab
        const activities_in_season = ACTIVITY_LOCATIONS
            .filter((activity_location) => {
                // true if the activity location matches some activity within the tab
                return activities.some((activity) => activity.name === activity_location.activity);
            });

        // No specific activity is selected, done here
        if (displayed_activity_index === null) {
            setMapMarkers(createActivityMarkers(activities_in_season));
            return;
        }

        // Filter activities to the one that is selected
        const activity = activities[displayed_activity_index];
        const activities_selected = activities_in_season
            .filter((activity_location) => {
                return activity.name === activity_location.activity;
            });
        setMapMarkers(createActivityMarkers(activities_selected, activity.icon));
    }, [season, displayed_activity_index]);
    ////////////////////////////////////////////////////////////

    const activity_buttons = activities
        .map((activity, idx) => 
            <ActivityButton
                key={`activity-button-${activity.name}`}
                activity={activity}
                onClick={() => setDisplayedActivityIndex(idx)}
                />
        );
    
    return (
        <div className="module-content">
            {
            (displayed_activity_index === null) ?
                <>
                    <div className="activity-button-container">
                        { activity_buttons }
                    </div>
        
                    <ModuleBottomTabs
                        onTabChanged={onSeasonChanged}
                        tab_names={SEASONS}
                        />
                </> :
                <Activity
                    onBackPressed={() => setDisplayedActivityIndex(null)}
                    activity={activities[displayed_activity_index]}
                    />
            }

        </div>
    );
}

export default ActivitySelector;