import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// No CSS import needed (handled by App.css)

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [tenants, setTenants] = useState([]); // Separate state for tenants
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [tenantForm, setTenantForm] = useState({
    name: '',
    email: '',
    phone: '',
    leaseStart: '',
    leaseEnd: '',
  });
  const [selectedTenantId, setSelectedTenantId] = useState(null);

  useEffect(() => {
    const fetchPropertyAndTenants = async () => {
      try {
        setLoading(true);
        console.log('Fetching property with ID:', id);
        const propertyResponse = await fetch(`http://localhost:5001/properties/${id}`);
        if (!propertyResponse.ok) {
          throw new Error(`Failed to fetch property: ${propertyResponse.status} ${propertyResponse.statusText}`);
        }
        const propertyData = await propertyResponse.json();
        console.log('Property fetched:', propertyData);

        // Fetch tenants for this property
        const tenantsResponse = await fetch(`http://localhost:5001/tenants/property/${id}`);
        if (!tenantsResponse.ok) {
          throw new Error(`Failed to fetch tenants: ${tenantsResponse.status} ${tenantsResponse.statusText}`);
        }
        const tenantsData = await tenantsResponse.json();
        console.log('Tenants fetched:', tenantsData);

        setProperty(propertyData);
        setTenants(tenantsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyAndTenants();
  }, [id]);

  const handleNavigation = (section) => {
    if (section === 'Properties') {
      navigate('/landlord');
    }
  };

  const handleTenantChange = (e) => {
    setTenantForm({ ...tenantForm, [e.target.name]: e.target.value });
  };

  const handleAddTenant = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5001/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...tenantForm,
          property: id,
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add tenant: ${response.status} ${errorText || response.statusText}`);
      }
      const newTenant = await response.json();
      setTenants(prevTenants => [...prevTenants, newTenant]);
      setTenantForm({
        name: '',
        email: '',
        phone: '',
        leaseStart: '',
        leaseEnd: '',
      });
      setShowModal(false);
      alert('Tenant added successfully!');
    } catch (err) {
      console.error('Error adding tenant:', err);
      alert(`Error adding tenant: ${err.message}`);
    }
  };

  const handleRemoveTenant = async (tenantId) => {
    try {
      const response = await fetch(`http://localhost:5001/tenants/${tenantId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Failed to remove tenant: ${response.status} ${response.statusText}`);
      }
      setTenants(prevTenants => prevTenants.filter(t => t._id.toString() !== tenantId));
      alert('Tenant removed successfully!');
    } catch (err) {
      console.error('Error removing tenant:', err);
      alert(`Error removing tenant: ${err.message}`);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!property) return <div>No property found</div>;

  return (
    <div className="property-details-container">
      <header className="header">
        <img src={process.env.PUBLIC_URL + '/rentl-transparent.png'} alt="Rentl Logo" className="logo" />
        <button className="menu-toggle">≡</button>
      </header>
      <nav className="sidebar">
        <ul>
          <li onClick={() => handleNavigation('Properties')}>Properties</li>
          <li>Payments <span className="badge">2</span></li>
          <li>Messages <span className="badge">5</span></li>
          <li>Maintenance <span className="badge">3</span></li>
          <li>Reports</li>
          <li>File System</li>
        </ul>
      </nav>
      <main className="main-content">
        <div className="property-info">
          <img src={property.imageUrl || 'https://via.placeholder.com/300x200'} alt={property.address} className="property-image" />
          <div className="property-details">
            <h2>{property.address}</h2>
            <p>Status: {property.status || 'N/A'}</p>
            <p>Lease Start: {property.leaseStart ? new Date(property.leaseStart).toLocaleDateString() : 'N/A'}</p>
            <p>Lease End: {property.leaseEnd ? new Date(property.leaseEnd).toLocaleDateString() : 'N/A'}</p>
            <p>Rent Amount: ${property.rentAmount || 'N/A'}</p>
            <p>Frequency: {property.rentAmount ? 'monthly' : 'N/A'}</p>
            <p>Security Deposit: ${property.securityDeposit || 'N/A'}</p>
            <p>Overdue Rent: {property.overdueRent || 'None'}</p>
          </div>
        </div>
        <div className="details-grid">
          <div className="tenants-section">
            <h3>Tenants</h3>
            <button className="manage-tenants-button" onClick={() => setShowModal(true)}>Manage Tenants</button>
            {tenants.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>ImgPath</th>
                    <th>Name</th>
                    <th>ID</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map(tenant => (
                    <tr key={tenant._id.toString()}>
                      <td><img src={tenant.imgPath || 'https://via.placeholder.com/50'} alt={tenant.name} className="tenant-avatar" /></td>
                      <td>{tenant.name}</td>
                      <td>{tenant._id.toString()}</td>
                      <td>
                        <button onClick={() => handleRemoveTenant(tenant._id.toString())}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No tenants assigned</p>
            )}
          </div>
          <div className="payments-expenses">
            <div className="payments">
              <h3>Payments</h3>
              <table>
                <thead>
                  <tr>
                    <th>Sender</th>
                    <th>Amount</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {property.payments && property.payments.length > 0 ? (
                    property.payments.map(payment => (
                      <tr key={payment._id.toString()}>
                        <td>{payment.sender || 'N/A'}</td>
                        <td>${payment.amount || '0'}</td>
                        <td>{payment.type || 'N/A'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="3">No payments recorded</td></tr>
                  )}
                </tbody>
              </table>
              <button className="add-payment">Add New Payment</button>
            </div>
            <div className="expenses">
              <h3>Expenses</h3>
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Cost</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {property.expenses && property.expenses.length > 0 ? (
                    property.expenses.map(expense => (
                      <tr key={expense._id.toString()}>
                        <td>{expense.description || 'N/A'}</td>
                        <td>${expense.cost || '0'}</td>
                        <td>{expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="3">No expenses recorded</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="messages">
            <h3>Messages</h3>
            {property.messages && property.messages.length > 0 ? (
              property.messages.map(message => (
                <div key={message._id.toString()} className="message-card">
                  <p><strong>{message.date ? new Date(message.date).toLocaleDateString() : 'N/A'}</strong> - {message.sender || 'N/A'}</p>
                  <p>{message.message || 'N/A'}</p>
                </div>
              ))
            ) : (
              <p>No messages recorded</p>
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Manage Tenants</h3>
            <form onSubmit={handleAddTenant}>
              <input type="text" name="name" placeholder="Name" value={tenantForm.name} onChange={handleTenantChange} required />
              <input type="email" name="email" placeholder="Email" value={tenantForm.email} onChange={handleTenantChange} required />
              <input type="tel" name="phone" placeholder="Phone" value={tenantForm.phone} onChange={handleTenantChange} required />
              <label>
                Lease Start:
                <input type="date" name="leaseStart" value={tenantForm.leaseStart} onChange={handleTenantChange} required />
              </label>
              <label>
                Lease End:
                <input type="date" name="leaseEnd" value={tenantForm.leaseEnd} onChange={handleTenantChange} required />
              </label>
              <button type="submit">Add Tenant</button>
              <button type="button" onClick={() => setShowModal(false)}>Close</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;