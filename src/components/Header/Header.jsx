import "./Header.css";

function Header(props) {
    return (
        <div className="header">
            <img alt="Lake Tahoe In Depth" src="/laketahoeindepth/static/img/header.png"></img>
            <span className="header-title"> 
                Lake Tahoe In Depth
            </span>
        </div>
    );
}

export default Header;