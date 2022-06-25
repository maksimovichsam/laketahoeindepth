import "./Activities.css";

function ActivityButton(props) {
    ////////////////////////////////////////
    // Expected props
    // activity: an activity object found in activities.json
    // onClick: callback function for when the button is clicked
    const { activity } = props;
    
    return (
        <div
            onClick={() => props.onClick() }
            style={{'backgroundImage': `url(${activity.thumb})` }} 
            className="activity-button"> 
        </div>
    );
}

export default ActivityButton;