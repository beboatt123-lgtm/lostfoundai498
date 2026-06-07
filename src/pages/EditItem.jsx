import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    Loader2, MapPin, Calendar, Smartphone, Shirt, Wallet, Briefcase, Gem, Glasses, FileBadge, 
    BookText, HeartPulse, PawPrint, Trophy, Music, Wrench, ToyBrick, Boxes, AlertCircle, Edit, Clock
} from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";

const EditItem = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [mainLocations, setMainLocations] = useState([]);
    const [locationsLoading, setLocationsLoading] = useState(false);
    const [itemData, setItemData] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        locationMain: '',
        locationDetail: '',
        date: '',
        notes: ''
    });

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                setLocationsLoading(true);
                const res = await api.get('locations');
                setMainLocations(res.data.map(loc => loc.name));
            } catch (err) {
                setMainLocations([
                    "ตึก A (สำนักงาน)",
                    "ตึก B (ห้องปฏิบัติการ)",
                    "โรงอาหาร (Canteen)",
                    "หอสมุดกลาง",
                    "ลานจอดรถ P1",
                    "ลานจอดรถ P2",
                    "สนามกีฬากลาง",
                    "อื่นๆ"
                ]);
            } finally {
                setLocationsLoading(false);
            }
        };
        fetchLocations();
    }, []);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const res = await api.get(`/items/${id}`);
                const data = res.data;
                setItemData(data);
                
                if (data.user._id !== user.id && user.role !== 'admin' && user.role !== 'staff') {
                    setError("คุณไม่มีสิทธิ์แก้ไขรายการนี้");
                }

                setFormData({
                    title: data.title || '',
                    category: data.category || '',
                    description: data.description || '',
                    locationMain: data.locationMain || '',
                    locationDetail: data.locationDetail || '',
                    date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
                    notes: data.notes || ''
                });
            } catch (err) {
                setError("ไม่สามารถโหลดข้อมูลรายการได้");
            } finally {
                setLoading(false);
            }
        };
        if (user) {
            fetchItem();
        }
    }, [id, user]);

    const categoryOptions = [
        { value: "electronics", label: "อุปกรณ์อิเล็กทรอนิกส์", icon: Smartphone },
        { value: "wallet", label: "กระเป๋าสตางค์/บัตร/กุญแจ", icon: Wallet },
        { value: "clothing", label: "เสื้อผ้า/เครื่องแต่งกาย", icon: Shirt },
        { value: "bag", label: "กระเป๋า/เป้", icon: Briefcase },
        { value: "jewelry", label: "เครื่องประดับ/นาฬิกา", icon: Gem },
        { value: "glasses", label: "แว่นตา", icon: Glasses },
        { value: "documents", label: "เอกสารสำคัญ/พาสปอร์ต", icon: FileBadge },
        { value: "stationery", label: "เครื่องเขียน/หนังสือ", icon: BookText },
        { value: "health", label: "อุปกรณ์สุขภาพ/ยา", icon: HeartPulse },
        { value: "pets", label: "สัตว์เลี้ยง/สิ่งมีชีวิต", icon: PawPrint },
        { value: "sports", label: "อุปกรณ์กีฬา/สันทการ", icon: Trophy },
        { value: "music", label: "เครื่องดนตรี/ลำโพง/หูฟัง", icon: Music },
        { value: "tools", label: "เครื่องมือ/อุปกรณ์ช่าง", icon: Wrench },
        { value: "toy", label: "ของเล่น/ของสะสม", icon: ToyBrick },
        { value: "others", label: "อื่นๆ", icon: Boxes },
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleCategoryChange = (value) => {
        setFormData({ ...formData, category: value });
    };

    const handleLocationMainChange = (value) => {
        setFormData({ ...formData, locationMain: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            await api.put(`/items/${id}`, formData);
            setShowSuccessModal(true);
        } catch (err) {
            setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error && !itemData) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-md border-rose-100 bg-rose-50 text-rose-700">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 font-sans">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                            <Edit size={20} />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-wider text-blue-600">
                            Edit Item
                        </span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">แก้ไขข้อมูลรายการ</h1>
                    <p className="text-slate-500 font-medium">แก้ไขรายละเอียดสิ่งของที่คุณแจ้งไว้ (การแก้ไขรูปภาพยังไม่รองรับในขณะนี้)</p>
                </div>

                <Card className="border shadow-md border-slate-200 overflow-hidden rounded-2xl bg-white">
                    <CardContent className="p-0">
                        {error && (
                            <div className="p-6 pb-0">
                                <Alert variant="destructive" className="border-rose-100 bg-rose-50 text-rose-700 rounded-xl">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="font-semibold">{error}</AlertDescription>
                                </Alert>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="divide-y divide-slate-100">
                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-sm font-bold text-slate-700">ชื่อสิ่งของ <span className="text-rose-500">*</span></Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                        className="h-11 border-slate-200 rounded-lg font-medium"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-sm font-bold text-slate-700">หมวดหมู่ <span className="text-rose-500">*</span></Label>
                                    <Select onValueChange={handleCategoryChange} value={formData.category} required>
                                        <SelectTrigger className="h-11 border-slate-200 rounded-lg font-medium">
                                            <SelectValue placeholder="เลือกหมวดหมู่สิ่งของ" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px]">
                                            {categoryOptions.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value} className="py-2.5">
                                                    <div className="flex items-center gap-3">
                                                        <opt.icon size={16} className="text-slate-400" />
                                                        <span className="font-medium text-slate-700">{opt.label}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="locationMain" className="text-sm font-bold text-slate-700">สถานที่หลัก <span className="text-rose-500">*</span></Label>
                                    <Select onValueChange={handleLocationMainChange} value={formData.locationMain} required>
                                        <SelectTrigger className="h-11 border-slate-200 rounded-lg font-medium">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={16} className="text-slate-400" />
                                                <SelectValue placeholder={locationsLoading ? "กำลังโหลดสถานที่..." : "เลือกสถานที่หลัก"} />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {mainLocations.map((loc) => (
                                                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="locationDetail" className="text-sm font-bold text-slate-700">รายละเอียดจุดที่พบ/หาย</Label>
                                    <Input
                                        id="locationDetail"
                                        value={formData.locationDetail}
                                        onChange={handleChange}
                                        className="h-11 border-slate-200 rounded-lg font-medium"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="date" className="text-sm font-bold text-slate-700">วันที่ <span className="text-rose-500">*</span></Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <Input
                                            id="date"
                                            type="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                            required
                                            className="pl-10 h-11 border-slate-200 rounded-lg font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-sm font-bold text-slate-700">รายละเอียดลักษณะของสิ่งของ <span className="text-rose-500">*</span></Label>
                                    <Textarea
                                        id="description"
                                        className="h-32 border-slate-200 rounded-lg p-4 font-medium"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes" className="text-sm font-bold text-slate-700">หมายเหตุเพิ่มเติม</Label>
                                    <Textarea
                                        id="notes"
                                        className="h-24 border-slate-200 rounded-lg p-4 font-medium"
                                        value={formData.notes}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="p-8 bg-slate-50/50 flex items-center justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-11 rounded-lg font-bold border-slate-200"
                                    onClick={() => navigate(-1)}
                                >
                                    ยกเลิก
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="h-11 px-8 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            กำลังบันทึก...
                                        </>
                                    ) : (
                                        'บันทึกการแก้ไข'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showSuccessModal} onOpenChange={(open) => {
                if (!open) {
                    setShowSuccessModal(false);
                    navigate('/profile');
                }
            }}>
                <DialogContent className="max-w-md p-0 border-none rounded-2xl shadow-2xl overflow-hidden font-sans">
                    <div className="p-8 text-center space-y-6">
                        <div className="mx-auto h-20 w-20 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100 shadow-sm animate-pulse">
                            <Clock className="h-10 w-10 text-amber-600" />
                        </div>
                        <div className="space-y-2">
                            <DialogTitle className="text-2xl font-black text-slate-800">
                                บันทึกการแก้ไขสำเร็จ!
                            </DialogTitle>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                                อยู่ระหว่างรอผู้ดูแลระบบตรวจสอบ
                            </p>
                        </div>
                        <DialogDescription className="text-sm text-slate-600 leading-relaxed font-medium">
                            การแก้ไขข้อมูลของคุณเรียบร้อยแล้ว สถานะของรายการจะถูกเปลี่ยนเป็น "รอแอดมินอนุมัติ" เพื่อตรวจสอบความถูกต้องอีกครั้งก่อนนำไปเผยแพร่
                        </DialogDescription>
                    </div>
                    <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-center">
                        <Button 
                            className="w-full text-white font-bold py-2.5 rounded-xl shadow-md transition-all active:scale-95 bg-blue-600 hover:bg-blue-700"
                            onClick={() => {
                                setShowSuccessModal(false);
                                navigate('/profile');
                            }}
                        >
                            ตกลง
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EditItem;
