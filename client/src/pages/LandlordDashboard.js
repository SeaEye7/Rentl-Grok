import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import PropertyCard from '../components/PropertyCard';
import AddPropertyForm from '../components/AddPropertyForm';
import AddTenantForm from '../components/AddTenantForm';
// No CSS import needed (handled by App.css)

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
        const [propertiesResponse, tenantsResponse] = await Promise.all([
          fetch('http://localhost:5001/properties'),
          fetch('http://localhost:5001/tenants') // Fetch all tenants
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
          const propertyId = tenant.property._id.toString(); // Extract _id from property object and convert to string
          if (!tenantsByProperty[propertyId]) {
            tenantsByProperty[propertyId] = [];
          }
          tenantsByProperty[propertyId].push(tenant);
        });

        // Ensure properties have tenants populated as strings
        const updatedProperties = propertiesData.map(property => ({
          ...property,
          tenants: property.tenants?.map(t => t.toString()) || []
        }));

        setProperties(updatedProperties);
        setTenants(tenantsByProperty);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePropertyAdded = (newProperty) => {
    setProperties(prevProperties => [newProperty, ...prevProperties]);
  };

  const handleTenantAdded = (newTenant) => {
    setTenants(prevTenants => ({
      ...prevTenants,
      [newTenant.property._id.toString()]: [...(prevTenants[newTenant.property._id.toString()] || []), newTenant]
    }));
    setProperties(prevProperties => prevProperties.map(p => 
      p._id.toString() === newTenant.property._id.toString() 
        ? { ...p, tenants: [...(p.tenants || []), newTenant._id.toString()] } 
        : p
    ));
  };

  const handleNavigation = (section) => {
    switch (section) {
      case 'properties':
        // Stay on /landlord, show properties (default behavior)
        setActiveSection('properties');
        break;
      case 'payments':
        navigate('/landlord/payments'); // Navigate to payments page
        break;
      case 'messages':
        navigate('/landlord/messages'); // Navigate to messages page
        break;
      case 'maintenance':
        navigate('/landlord/maintenance'); // Navigate to maintenance page
        break;
      case 'reports':
        navigate('/landlord/reports'); // Navigate to reports page
        break;
      case 'files':
        navigate('/landlord/files'); // Navigate to file system page
        break;
      default:
        break;
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="dashboard-container">
      <header className="header">
        <img src={process.env.PUBLIC_URL + '/rentl-transparent.png'} alt="Rentl Logo" className="logo" />
        <button className="menu-toggle">≡</button>
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
                  key={property._id.toString()} 
                  property={property} 
                  tenants={tenants[property._id.toString()] || []} 
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