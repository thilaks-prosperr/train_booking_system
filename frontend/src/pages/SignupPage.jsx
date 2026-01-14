import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function SignupPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}/api/auth/register`, {
                username: formData.username,
                password: formData.password,
                email: formData.email,
                fullName: formData.fullName
            });
            alert("Registration successful! Please login.");
            navigate('/login');
        } catch (err) {
            console.error(err);
            setError('Registration failed. Username may be taken.');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f5f5f5' }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Sign Up</h2>
                {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label>Full Name</label>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label>Username</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label>Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label>Confirm Password</label>
                        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', background: 'var(--primary-color, #007bff)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Sign Up</button>
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        Already have an account? <Link to="/login">Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignupPage;
