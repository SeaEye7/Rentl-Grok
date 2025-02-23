import React, { useState } from 'react';
import '../styles/AddPropertyForm.css';

const AddPropertyForm = ({ onPropertyAdded }) => {
  const [formData, setFormData] = useState({
    address: '',
    imageUrl: '',
    status: 'Currently Renting',
    leaseStart: '',
    leaseEnd: '',
    rentAmount: '',
    securityDeposit: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to add property');
      const newProperty = await response.json();
      onPropertyAdded(newProperty);
      setFormData({
        address: '',
        imageUrl: '',
        status: 'Currently Renting',
        leaseStart: '',
        leaseEnd: '',
        rentAmount: '',
        securityDeposit: '',
      });
      alert('Property added successfully!');
    } catch (err) {
      alert(`Error adding property: ${err.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-property-form">
      <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
      <input type="text" name="imageUrl" placeholder="Image URL" value={formData.imageUrl} onChange={handleChange} />
      <input type="date" name="leaseStart" value={formData.leaseStart} onChange={handleChange} required />
      <input type="date" name="leaseEnd" value={formData.leaseEnd} onChange={handleChange} required />
      <input type="number" name="rentAmount" placeholder="Rent Amount" value={formData.rentAmount} onChange={handleChange} required />
      <input type="number" name="securityDeposit" placeholder="Security Deposit" value={formData.securityDeposit} onChange={handleChange} required />
      <button type="submit">Add Property</button>
    </form>
  );
};

export default AddPropertyForm;