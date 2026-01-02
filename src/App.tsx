import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage.tsx';
import { CompleteProfilePage } from './pages/CompleteProfilePage';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { ProgramsPage } from './pages/ProgramsPage';
import { ProgramDetailPage } from './pages/ProgramDetailPage';
import { HostEventsPage } from './pages/HostEventsPage';
import { EventFormPage } from './pages/EventFormPage';
import { EventManagePage } from './pages/EventManagePage';
import { AdminPage } from './pages/AdminPage';
import HostDashboardPage from './pages/HostDashboardPage';

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, needsProfileCompletion } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }


  // If user is admin (god), never require profile completion
  if (
    user &&
    user.username === 'admin' &&
    user.role === 'ADMIN'
  ) {
    // skip profile completion for god admin
    return <>{children}</>;
  }

  if (needsProfileCompletion && window.location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }

  return <>{children}</>;
};

// Admin Route wrapper
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (
    !user ||
    (user.role !== 'EVENT_ADMIN' && user.role !== 'ADMIN' && (user.role as string) !== 'HOST')
  ) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

// Ultimate Event Host Route wrapper
const UltimateAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/admin-login" element={<AdminLoginPage />} />

      {/* Protected Routes */}
      <Route
        path="/complete-profile"
        element={
          <ProtectedRoute>
            <CompleteProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/search/:categorySlug"
        element={
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/event/:id"
        element={
          <ProtectedRoute>
            <EventDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/programs"
        element={
          <ProtectedRoute>
            <ProgramsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/programs/:programName"
        element={
          <ProtectedRoute>
            <ProgramDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Friendly SEO route for program/event (e.g. /programname/eventid) */}
      <Route
        path="/:program/:event"
        element={
          <ProtectedRoute>
            <EventDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Host Routes */}
      <Route
        path="/host/events"
        element={
          <AdminRoute>
            <HostEventsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/host/events/create"
        element={
          <AdminRoute>
            <EventFormPage />
          </AdminRoute>
        }
      />
      <Route
        path="/host/events/manage/:id"
        element={
          <AdminRoute>
            <EventManagePage />
          </AdminRoute>
        }
      />
      <Route
        path="/host/events/edit/:id"
        element={
          <AdminRoute>
            <EventFormPage />
          </AdminRoute>
        }
      />

      {/* Ultimate Admin Routes */}
      <Route
        path="/host/dashboard"
        element={
          <UltimateAdminRoute>
            <AdminPage />
          </UltimateAdminRoute>
        }
      />

      {/* Demo Admin Dashboard Route (Hidden) */}
      <Route path="/admin-demo" element={<HostDashboardPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
