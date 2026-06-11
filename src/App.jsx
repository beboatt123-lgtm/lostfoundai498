import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Maintenance from './pages/Maintenance';
import { useState, useEffect } from 'react';
import api from './lib/axios';

import Home from './pages/Home';
import ReportItem from './pages/ReportItem';
import EditItem from './pages/EditItem';
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
import AdminStaff from './pages/admin/Staff';
import AdminLogin from './pages/admin/Login';
import AdminSettings from './pages/admin/Settings';
import AdminLocations from './pages/admin/Locations';
import QRScanner from './pages/admin/QRScanner';

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

// Maintenance mode gate — blocks non-admin users when maintenance is on
const MaintenanceGate = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');
    const [maintenance, setMaintenance] = useState(null);
    const [orgName, setOrgName] = useState('');

    useEffect(() => {
        api.get('/settings/public').then(res => {
            setMaintenance(res.data.maintenanceMode);
            setOrgName(res.data.orgName);
        }).catch(() => setMaintenance(false));
    }, []);

    if (maintenance === null) return null; // wait for check
    if (maintenance && !isAdminRoute && user?.role !== 'admin' && user?.role !== 'staff') {
        return <Maintenance orgName={orgName} />;
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
                <MaintenanceGate>
                <AppLayout>
                    <Routes>
                        {/* Auth Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />

                        {/* Protected User Routes */}
                        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                        <Route path="/item/:id" element={<ProtectedRoute><ItemDetail /></ProtectedRoute>} />
                        <Route path="/report/:type" element={<ProtectedRoute><ReportItem /></ProtectedRoute>} />
                        <Route path="/edit-item/:id" element={<ProtectedRoute><EditItem /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="/chat/:userId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

                        {/* Protected Admin Routes */}
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
                        <Route path="/admin/items" element={<AdminRoute><AdminLayout><AdminItems /></AdminLayout></AdminRoute>} />
                        <Route path="/admin/lost" element={<AdminRoute><AdminLayout><AdminLostItems /></AdminLayout></AdminRoute>} />
                        <Route path="/admin/found" element={<AdminRoute><AdminLayout><AdminFoundItems /></AdminLayout></AdminRoute>} />
                        <Route path="/admin/users" element={<AdminRoute><AdminLayout><AdminUsers /></AdminLayout></AdminRoute>} />
                        <Route path="/admin/staff" element={<AdminRoute><AdminLayout><AdminStaff /></AdminLayout></AdminRoute>} />
                        <Route path="/admin/settings" element={<AdminRoute><AdminLayout><AdminSettings /></AdminLayout></AdminRoute>} />
                        <Route path="/admin/locations" element={<AdminRoute><AdminLayout><AdminLocations /></AdminLayout></AdminRoute>} />
                        <Route path="/admin/qr-scanner" element={<AdminRoute><AdminLayout><QRScanner /></AdminLayout></AdminRoute>} />
                    </Routes>
                </AppLayout>
                </MaintenanceGate>
            </AuthProvider>
        </Router>
    );
}

export default App;
