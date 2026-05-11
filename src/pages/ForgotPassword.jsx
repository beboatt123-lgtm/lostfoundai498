import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link } from 'react-router-dom';
import { KeyRound, Loader2, ArrowLeft, MailCheck } from 'lucide-react';
import api from '../lib/axios';
import { Alert, AlertDescription } from "@/components/ui/alert";

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            await api.post('/auth/forgot-password', { email });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งอีเมล');
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
                                <MailCheck size={32} />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold text-slate-800">ตรวจสอบอีเมลของคุณ</CardTitle>
                        <CardDescription className="pt-2">
                            เราได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยัง <span className="font-bold text-slate-900">{email}</span> แล้ว
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center text-slate-500 text-sm">
                        หากไม่พบอีเมล โปรดตรวจสอบในโฟลเดอร์จดหมายขยะ (Spam) หรือลองใหม่อีกครั้ง
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full" asChild>
                            <Link to="/login">กลับไปยังหน้าเข้าสู่ระบบ</Link>
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
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                            <KeyRound size={24} />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">ลืมรหัสผ่าน?</CardTitle>
                    <CardDescription>
                        ไม่ต้องกังวล! กรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน
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
                            <Label htmlFor="email">อีเมล</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter>
                    <Link to="/login" className="flex items-center text-sm text-slate-500 hover:text-emerald-600 transition-colors">
                        <ArrowLeft size={16} className="mr-1" /> กลับไปยังหน้าเข้าสู่ระบบ
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default ForgotPassword;
