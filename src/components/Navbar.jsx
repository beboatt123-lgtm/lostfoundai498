import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { MapPin, Menu, User, LogOut, Settings, PlusCircle, LayoutDashboard, LogIn, UserPlus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
    Sheet, 
    SheetContent, 
    SheetHeader, 
    SheetTitle, 
    SheetTrigger,
    SheetClose
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsOpen(false);
    };

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 flex items-center justify-between px-6 lg:px-12 selection:bg-blue-100">
            <div className="flex items-center gap-12">
                <Link to="/" className="flex items-center gap-2 group shrink-0">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-600 rounded-lg md:rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 group-hover:shadow-emerald-300 transition-all">
                        <MapPin size={20} className="md:w-6 md:h-6" fill="currentColor" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-base md:text-xl font-extrabold text-slate-800 tracking-tight leading-none">Lost&Found</span>
                        <span className="text-[8px] md:text-[10px] text-slate-500 font-bold tracking-widest uppercase">AI System</span>
                    </div>
                </Link>

                <div className="hidden md:flex gap-8">
                    <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">หน้าแรก</Link>
                    {(!user || (user.role !== 'admin' && user.role !== 'staff')) && (
                        <>
                            <Link to="/report/lost" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">แจ้งทำของหาย</Link>
                            <Link to="/report/found" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">แจ้งเจอของ</Link>
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">

                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-9 w-9 md:h-10 md:w-10 rounded-full p-0">
                                <Avatar className="h-9 w-9 md:h-10 md:w-10 border-2 border-emerald-100">
                                    <AvatarImage src={user.avatar} alt={user.firstname} />
                                    <AvatarFallback className="bg-emerald-50 text-emerald-600 font-bold">{user.firstname?.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 mt-2 rounded-xl shadow-2xl border-slate-100 p-2" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal px-2 py-3">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-bold leading-none text-slate-900">{user.firstname} {user.lastname}</p>
                                    <p className="text-xs leading-none text-slate-500 font-medium">{user.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-50" />
                            <div className="p-1 space-y-1">
                                <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-lg py-2 font-semibold">
                                    <User className="mr-3 h-4 w-4 text-slate-400" />
                                    <span>โปรไฟล์ของฉัน</span>
                                </DropdownMenuItem>
                                {(user.role === 'admin' || user.role === 'staff' ) && (
                                    <DropdownMenuItem onClick={() => navigate('/admin')} className="rounded-lg py-2 font-semibold">
                                        <Settings className="mr-3 h-4 w-4 text-slate-400" />
                                        <span>ระบบจัดการ (Admin)</span>
                                    </DropdownMenuItem>
                                )}
                            </div>
                            <DropdownMenuSeparator className="bg-slate-50" />
                            <DropdownMenuItem onClick={handleLogout} className="text-rose-600 focus:bg-rose-50 rounded-lg py-2 font-bold m-1">
                                <LogOut className="mr-3 h-4 w-4" />
                                <span>ออกจากระบบ</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <div className="hidden sm:flex items-center gap-3">
                        <Link to="/login">
                            <Button variant="ghost" className="font-bold text-slate-600 hover:text-slate-900 text-sm">เข้าสู่ระบบ</Button>
                        </Link>
                        <Link to="/register">
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 font-bold rounded-full px-5 text-sm h-10 transition-all hover:scale-105 active:scale-95">
                                สมัครสมาชิก
                            </Button>
                        </Link>
                    </div>
                )}

                {/* Professional Mobile Menu with Sheet */}
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden text-slate-600 hover:bg-slate-100 rounded-xl">
                            <Menu size={24} />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0 flex flex-col border-l border-slate-100">
                        <SheetHeader className="p-6 text-left border-b border-slate-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                                        <MapPin size={20} fill="currentColor" />
                                    </div>
                                    <div className="font-black text-slate-900 tracking-tighter">LOSTFOUND</div>
                                </div>
                                <SheetClose asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                                        <X size={20} className="text-slate-400" />
                                    </Button>
                                </SheetClose>
                            </div>
                        </SheetHeader>

                        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                            <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-50 transition-all font-bold text-slate-600 hover:text-slate-900">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                    <LayoutDashboard size={18} />
                                </div>
                                <span>หน้าแรก</span>
                            </Link>
                                {(!user || (user.role !== 'admin' && user.role !== 'staff')) && (
                                <>
                                    <Link to="/report/lost" onClick={() => setIsOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-50 transition-all font-bold text-slate-600 hover:text-slate-900 text-rose-600">
                                        <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500">
                                            <PlusCircle size={18} />
                                        </div>
                                        <span>แจ้งทำของหาย</span>
                                    </Link>
                                    <Link to="/report/found" onClick={() => setIsOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-50 transition-all font-bold text-slate-600 hover:text-slate-900 text-emerald-600">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                                            <PlusCircle size={18} />
                                        </div>
                                        <span>แจ้งเจอของ</span>
                                    </Link>
                                </>
                            )}
                            
                            {(user && (user.role === 'admin' || user.role === 'staff')) && (
                                <Link to="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-50 transition-all font-bold text-slate-600 hover:text-slate-900 text-indigo-600">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                                        <Settings size={18} />
                                    </div>
                                    <span>ระบบจัดการ (Admin Dashboard)</span>
                                </Link>
                            )}


                        </div>

                        {!user && (
                            <div className="p-6 border-t border-slate-50 grid grid-cols-2 gap-4">
                                <Link to="/login" onClick={() => setIsOpen(false)}>
                                    <Button variant="outline" className="w-full rounded-xl font-bold h-11 border-slate-200">
                                        <LogIn size={16} className="mr-2" /> เข้าสู่ระบบ
                                    </Button>
                                </Link>
                                <Link to="/register" onClick={() => setIsOpen(false)}>
                                    <Button className="w-full rounded-xl font-bold h-11 bg-emerald-600 hover:bg-emerald-700">
                                        <UserPlus size={16} className="mr-2" /> สมัครสมาชิก
                                    </Button>
                                </Link>
                            </div>
                        )}
                        
                        {user && (
                            <div className="p-6 border-t border-slate-50">
                                <Button 
                                    onClick={handleLogout} 
                                    variant="ghost" 
                                    className="w-full justify-start rounded-xl font-bold h-11 text-rose-600 hover:bg-rose-50 hover:text-rose-700 p-4"
                                >
                                    <LogOut size={18} className="mr-3" /> ออกจากระบบ
                                </Button>
                            </div>
                        )}
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    );
};

export default Navbar;
