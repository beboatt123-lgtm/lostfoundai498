import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../lib/axios';
import { Alert, AlertDescription } from "@/components/ui/alert";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            return setError('รหัสผ่านไม่ตรงกัน');
        }

        if (password.length < 6) {
            return setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
        }

        setLoading(true);
        setError('');
        
        try {
            await api.put(`/auth/reset-password/${token}`, { password });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'โทเคนหมดอายุหรือการรีเซ็ตล้มเหลว');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Card className="w-full max-w-md shadow-xl border-emerald-100">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                <CheckCircle2 size={32} />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold text-slate-800">เปลี่ยนรหัสผ่านสำเร็จ!</CardTitle>
                        <CardDescription className="pt-2">
                            ระบบกำลังนำคุณไปยังหน้าเข้าสู่ระบบใน 3 วินาที...
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button className="w-full bg-emerald-600" asChild>
                            <Link to="/login">เข้าสู่ระบบตอนนี้</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-emerald-50 p-4">
            <Card className="w-full max-w-md shadow-2xl border-white/50 backdrop-blur-sm bg-white/90">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                                <MapPin size={22} fill="currentColor" />
                            </div>
                            <span className="text-xl font-extrabold text-slate-800 tracking-tight leading-none">Lost&Found</span>
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-800">ตั้งรหัสผ่านใหม่</CardTitle>
                    <CardDescription>
                        กรุณากำหนดรหัสผ่านใหม่สำหรับบัญชีของคุณ
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">รหัสผ่านใหม่</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'บันทึกรหัสผ่านใหม่'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ResetPassword;
