import React from 'react';
import '../styles/PropertyCard.css';

const PropertyCard = ({ property, tenants }) => {
  console.log('Rendering PropertyCard:', { property, tenants }); // Debug log
  return (
    <div className="property-card">
      <img src={property.imageUrl} alt={property.address} />
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
      <button>View Details</button>
    </div>
  );
};

export default PropertyCard;