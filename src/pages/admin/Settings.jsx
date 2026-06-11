import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Globe, Save, Database, Loader2, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "@/lib/axios";

const AdminSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [purging, setPurging] = useState(false);
    const [saved, setSaved] = useState(false);
    const [purgeResult, setPurgeResult] = useState(null);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        orgName: '',
        contactPhone: '',
        contactEmail: '',
        requireApproval: true,
        maintenanceMode: false,
    });

    useEffect(() => {
        api.get('/admin/settings')
            .then(res => setForm(res.data))
            .catch(() => setError('โหลดการตั้งค่าไม่สำเร็จ'))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const res = await api.put('/admin/settings', form);
            setForm(res.data);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch {
            setError('บันทึกไม่สำเร็จ กรุณาลองใหม่');
        } finally {
            setSaving(false);
        }
    };

    const handlePurge = async () => {
        if (!window.confirm('ยืนยันการลบข้อมูลรายการที่ส่งคืนแล้ว/ปิดแล้ว ที่เก่าเกิน 12 เดือน?')) return;
        setPurging(true);
        setPurgeResult(null);
        try {
            const res = await api.delete('/admin/settings/purge?months=12');
            setPurgeResult(res.data.deleted);
        } catch {
            setError('ลบข้อมูลไม่สำเร็จ');
        } finally {
            setPurging(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-400">
                <Loader2 className="animate-spin mr-2" /> กำลังโหลด...
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-3xl mx-auto font-sans pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                        <div className="p-2.5 bg-slate-100 rounded-2xl shadow-sm shrink-0">
                            <Settings className="text-slate-600 h-6 w-6" />
                        </div>
                        ตั้งค่าระบบ
                    </h2>
                    <p className="text-slate-500 mt-1 ml-1 text-sm">ปรับแต่งการทำงานของระบบ Lost &amp; Found</p>
                </div>
                {saved && (
                    <Alert className="bg-emerald-50 border-emerald-200 text-emerald-700 py-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
                        <CheckCircle2 size={16} />
                        <AlertDescription className="font-bold">บันทึกเรียบร้อยแล้ว</AlertDescription>
                    </Alert>
                )}
                {error && (
                    <Alert className="bg-rose-50 border-rose-200 text-rose-700 py-2">
                        <AlertDescription className="font-medium">{error}</AlertDescription>
                    </Alert>
                )}
            </div>

            {/* ── Card 1: ข้อมูลองค์กร ── */}
            <Card className="border-slate-200 shadow-lg shadow-slate-200/40">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Globe size={20} />
                        </div>
                        <div>
                            <CardTitle className="text-lg">ข้อมูลองค์กร</CardTitle>
                            <CardDescription>ชื่อและช่องทางติดต่อที่แสดงในระบบ</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-5 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="orgName">ชื่อองค์กร / หน่วยงาน</Label>
                        <Input
                            id="orgName"
                            value={form.orgName}
                            onChange={e => setForm(f => ({ ...f, orgName: e.target.value }))}
                            className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                        />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="contactPhone">เบอร์โทรติดต่อ</Label>
                            <Input
                                id="contactPhone"
                                value={form.contactPhone}
                                onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))}
                                placeholder="0XX-XXX-XXXX"
                                className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactEmail">อีเมลติดต่อ</Label>
                            <Input
                                id="contactEmail"
                                type="email"
                                value={form.contactEmail}
                                onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
                                placeholder="example@email.com"
                                className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── Card 2: นโยบายระบบ ── */}
            <Card className="border-slate-200 shadow-lg shadow-slate-200/40">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Settings size={20} />
                        </div>
                        <div>
                            <CardTitle className="text-lg">นโยบายระบบ</CardTitle>
                            <CardDescription>ควบคุมการทำงานหลักของระบบ</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-5 pt-2">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base font-semibold">อนุมัติรายการก่อนเผยแพร่</Label>
                            <p className="text-sm text-slate-500">รายการใหม่จะอยู่ในสถานะ "รอตรวจสอบ" จนกว่าเจ้าหน้าที่จะอนุมัติ</p>
                        </div>
                        <Switch
                            checked={form.requireApproval}
                            onCheckedChange={v => setForm(f => ({ ...f, requireApproval: v }))}
                        />
                    </div>
                    <Separator className="bg-slate-100" />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base font-semibold text-amber-700">ปิดปรับปรุงระบบ (Maintenance Mode)</Label>
                            <p className="text-sm text-slate-500">ผู้ใช้งานทั่วไปจะเห็นหน้าปิดปรับปรุง เฉพาะ Admin/Staff เข้าได้ปกติ</p>
                        </div>
                        <Switch
                            checked={form.maintenanceMode}
                            onCheckedChange={v => setForm(f => ({ ...f, maintenanceMode: v }))}
                        />
                    </div>
                    {form.maintenanceMode && (
                        <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
                            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                            <span>ขณะนี้ระบบอยู่ในโหมดปิดปรับปรุง — ผู้ใช้งานทั่วไปจะเข้าระบบไม่ได้</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── Card 3: จัดการข้อมูล ── */}
            <Card className="border-slate-200 shadow-lg shadow-slate-200/40">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-50 text-rose-500 rounded-lg">
                            <Database size={20} />
                        </div>
                        <div>
                            <CardTitle className="text-lg">จัดการข้อมูล</CardTitle>
                            <CardDescription>ล้างข้อมูลเก่าเพื่อประสิทธิภาพของระบบ</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base font-semibold text-rose-600">ล้างรายการเก่าเกิน 12 เดือน</Label>
                            <p className="text-sm text-slate-500">ลบรายการที่มีสถานะ "ส่งคืนแล้ว" หรือ "ปิดแล้ว" ที่เก่าเกิน 1 ปี</p>
                            {purgeResult !== null && (
                                <p className="text-sm font-medium text-emerald-600 mt-1">
                                    ลบแล้ว {purgeResult} รายการ
                                </p>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            onClick={handlePurge}
                            disabled={purging}
                            className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 shrink-0"
                        >
                            {purging ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 size={14} className="mr-2" />}
                            ล้างทันที
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Save button */}
            <div className="pt-2 flex justify-end gap-3">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-200/50 min-w-[200px]"
                >
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    บันทึกการตั้งค่า
                </Button>
            </div>
        </div>
    );
};

export default AdminSettings;
