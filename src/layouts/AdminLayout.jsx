import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Package,
    Users,
    Settings,
    LogOut,
    Menu,
    MapPin,
    Search,
    Bell,
    ChevronDown,
    MessageSquare,
    ShieldCheck,
    ExternalLink
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminLayout = ({ children }) => {
    const { user, logout, loading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    // Security Check: Redirect to admin login if not logged in or not admin/staff
    if (!loading && (!user || (user.role !== 'admin' && user.role !== 'staff'))) {
        navigate('/admin/login');
        return null;
    }

    if (loading) {
        return <div className="h-screen w-full flex items-center justify-center bg-[#0F172A] text-white">กำลังโหลด...</div>;
    }

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'ภาพรวมระบบ', path: '/admin' },
        { icon: <ExternalLink size={20} className="text-blue-400" />, label: 'ไปหน้าหลักของเว็บ', path: '/' },
        { icon: <Package size={20} className="text-rose-400" />, label: 'จัดการของหาย', path: '/admin/lost' },
        { icon: <MapPin size={20} className="text-emerald-400" />, label: 'จัดการของที่พบ', path: '/admin/found' },
        { icon: <MapPin size={20} className="text-blue-400" />, label: 'จัดการสถานที่', path: '/admin/locations' },
        { icon: <MessageSquare size={20} className="text-blue-400" />, label: 'แชทช่วยเหลือ', path: '/admin/chat' },
        { icon: <Search size={20} className="text-purple-400" />, label: 'AI ค้นหาอัจฉริยะ', path: '/admin/ai-search' },
        { icon: <Users size={20} />, label: 'บัญชีผู้ใช้งาน', path: '/admin/users' },
    ];

    const settingItems = [
        { icon: <ShieldCheck size={20} />, label: 'จัดการผู้ดูแล (Staff)', path: '/admin/staff' },
        { icon: <Settings size={20} />, label: 'ตั้งค่าระบบ', path: '/admin/settings' },
    ];

    const isActive = (path) => {
        if (path === '/admin' && location.pathname === '/admin') return true;
        if (path !== '/admin' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-[#111827] text-slate-300 font-sans">
            <div className="p-6 pb-2">
                <Link to="/admin" className="flex items-center gap-3 mb-10 group">
                    <div className="w-10 h-10 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-900/40 group-hover:shadow-emerald-900/60 transition-all ring-1 ring-white/10">
                        <MapPin size={22} fill="currentColor" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-white tracking-tight leading-tight">Lost&Found AI</span>
                        <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">แผงควบคุมหลัก</span>
                    </div>
                </Link>

                <div className="space-y-8">
                    <div>
                        <h3 className="text-xs font-bold uppercase text-slate-500 mb-4 px-3 tracking-widest leading-none">เมนูหลัก</h3>
                        <nav className="space-y-1.5">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden ${isActive(item.path)
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                                        : 'hover:bg-slate-800/50 hover:text-white'
                                        }`}
                                >
                                    {isActive(item.path) && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full"></div>}
                                    <span className={`transition-colors duration-200 ${isActive(item.path) ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-300'}`}>
                                        {item.icon}
                                    </span>
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold uppercase text-slate-500 mb-4 px-3 tracking-widest leading-none">การตั้งค่า</h3>
                        <nav className="space-y-1.5">
                            {settingItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden ${isActive(item.path)
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                                        : 'hover:bg-slate-800/50 hover:text-white'
                                        }`}
                                >
                                    {isActive(item.path) && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full"></div>}
                                    <span className={`transition-colors duration-200 ${isActive(item.path) ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-300'}`}>
                                        {item.icon}
                                    </span>
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>

            <div className="mt-auto border-t border-slate-800 bg-[#0B1120] p-4">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-slate-700 shadow-sm">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback className="bg-emerald-500 text-white font-bold">{user?.firstname?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-semibold text-white truncate">{user?.firstname} {user?.lastname}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            logout();
                            navigate('/admin/login');
                        }}
                        className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 rounded-full"
                    >
                        <LogOut size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex">

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-[280px] fixed h-full z-30 border-r border-slate-200 shadow-2xl shadow-slate-200/50">
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-[280px] flex flex-col min-h-screen bg-[#F8FAFC]">

                {/* Header */}
                <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-6 sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-4 flex-1">
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="lg:hidden">
                                    <Menu size={24} />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-[280px] border-r-0">
                                <SidebarContent />
                            </SheetContent>
                        </Sheet>

                        {/* Search Bar */}
                        <div className="hidden md:flex relative max-w-md w-96 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                            <Input
                                placeholder="ค้นหาบันทึก, ผู้ใช้งาน, หรือเลขอ้างอิง..."
                                className="pl-10 h-10 bg-slate-100/50 border-slate-200 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/30 transition-all font-medium placeholder:text-slate-400"
                            />
                        </div>

                        <Link to="/">
                            <Button variant="ghost" size="sm" className="hidden xl:flex gap-2 font-bold text-slate-500 hover:text-emerald-600 hover:bg-emerald-50">
                                <ExternalLink size={14} /> ไปหน้าหลักของเว็บ
                            </Button>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:bg-slate-100/80 hover:text-slate-700 w-10 h-10 rounded-full">
                            <Bell size={20} />
                            <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-rose-500 rounded-full border-2 border-white ring-1 ring-rose-500/20"></span>
                        </Button>
                        <div className="h-6 w-px bg-slate-200 mx-2"></div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="gap-2 pl-2 pr-2 text-slate-700 hover:bg-slate-100/80 rounded-full h-10">
                                    <Avatar className="h-8 w-8 border border-slate-100">
                                        <AvatarImage src={user?.avatar} />
                                        <AvatarFallback className="bg-emerald-50 text-emerald-600 font-bold">{user?.firstname?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-right hidden sm:block mr-2">
                                        <div className="text-sm font-bold leading-none">{user?.firstname}</div>
                                        <div className="text-[10px] text-slate-500 font-medium capitalize mt-0.5">{user?.role}</div>
                                    </div>
                                    <ChevronDown size={16} className="text-slate-400" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 mt-2">
                                <DropdownMenuLabel>บัญชีของฉัน</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer">แก้ไขข้อมูลส่วนตัว</DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">ตั้งค่าบัญชี</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-rose-600 focus:text-rose-700 focus:bg-rose-50 cursor-pointer"
                                    onClick={() => {
                                        logout();
                                        navigate('/admin/login');
                                    }}
                                >
                                    ออกจากระบบ
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6 md:p-8 flex-1 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
