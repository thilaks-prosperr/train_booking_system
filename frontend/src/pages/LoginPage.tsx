import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    // const [loginType, setLoginType] = useState('USER'); // Unused for logic, just UI
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/auth/login', { username, password });
            login(res.data);

            if (res.data.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err: any) {
            console.error(err);
            if (err.response && err.response.status === 401) {
                setError('Invalid credentials');
            } else {
                setError('Login failed. Please try again later.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
            <div className="w-full max-w-[400px] bg-card border border-border/50 shadow-lg rounded-xl p-6">
                <div className="flex items-center gap-4 mb-6">
                    <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        ← Back
                    </Link>
                    <h2 className="text-2xl font-bold">Login</h2>
                </div>

                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Username / Email</label>
                        <input
                            type="text"
                            className="w-full p-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Password</label>
                        <input
                            type="password"
                            className="w-full p-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Login
                    </button>
                    <div className="text-center text-sm text-muted-foreground mt-4">
                        Don't have an account? <Link to="/signup" className="text-primary hover:underline">Sign Up</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;
