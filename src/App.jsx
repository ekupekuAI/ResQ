import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages (to be implemented)
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import CreateSociety from './pages/CreateSociety';
import JoinSociety from './pages/JoinSociety';
import Home from './pages/Home';
import SendAlert from './pages/SendAlert';
import SafetyCheck from './pages/SafetyCheck';
import Announcements from './pages/Announcements';
import AdminDashboard from './pages/AdminDashboard';
import GuardView from './pages/GuardView';
import Profile from './pages/Profile';

import Navbar from './components/Navbar';

// Auth Guard Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/auth" />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />; // fallback to home if unauthorized
  }
  
  return children;
};

// Route layout with Navbar
const Layout = ({ children }) => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen relative max-w-md mx-auto bg-background md:border-x md:shadow-2xl">
      <main className="pb-20">
        {children}
      </main>
      {user && <Navbar />}
    </div>
  );
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={!user ? <LandingPage /> : <Navigate to={user.role === 'guard' ? '/guard' : '/home'} />} />
          <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
          
          {/* Protected Routes */}
          <Route path="/join" element={<ProtectedRoute><JoinSociety /></ProtectedRoute>} />
          <Route path="/create-society" element={<ProtectedRoute allowedRoles={['admin']}><CreateSociety /></ProtectedRoute>} />
          
          <Route path="/home" element={<ProtectedRoute allowedRoles={['resident', 'admin']}><Home /></ProtectedRoute>} />
          <Route path="/send-alert" element={<ProtectedRoute allowedRoles={['resident']}><SendAlert /></ProtectedRoute>} />
          <Route path="/safety" element={<ProtectedRoute allowedRoles={['resident']}><SafetyCheck /></ProtectedRoute>} />
          <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/guard" element={<ProtectedRoute allowedRoles={['guard']}><GuardView /></ProtectedRoute>} />
        </Routes>
      </Layout>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
