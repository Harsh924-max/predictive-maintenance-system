import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <div className="hero-card">
        <h1>
          <span className="icon">🔧</span> Predictive Maintenance System
        </h1>
        <p className="subtitle">
          Early fault detection for turbofan engines and rotating machinery
        </p>

        <div className="home-feature-grid">
          <Link to="/nasa" className="home-feature-card">
            <span className="home-feature-icon">🛩️</span>
            <h3>NASA C-MAPSS</h3>
            <p>
              Predict failure probability from engine sensor readings
              using XGBoost and Random Forest models.
            </p>
          </Link>

          <Link to="/cwru" className="home-feature-card">
            <span className="home-feature-icon">⚙️</span>
            <h3>CWRU Bearing</h3>
            <p>
              Detect bearing faults (IR, OR, Ball) from vibration data
              using a Convolutional Neural Network.
            </p>
          </Link>
        </div>

        <div className="status-badge">
          <span className="dot"></span>
          API Status:
          <span className="status-text"> Connected</span>
        </div>
      </div>
    </div>
  );
}

export default Home;