
import { config } from '@fortawesome/fontawesome-svg-core';
import "bootstrap/dist/js/bootstrap.bundle.min.js";
config.autoAddCss = false;

import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import LoginComponent from './components/auth/AuthComponent';
import PublicRoute from './components/auth/PublicRoute';
import FacilityManager from './components/facility/FacilityManager';
import FieldManager from "./components/field/FieldManager";
import GoogleAuthCallback from './components/GoogleAuthCallback';
import WeeklySchedule from './components/lich';
import OrderManager from "./components/order/OrderManager";
import HomePage from './components/Pages/HomePage';
import ServiceManager from "./components/services/ServiceManager";
const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/homepage" element={<HomePage />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginComponent />
          </PublicRoute>
        }
      />
      <Route path="/facility_manager" element={<FacilityManager />} />
      <Route path="/field_manager" element={<FieldManager />} />
      <Route path="/weekly_schedule" element={<WeeklySchedule />} />
      <Route path="/google-auth-callback" element={<GoogleAuthCallback />} />
      <Route path="/service_manager" element={<ServiceManager />} />
      <Route path="/order_manager" element={<OrderManager />} />

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
