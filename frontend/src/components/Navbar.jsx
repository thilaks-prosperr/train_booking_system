import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <span className="logo-icon">🚆</span>
                <Link to="/" className="brand-text">RailBook</Link>
            </div>
            <div className="navbar-links">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="#" className="nav-link">About</Link>
                <Link to="/api/admin/stats" className="btn-login">
                    Login
                </Link>
            </div>
        </nav>
    );
}

export default Navbar;
