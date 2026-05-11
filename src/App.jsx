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

// Layout wrapper to conditionally hide Navbar/Footer
const AppLayout = ({ children }) => {
    const location = useLocation();
    const hideNavFooter = ['/login', '/register', '/forgot-password', '/reset-password'].some(path => location.pathname.startsWith(path));
    const isAdminRoute = location.pathname.startsWith('/admin');

    if (isAdminRoute) {
        return children;
    }

    return (
        <div className="bg-background min-h-screen flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
            {!hideNavFooter && <Navbar />}
            <main className={`flex-grow ${!hideNavFooter ? 'pt-20' : ''}`}>
                {children}
            </main>


        </div>
    );
};

import { AuthProvider } from './context/AuthContext';

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppLayout>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/search" element={<SearchItems />} />
                        <Route path="/item/:id" element={<ItemDetail />} />
                        <Route path="/report/:type" element={<ReportItem />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/chat/:userId" element={<Chat />} />


                        {/* Admin Routes */}
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
                        <Route path="/admin/items" element={<AdminLayout><AdminItems /></AdminLayout>} />
                        <Route path="/admin/lost" element={<AdminLayout><AdminLostItems /></AdminLayout>} />
                        <Route path="/admin/found" element={<AdminLayout><AdminFoundItems /></AdminLayout>} />
                        <Route path="/admin/chat" element={<AdminLayout><AdminChat /></AdminLayout>} />
                        <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
                        <Route path="/admin/staff" element={<AdminLayout><AdminStaff /></AdminLayout>} />
                        <Route path="/admin/ai-search" element={<AdminLayout><AIChatSearch /></AdminLayout>} />
                        <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
                    </Routes>
                </AppLayout>
            </AuthProvider>
        </Router>
    );
}

export default App;
