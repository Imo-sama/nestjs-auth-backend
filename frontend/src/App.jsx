import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import TwoFactorSetup from './components/TwoFactorSetup';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          token ? <Navigate to="/dashboard" /> : <Login setToken={setToken} />
        } />
        <Route path="/signup" element={
          token ? <Navigate to="/dashboard" /> : <Signup setToken={setToken} />
        } />
        <Route path="/dashboard" element={
          token ? <Dashboard token={token} logout={logout} /> : <Navigate to="/login" />
        } />
        <Route path="/2fa-setup" element={
          token ? <TwoFactorSetup token={token} /> : <Navigate to="/login" />
        } />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
