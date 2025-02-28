import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import PropertyCard from '../components/PropertyCard';
import AddPropertyForm from '../components/AddPropertyForm';
import AddTenantForm from '../components/AddTenantForm';

const LandlordDashboard = () => {
  const navigate = useNavigate(); // Initialize navigate for routing
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState({}); // Object to store tenants by property ID
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('properties');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching data...');
        const token = localStorage.getItem('token'); // Ensure token is fetched from localStorage
        const [propertiesResponse, tenantsResponse] = await Promise.all([
          fetch('http://localhost:5001/properties', {
            headers: { 'Authorization': `Bearer ${token}` }, // Add Authorization header
          }),
          fetch('http://localhost:5001/tenants', {
            headers: { 'Authorization': `Bearer ${token}` }, // Add Authorization header
          }),
        ]);
        if (!propertiesResponse.ok) {
          throw new Error(`Failed to fetch properties: ${propertiesResponse.status} ${propertiesResponse.statusText}`);
        }
        if (!tenantsResponse.ok) {
          throw new Error(`Failed to fetch tenants: ${tenantsResponse.status} ${tenantsResponse.statusText}`);
        }
        const propertiesData = await propertiesResponse.json();
        const tenantsData = await tenantsResponse.json();
        console.log('Properties fetched:', propertiesData);
        console.log('Tenants fetched:', tenantsData);

        // Organize tenants by property ID, handling property as an object with _id
        const tenantsByProperty = {};
        tenantsData.forEach(tenant => {
          const propertyId = tenant.property?._id?.toString() || ''; // Safely handle missing property._id
          if (!tenantsByProperty[propertyId]) {
            tenantsByProperty[propertyId] = [];
          }
          tenantsByProperty[propertyId].push(tenant);
        });

        // Ensure properties have tenants populated as strings, safely handle missing tenants
        const updatedProperties = propertiesData.map(property => ({
          ...property,
          tenants: (property.tenants?.map(t => t?.toString()) || []).filter(Boolean), // Filter out undefined/null
        }));

        setProperties(updatedProperties);
        setTenants(tenantsByProperty);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // No dependencies needed since token is fetched from localStorage

  const handlePropertyAdded = (newProperty) => {
    setProperties(prevProperties => [newProperty, ...prevProperties]);
  };

  const handleTenantAdded = (newTenant) => {
    setTenants(prevTenants => ({
      ...prevTenants,
      [newTenant.property?._id?.toString() || '']: [...(prevTenants[newTenant.property?._id?.toString() || ''] || []), newTenant]
    }));
    setProperties(prevProperties => prevProperties.map(p => 
      p._id?.toString() === newTenant.property?._id?.toString() 
        ? { ...p, tenants: [...(p.tenants || []), newTenant._id?.toString() || ''] } 
        : p
    ));
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