import "./Activities.css";

function Activity(props) {
    const { activity } = props;

    return (
        <div 
            style={{"backgroundImage": `url(${activity.poster})`}}
            className="activity"
            >

            <div className="activity-header">
                <div className="activity-title"> 
                    { activity.name }
                </div>
                <div className="activity-desc">
                    { activity.desc }
                </div>
            </div>

            <div
                onClick={props.onBackPressed}
                className="activity-arrow"
                />

        </div>
    );
}

export default Activity;