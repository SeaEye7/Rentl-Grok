import React, { useState } from 'react';
import '../styles/AddTenantForm.css';

const AddTenantForm = ({ onTenantAdded, properties }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    property: '',
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
          <option key={property._id} value={property._id}>
            {property.address}
          </option>
        ))}
      </select>
      <button type="submit">Add Tenant</button>
    </form>
  );
};

export default AddTenantForm;