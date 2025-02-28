import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode for token decoding

// Initialize Stripe with your Publishable Key (replace with your actual key)
const stripePromise = loadStripe('pk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'); // Use your Stripe test Publishable Key (e.g., pk_test_...)

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // Get current path for dynamic content
  const [property, setProperty] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [payments, setPayments] = useState([]);
  const [maintenance, setMaintenance] = useState([]); // State for maintenance requests
  const [messages, setMessages] = useState([]); // State for messages
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTenantsModal, setShowTenantsModal] = useState(false);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [tenantForm, setTenantForm] = useState({
    name: '',
    email: '',
    phone: '',
    leaseStart: '',
    leaseEnd: '',
  });
  const [paymentForm, setPaymentForm] = useState({
    sender: '',
    amount: '',
    type: 'Rent',
  });
  const [maintenanceForm, setMaintenanceForm] = useState({
    description: '',
    status: 'Pending',
  });
  const [messageForm, setMessageForm] = useState({
    sender: '',
    message: '',
  });
  const [selectedTenantId, setSelectedTenantId] = useState(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState(null);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [stripeClient, setStripeClient] = useState(null); // State for Stripe client
  const [cardElement, setCardElement] = useState(null); // State for Stripe Card Element
  const token = localStorage.getItem('token');
  const decodedToken = token ? jwtDecode(token) : null;
  const userRole = decodedToken?.role || decodedToken?.accountType || 'landlord'; // Default to 'landlord' if undefined

  useEffect(() => {
    const fetchPropertyAndData = async () => {
      try {
        setLoading(true);
        console.log('Fetching property with ID:', id);
        const [propertyResponse, tenantsResponse, paymentsResponse, maintenanceResponse, messagesResponse] = await Promise.all([
          fetch(`http://localhost:5001/properties/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch(`http://localhost:5001/tenants/property/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch(`http://localhost:5001/payments/property/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch(`http://localhost:5001/maintenance/property/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch(`http://localhost:5001/messages/property/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
        ]);
        if (!propertyResponse.ok) {
          throw new Error(`Failed to fetch property: ${propertyResponse.status} ${propertyResponse.statusText}`);
        }
        if (!tenantsResponse.ok) {
          throw new Error(`Failed to fetch tenants: ${tenantsResponse.status} ${tenantsResponse.statusText}`);
        }
        if (!paymentsResponse.ok) {
          throw new Error(`Failed to fetch payments: ${paymentsResponse.status} ${paymentsResponse.statusText}`);
        }
        const propertyData = await propertyResponse.json();
        const tenantsData = await tenantsResponse.json();
        const paymentsData = await paymentsResponse.json();
        const maintenanceData = maintenanceResponse.ok ? await maintenanceResponse.json() : [];
        const messagesData = messagesResponse.ok ? await messagesResponse.json() : [];

        // Check if tenant is authorized for this property
        if (userRole === 'tenant') {
          const tenantFound = tenantsData.some(tenant => tenant._id === decodedToken.id);
          if (!tenantFound) {
            throw new Error('Unauthorized: Tenant not associated with this property');
          }
        }

        setProperty(propertyData);
        setTenants(tenantsData);
        setPayments(paymentsData);
        setMaintenance(maintenanceData);
        setMessages(messagesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const initializeStripe = async () => {
      const stripe = await stripePromise;
      setStripeClient(stripe);

      // Mount Stripe Elements (Card Element) when Stripe is initialized
      const elements = stripe.elements();
      const card = elements.create('card');
      setCardElement(card);
    };

    if (token) {
      fetchPropertyAndData();
      initializeStripe();
    } else {
      setError('Unauthorized: Please log in');
      setLoading(false);
    }
  }, [id, token, userRole]); // Added userRole to dependencies to satisfy ESLint

  useEffect(() => {
    // Mount the Card Element to the DOM when it’s available
    if (cardElement && showPaymentsModal) {
      const paymentFormElement = document.getElementById('payment-form');
      if (paymentFormElement) {
        cardElement.mount('#card-element');
      }
    }

    // Clean up: Unmount the Card Element when the modal closes
    return () => {
      if (cardElement) {
        cardElement.unmount();
      }
    };
  }, [cardElement, showPaymentsModal]); // Dependencies updated for ESLint

  const handleNavigation = (section) => {
    switch (section) {
      case 'Properties':
        navigate(userRole === 'landlord' ? '/landlord' : '/tenant'); // Back to respective dashboard
        break;
      case 'Payments':
        navigate(`/properties/${id}/payments`);
        break;
      case 'Messages':
        navigate(`/properties/${id}/messages`);
        break;
      case 'Maintenance':
        navigate(`/properties/${id}/maintenance`);
        break;
      case 'Reports':
        if (userRole === 'landlord') {
          navigate('/landlord/reports');
        } else {
          alert('Unauthorized: Only landlords can access reports');
        }
        break;
      case 'File System':
        if (userRole === 'landlord') {
          navigate('/landlord/files');
        } else {
          alert('Unauthorized: Only landlords can access the file system');
        }
        break;
      default:
        break;
    }
  };

  const handleTenantChange = (e) => {
    setTenantForm({ ...tenantForm, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e) => {
    setPaymentForm({ ...paymentForm, [e.target.name]: e.target.value });
  };

  const handleMaintenanceChange = (e) => {
    setMaintenanceForm({ ...maintenanceForm, [e.target.name]: e.target.value });
  };

  const handleMessageChange = (e) => {
    setMessageForm({ ...messageForm, [e.target.name]: e.target.value });
  };

  const handleAddOrUpdateTenant = async (e) => {
    e.preventDefault();
    if (userRole !== 'landlord') {
      alert('Unauthorized: Only landlords can manage tenants');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5001/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...tenantForm,
          property: id,
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to add tenant: ${response.status} ${response.statusText}`);
      }
      const newTenant = await response.json();
      setTenants([...tenants, newTenant]);
      setTenantForm({
        name: '',
        email: '',
        phone: '',
        leaseStart: '',
        leaseEnd: '',
      });
      setSelectedTenantId(null);
      setShowTenantsModal(false);
      alert('Tenant added successfully!');
    } catch (err) {
      console.error('Error adding tenant:', err);
      alert(`Error adding tenant: ${err.message}`);
    }
  };

  const handleAddOrUpdatePayment = async (e) => {
    e.preventDefault();
    try {
      if (!stripeClient || !cardElement) throw new Error('Stripe not initialized');

      // Create a payment method using Stripe Elements
      const { paymentMethod, error } = await stripeClient.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) throw new Error(error.message);

      const response = await fetch('http://localhost:5001/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          propertyId: id,
          sender: paymentForm.sender,
          amount: parseFloat(paymentForm.amount) || 0,
          type: paymentForm.type,
          paymentMethodId: paymentMethod.id, // Send the payment method ID to backend
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to process payment: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      
      // Confirm payment if required (for card payments, no redirects needed with allow_redirects: 'never')
      if (data.stripePaymentIntent.status === 'requires_action') {
        const { error: actionError } = await stripeClient.confirmCardPayment(data.stripePaymentIntent.client_secret);
        if (actionError) throw new Error(actionError.message);
      }

      // After payment, update payments state (optional: poll or use webhook)
      const updatedPaymentsResponse = await fetch(`http://localhost:5001/payments/property/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!updatedPaymentsResponse.ok) {
        throw new Error(`Failed to fetch updated payments: ${updatedPaymentsResponse.status} ${updatedPaymentsResponse.statusText}`);
      }
      const updatedPayments = await updatedPaymentsResponse.json();
      setPayments(updatedPayments);

      setPaymentForm({ sender: '', amount: '', type: 'Rent' });
      setSelectedPaymentId(null);
      setShowPaymentsModal(false);
      alert('Payment processed successfully!');
    } catch (err) {
      console.error('Error managing payment:', err);
      alert(`Error processing payment: ${err.message}`);
    }
  };

  const handleAddOrUpdateMaintenance = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          propertyId: id,
          description: maintenanceForm.description,
          status: maintenanceForm.status,
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to add maintenance request: ${response.status} ${response.statusText}`);
      }
      const newMaintenance = await response.json();
      setMaintenance([...maintenance, newMaintenance]);
      setMaintenanceForm({ description: '', status: 'Pending' });
      setSelectedMaintenanceId(null);
      alert('Maintenance request added successfully!');
    } catch (err) {
      console.error('Error adding maintenance:', err);
      alert(`Error adding maintenance: ${err.message}`);
    }
  };

  const handleAddOrUpdateMessage = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          propertyId: id,
          sender: messageForm.sender || (userRole === 'tenant' ? 'Tenant' : 'Landlord'),
          message: messageForm.message,
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to add message: ${response.status} ${response.statusText}`);
      }
      const newMessage = await response.json();
      setMessages([...messages, newMessage]);
      setMessageForm({ sender: '', message: '' });
      setSelectedMessageId(null);
      alert('Message sent successfully!');
    } catch (err) {
      console.error('Error adding message:', err);
      alert(`Error adding message: ${err.message}`);
    }
  };

  const handleRemoveTenant = async (tenantId) => {
    if (userRole !== 'landlord') {
      alert('Unauthorized: Only landlords can remove tenants');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5001/tenants/${tenantId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`Failed to remove tenant: ${response.status} ${response.statusText}`);
      }
      setTenants(tenants.filter(t => t._id.toString() !== tenantId));
      alert('Tenant removed successfully!');
    } catch (err) {
      console.error('Error removing tenant:', err);
      alert(`Error removing tenant: ${err.message}`);
    }
  };

  const handleRemovePayment = async (paymentId) => {
    try {
      const response = await fetch(`http://localhost:5001/payments/${paymentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ propertyId: id }),
      });
      if (!response.ok) {
        throw new Error(`Failed to remove payment: ${response.status} ${response.statusText}`);
      }
      setPayments(payments.filter(p => p._id !== paymentId));
      alert('Payment removed successfully!');
    } catch (err) {
      console.error('Error removing payment:', err);
      alert(`Error removing payment: ${err.message}`);
    }
  };

  const handleRemoveMaintenance = async (maintenanceId) => {
    try {
      const response = await fetch(`http://localhost:5001/maintenance/${maintenanceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ propertyId: id }),
      });
      if (!response.ok) {
        throw new Error(`Failed to remove maintenance: ${response.status} ${response.statusText}`);
      }
      setMaintenance(maintenance.filter(m => m._id !== maintenanceId));
      alert('Maintenance request removed successfully!');
    } catch (err) {
      console.error('Error removing maintenance:', err);
      alert(`Error removing maintenance: ${err.message}`);
    }
  };

  const handleRemoveMessage = async (messageId) => {
    try {
      const response = await fetch(`http://localhost:5001/messages/${messageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ propertyId: id }),
      });
      if (!response.ok) {
        throw new Error(`Failed to remove message: ${response.status} ${response.statusText}`);
      }
      setMessages(messages.filter(m => m._id !== messageId));
      alert('Message removed successfully!');
    } catch (err) {
      console.error('Error removing message:', err);
      alert(`Error removing message: ${err.message}`);
    }
  };

  // Determine which section to display based on the URL path and user role
  const section = location.pathname.split('/').pop().toLowerCase();
  const renderSection = () => {
    if (userRole === 'tenant' && !tenants.some(tenant => tenant._id === decodedToken.id)) {
      return <div className="error">Unauthorized: You are not a tenant of this property</div>;
    }

    switch (section) {
      case 'payments':
        return (
          <div className="payments">
            <h3>Payments</h3>
            <button 
              className="manage-payments-button" 
              onClick={() => setShowPaymentsModal(true)}
              disabled={userRole === 'tenant' && !paymentForm.sender} // Disable for tenants without sender
            >
              Manage Payments
            </button>
            {payments.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Sender</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(payment => (
                    <tr key={payment._id.toString()}>
                      <td>{payment.sender || 'N/A'}</td>
                      <td>${payment.amount || '0'}</td>
                      <td>{payment.type || 'N/A'}</td>
                      <td>{new Date(payment.date).toLocaleDateString()}</td>
                      <td>
                        {userRole === 'landlord' && (
                          <>
                            <button onClick={() => { setShowPaymentsModal(true); setPaymentForm({ sender: payment.sender, amount: payment.amount, type: payment.type }); setSelectedPaymentId(payment._id); }}>Edit</button>
                            <button onClick={() => handleRemovePayment(payment._id.toString())}>Remove</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No payments recorded</p>
            )}
          </div>
        );
      case 'maintenance':
        return (
          <div className="maintenance">
            <h3>Maintenance</h3>
            <button 
              className="manage-maintenance-button" 
              onClick={() => setShowTenantsModal(true)} // Reuse tenants modal for maintenance (update later)
              disabled={userRole === 'landlord'} // Disable for landlords (tenants submit, landlords manage)
            >
              Manage Maintenance
            </button>
            {maintenance.length > 0 ? (
              maintenance.map(request => (
                <div key={request._id.toString()} className="maintenance-card">
                  <p><strong>{request.date ? new Date(request.date).toLocaleDateString() : 'N/A'}</strong> - {request.description || 'N/A'}</p>
                  <p>Status: {request.status || 'Pending'}</p>
                  {userRole === 'landlord' && (
                    <button onClick={() => handleRemoveMaintenance(request._id.toString())}>Remove</button>
                  )}
                </div>
              ))
            ) : (
              <p>No maintenance requests recorded</p>
            )}
          </div>
        );
      case 'messages':
        return (
          <div className="messages">
            <h3>Messages</h3>
            <button 
              className="manage-messages-button" 
              onClick={() => setShowTenantsModal(true)} // Reuse tenants modal for messages (update later)
              disabled={userRole === 'landlord'} // Disable for landlords (tenants send, landlords view)
            >
              Manage Messages
            </button>
            {messages.length > 0 ? (
              messages.map(message => (
                <div key={message._id.toString()} className="message-card">
                  <p><strong>{message.date ? new Date(message.date).toLocaleDateString() : 'N/A'}</strong> - {message.sender || 'N/A'}</p>
                  <p>{message.message || 'N/A'}</p>
                  {userRole === 'landlord' && (
                    <button onClick={() => handleRemoveMessage(message._id.toString())}>Remove</button>
                  )}
                </div>
              ))
            ) : (
              <p>No messages recorded</p>
            )}
          </div>
        );
      default:
        return (
          <>
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
                <p>Overdue Rent: ${property.overdueRent || 'None'}</p>
              </div>
            </div>
            <div className="details-grid">
              <div className="tenants-section">
                <h3>Tenants</h3>
                {userRole === 'landlord' ? (
                  <>
                    <button className="manage-tenants-button" onClick={() => setShowTenantsModal(true)}>Manage Tenants</button>
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
                  </>
                ) : (
                  <p>You are a tenant of this property.</p>
                )}
              </div>
              <div className="payments-expenses">
                <div className="payments">
                  <h3>Payments</h3>
                  <button 
                    className="manage-payments-button" 
                    onClick={() => setShowPaymentsModal(true)}
                    disabled={userRole === 'tenant' && !paymentForm.sender} // Disable for tenants without sender
                  >
                    Manage Payments
                  </button>
                  {payments.length > 0 ? (
                    <table>
                      <thead>
                        <tr>
                          <th>Sender</th>
                          <th>Amount</th>
                          <th>Type</th>
                          <th>Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map(payment => (
                          <tr key={payment._id.toString()}>
                            <td>{payment.sender || 'N/A'}</td>
                            <td>${payment.amount || '0'}</td>
                            <td>{payment.type || 'N/A'}</td>
                            <td>{new Date(payment.date).toLocaleDateString()}</td>
                            <td>
                              {userRole === 'landlord' && (
                                <>
                                  <button onClick={() => { setShowPaymentsModal(true); setPaymentForm({ sender: payment.sender, amount: payment.amount, type: payment.type }); setSelectedPaymentId(payment._id); }}>Edit</button>
                                  <button onClick={() => handleRemovePayment(payment._id.toString())}>Remove</button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No payments recorded</p>
                  )}
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
                <button 
                  className="manage-messages-button" 
                  onClick={() => setShowTenantsModal(true)} // Reuse tenants modal for messages (update later)
                  disabled={userRole === 'landlord'} // Disable for landlords (tenants send, landlords view)
                >
                  Manage Messages
                </button>
                {messages.length > 0 ? (
                  messages.map(message => (
                    <div key={message._id.toString()} className="message-card">
                      <p><strong>{message.date ? new Date(message.date).toLocaleDateString() : 'N/A'}</strong> - {message.sender || 'N/A'}</p>
                      <p>{message.message || 'N/A'}</p>
                      {userRole === 'landlord' && (
                        <button onClick={() => handleRemoveMessage(message._id.toString())}>Remove</button>
                      )}
                    </div>
                  ))
                ) : (
                  <p>No messages recorded</p>
                )}
              </div>
              <div className="maintenance">
                <h3>Maintenance</h3>
                <button 
                  className="manage-maintenance-button" 
                  onClick={() => setShowTenantsModal(true)} // Reuse tenants modal for maintenance (update later)
                  disabled={userRole === 'landlord'} // Disable for landlords (tenants submit, landlords manage)
                >
                  Manage Maintenance
                </button>
                {maintenance.length > 0 ? (
                  maintenance.map(request => (
                    <div key={request._id.toString()} className="maintenance-card">
                      <p><strong>{request.date ? new Date(request.date).toLocaleDateString() : 'N/A'}</strong> - {request.description || 'N/A'}</p>
                      <p>Status: {request.status || 'Pending'}</p>
                      {userRole === 'landlord' && (
                        <button onClick={() => handleRemoveMaintenance(request._id.toString())}>Remove</button>
                      )}
                    </div>
                  ))
                ) : (
                  <p>No maintenance requests recorded</p>
                )}
              </div>
            </div>
          </>
        );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the JWT token
    localStorage.removeItem('user'); // Clear user data if stored
    navigate('/login'); // Redirect to login page
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!property) return <div>No property found</div>;

  return (
    <div className="property-details-container">
      <header className="header">
        <img src={process.env.PUBLIC_URL + '/rentl-transparent.png'} alt="Rentl Logo" className="logo" />
        <button 
          onClick={handleLogout}
          className="logout-button"
        >
          Logout
        </button>
      </header>
      <nav className="sidebar">
        <ul>
          <li onClick={() => handleNavigation('Properties')}>Properties</li>
          <li onClick={() => handleNavigation('Payments')}>Payments <span className="badge">2</span></li>
          <li onClick={() => handleNavigation('Messages')}>Messages <span className="badge">5</span></li>
          <li onClick={() => handleNavigation('Maintenance')}>Maintenance <span className="badge">3</span></li>
          {userRole === 'landlord' && (
            <>
              <li onClick={() => handleNavigation('Reports')}>Reports</li>
              <li onClick={() => handleNavigation('File System')}>File System</li>
            </>
          )}
        </ul>
      </nav>
      <main className="main-content">
        {renderSection()}
      </main>

      {showTenantsModal && (
        <div className="modal-overlay" onClick={() => { 
          setShowTenantsModal(false); 
          setSelectedTenantId(null); 
          setMaintenanceForm({ description: '', status: 'Pending' }); 
          setMessageForm({ sender: '', message: '' }); 
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{userRole === 'landlord' ? 'Manage Tenants' : userRole === 'tenant' ? 'Submit Maintenance Request' : 'Manage Messages'}</h3>
            <form onSubmit={userRole === 'landlord' ? handleAddOrUpdateTenant : userRole === 'tenant' ? handleAddOrUpdateMaintenance : handleAddOrUpdateMessage}>
              {userRole === 'landlord' ? (
                <>
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
                </>
              ) : userRole === 'tenant' ? (
                <>
                  <input type="text" name="description" placeholder="Description" value={maintenanceForm.description} onChange={handleMaintenanceChange} required />
                  <select name="status" value={maintenanceForm.status} onChange={handleMaintenanceChange} required>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </>
              ) : (
                <>
                  <input type="text" name="sender" placeholder="Your Name" value={messageForm.sender} onChange={handleMessageChange} required />
                  <textarea name="message" placeholder="Message" value={messageForm.message} onChange={handleMessageChange} required style={{ width: '100%', margin: '10px 0', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </>
              )}
              <button type="submit">{userRole === 'landlord' ? 'Add Tenant' : userRole === 'tenant' ? 'Submit Maintenance' : 'Send Message'}</button>
              <button type="button" onClick={() => { 
                setShowTenantsModal(false); 
                setSelectedTenantId(null); 
                setMaintenanceForm({ description: '', status: 'Pending' }); 
                setMessageForm({ sender: '', message: '' }); 
              }}>Close</button>
            </form>
          </div>
        </div>
      )}

      {showPaymentsModal && (
        <div className="modal-overlay" onClick={() => { 
          setShowPaymentsModal(false); 
          setSelectedPaymentId(null); 
          setPaymentForm({ sender: '', amount: '', type: 'Rent' }); 
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{selectedPaymentId ? 'Edit Payment' : 'Manage Payments'}</h3>
            <form id="payment-form" onSubmit={handleAddOrUpdatePayment}>
              <input type="text" name="sender" placeholder="Sender (Tenant Name)" value={paymentForm.sender} onChange={handlePaymentChange} required disabled={userRole === 'tenant'} />
              <input type="number" name="amount" placeholder="Amount" value={paymentForm.amount} onChange={handlePaymentChange} step="0.01" required />
              <select name="type" value={paymentForm.type} onChange={handlePaymentChange} required>
                <option value="Rent">Rent</option>
                <option value="Security Deposit">Security Deposit</option>
                <option value="Late Fee">Late Fee</option>
              </select>
              <div id="card-element" style={{ margin: '10px 0', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}></div>
              <button type="submit">{selectedPaymentId ? 'Update Payment' : 'Process Payment'}</button>
              <button type="button" onClick={() => { 
                setShowPaymentsModal(false); 
                setSelectedPaymentId(null); 
                setPaymentForm({ sender: '', amount: '', type: 'Rent' }); 
              }}>Close</button>
              <div id="card-errors" style={{ color: 'red', fontSize: '12px' }}></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;