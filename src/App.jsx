import { Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import { Layout } from './components/layout';
import Login from './pages/Login';

// Admin Pages
import {
  AdminDashboard,
  Production,
  Items,
  Shops,
  Reports,
  Users,
  AuditLogs
} from './pages/admin';

// Seller Pages
import {
  SellerDashboard,
  SellerTransactions
} from './pages/seller';

function App() {
  return (
    <DataProvider>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="production" element={<Production />} />
          <Route path="items" element={<Items />} />
          <Route path="shops" element={<Shops />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<Users />} />
          <Route path="audit-logs" element={<AuditLogs />} />
        </Route>

        {/* Seller Routes */}
        <Route
          path="/seller"
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SellerDashboard />} />
          <Route path="transactions" element={<SellerTransactions />} />
        </Route>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* 404 - Redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </DataProvider>
  );
}

export default App;
