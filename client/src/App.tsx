import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import StatsPage from './pages/StatsPage';
import TodoPage from './pages/TodoPage';
import ProfilePage from './pages/ProfilePage';
import HabitDetailPage from './pages/HabitDetailPage';
import HabitWizardPage from './pages/HabitWizardPage';
import SettingsPage from './pages/SettingsPage';

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-vs-deep flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="text-5xl mb-4 animate-float">🦚</div>
          <p className="text-vs-feather font-heading font-semibold">Loading Velvet Streak...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth routes */}
      <Route element={isAuthenticated ? <Navigate to="/" /> : <AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* App routes (protected) */}
      <Route element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" />}>
        <Route index element={<HomePage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="todos" element={<TodoPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="habits/new" element={<HabitWizardPage />} />
        <Route path="habits/:id" element={<HabitDetailPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--vs-surface)',
            color: 'var(--vs-text)',
            border: '1px solid var(--vs-border)',
            borderRadius: '16px',
          },
        }}
      />
      <AppRoutes />
    </BrowserRouter>
  );
}
