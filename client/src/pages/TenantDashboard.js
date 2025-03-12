import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode for token decoding

const TenantDashboard = () => {
  const navigate = useNavigate(); // Initialize navigate for routing
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found. Please log in.');
        }

        // Decode the JWT token to get the tenant's ID and role
        const decodedToken = jwtDecode(token);
        const tenantId = decodedToken.id; // Adjust this based on your JWT structure (e.g., 'id', 'userId', or 'tenantId')
        const role = decodedToken.role || decodedToken.accountType; // Ensure role is correctly extracted
        if (role !== 'tenant') {
          throw new Error('Unauthorized: Only tenants can access this dashboard.');
        }

        console.log('Fetching data for tenant ID:', tenantId);

        // Fetch properties specific to the tenant
        const propertiesResponse = await fetch(`http://localhost:5001/properties?tenantId=${tenantId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!propertiesResponse.ok) {
          throw new Error(`Failed to fetch properties: ${propertiesResponse.status} ${propertiesResponse.statusText}`);
        }
        const propertiesData = await propertiesResponse.json();
        console.log('Properties fetched:', propertiesData);

        setProperties(propertiesData);
      } catch (err) {
        console.error('Error fetching tenant data:', err);
        setError(err.message || 'An error occurred while fetching tenant data');
      } finally {
        setLoading(false);
      }
    };

    fetchTenantData();
  }, []);

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
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-container">
      <header className="header">
        <div className="header-actions">
          <button 
            onClick={handleHome}
            className="logout-button"
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
      <nav className="sidebar">
        {properties.length > 0 ? (
          <div className="property-grid">
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
      </nav>
    </div>
  );
};

export default TenantDashboard;