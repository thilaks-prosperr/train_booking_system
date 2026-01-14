import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginType, setLoginType] = useState('USER');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { username, password });
            const { token, role, userId } = res.data;

            // Optional: Check if role matches selected type
            // if (role !== loginType) {
            //     setError(`You are not registered as an ${loginType}`);
            //     return;
            // }

            login(token, role, username, userId);

            if (role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 401) {
                setError('Invalid credentials');
            } else {
                setError('Login failed. Please try again later.');
            }
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f5f5f5' }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '350px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Login</h2>
                {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label>Username / Email</label>
                        <input type="text" className="form-control" value={username} onChange={e => setUsername(e.target.value)} required style={{ width: '100%', padding: '0.5rem' }} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label>Password</label>
                        <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '0.5rem' }} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label>Login As</label>
                        <select className="form-control" value={loginType} onChange={e => setLoginType(e.target.value)} style={{ width: '100%', padding: '0.5rem' }}>
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', background: 'var(--primary-color, #007bff)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Login</button>
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        Don't have an account? <Link to="/signup">Sign Up</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;
