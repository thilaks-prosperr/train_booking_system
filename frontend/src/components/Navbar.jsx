import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

function Navbar() {
    const { user } = useAuth();
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
                <Link to="#" className="nav-link">About</Link>
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link to={dashboardLink} className="user-icon-link" title="My Dashboard">
                            <span className="user-icon">👤</span>
                        </Link>
                        <button onClick={useAuth().logout} style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link to="/login" className="btn-login">
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
