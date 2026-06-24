import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';

import Home from './pages/Home';
import NASA from './pages/NASA';
import CWRU from './pages/CWRU';

import './App.css';

function App() {
  return (
    <Router>

      <div className="App">

        <nav className="navbar">
          <div className="nav-container">

            <Link
              to="/"
              className="nav-logo"
            >
              🔧 PdM System
            </Link>

            <ul className="nav-menu">
              <li>
                <Link to="/">
                  Home
                </Link>
              </li>

              <li>
                <Link to="/nasa">
                  Engine Health
                </Link>
              </li>

              <li>
                <Link to="/cwru">
                  Bearing Health
                </Link>
              </li>
            </ul>

          </div>
        </nav>

        <div className="page-container">

          <Routes>
            <Route
              path="/"
              element={<Home />}
            />

            <Route
              path="/nasa"
              element={<NASA />}
            />

            <Route
              path="/cwru"
              element={<CWRU />}
            />
          </Routes>

        </div>

        <footer className="footer">
          <p>
            Predictive Maintenance System –
            Early Detection & Health Monitoring
          </p>
        </footer>

      </div>

    </Router>
  );
}

export default App;