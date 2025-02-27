import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/App.css'; // Ensure this matches your wireframe styling

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        throw new Error('Registration failed');
      }
      const data = await response.json();
      // Do not store token or user data in localStorage
      // Instead, redirect to the login page
      navigate('/login');
      alert('Registration successful! Please log in.');
    } catch (err) {
      console.error('Registration Error:', err);
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container" style={{ backgroundColor: '#c4c4c4', fontFamily: 'Arial, sans-serif' }}>
      <h2>Register</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} className="auth-form" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ margin: '10px 0', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ margin: '10px 0', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <button type="submit" style={{ backgroundColor: '#49c7ab', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Register
        </button>
      </form>
      <p>
        Already have an account? <a href="/login" style={{ color: '#49c7ab' }}>Login</a>
      </p>
    </div>
  );
};

export default Register;