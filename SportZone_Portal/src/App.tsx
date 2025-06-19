import "bootstrap/dist/js/bootstrap.bundle.min.js";
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import LoginComponent from './components/auth/AuthComponent';
import HomePage from './components/Pages/HomePage';

const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/homepage" element={<HomePage />} />
      <Route path="/login" element={<LoginComponent />} />

    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;