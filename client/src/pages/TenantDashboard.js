import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Ensure this is imported
import '../styles/App.css'; // Ensure this matches your wireframe styling

const TenantDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchLeasedProperties = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5001/properties/tenant', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch leased properties');
        }
        const data = await response.json();
        setProperties(data);
      } catch (err) {
        console.error('Error fetching leased properties:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeasedProperties();
  }, [token]);

  const handlePropertyClick = (propertyId) => {
    navigate(`/properties/${propertyId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the JWT token
    localStorage.removeItem('user'); // Clear user data if stored
    navigate('/login'); // Redirect to login page
  };

  const handleHome = () => {
    navigate('/tenant'); // Navigate back to tenant dashboard
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="dashboard-container">
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={handleHome}
            className="logout-button" // Use logout-button class for consistency
          >
            Home
          </button>
          <h2>Tenant Dashboard</h2>
        </div>
        <button 
          onClick={handleLogout}
          className="logout-button"
        >
          Logout
        </button>
      </header>
      {properties.length > 0 ? (
        <div className="properties-grid">
          {properties.map(property => (
            <div
              key={property._id}
              className="property-card"
              onClick={() => handlePropertyClick(property._id)}
            >
              <h3>{property.address}</h3>
              <p>Status: {property.status || 'N/A'}</p>
              <p>Rent Amount: ${property.rentAmount || 'N/A'}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No leased properties found.</p>
      )}
    </div>
  );
};

export default TenantDashboard;