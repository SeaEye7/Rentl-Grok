import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginRegister.css';


const Register = () => {
  const [formData, setFormData] = useState({ email: '', password: '', accountType: 'landlord' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Registration failed');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="register-container">
      <h1>Register for Rentl</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="register-form">
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        <select name="accountType" value={formData.accountType} onChange={handleChange} required>
          <option value="landlord">Landlord</option>
          <option value="tenant">Tenant</option>
        </select>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;