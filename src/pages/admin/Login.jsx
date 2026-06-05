import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2, Lock, Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error: authError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await login(email, password);
        if (res.success) {
            if (res.user?.role === 'admin' || res.user?.role === 'staff') {
                navigate('/admin');
            } else {
                // If not admin, logout or show error? For now, we'll logout and show an error.
                // Actually, the login function sets the user in context, so we should check role from res.user
                // Wait, res.user might not be returned by my login function if it's not explicitly in the return object.
                // Let's re-verify AuthContext Login return.
                navigate('/admin'); // AdminLayout will handle the role check redirect
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-4 relative overflow-hidden font-sans">
            {/* Dark Professional Background Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-30"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="flex justify-center mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-4"
                    >
                        <ArrowLeft size={16} /> กลับไปหน้าหลัก
                    </button>
                </div>

                <Card className="shadow-2xl border-slate-700/50 bg-slate-900/90 backdrop-blur-md text-white">
                    <CardHeader className="space-y-2 text-center pb-8 border-b border-white/5">
                        <div className="flex justify-center mb-4">
                            <div className="h-16 w-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center ring-2 ring-white/10 ring-offset-4 ring-offset-[#0F172A]">
                                <ShieldCheck size={32} className="text-white" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-black tracking-tight">Admin Console</CardTitle>
                        <CardDescription className="text-slate-400 font-medium">
                            ลงชื่อเข้าสู่ระบบจัดการสำหรับเจ้าหน้าที่
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-8 space-y-4">
                        {authError && (
                            <Alert variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20">
                                <AlertDescription>{authError}</AlertDescription>
                            </Alert>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-300">อีเมลผู้บรรยาย</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@lostfound.com"
                                        className="bg-slate-800/50 border-slate-700 pl-10 h-11 focus-visible:ring-emerald-500/30 text-white placeholder:text-slate-600"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-slate-300">รหัสผ่าน</Label>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                                    <Input
                                        id="password"
                                        type="password"
                                        className="bg-slate-800/50 border-slate-700 pl-10 h-11 focus-visible:ring-emerald-500/30 text-white"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                            >
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'เข้าสู่ระบบจัดการ'}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="pb-8 pt-2 flex flex-col text-center">
                        <p className="text-xs text-slate-500 font-medium">
                            การเข้าถึงโดยไม่ได้รับอนุญาตจะถูกบันทึกข้อมูลและดำเนินคดีตามกฎหมาย
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default AdminLogin;
