import React, { useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import './NASA.css';

const API_BASE = process.env.REACT_APP_API_URL;

function NASA() {
  // ─── 21 Features ────────────────────────────────────────────
  const featureKeys = [
    'cycle',           // cycle number
    'op_setting_1',    // operational setting 1
    'op_setting_2',    // operational setting 2
    'sensor_2',        // sensor readings
    'sensor_3',
    'sensor_4',
    'sensor_6',
    'sensor_7',
    'sensor_8',
    'sensor_9',
    'sensor_11',
    'sensor_12',
    'sensor_13',
    'sensor_14',
    'sensor_15',
    'sensor_17',
    'sensor_20',
    'sensor_21',
    'engine_age',      // derived feature
    'sensor_2_roll',   // rolling average
    'sensor_2_diff'    // difference feature
  ];

  // ─── Default values (example – adjust based on your dataset) ──
  const defaultValues = {
    cycle: 1,
    op_setting_1: 0.5,
    op_setting_2: 0.5,
    sensor_2: 642.5,
    sensor_3: 1590.1,
    sensor_4: 1410.3,
    sensor_6: 0.0,
    sensor_7: 555.0,
    sensor_8: 2388.0,
    sensor_9: 9050.0,
    sensor_11: 47.5,
    sensor_12: 525.0,
    sensor_13: 2390.0,
    sensor_14: 8200.0,
    sensor_15: 8.42,
    sensor_17: 395.0,
    sensor_20: 39.0,
    sensor_21: 23.0,
    engine_age: 100,
    sensor_2_roll: 642.0,
    sensor_2_diff: 0.5
  };

  // ─── State ────────────────────────────────────────────────
  const [featureData, setFeatureData] = useState(defaultValues);
  const [snapshots, setSnapshots] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentHealth, setCurrentHealth] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  // ─── Handle input change ──────────────────────────────────
  const handleChange = (e) => {
    setFeatureData({
      ...featureData,
      [e.target.name]: parseFloat(e.target.value) || 0
    });
  };

  // ─── Reset to default ─────────────────────────────────────
  const resetValues = () => {
    setFeatureData(defaultValues);
  };

  // ─── Add current snapshot ────────────────────────────────
  const handleAddSnapshot = () => {
    setSnapshots(prev => [
      ...prev,
      { data: { ...featureData }, timestamp: new Date().toLocaleTimeString() }
    ]);
    setError(null);
  };

  // ─── Clear all ─────────────────────────────────────────────
  const handleClearAll = () => {
    setSnapshots([]);
    setHistory([]);
    setCurrentHealth(null);
    setStatusMessage('');
  };

  // ─── Predict all snapshots ────────────────────────────────
  const handlePredictAll = async () => {
    if (snapshots.length === 0) {
      setError('Add at least one snapshot first.');
      return;
    }
    setLoading(true);
    setError(null);
    const results = [];
    for (const snap of snapshots) {
      try {
        const response = await axios.post(`${API_BASE}/api/nasa/predict/`, snap.data);
        const prob = response.data.probability;
        const health = 1 - prob;
        results.push({
          timestamp: snap.timestamp,
          health: health,
          probability: prob,
          label: response.data.message,
          model: response.data.model_used
        });
      } catch (err) {
        setError(`Prediction failed for snapshot at ${snap.timestamp}: ${err.message}`);
        setLoading(false);
        return;
      }
    }
    setLoading(false);
    setHistory(results);
    if (results.length > 0) {
      const latest = results[results.length - 1];
      setCurrentHealth(latest.health);
      if (latest.health >= 0.8) setStatusMessage('✅ Engine Healthy – continue monitoring');
      else if (latest.health >= 0.5) setStatusMessage('⚠️ Monitoring – slight degradation detected');
      else if (latest.health >= 0.3) setStatusMessage('🔶 Warning – significant degradation, schedule inspection');
      else setStatusMessage('🔴 Critical – immediate maintenance required!');
    }
  };

  // ─── Render ──────────────────────────────────────────────
  return (
    <div className="nasa-container">
      <div className="card">
        <h2>🛩️ Engine Health Monitoring</h2>
        <p className="subtext">
          Enter <strong>21 features</strong> to track engine health over time
        </p>

        {/* Feature Input Grid */}
        <div className="nasa-feature-grid">
          {featureKeys.map(key => (
            <div className="feature-item" key={key}>
              <label>{key}</label>
              <input
                type="number"
                step="0.01"
                name={key}
                value={featureData[key]}
                onChange={handleChange}
              />
            </div>
          ))}
        </div>

        <div className="action-row">
          <button className="btn-secondary" onClick={resetValues}>↺ Reset</button>
          <button className="btn-secondary" onClick={handleAddSnapshot}>➕ Add Snapshot</button>
          <button className="btn-secondary" onClick={handleClearAll}>🗑️ Clear All</button>
        </div>

        <div className="snapshot-info">
          <strong>Snapshots added: {snapshots.length}</strong>
          <span className="snapshot-badges">
            {snapshots.map((s, idx) => (
              <span key={idx} className="snapshot-tag">#{idx + 1}</span>
            ))}
          </span>
        </div>

        <button
          className="btn-primary predict-btn"
          onClick={handlePredictAll}
          disabled={loading || snapshots.length === 0}
        >
          {loading ? 'Predicting...' : '🔍 Predict All & Show Health Trend'}
        </button>

        {error && <div className="error-box">{error}</div>}

        {/* Health Dashboard */}
        {history.length > 0 && (
          <div className="dashboard">
            <div className="health-gauge">
              <h3>Current Engine Health</h3>
              <div className="gauge-container">
                <div className="gauge-ring">
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="65" fill="none" stroke="#e0e0e0" strokeWidth="12" />
                    <circle
                      cx="80"
                      cy="80"
                      r="65"
                      fill="none"
                      stroke={currentHealth >= 0.8 ? '#4caf50' : currentHealth >= 0.5 ? '#ff9800' : currentHealth >= 0.3 ? '#ff5722' : '#f44336'}
                      strokeWidth="12"
                      strokeDasharray={`${2 * Math.PI * 65 * currentHealth} ${2 * Math.PI * 65 * (1 - currentHealth)}`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      transform="rotate(-90 80 80)"
                      style={{ transition: 'stroke-dasharray 0.5s' }}
                    />
                    <text x="80" y="80" textAnchor="middle" dominantBaseline="middle" fontSize="28" fontWeight="700" fill="#333">
                      {Math.round(currentHealth * 100)}%
                    </text>
                  </svg>
                </div>
                <div className="health-status">
                  <div className={`status-badge ${currentHealth >= 0.8 ? 'healthy' : currentHealth >= 0.5 ? 'warning' : currentHealth >= 0.3 ? 'danger' : 'critical'}`}>
                    {statusMessage}
                  </div>
                  <div className="health-details">
                    <span>Latest prediction: <strong>{history[history.length - 1].label}</strong></span>
                    <span>Failure probability: {(history[history.length - 1].probability * 100).toFixed(1)}%</span>
                    <span>Model used: {history[history.length - 1].model}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trend Chart */}
            <div className="trend-chart">
              <h3>Health Degradation Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 1]} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
                  <Tooltip formatter={(v) => `${(v * 100).toFixed(1)}%`} />
                  <ReferenceLine y={0.5} stroke="#ff9800" strokeDasharray="5 5" label="Threshold" />
                  <Line type="monotone" dataKey="health" stroke="#0083b0" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="chart-legend">
                <span>🟢 Healthy (≥80%)</span>
                <span>🟡 Monitoring (50‑79%)</span>
                <span>🟠 Warning (30‑49%)</span>
                <span>🔴 Critical (&lt;30%)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NASA;