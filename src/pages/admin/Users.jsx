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
    Shield,
    Search,
    Filter,
    Download,
    UserCog,
    Ban,
    Trash2,
    Calendar,
    Users
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import api from "@/lib/axios";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/admin/users', {
                    params: { search }
                });
                setUsers(res.data.filter(u => u.role !== 'admin' && u.role !== 'staff'));
            } catch (err) {
                console.error('Failed to fetch users:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [search]);

    const getStatusBadge = (isSuspended) => {
        if (isSuspended) {
            return <Badge variant="destructive" className="bg-rose-100 text-rose-700 border-rose-200">ระงับการใช้งาน</Badge>;
        }
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">ใช้งานปกติ</Badge>;
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin': return <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 border-indigo-200"><Shield size={12} className="mr-1" /> ผู้ดูแลระบบ</Badge>;
            case 'staff': return <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">เจ้าหน้าที่</Badge>;
            default: return <Badge variant="outline" className="text-slate-600">ผู้ใช้งานทั่วไป</Badge>;
        }
    };

    const handleExport = () => {
        const headers = ['ID', 'ชื่อ', 'นามสกุล', 'อีเมล', 'สถานะ', 'วันที่และเวลาสมัคร'];
        const rows = users.map(u => [
            u._id,
            u.firstname,
            u.lastname,
            u.email,
            u.isSuspended ? 'ระงับการใช้งาน' : 'ใช้งานปกติ',
            new Date(u.createdAt).toLocaleString('th-TH', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
            }),
        ]);
        const csv = [headers, ...rows]
            .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleSuspend = async (userId, isSuspended) => {
        try {
            await api.put(`/admin/users/${userId}`, { isSuspended: !isSuspended });
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, isSuspended: !isSuspended } : u));
        } catch (err) {
            console.error('Failed to update user status:', err);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('ยืนยันการลบผู้ใช้งานนี้ถาวร? การกระทำนี้ไม่สามารถย้อนกลับได้')) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            setUsers(prev => prev.filter(u => u._id !== userId));
        } catch (err) {
            alert(err.response?.data?.message || 'ลบผู้ใช้งานไม่สำเร็จ');
        }
    };

    const UserActionMenu = ({ user }) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 shadow-xl border-slate-200">
                <DropdownMenuItem
                    className="cursor-pointer font-medium py-2"
                    onClick={() => handleSuspend(user._id, user.isSuspended)}
                >
                    <Ban className="mr-2 h-4 w-4 text-slate-500" />
                    {user.isSuspended ? 'ยกเลิกการระงับ' : 'ระงับการใช้งาน'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="cursor-pointer font-medium py-2 text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                    onClick={() => handleDelete(user._id)}
                >
                    <Trash2 className="mr-2 h-4 w-4" /> ลบผู้ใช้งาน
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto font-sans">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-100 rounded-2xl shadow-sm shrink-0">
                            <Users className="text-indigo-600 h-6 w-6 sm:h-7 sm:w-7" />
                        </div>
                        จัดการผู้ใช้งาน
                    </h2>
                    <p className="text-slate-500 mt-1 ml-1 text-sm">รายชื่อผู้ใช้งานทั้งหมดและสิทธิ์การเข้าถึง</p>
                </div>
                <Button onClick={handleExport} variant="outline" className="gap-2 bg-white hover:bg-slate-50 border-slate-300 shadow-sm text-slate-700 font-medium w-full sm:w-auto">
                    <Download size={16} /> Export Users
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-200/40 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <Input
                            placeholder="ค้นหาชื่อ, อีเมล, หรือ ID..."
                            className="pl-10 bg-white border-slate-200 focus-visible:ring-indigo-500/20 shadow-sm w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="flex-1 sm:flex-none gap-2 bg-white border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 font-medium">
                            <Filter size={14} /> สถานะ
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 sm:flex-none gap-2 bg-white border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 font-medium">
                            <UserCog size={14} /> บทบาท
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="p-16 flex items-center justify-center text-slate-400 font-medium">
                        กำลังโหลด...
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-16 flex items-center justify-center text-slate-400 font-medium">
                        ไม่พบผู้ใช้งาน
                    </div>
                ) : (
                    <>
                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {users.map((user) => (
                                <div key={user._id} className="p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-11 w-11 border border-slate-200 shrink-0">
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">{user.firstname.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-800 text-sm truncate">{user.firstname} {user.lastname}</p>
                                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                        </div>
                                        <UserActionMenu user={user} />
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap">
                                        {getRoleBadge(user.role)}
                                        {getStatusBadge(user.isSuspended)}
                                    </div>

                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <Calendar size={11} />
                                        <span>สมัครเมื่อ {new Date(user.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                                        <span className="ml-2 font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400">
                                            {user._id.substring(0, 8)}...
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block relative w-full overflow-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
                                    <TableRow className="hover:bg-transparent border-slate-200">
                                        <TableHead className="font-bold text-slate-700 w-[80px]">ID</TableHead>
                                        <TableHead className="font-bold text-slate-700">ผู้ใช้งาน</TableHead>
                                        <TableHead className="font-bold text-slate-700">บทบาท</TableHead>
                                        <TableHead className="font-bold text-slate-700">วันที่สมัคร</TableHead>
                                        <TableHead className="font-bold text-slate-700">สถานะ</TableHead>
                                        <TableHead className="text-right font-bold text-slate-700">จัดการ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user._id} className="hover:bg-slate-50 transition-all border-b border-slate-100 last:border-0">
                                            <TableCell className="font-mono text-[10px] font-semibold text-slate-500">{user._id.substring(0, 8)}...</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border border-slate-200">
                                                        <AvatarImage src={user.avatar} />
                                                        <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">{user.firstname.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-800 text-sm">{user.firstname} {user.lastname}</span>
                                                        <span className="text-xs text-slate-500">{user.email}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                                            <TableCell className="text-sm text-slate-600">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell>{getStatusBadge(user.isSuspended)}</TableCell>
                                            <TableCell className="text-right">
                                                <UserActionMenu user={user} />
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

export default AdminUsers;
