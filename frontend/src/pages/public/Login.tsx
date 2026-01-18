/*
 * Copyright (c) 2026 Thilak S. All Rights Reserved.
 *
 * This source code, inclusive of the logic, design, and intellectual property,
 * is the sole property of Thilak S.
 *
 * Created by Thilak S.
 *
 * This source code is licensed under the proprietary license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await login(username, password);
            navigate('/');
        } catch (err: any) {
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden bg-background text-foreground">
            <Navbar />
            <div className="animated-bg absolute inset-0 z-0 pointer-events-none"></div>

            <main className="relative z-10 flex-1 flex items-center justify-center p-6">
                <div className="glass-card w-full max-w-md p-8">
                    <h2 className="text-3xl font-display font-bold text-center mb-2">Welcome Back</h2>
                    <p className="text-center text-muted-foreground mb-8">Sign in to your RailBook account</p>

                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-background/50 border border-input rounded-md p-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-background/50 border border-input rounded-md p-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-lg py-6 mt-2">
                            Sign In
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-primary hover:underline font-medium">
                            Sign up
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Login;
