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

    const login = (token, role, username, userId) => {
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

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
