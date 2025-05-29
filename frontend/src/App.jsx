import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FormPage from './FormPage';
import AdminLogin from './admin/AdminLogin';
import Dashboard from './admin/Dashboard';
import ProtectedRoute from './admin/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/Formpage" element={<FormPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        {/* Protect dashboard route */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

