import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

function Navbar() {
    const { user, logout } = useAuth();
    // Assuming backend returns role "USER" or "ADMIN"
    const dashboardLink = user?.role === 'ADMIN' ? '/admin' : '/dashboard';

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <span className="logo-icon">🚆</span>
                <Link to="/" className="brand-text">RailBook</Link>
            </div>
            <div className="navbar-links">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/about" className="nav-link">About</Link>
                {user ? (
                    <div className="user-menu">
                        <Link to={dashboardLink} className="user-icon-link" title="My Dashboard">
                            <span className="user-icon">👤</span>
                        </Link>
                        <button onClick={logout} className="btn btn-danger btn-sm">
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link to="/login" className="btn btn-primary">
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
