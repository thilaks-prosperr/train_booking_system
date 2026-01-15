import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

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
            const res = await api.post('/auth/login', { username, password });

            // Optional: Check if role matches selected type
            // if (res.data.role !== loginType) {
            //     setError(`You are not registered as an ${loginType}`);
            //     return;
            // }

            login(res.data);

            if (res.data.role === 'ADMIN') {
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
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '2rem 0' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
                    <Link to="/" className="btn btn-secondary btn-sm" style={{ marginRight: '1rem' }}>← Back</Link>
                    <h2 style={{ margin: 0 }}>Login</h2>
                </div>

                {error && <div className="alert alert-danger" style={{ color: 'var(--danger-color)', marginBottom: '1rem', padding: '0.5rem', background: '#fee2e2', borderRadius: '4px', border: '1px solid #fecaca' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username / Email</label>
                        <input type="text" className="form-control" value={username} onChange={e => setUsername(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Login As</label>
                        <select className="form-control" value={loginType} onChange={e => setLoginType(e.target.value)}>
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">Login</button>
                    <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9em' }}>
                        Don't have an account? <Link to="/signup">Sign Up</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;
