import React, { useState } from 'react';
// Remove 'import '../styles/AddTenantForm.css';'

const AddTenantForm = ({ onTenantAdded, properties }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    property: '',
    leaseStart: '',
    leaseEnd: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to add tenant');
      const newTenant = await response.json();
      onTenantAdded(newTenant);
      setFormData({
        name: '',
        email: '',
        phone: '',
        property: '',
        leaseStart: '',
        leaseEnd: '',
      });
      alert('Tenant added successfully!');
    } catch (err) {
      alert(`Error adding tenant: ${err.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-tenant-form">
      <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
      <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />
      <select name="property" value={formData.property} onChange={handleChange} required>
        <option value="">Select a Property</option>
        {properties.map(property => (
          <option key={property._id.toString()} value={property._id.toString()}>
            {property.address}
          </option>
        ))}
      </select>
      <label>
        Lease Start:
        <input type="date" name="leaseStart" value={formData.leaseStart} onChange={handleChange} />
      </label>
      <label>
        Lease End:
        <input type="date" name="leaseEnd" value={formData.leaseEnd} onChange={handleChange} />
      </label>
      <button type="submit">Add Tenant</button>
    </form>
  );
};

export default AddTenantForm;