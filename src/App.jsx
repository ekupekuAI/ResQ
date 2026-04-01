import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
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

// Master Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles, requireSociety = true }) => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/auth" replace />;
  
  // Force society assignment before they can access standard pages
  if (requireSociety && !user.society_id) {
    if (user.role === 'admin') return <Navigate to="/create-society" replace />;
    return <Navigate to="/join" replace />;
  }
  
  // If they have a society but shouldn't be here (e.g. guard trying to access resident feed)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // This pushes them to RootGuard resolver
  }
  
  return children;
};

// Root Resolver Route
const RootGuard = () => {
  const { user } = useAuth();
  
  if (!user) return <LandingPage />;
  
  if (!user.society_id) {
    if (user.role === 'admin') return <Navigate to="/create-society" replace />;
    return <Navigate to="/join" replace />;
  }
  
  if (user.role === 'guard') return <Navigate to="/guard" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/home" replace />;
};

const Layout = ({ children }) => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen relative max-w-md mx-auto bg-background md:border-x md:shadow-2xl">
      <main className="pb-20">
        {children}
      </main>
      {/* Navbar only shows if logged in AND they completed society onboarding */}
      {(user && user.society_id) && <Navbar />}
    </div>
  );
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<RootGuard />} />
          <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" replace />} />
          
          {/* Onboarding Routes - Explicity don't require society_id to view these! */}
          <Route path="/join" element={<ProtectedRoute requireSociety={false}><JoinSociety /></ProtectedRoute>} />
          <Route path="/create-society" element={<ProtectedRoute allowedRoles={['admin']} requireSociety={false}><CreateSociety /></ProtectedRoute>} />
          
          {/* Application Routes - DO require society_id */}
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
