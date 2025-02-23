import React, { useState, useEffect } from 'react';
import PropertyCard from '../components/PropertyCard';
import AddPropertyForm from '../components/AddPropertyForm';
import AddTenantForm from '../components/AddTenantForm';
import '../styles/LandlordDashboard.css';

const LandlordDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('properties');

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data...');
        const [propertiesResponse, tenantsResponse] = await Promise.all([
          fetch('http://localhost:5001/properties'),
          fetch('http://localhost:5001/tenants')
        ]);
        if (!propertiesResponse.ok) throw new Error('Failed to fetch properties');
        if (!tenantsResponse.ok) throw new Error('Failed to fetch tenants');
        const propertiesData = await propertiesResponse.json();
        const tenantsData = await tenantsResponse.json();
        console.log('Properties fetched:', propertiesData);
        console.log('Tenants fetched (raw):', tenantsData); // Log raw data
        // Ensure tenants have consistent _id and property formats
        const normalizedTenants = tenantsData.map(tenant => ({
          ...tenant,
          _id: tenant._id.toString(), // Ensure _id is a string
          property: tenant.property?.toString() || '', // Ensure property is a string
        }));
        console.log('Tenants normalized:', normalizedTenants); // Log normalized data
        setProperties(propertiesData);
        setTenants(normalizedTenants);
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
    // Normalize the new tenant to ensure consistent _id and property formats
    const normalizedTenant = {
      ...newTenant,
      _id: newTenant._id.toString(),
      property: newTenant.property.toString(),
    };
    setTenants(prevTenants => [normalizedTenant, ...prevTenants]);
    setProperties(prevProperties => prevProperties.map(p => 
      p._id.toString() === newTenant.property.toString() 
        ? { ...p, tenants: [...(p.tenants || []), newTenant._id.toString()] } 
        : p
    ));
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  console.log('Current tenants in state:', tenants); // Debug current state

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <img src="/rentl-transparent.png" alt="Rentl Logo" className="logo" />
        <ul>
          <li className={activeSection === 'properties' ? 'active' : ''} onClick={() => setActiveSection('properties')}>
            Properties
          </li>
          <li className={activeSection === 'payments' ? 'active' : ''} onClick={() => setActiveSection('payments')}>
            Payments <span className="badge">2</span>
          </li>
          <li className={activeSection === 'messages' ? 'active' : ''} onClick={() => setActiveSection('messages')}>
            Messages <span className="badge">5</span>
          </li>
          <li className={activeSection === 'maintenance' ? 'active' : ''} onClick={() => setActiveSection('maintenance')}>
            Maintenance <span className="badge">3</span>
          </li>
          <li className={activeSection === 'reports' ? 'active' : ''} onClick={() => setActiveSection('reports')}>
            Reports
          </li>
          <li className={activeSection === 'files' ? 'active' : ''} onClick={() => setActiveSection('files')}>
            File System
          </li>
        </ul>
      </nav>
      <main className="main-content">
        {activeSection === 'properties' && (
          <>
            <h1>Landlord Dashboard / Properties</h1>
            <AddPropertyForm onPropertyAdded={handlePropertyAdded} />
            <AddTenantForm onTenantAdded={handleTenantAdded} properties={properties} />
            <div className="property-grid">
              {properties.map(property => (
                <PropertyCard 
                  key={property._id} 
                  property={property} 
                  tenants={tenants.filter(t => t.property.toString() === property._id.toString())} 
                />
              ))}
            </div>
          </>
        )}
        {activeSection === 'payments' && (
          <div className="section-content">
            <h1>Payments</h1>
            <p>Placeholder for payment history, outstanding payments, and online payments (to be implemented later).</p>
          </div>
        )}
        {activeSection === 'messages' && (
          <div className="section-content">
            <h1>Messages</h1>
            <p>Placeholder for landlord-tenant messaging (to be implemented later).</p>
          </div>
        )}
        {activeSection === 'maintenance' && (
          <div className="section-content">
            <h1>Maintenance</h1>
            <p>Placeholder for maintenance requests (to be implemented later).</p>
          </div>
        )}
        {activeSection === 'reports' && (
          <div className="section-content">
            <h1>Reports</h1>
            <p>Placeholder for tax, expenses, profit/loss reports (to be implemented later).</p>
          </div>
        )}
        {activeSection === 'files' && (
          <div className="section-content">
            <h1>File System</h1>
            <p>Placeholder for file uploads and management (to be implemented later).</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default LandlordDashboard;