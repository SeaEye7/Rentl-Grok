import React, { useState } from 'react';
// Remove 'import '../styles/AddPropertyForm.css';'

const AddPropertyForm = ({ onPropertyAdded }) => {
  const [formData, setFormData] = useState({
    address: '',
    imageUrl: '',
    status: 'Currently Renting',
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
      <select name="status" value={formData.status} onChange={handleChange} required>
        <option value="Currently Renting">Currently Renting</option>
        <option value="Upcoming Lease">Upcoming Lease</option>
        <option value="Vacant">Vacant</option>
      </select>
      <button type="submit">Add Property</button>
    </form>
  );
};

export default AddPropertyForm;