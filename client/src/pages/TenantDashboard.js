import React from 'react';
// import '../styles/TenantDashboard.css'; // Create or update this file similarly

const TenantDashboard = () => {
  return (
    <div className="dashboard-container">
      <header className="header">
        <img src="/rentl-transparent.png" alt="Rentl Logo" className="logo" />
        <button className="menu-toggle">≡</button>
      </header>
      <nav className="sidebar">
        <ul>
          <li>Properties</li>
          <li>Payments</li>
          <li>Messages</li>
          <li>Maintenance</li>
          <li>Reports</li>
          <li>File System</li>
        </ul>
      </nav>
      <main className="main-content">
        <h1>Tenant Dashboard</h1>
        <p>Welcome to your tenant dashboard. Features to be added (e.g., view property, pay rent, submit maintenance requests).</p>
      </main>
    </div>
  );
};

export default TenantDashboard;