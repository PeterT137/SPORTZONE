import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginComponent from './components/auth/AuthComponent';
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import FacilityManager from './components/facility/FacilityManager';
const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginComponent />} />
      <Route path="/login" element={<LoginComponent />} />
      <Route path="/facility_manager" element={<FacilityManager />} />
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