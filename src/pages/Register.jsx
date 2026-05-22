import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Alert, AlertDescription } from "@/components/ui/alert";

const Register = () => {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const { register, loading, error: authError } = useAuth();
    const navigate = useNavigate();
    const [localError, setLocalError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        setSuccessMsg('');

        if (formData.password !== formData.confirmPassword) {
            setLocalError('รหัสผ่านไม่ตรงกัน');
            return;
        }

        const res = await register({
            firstname: formData.firstname,
            lastname: formData.lastname,
            email: formData.email,
            password: formData.password
        });

        if (res.success) {
            setSuccessMsg(res.message || 'สมัครสมาชิกสำเร็จ กรุณายืนยันอีเมลของคุณ');
            setFormData({ firstname: '', lastname: '', email: '', password: '', confirmPassword: '' });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-emerald-50 font-sans p-4 relative overflow-hidden">

            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute bottom-[10%] left-[5%] w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-pulse delay-500"></div>
                <div className="absolute top-[5%] right-[5%] w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-[40%] left-[40%] w-64 h-64 bg-teal-200/20 rounded-full blur-3xl animate-bounce delay-1000 duration-[6000ms]"></div>
            </div>

            <Card className="w-full max-w-md shadow-2xl border-white/50 backdrop-blur-sm bg-white/90 relative z-10">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                                <MapPin size={22} fill="currentColor" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-xl font-extrabold text-slate-800 tracking-tight leading-none">Lost&Found</span>
                                <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase mt-0.5">AI System</span>
                            </div>
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-800">
                        สมัครสมาชิกใหม่
                    </CardTitle>
                    <CardDescription>
                        สร้างบัญชีเพื่อเริ่มใช้งานระบบติดตามของหาย
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {(authError || localError) && (
                        <Alert variant="destructive" className="bg-red-50 text-red-600 border-red-100 mb-4">
                            <AlertDescription>{localError || authError}</AlertDescription>
                        </Alert>
                    )}
                    {successMsg && (
                        <Alert className="bg-emerald-50 text-emerald-600 border-emerald-100 mb-4">
                            <AlertDescription>{successMsg}</AlertDescription>
                        </Alert>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstname">ชื่อจริง</Label>
                                <Input
                                    id="firstname"
                                    placeholder=""
                                    className="bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500/30"
                                    value={formData.firstname}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastname">นามสกุล</Label>
                                <Input
                                    id="lastname"
                                    placeholder=""
                                    className="bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500/30"
                                    value={formData.lastname}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2 mt-4">
                            <Label htmlFor="email">อีเมล</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                className="bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500/30"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2 mt-4">
                            <Label htmlFor="password">กำหนดรหัสผ่าน</Label>
                            <Input
                                id="password"
                                type="password"
                                className="bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500/30"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2 mt-4">
                            <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                className="bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500/30"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 font-bold shadow-lg shadow-indigo-500/20 mt-6 transition-all hover:scale-[1.02]">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'ลงทะเบียน'}
                        </Button>
                    </form>

                    <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white/90 px-2 text-slate-500 font-medium">
                                หรือสมัครด้วย
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" type="button" className="w-full bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-medium transition-all hover:-translate-y-0.5 hover:shadow-sm">
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Google
                        </Button>
                        <Button variant="outline" type="button" className="w-full bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-medium transition-all hover:-translate-y-0.5 hover:shadow-sm">
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 23 23">
                                <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                                <path fill="#f35325" d="M1 1h10v10H1z" />
                                <path fill="#81bc06" d="M12 1h10v10H12z" />
                                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                                <path fill="#ffba08" d="M12 12h10v10H12z" />
                            </svg>
                            Microsoft
                        </Button>
                    </div>

                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <div className="text-center text-sm text-slate-500">
                        มีบัญชีอยู่แล้ว?{" "}
                        <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-500 underline decoration-2 decoration-transparent hover:decoration-emerald-500 transition-all">
                            เข้าสู่ระบบ
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Register;
