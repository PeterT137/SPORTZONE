import BookingHistoryPage from "./pages/BookingHistory";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import { config } from "@fortawesome/fontawesome-svg-core";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
config.autoAddCss = false;

import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import LoginComponent from "./components/auth/AuthComponent";
import PublicRoute from "./components/auth/PublicRoute";
import BookingPage from "./components/booking/BookingPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import FacilityDetail from "./components/facility/FacilityDetail";
import FacilityManager from "./components/facility/FacilityManager";
import FieldListPage from "./components/field/FieldListPage";
import FieldManager from "./components/field/FieldManager";
import GoogleAuthCallback from "./components/GoogleAuthCallback";
import WeeklySchedule from "./components/booking/lich";
import OrdersTable from "./components/order/OrderTable";
import HomePage from "./components/Pages/HomePage";
import PaymentPage from "./components/payment/PaymentPage";
import ServiceManager from "./components/services/ServiceManager";
import StaffManager from "./components/staff/StaffManager";
import UsersManager from "./components/users/UsersManager";
import RegulationManager from "./components/regulation/RegulationManager";
import FinanceManager from "./pages/FinanceManager";
import AppNotificationDemo from "./AppNotificationDemo";
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
      <Route
        path="/facility_manager"
        element={
          <ProtectedRoute requireAuth allowRoles={[2]}>
            <FacilityManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/field_manager"
        element={
          <ProtectedRoute requireAuth allowRoles={[2]}>
            <FieldManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/weekly_schedule"
        element={
          <ProtectedRoute requireAuth allowRoles={[2]}>
            <WeeklySchedule />
          </ProtectedRoute>
        }
      />
      <Route path="/google-auth-callback" element={<GoogleAuthCallback />} />
      <Route
        path="/service_manager"
        element={
          <ProtectedRoute requireAuth allowRoles={[2]}>
            <ServiceManager />
          </ProtectedRoute>
        }
      />
      <Route path="/order_manager" element={<OrdersTable />} />
      <Route path="/field_list" element={<FieldListPage />} />
      <Route
        path="/booking/:facId"
        element={
          <ProtectedRoute
            blockRoles={[3]}
            message="Admin không thể tiến hành đặt vé"
          >
            <BookingPage />
          </ProtectedRoute>
        }
      />
      <Route path="/payment" element={<PaymentPage />} />
      <Route
        path="/staff_manager"
        element={
          <ProtectedRoute requireAuth allowRoles={[2]}>
            <StaffManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users_manager"
        element={
          <ProtectedRoute requireAuth allowRoles={[3]}>
            <UsersManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/regulation_manager"
        element={
          <ProtectedRoute requireAuth allowRoles={[3]}>
            <RegulationManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance_manager"
        element={
          <ProtectedRoute requireAuth allowRoles={[2]}>
            <FinanceManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking-history"
        element={
          <ProtectedRoute requireAuth allowRoles={[1, 2, 4]}>
            <BookingHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-failed" element={<PaymentFailed />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppNotificationDemo />
      <AppContent />
    </Router>
  );
};

export default App;
