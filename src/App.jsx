import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import ReportItem from './pages/ReportItem';
import SearchItems from './pages/SearchItems';
import ItemDetail from './pages/ItemDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminItems from './pages/admin/Items';
import AdminUsers from './pages/admin/Users';
import AdminLostItems from './pages/admin/LostItems';
import AdminFoundItems from './pages/admin/FoundItems';
import AdminChat from './pages/admin/Chat';
import AdminStaff from './pages/admin/Staff';
import AdminLogin from './pages/admin/Login';
import AdminSettings from './pages/admin/Settings';

import AIChatSearch from './pages/AIChatSearch';
import Chat from './pages/Chat';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import './App.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { Navigate } from 'react-router-dom';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) return (
        <div className="min-h-screen bg-[#060b18] flex items-center justify-center">
            <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) return (
        <div className="min-h-screen bg-[#060b18] flex items-center justify-center">
            <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
    
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
        return <Navigate to="/login" replace />;
    }
    
    return children;
};

// Layout wrapper to conditionally hide Navbar/Footer
const AppLayout = ({ children }) => {
    const location = useLocation();
    const hideNavFooter = ['/login', '/register', '/forgot-password', '/reset-password'].some(path => location.pathname.startsWith(path));
    const isAdminRoute = location.pathname.startsWith('/admin');

    if (isAdminRoute) {
        return children;
    }

    return (
        <div className="bg-background min-h-screen flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900 mobile-optimized">
            {!hideNavFooter && <Navbar />}
            <main className={`flex-grow ${!hideNavFooter ? 'pt-20' : ''}`}>
                {children}
            </main>
        </div>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppLayout>
                    <Routes>
                        {/* Auth Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />

                        {/* Protected User Routes */}
                        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                        <Route path="/search" element={<ProtectedRoute><SearchItems /></ProtectedRoute>} />
                        <Route path="/item/:id" element={<ProtectedRoute><ItemDetail /></ProtectedRoute>} />
                        <Route path="/report/:type" element={<ProtectedRoute><ReportItem /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="/chat/:userId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

                        {/* Protected Admin Routes */}
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
                        <Route path="/admin/items" element={<AdminRoute><AdminLayout><AdminItems /></AdminLayout></AdminRoute>} />
                        <Route path="/admin/lost" element={<AdminRoute><AdminLayout><AdminLostItems /></AdminLayout></AdminRoute>} />
                        <Route path="/admin/found" element={<AdminRoute><AdminLayout><AdminFoundItems /></AdminLayout></AdminRoute>} />
                        <Route path="/admin/chat" element={<AdminRoute><AdminLayout><AdminChat /></AdminLayout></AdminRoute>} />
                        <Route path="/admin/users" element={<AdminRoute><AdminLayout><AdminUsers /></AdminLayout></AdminRoute>} />
                        <Route path="/admin/staff" element={<AdminRoute><AdminLayout><AdminStaff /></AdminLayout></AdminRoute>} />
                        <Route path="/admin/ai-search" element={<AdminRoute><AdminLayout><AIChatSearch /></AdminLayout></AdminRoute>} />
                        <Route path="/admin/settings" element={<AdminRoute><AdminLayout><AdminSettings /></AdminLayout></AdminRoute>} />
                    </Routes>
                </AppLayout>
            </AuthProvider>
        </Router>
    );
}

export default App;
