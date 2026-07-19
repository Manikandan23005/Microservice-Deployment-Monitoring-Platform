import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Overview from './pages/Overview';
import Deployments from './pages/Deployments';
import Pods from './pages/Pods';
import Nodes from './pages/Nodes';
import Namespaces from './pages/Namespaces';
import Metrics from './pages/Metrics';
import Logs from './pages/Logs';
import Alerts from './pages/Alerts';
import AI from './pages/AI';
import Settings from './pages/Settings';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import { ScopeProvider } from './context/ScopeContext';

// Admin EWRAM Pages
import { UsersPage } from './pages/admin/Users';
import { RolesPage } from './pages/admin/Roles';
import { PermissionsMatrixPage } from './pages/admin/PermissionsMatrix';
import { AuditLogsPage } from './pages/admin/AuditLogs';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Views */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <ScopeProvider>
                <DashboardLayout />
              </ScopeProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="deployments" element={<Deployments />} />
          <Route path="pods" element={<Pods />} />
          <Route path="nodes" element={<Nodes />} />
          <Route path="namespaces" element={<Namespaces />} />
          <Route path="metrics" element={<Metrics />} />
          <Route path="logs" element={<Logs />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="ai" element={<AI />} />
          
          {/* Admin Protected EWRAM Pages */}
          <Route 
            path="admin/users" 
            element={
              <ProtectedRoute allowedRoles={['Administrator', 'Platform Engineer']}>
                <UsersPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="admin/roles" 
            element={
              <ProtectedRoute allowedRoles={['Administrator', 'Platform Engineer']}>
                <RolesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="admin/permissions" 
            element={
              <ProtectedRoute allowedRoles={['Administrator', 'Platform Engineer']}>
                <PermissionsMatrixPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="admin/audit" 
            element={
              <ProtectedRoute allowedRoles={['Administrator', 'Platform Engineer']}>
                <AuditLogsPage />
              </ProtectedRoute>
            } 
          />

          {/* Settings restricted to Administrator only */}
          <Route 
            path="settings" 
            element={
              <ProtectedRoute allowedRoles={['Administrator']}>
                <Settings />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
