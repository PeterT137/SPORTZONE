import { config } from '@fortawesome/fontawesome-svg-core';
import "bootstrap/dist/js/bootstrap.bundle.min.js";
config.autoAddCss = false;

import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import LoginComponent from './components/auth/AuthComponent';
import PublicRoute from './components/auth/PublicRoute';
import FacilityDetail from "./components/facility/FacilityDetail";
import FacilityManager from './components/facility/FacilityManager';
import FieldListPage from './components/field/FieldListPage';
import FieldManager from "./components/field/FieldManager";
import GoogleAuthCallback from './components/GoogleAuthCallback';
import WeeklySchedule from './components/lich';
import { OrderManagement } from './components/order/OrderManager'; // Sửa import
import HomePage from './components/Pages/HomePage';
import PaymentPage from './components/payment/PaymentPage';
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
      <Route path="/facility/:facId" element={<FacilityDetail />} />
      <Route path="/facility_manager" element={<FacilityManager />} />
      <Route path="/field_manager" element={<FieldManager />} />
      <Route path="/weekly_schedule" element={<WeeklySchedule />} />
      <Route path="/google-auth-callback" element={<GoogleAuthCallback />} />
      <Route path="/service_manager" element={<ServiceManager />} />
      <Route path="/order_manager" element={<OrderManagement />} /> {/* Sửa tên component */}
      <Route path="/field_list" element={<FieldListPage />} />
      <Route path="/payment" element={<PaymentPage />} />
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