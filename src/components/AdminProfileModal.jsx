import { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';

const roleLabel = { admin: 'ผู้ดูแลระบบ', staff: 'เจ้าหน้าที่', user: 'ผู้ใช้งาน' };
const roleColor = { admin: 'bg-rose-100 text-rose-700 border-rose-200', staff: 'bg-indigo-100 text-indigo-700 border-indigo-200', user: 'bg-slate-100 text-slate-700 border-slate-200' };

const AdminProfileModal = ({ open, onClose }) => {
    const { user, refreshUser } = useAuth();

    const [form, setForm] = useState({ firstname: '', lastname: '', email: '' });
    const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
    const [showPassSection, setShowPassSection] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (open && user) {
            setForm({ firstname: user.firstname || '', lastname: user.lastname || '', email: user.email || '' });
            setPasswords({ current: '', newPass: '', confirm: '' });
            setShowPassSection(false);
            setSuccess('');
            setError('');
        }
    }, [open, user]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const payload = {
                firstname: form.firstname,
                lastname: form.lastname,
                email: form.email,
            };

            if (showPassSection) {
                if (!passwords.current) { setError('กรุณากรอกรหัสผ่านปัจจุบัน'); setLoading(false); return; }
                if (passwords.newPass.length < 6) { setError('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร'); setLoading(false); return; }
                if (passwords.newPass !== passwords.confirm) { setError('รหัสผ่านใหม่ไม่ตรงกัน'); setLoading(false); return; }
                payload.currentPassword = passwords.current;
                payload.password = passwords.newPass;
            }

            await api.put('/auth/profile', payload);
            await refreshUser();
            setSuccess('บันทึกข้อมูลเรียบร้อยแล้ว');
            setPasswords({ current: '', newPass: '', confirm: '' });
            setShowPassSection(false);
        } catch (err) {
            setError(err.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
                <DialogTitle className="sr-only">แก้ไขข้อมูลส่วนตัว</DialogTitle>
                <DialogDescription className="sr-only">แก้ไขชื่อ อีเมล และรหัสผ่านของบัญชีผู้ดูแลระบบ</DialogDescription>

                {/* Header */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_#818cf8,_transparent_60%)]" />
                    <div className="relative">
                        <Avatar className="h-20 w-20 mx-auto border-4 border-white/20 shadow-xl mb-3">
                            <AvatarImage src={user?.avatar} />
                            <AvatarFallback className="bg-indigo-600 text-white text-2xl font-black">
                                {user?.firstname?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <p className="font-black text-lg">{user?.firstname} {user?.lastname}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{user?.email}</p>
                        <Badge className={`mt-2 border font-bold text-xs ${roleColor[user?.role] || roleColor.user}`}>
                            <Shield size={10} className="mr-1" />
                            {roleLabel[user?.role] || user?.role}
                        </Badge>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSaveProfile} className="p-5 space-y-4 bg-white">

                    {/* Name */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">ชื่อ</Label>
                            <div className="relative">
                                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <Input
                                    placeholder="ชื่อ"
                                    className="pl-9 h-10 bg-slate-50 border-slate-200 rounded-xl text-sm"
                                    value={form.firstname}
                                    onChange={(e) => setForm({ ...form, firstname: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">นามสกุล</Label>
                            <Input
                                placeholder="นามสกุล"
                                className="h-10 bg-slate-50 border-slate-200 rounded-xl text-sm"
                                value={form.lastname}
                                onChange={(e) => setForm({ ...form, lastname: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">อีเมล</Label>
                        <div className="relative">
                            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <Input
                                type="email"
                                placeholder="email@example.com"
                                className="pl-9 h-10 bg-slate-50 border-slate-200 rounded-xl text-sm"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Change Password Toggle */}
                    <div>
                        <button
                            type="button"
                            onClick={() => setShowPassSection(!showPassSection)}
                            className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                            <Lock size={13} />
                            {showPassSection ? 'ยกเลิกการเปลี่ยนรหัสผ่าน' : 'เปลี่ยนรหัสผ่าน'}
                        </button>
                    </div>

                    {/* Password Fields */}
                    {showPassSection && (
                        <div className="space-y-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-indigo-500">รหัสผ่านปัจจุบัน</Label>
                                <div className="relative">
                                    <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        type={showCurrent ? 'text' : 'password'}
                                        placeholder="รหัสผ่านปัจจุบัน"
                                        className="pl-9 pr-10 h-10 bg-white border-indigo-100 rounded-xl text-sm"
                                        value={passwords.current}
                                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                    />
                                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-indigo-500">รหัสผ่านใหม่</Label>
                                    <div className="relative">
                                        <Input
                                            type={showNew ? 'text' : 'password'}
                                            placeholder="อย่างน้อย 6 ตัว"
                                            className="pr-9 h-10 bg-white border-indigo-100 rounded-xl text-sm"
                                            value={passwords.newPass}
                                            onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                                        />
                                        <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-indigo-500">ยืนยันรหัสใหม่</Label>
                                    <Input
                                        type="password"
                                        placeholder="ยืนยันรหัสผ่าน"
                                        className="h-10 bg-white border-indigo-100 rounded-xl text-sm"
                                        value={passwords.confirm}
                                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Feedback */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm">
                            <AlertCircle size={15} className="shrink-0" />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm">
                            <CheckCircle2 size={15} className="shrink-0" />
                            <span className="font-bold">{success}</span>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-1">
                        <Button type="button" variant="outline" className="flex-1 font-bold rounded-xl h-11" onClick={onClose}>
                            ปิด
                        </Button>
                        <Button type="submit" disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-11 shadow-lg shadow-indigo-200 gap-2">
                            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                            บันทึกข้อมูล
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AdminProfileModal;
