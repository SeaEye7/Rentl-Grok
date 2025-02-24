import React from 'react';
import { useNavigate } from 'react-router-dom';
// No CSS import needed (handled by App.css)

const PropertyCard = ({ property, tenants }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/properties/${property._id}`);
  };

  return (
    <div className="property-card">
      <img src={property.imageUrl || 'https://via.placeholder.com/200x150'} alt={property.address} />
      <h3>{property.address}</h3>
      <p>Status: {property.status}</p>
      {tenants.length > 0 ? (
        <div>
          <h4>Tenants:</h4>
          <ul>
            {tenants.map(tenant => (
              <li key={tenant._id.toString()}>{tenant.name} ({tenant.email})</li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No tenants assigned</p>
      )}
      <button onClick={handleViewDetails}>View Details</button>
    </div>
  );
};

export default PropertyCard;