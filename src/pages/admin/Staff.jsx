import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    MoreHorizontal,
    ShieldCheck,
    ShieldAlert,
    Shield,
    Search,
    UserPlus,
    KeyRound,
    Trash2,
    Loader2,
    RefreshCw,
    Calendar
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label as FormLabel } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import api from '../../lib/axios';

const AdminStaff = () => {
    const { user: currentUser } = useAuth();
    const [staffMembers, setStaffMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        role: 'staff'
    });

    const handleAddStaff = async (e) => {
        e.preventDefault();
        setAddLoading(true);
        try {
            await api.post('/admin/users', formData);
            setIsDialogOpen(false);
            setFormData({ firstname: '', lastname: '', email: '', password: '', role: 'staff' });
            fetchStaff();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add staff member");
        } finally {
            setAddLoading(false);
        }
    };

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/users');
            const filteredStaff = res.data.filter(u => u.role === 'admin' || u.role === 'staff');
            setStaffMembers(filteredStaff);
        } catch (err) {
            console.error("Failed to fetch staff members", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const filteredItems = staffMembers.filter(staff =>
        staff.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin': return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200 shadow-sm font-bold uppercase text-[10px]"><ShieldAlert size={12} className="mr-1.5" /> Admin</Badge>;
            case 'staff': return <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200 shadow-sm font-bold uppercase text-[10px]"><ShieldCheck size={12} className="mr-1.5" /> Staff</Badge>;
            default: return <Badge variant="outline" className="text-slate-500 font-bold uppercase text-[10px]">Staff</Badge>;
        }
    };

    const handleUpdateUserStatus = async (userId, isSuspended) => {
        if (window.confirm(`คุณต้องการ ${isSuspended ? 'ระงับสิทธิ์' : 'เปิดใช้งาน'} ผู้ดูแลท่านนี้ใช่หรือไม่?`)) {
            try {
                await api.put(`/admin/users/${userId}`, { isSuspended });
                fetchStaff();
            } catch (err) {
                console.error("Update failed", err);
            }
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        if (window.confirm(`ยืนยันการเปลี่ยนสิทธิ์ให้เป็น ${newRole} ใช่หรือไม่?`)) {
            try {
                await api.put(`/admin/users/${userId}`, { role: newRole });
                fetchStaff();
            } catch (err) {
                console.error("Role update failed", err);
                alert("ไม่สามารถเปลี่ยนสิทธิ์ได้");
            }
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('คำเตือน: คุณต้องการลบบัญชีผู้ดูแลนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
            try {
                await api.delete(`/admin/users/${userId}`);
                fetchStaff();
            } catch (err) {
                console.error("Delete failed", err);
                alert(err.response?.data?.message || "ไม่สามารถลบผู้ดูแลได้");
            }
        }
    };

    const StaffActionMenu = ({ staff }) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 w-9 p-0 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all">
                    <MoreHorizontal className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-slate-200 p-2">
                <DropdownMenuLabel className="px-2 py-1.5 text-xs text-slate-400 font-bold uppercase tracking-widest">ข้อมูลบัญชี</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem className="cursor-pointer py-2.5 rounded-lg">
                    <KeyRound className="mr-3 h-4 w-4 text-slate-400" /> รีเซ็ตรหัสผ่าน
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem
                    className={`cursor-pointer py-2.5 rounded-lg font-bold ${!staff.isSuspended ? 'text-amber-600 focus:text-amber-700 focus:bg-amber-50' : 'text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50'}`}
                    onClick={() => handleUpdateUserStatus(staff._id, !staff.isSuspended)}
                >
                    {!staff.isSuspended ? 'ระงับสิทธิ์การใช้งาน' : 'ยกเลิกการระงับสิทธิ์'}
                </DropdownMenuItem>
                {currentUser?.role === 'admin' && staff._id !== currentUser._id && (
                    <>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="cursor-pointer py-2.5 rounded-lg">
                                <Shield className="mr-3 h-4 w-4 text-slate-400" /> ปรับระดับสิทธิ์ (Role)
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent className="w-48 rounded-xl shadow-xl p-2 border-slate-200">
                                    <DropdownMenuItem onClick={() => handleUpdateRole(staff._id, 'admin')} className="cursor-pointer font-bold text-purple-600 focus:bg-purple-50">
                                        <ShieldAlert size={14} className="mr-2" /> ปรับเป็น Admin
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleUpdateRole(staff._id, 'staff')} className="cursor-pointer font-bold text-indigo-600 focus:bg-indigo-50">
                                        <ShieldCheck size={14} className="mr-2" /> ลดขั้นเป็น Staff
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator className="bg-slate-100" />
                        <DropdownMenuItem
                            className="cursor-pointer py-2.5 rounded-lg font-bold text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                            onClick={() => handleDeleteUser(staff._id)}
                        >
                            <Trash2 className="mr-3 h-4 w-4" /> ลบบัญชีถาวร
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto font-sans pb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                        <div className="p-2.5 bg-purple-100 rounded-2xl shadow-sm shrink-0">
                            <ShieldCheck className="text-purple-600 h-6 w-6 sm:h-7 sm:w-7" />
                        </div>
                        จัดการทีมผู้ดูแล
                    </h2>
                    <p className="text-slate-500 mt-2 ml-1 text-sm">จัดการบัญชีและกำหนดสิทธิ์การเข้าถึงระบบสำหรับเจ้าหน้าที่และแอดมิน</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-purple-600 hover:bg-purple-700 h-11 px-6 rounded-xl shadow-lg shadow-purple-200 font-bold transition-all active:scale-95 w-full sm:w-auto">
                            <UserPlus size={18} /> เพิ่มผู้ดูแลใหม่
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                <UserPlus className="text-purple-600" /> เพิ่มสมาชิกทีมใหม่
                            </DialogTitle>
                            <DialogDescription>
                                กรอกข้อมูลเพื่อสร้างบัญชีผู้ดูแลระบบคนใหม่
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddStaff} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <FormLabel htmlFor="firstname">ชื่อ</FormLabel>
                                    <Input
                                        id="firstname"
                                        placeholder="ชื่อจริง"
                                        value={formData.firstname}
                                        onChange={(e) => setFormData({...formData, firstname: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <FormLabel htmlFor="lastname">นามสกุล</FormLabel>
                                    <Input
                                        id="lastname"
                                        placeholder="นามสกุล"
                                        value={formData.lastname}
                                        onChange={(e) => setFormData({...formData, lastname: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <FormLabel htmlFor="email">อีเมล</FormLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="email@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <FormLabel htmlFor="password">รหัสผ่านชั่วคราว</FormLabel>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <FormLabel htmlFor="role">สิทธิ์การใช้งาน</FormLabel>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value) => setFormData({...formData, role: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="เลือกสิทธิ์" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="staff">Staff (เจ้าหน้าที่)</SelectItem>
                                        <SelectItem value="admin">Admin (ผู้ดูแลระบบ)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="submit" disabled={addLoading} className="w-full bg-purple-600 hover:bg-purple-700 font-bold">
                                    {addLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'สร้างบัญชีผู้ดูแล'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                        <Input
                            placeholder="ค้นหาชื่อ หรือ อีเมลผู้ดูแล..."
                            className="pl-10 h-11 bg-white border-slate-200 focus-visible:ring-purple-500/20 shadow-sm rounded-xl font-medium w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="ghost" onClick={fetchStaff} className="text-slate-400 hover:text-purple-600 gap-2 w-full sm:w-auto justify-center">
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        รีเฟรชข้อมูล
                    </Button>
                </div>

                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4 text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
                        <p className="text-slate-400 font-semibold italic">กำลังดึงรายชื่อเจ้าหน้าที่จากฐานข้อมูล...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="p-16 flex flex-col items-center gap-2 text-slate-400">
                        <Search size={40} className="text-slate-200" />
                        <p className="font-medium">ไม่พบข้อมูลผู้ดูแลที่คุณกำลังค้นหา</p>
                    </div>
                ) : (
                    <>
                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-slate-100 text-sm">
                            {filteredItems.map((staff) => (
                                <div key={staff._id} className="p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-11 w-11 border-2 border-slate-100 shadow-sm shrink-0">
                                            <AvatarImage src={staff.avatar} />
                                            <AvatarFallback className="bg-purple-100 text-purple-700 font-black text-xs">
                                                {staff.firstname?.charAt(0)}{staff.lastname?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-900 uppercase tracking-tight truncate">
                                                {staff.firstname} {staff.lastname}
                                            </p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                                                <Mail size={10} className="text-slate-300 shrink-0" /> {staff.email}
                                            </p>
                                        </div>
                                        <StaffActionMenu staff={staff} />
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap">
                                        {getRoleBadge(staff.role)}
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${!staff.isSuspended ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${!staff.isSuspended ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                            {!staff.isSuspended ? 'Active' : 'ระงับสิทธิ์'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <Calendar size={11} />
                                        <span>เข้าร่วมเมื่อ {new Date(staff.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block relative w-full overflow-auto text-sm">
                            <Table>
                                <TableHeader className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-md">
                                    <TableRow className="hover:bg-transparent border-slate-200 h-14">
                                        <TableHead className="font-bold text-slate-800 px-6">ผู้ดูแล</TableHead>
                                        <TableHead className="font-bold text-slate-800">สิทธิ์การใช้งาน (Role)</TableHead>
                                        <TableHead className="font-bold text-slate-800">สถานะ</TableHead>
                                        <TableHead className="font-bold text-slate-800">เข้าร่วมเมื่อ</TableHead>
                                        <TableHead className="text-right font-bold text-slate-800 pr-6">จัดการบัญชี</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredItems.map((staff) => (
                                        <TableRow key={staff._id} className="hover:bg-slate-50/50 transition-all border-b border-slate-100 last:border-0 h-20">
                                            <TableCell className="px-6">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-10 w-10 border-2 border-slate-100 shadow-sm">
                                                        <AvatarImage src={staff.avatar} />
                                                        <AvatarFallback className="bg-purple-100 text-purple-700 font-black text-xs">
                                                            {staff.firstname?.charAt(0)}{staff.lastname?.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900 uppercase tracking-tight">
                                                            {staff.firstname} {staff.lastname}
                                                        </span>
                                                        <span className="text-xs text-slate-500 font-medium inline-flex items-center gap-1">
                                                            <Mail size={10} className="text-slate-300" /> {staff.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getRoleBadge(staff.role)}</TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${!staff.isSuspended ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-2 ${!staff.isSuspended ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                                    {!staff.isSuspended ? 'พร้อมทำงาน (Active)' : 'ระงับสิทธิ์'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-slate-500 font-medium">
                                                {new Date(staff.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' })}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <StaffActionMenu staff={staff} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminStaff;
