import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, googleLogin, loading, error: authError } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const queryParams = new URLSearchParams(location.search);
    const isVerified = queryParams.get('verified') === 'true';

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            const res = await googleLogin(tokenResponse.access_token);
            if (res.success) {
                // Requirement 4: Admin Redirect
                if (res.user?.role === 'admin' || res.user?.role === 'staff' || res.user?.role === 'superadmin') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            }
        },
        onError: () => setError('Google Login Failed'),
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await login(email, password);
        if (res.success) {
            // Requirement 4: Admin Redirect
            if (res.user?.role === 'admin' || res.user?.role === 'staff' || res.user?.role === 'superadmin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-emerald-50 font-sans p-4 relative overflow-hidden">

            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-blue-200/20 rounded-full blur-3xl animate-bounce delay-700 duration-[5000ms]"></div>
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
                        เข้าสู่ระบบ
                    </CardTitle>
                    <CardDescription>
                        ยินดีต้อนรับกลับ! กรอกข้อมูลเพื่อใช้งานต่อ
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isVerified && (
                        <Alert className="bg-emerald-50 text-emerald-600 border-emerald-100 mb-4">
                            <AlertDescription>ยืนยันอีเมลสำเร็จแล้ว คุณสามารถเข้าสู่ระบบได้ทันที</AlertDescription>
                        </Alert>
                    )}
                    {authError && (
                        <Alert variant="destructive" className="bg-red-50 text-red-600 border-red-100 mb-4">
                            <AlertDescription>{authError}</AlertDescription>
                        </Alert>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">อีเมล</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                className="bg-slate-50/50 border-slate-200 focus-visible:ring-emerald-500/30"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">รหัสผ่าน</Label>
                                <Link to="/forgot-password" title="Forgot Password" id="forgot-password-link" className="text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                                    ลืมรหัสผ่าน?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                className="bg-slate-50/50 border-slate-200 focus-visible:ring-emerald-500/30"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'เข้าสู่ระบบ'}
                        </Button>
                    </form>

                    <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white/90 px-2 text-slate-500 font-medium">
                                หรือเข้าสู่ระบบด้วย
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button
                            variant="outline"
                            type="button"
                            className="w-full bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-medium transition-all hover:-translate-y-0.5 hover:shadow-sm h-11"
                            onClick={() => handleGoogleLogin()}
                            disabled={loading}
                        >
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
                            เข้าสู่ระบบด้วย Google
                        </Button>
                    </div>

                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <div className="text-center text-sm text-slate-500">
                        ยังไม่มีบัญชี?{" "}
                        <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-500 underline decoration-2 decoration-transparent hover:decoration-emerald-500 transition-all">
                            สมัครสมาชิก
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Login;
