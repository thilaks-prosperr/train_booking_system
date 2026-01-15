import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Train, User, LogOut } from 'lucide-react';

function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    // Assuming backend returns role "USER" or "ADMIN"
    const dashboardLink = user?.role === 'ADMIN' ? '/admin' : '/dashboard';

    return (
        <nav className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50 shadow-sm">
            <div className="container flex h-16 items-center justify-between px-4 max-w-screen-2xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                        <Train className="w-5 h-5" />
                    </div>
                    <Link to="/" className="text-xl font-bold tracking-tight hover:opacity-90 transition-opacity text-foreground">
                        RailBook
                    </Link>
                </div>

                <div className="flex items-center gap-6">
                    <Link to="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                        Home
                    </Link>
                    <Link to="/about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                        About
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-4 border-l pl-4 ml-2 border-border/50">
                            <Link
                                to={dashboardLink}
                                className="flex items-center justify-center w-9 h-9 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
                                title="My Dashboard"
                            >
                                <User className="w-4 h-4" />
                            </Link>
                            {/* Only show logout if on dashboard/admin pages as per request */}
                            {(location.pathname.includes('/dashboard') || location.pathname.includes('/admin')) && (
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 ml-2">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
