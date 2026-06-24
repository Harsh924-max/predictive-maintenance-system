import React, { useState } from 'react';
import axios from 'axios';
import './CWRU.css';

const API_BASE = 'http://127.0.0.1:8000';

function CWRU() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const loadDemoSample = () => {
  const demoData = [
    0.52, 1.23, 3.45, 2.11, 0.89,
    1.67, 2.34, 1.56, 0.98, 1.22
  ];

  setResult({
    prediction_label: "Inner Race Fault",
    confidence: 0.982,
    health_status: "Warning",
    recommendation: "Inspect inner race bearing"
  });
};


  const handlePredict = async () => {
    if (!file) {
      setError('Please select a file.');
      return;
    }

    

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post(
        `${API_BASE}/api/cwru/predict/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setResult(response.data);
    } catch (err) {
       console.error(err);

  if (err.response && err.response.data) {
    setError(JSON.stringify(err.response.data));
  } else {
    setError('Prediction failed.');
  }
    }

    setLoading(false);
  };

 // ADD HERE
  const faultMap = {
    Normal: "Healthy Bearing",

    IR_007: "Inner Race Fault",
    IR_014: "Inner Race Fault",
    IR_021: "Inner Race Fault",

    OR_007: "Outer Race Fault",
    OR_014: "Outer Race Fault",
    OR_021: "Outer Race Fault",

    Ball_007: "Ball Fault",
    Ball_014: "Ball Fault",
    Ball_021: "Ball Fault"
  };
  
  return (
    <div className="cwru-container">
      <div className="card">

        <h2>⚙️ Rolling Bearing Fault Detection</h2>

        <p className="subtext">
          Upload bearing vibration data for early fault detection and health assessment
        </p>

        <div className="upload-box">
          <input
            type="file"
            accept=".csv,.xlsx,.xls,.mat,.npz"
            onChange={handleFileChange}
          />

          <p>
            Supported formats:
            CSV, Excel, MAT, NPZ
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={handlePredict}
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Analyze Bearing Health'}
        </button>

        <button
           className="btn-secondary"
             onClick={loadDemoSample}
>
          Load Demo Bearing Sample
        </button>

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        {result && (
          <div className="result-box">

            <h3>Bearing Health Report</h3>

            <div className="result-row">
              <span className="label">Fault Type:</span>
              <span className="value">
                {faultMap[result.prediction_label] || result.prediction_label}
              </span>
            </div>

            <div className="result-row">
              <span className="label">Confidence:</span>
              <span className="value">
                {(result.confidence * 100).toFixed(2)}%
              </span>
            </div>

            <div className="result-row">
              <span className="label">Health Status:</span>
              <span className="value">
                {
  result.prediction_label.includes("Normal")
    ? "Healthy"
    : result.prediction_label.includes("IR")
    ? "Warning"
    : result.prediction_label.includes("OR")
    ? "Critical"
    : "Warning"
}
              </span>
            </div>

            <div className="result-row">
              <span className="label">Recommendation:</span>
              <span className="value">
                {
  result.prediction_label.includes("Normal")
    ? "Continue normal operation and periodic monitoring."
    : result.prediction_label.includes("IR")
    ? "Inspect inner race bearing and schedule maintenance."
    : result.prediction_label.includes("OR")
    ? "Outer race damage detected. Immediate inspection recommended."
    : "Bearing fault detected. Maintenance required."
}
              </span>
            </div>

          </div>
        )}
        

      </div>
    </div>
  );
}

export default CWRU;