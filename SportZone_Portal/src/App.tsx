import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginComponent from './components/auth/AuthComponent';
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginComponent />} />
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