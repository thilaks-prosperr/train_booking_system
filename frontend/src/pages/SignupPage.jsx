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
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '2rem 0' }}>
            <div className="card" style={{ width: '100%', maxWidth: '450px' }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
                    <Link to="/" className="btn btn-secondary btn-sm" style={{ marginRight: '1rem' }}>← Back</Link>
                    <h2 style={{ margin: 0 }}>Sign Up</h2>
                </div>

                {error && <div className="alert alert-danger" style={{ color: 'var(--danger-color)', marginBottom: '1rem', padding: '0.5rem', background: '#fee2e2', borderRadius: '4px', border: '1px solid #fecaca' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" className="form-control" name="fullName" value={formData.fullName} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Username</label>
                        <input type="text" className="form-control" name="username" value={formData.username} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input type="password" className="form-control" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">Sign Up</button>
                    <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9em' }}>
                        Already have an account? <Link to="/login">Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignupPage;
