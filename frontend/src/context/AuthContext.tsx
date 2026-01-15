import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const username = localStorage.getItem('username'); // Optional
        const userId = localStorage.getItem('userId');

        if (token && role) {
            setUser({ token, role, username, userId });
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        const { token, role, username, userId } = userData;
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('username', username);
        localStorage.setItem('userId', userId);
        setUser({ token, role, username, userId });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        setUser(null);
    };

    const isAuthenticated = !!user;
    const isAdmin = user?.role === 'ADMIN';

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated, isAdmin }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
