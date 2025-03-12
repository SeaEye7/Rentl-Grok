import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import PropertyCard from '../components/PropertyCard';
import AddPropertyForm from '../components/AddPropertyForm';
import AddTenantForm from '../components/AddTenantForm';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode for token decoding

const LandlordDashboard = () => {
  const navigate = useNavigate(); // Initialize navigate for routing
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState({}); // Object to store tenants by property ID
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('properties');

  useEffect(() => {
    const fetchLandlordData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found. Please log in.');
        }

        // Decode the JWT token to get the landlord's ID and role
        const decodedToken = jwtDecode(token);
        const landlordId = decodedToken.id; // Adjust this based on your JWT structure (e.g., 'id', 'userId', or 'landlordId')
        const role = decodedToken.role || decodedToken.accountType; // Ensure role is correctly extracted
        if (role !== 'landlord') {
          throw new Error('Unauthorized: Only landlords can access this dashboard.');
        }

        console.log('Fetching data for landlord ID:', landlordId);

        // Fetch properties specific to the landlord
        const propertiesResponse = await fetch(`http://localhost:5001/properties?landlordId=${landlordId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!propertiesResponse.ok) {
          throw new Error(`Failed to fetch properties: ${propertiesResponse.status} ${propertiesResponse.statusText}`);
        }
        const propertiesData = await propertiesResponse.json();
        console.log('Properties fetched:', propertiesData);

        // Fetch all tenants (or filter by properties if your API supports it)
        const tenantsResponse = await fetch('http://localhost:5001/tenants', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!tenantsResponse.ok) {
          throw new Error(`Failed to fetch tenants: ${tenantsResponse.status} ${tenantsResponse.statusText}`);
        }
        const tenantsData = await tenantsResponse.json();
        console.log('Tenants fetched:', tenantsData);

        // Organize tenants by property ID, filtering for properties owned by the landlord
        const tenantsByProperty = {};
        tenantsData.forEach(tenant => {
          const propertyId = tenant.property?._id?.toString() || '';
          // Only include tenants for properties owned by this landlord
          const property = propertiesData.find(p => p._id.toString() === propertyId);
          if (property) {
            if (!tenantsByProperty[propertyId]) {
              tenantsByProperty[propertyId] = [];
            }
            tenantsByProperty[propertyId].push(tenant);
          }
        });

        // Ensure properties have tenants populated as strings, safely handle missing tenants
        const updatedProperties = propertiesData.map(property => ({
          ...property,
          tenants: (property.tenants?.map(t => t?.toString()) || []).filter(Boolean), // Filter out undefined/null
        }));

        setProperties(updatedProperties);
        setTenants(tenantsByProperty);
      } catch (err) {
        console.error('Error fetching landlord data:', err);
        setError(err.message || 'An error occurred while fetching landlord data');
      } finally {
        setLoading(false);
      }
    };

    fetchLandlordData();
  }, []);

  const handlePropertyAdded = (newProperty) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to add a property.');
      return;
    }
    const decodedToken = jwtDecode(token);
    const landlordId = decodedToken.id; // Adjust based on your JWT structure
    const propertyWithLandlord = { ...newProperty, landlordId }; // Add landlordId to the property
    setProperties(prevProperties => [propertyWithLandlord, ...prevProperties]);
    // You might need to call an API to save this to the backend
  };

  const handleTenantAdded = (newTenant) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to add a tenant.');
      return;
    }
    setTenants(prevTenants => ({
      ...prevTenants,
      [newTenant.property?._id?.toString() || '']: [...(prevTenants[newTenant.property?._id?.toString() || ''] || []), newTenant]
    }));
    setProperties(prevProperties => prevProperties.map(p => 
      p._id?.toString() === newTenant.property?._id?.toString() 
        ? { ...p, tenants: [...(p.tenants || []), newTenant._id?.toString() || ''] } 
        : p
    ));
    // You might need to call an API to save this to the backend
  };

  const handleNavigation = (section) => {
    switch (section) {
      case 'properties':
        setActiveSection('properties');
        break;
      case 'payments':
        navigate('/landlord/payments');
        break;
      case 'messages':
        navigate('/landlord/messages');
        break;
      case 'maintenance':
        navigate('/landlord/maintenance');
        break;
      case 'reports':
        navigate('/landlord/reports');
        break;
      case 'files':
        navigate('/landlord/files');
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the JWT token
    localStorage.removeItem('user'); // Clear user data if stored
    navigate('/login'); // Redirect to login page
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-container">
      <header className="header">
        <img src={process.env.PUBLIC_URL + '/rentl-transparent.png'} alt="Rentl Logo" className="logo" />
        <div className="header-actions">
          <button className="menu-toggle">≡</button>
          <button 
            onClick={() => handleLogout()}
            className="logout-button"
          >
            Logout
          </button>
        </div>
      </header>
      <nav className="sidebar">
        <ul>
          <li className={activeSection === 'properties' ? 'active' : ''} onClick={() => handleNavigation('properties')}>
            Properties
          </li>
          <li className={activeSection === 'payments' ? 'active' : ''} onClick={() => handleNavigation('payments')}>
            Payments <span className="badge">2</span>
          </li>
          <li className={activeSection === 'messages' ? 'active' : ''} onClick={() => handleNavigation('messages')}>
            Messages <span className="badge">5</span>
          </li>
          <li className={activeSection === 'maintenance' ? 'active' : ''} onClick={() => handleNavigation('maintenance')}>
            Maintenance <span className="badge">3</span>
          </li>
          <li className={activeSection === 'reports' ? 'active' : ''} onClick={() => handleNavigation('reports')}>
            Reports
          </li>
          <li className={activeSection === 'files' ? 'active' : ''} onClick={() => handleNavigation('files')}>
            File System
          </li>
        </ul>
      </nav>
      <main className="main-content">
        {activeSection === 'properties' && (
          <>
            <h1 className="dashboard-title">Landlord Dashboard / Properties</h1>
            <div className="forms-container">
              <AddPropertyForm onPropertyAdded={handlePropertyAdded} />
              <AddTenantForm onTenantAdded={handleTenantAdded} properties={properties} />
            </div>
            <div className="property-grid">
              {properties.map(property => (
                <PropertyCard 
                  key={property._id?.toString() || ''} 
                  property={property} 
                  tenants={tenants[property._id?.toString() || ''] || []} 
                />
              ))}
            </div>
          </>
        )}
        {activeSection === 'payments' && (
          <div className="section-content">
            <h1>Payments</h1>
            <p>Payments management for landlords (to be implemented later).</p>
            {/* Add Payments management UI here later */}
          </div>
        )}
        {activeSection === 'messages' && (
          <div className="section-content">
            <h1>Messages</h1>
            <p>Landlord-tenant messaging (to be implemented later).</p>
          </div>
        )}
        {activeSection === 'maintenance' && (
          <div className="section-content">
            <h1>Maintenance</h1>
            <p>Maintenance requests management (to be implemented later).</p>
          </div>
        )}
        {activeSection === 'reports' && (
          <div className="section-content">
            <h1>Reports</h1>
            <p>Tax, expenses, and profit/loss reports (to be implemented later).</p>
          </div>
        )}
        {activeSection === 'files' && (
          <div className="section-content">
            <h1>File System</h1>
            <p>File uploads and management (to be implemented later).</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default LandlordDashboard;