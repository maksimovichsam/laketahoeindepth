import "./ModuleHeader.css";

function ModuleHeader(props) {
    let { module } = props;

    return (
        <div className="module-header">
            <div className="module-header-name"> { module.name } </div>
            <p className="module-header-desc"> { module.description }</p>
        </div>
    );
}

export default ModuleHeader;