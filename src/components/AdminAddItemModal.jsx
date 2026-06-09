import { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Camera, X, MapPin, Calendar, Clock, Loader2, AlertCircle, CheckCircle2,
    Smartphone, Wallet, Shirt, Briefcase, Gem, Glasses, FileBadge,
    BookText, HeartPulse, PawPrint, Trophy, Music, Wrench, ToyBrick, Boxes
} from 'lucide-react';
import api from '../lib/axios';

const categoryOptions = [
    { value: 'electronics', label: 'อุปกรณ์อิเล็กทรอนิกส์', icon: Smartphone },
    { value: 'wallet', label: 'กระเป๋าสตางค์/บัตร/กุญแจ', icon: Wallet },
    { value: 'clothing', label: 'เสื้อผ้า/เครื่องแต่งกาย', icon: Shirt },
    { value: 'bag', label: 'กระเป๋า/เป้', icon: Briefcase },
    { value: 'jewelry', label: 'เครื่องประดับ/นาฬิกา', icon: Gem },
    { value: 'glasses', label: 'แว่นตา', icon: Glasses },
    { value: 'documents', label: 'เอกสารสำคัญ/พาสปอร์ต', icon: FileBadge },
    { value: 'stationery', label: 'เครื่องเขียน/หนังสือ', icon: BookText },
    { value: 'health', label: 'อุปกรณ์สุขภาพ/ยา', icon: HeartPulse },
    { value: 'pets', label: 'สัตว์เลี้ยง/สิ่งมีชีวิต', icon: PawPrint },
    { value: 'sports', label: 'อุปกรณ์กีฬา/สันทการ', icon: Trophy },
    { value: 'music', label: 'เครื่องดนตรี/ลำโพง/หูฟัง', icon: Music },
    { value: 'tools', label: 'เครื่องมือ/อุปกรณ์ช่าง', icon: Wrench },
    { value: 'toy', label: 'ของเล่น/ของสะสม', icon: ToyBrick },
    { value: 'others', label: 'อื่นๆ', icon: Boxes },
];

const emptyForm = {
    title: '',
    category: '',
    description: '',
    locationMain: '',
    locationDetail: '',
    date: '',
    timePeriod: '',
    reporterIdCard: '',
    reporterPhone: '',
    storagePosition: '',
    notes: '',
};

const AdminAddItemModal = ({ open, onClose, type, onSuccess }) => {
    const isLost = type === 'lost';
    const [formData, setFormData] = useState(emptyForm);
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [mainLocations, setMainLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!open) return;
        api.get('locations').then(res => {
            setMainLocations(res.data.map(l => l.name));
        }).catch(() => {
            setMainLocations(['ตึก A (สำนักงาน)', 'ตึก B (ห้องปฏิบัติการ)', 'โรงอาหาร (Canteen)', 'หอสมุดกลาง', 'ลานจอดรถ P1', 'ลานจอดรถ P2', 'สนามกีฬากลาง', 'อื่นๆ']);
        });
    }, [open]);

    const handleChange = (e) => setFormData(p => ({ ...p, [e.target.id]: e.target.value }));

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 5) { setError('สูงสุด 5 รูป'); return; }
        setImages(p => [...p, ...files]);
        setImagePreviews(p => [...p, ...files.map(f => URL.createObjectURL(f))]);
        setError(null);
    };

    const removeImage = (i) => {
        setImages(p => p.filter((_, idx) => idx !== i));
        setImagePreviews(p => p.filter((_, idx) => idx !== i));
    };

    const handleClose = () => {
        setFormData(emptyForm);
        setImages([]);
        setImagePreviews([]);
        setError(null);
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (images.length === 0) { setError('กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป'); return; }
        if (!formData.title || !formData.category || !formData.locationMain || !formData.date || !formData.description) {
            setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบ'); return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('category', formData.category);
            data.append('description', formData.description);
            data.append('locationMain', formData.locationMain);
            data.append('locationDetail', formData.locationDetail);
            data.append('date', formData.date);
            data.append('timePeriod', formData.timePeriod);
            data.append('reporterIdCard', formData.reporterIdCard || '0000000000000');
            data.append('reporterPhone', formData.reporterPhone || '0000000000');
            data.append('storagePosition', formData.storagePosition);
            data.append('notes', formData.notes);
            data.append('type', type);
            images.forEach(img => data.append('images', img));

            await api.post('items', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            onSuccess?.();
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
        } finally {
            setLoading(false);
        }
    };

    const accent = isLost ? 'rose' : 'emerald';
    const btnClass = isLost
        ? 'bg-rose-600 hover:bg-rose-700 text-white'
        : 'bg-emerald-600 hover:bg-emerald-700 text-white';

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none rounded-2xl shadow-2xl">
                <DialogHeader className={`p-6 ${isLost ? 'bg-rose-600' : 'bg-emerald-600'} text-white shrink-0`}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            {isLost ? <AlertCircle size={22} /> : <CheckCircle2 size={22} />}
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black">
                                เพิ่มรายการ{isLost ? 'ของหาย' : 'พบสิ่งของ'}
                            </DialogTitle>
                            <DialogDescription className={`${isLost ? 'text-rose-100' : 'text-emerald-100'} text-sm font-medium mt-0.5`}>
                                กรอกข้อมูลสิ่งของเพื่อเพิ่มเข้าระบบ (เผยแพร่ทันที)
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-5">
                        {error && (
                            <Alert variant="destructive" className="border-rose-100 bg-rose-50 text-rose-700 rounded-xl">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="font-semibold">{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Images */}
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700">
                                รูปภาพสิ่งของ <span className="text-rose-500">*</span>
                                <span className="text-slate-400 font-normal ml-1">(สูงสุด 5 รูป)</span>
                            </Label>
                            <div className="grid grid-cols-5 gap-3">
                                {imagePreviews.map((preview, i) => (
                                    <div key={i} className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                        <img src={preview} alt="" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeImage(i)}
                                            className="absolute top-1.5 right-1.5 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600">
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                                {imagePreviews.length < 5 && (
                                    <label className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition-all cursor-pointer">
                                        <Camera className="w-6 h-6 text-slate-400 mb-1" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">เพิ่มรูป</span>
                                        <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageChange} />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Title + Category */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="title" className="text-sm font-bold text-slate-700">ชื่อสิ่งของ <span className="text-rose-500">*</span></Label>
                                <Input id="title" placeholder="เช่น กระเป๋าสตางค์สีดำ" value={formData.title} onChange={handleChange} required className="h-10 border-slate-200 rounded-lg" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-bold text-slate-700">หมวดหมู่ <span className="text-rose-500">*</span></Label>
                                <Select onValueChange={v => setFormData(p => ({ ...p, category: v }))} value={formData.category} required>
                                    <SelectTrigger className="h-10 border-slate-200 rounded-lg">
                                        <SelectValue placeholder="เลือกหมวดหมู่" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        {categoryOptions.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                <div className="flex items-center gap-2">
                                                    <opt.icon size={14} className="text-slate-400" />
                                                    <span>{opt.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-bold text-slate-700">สถานที่หลัก <span className="text-rose-500">*</span></Label>
                                <Select onValueChange={v => setFormData(p => ({ ...p, locationMain: v }))} value={formData.locationMain} required>
                                    <SelectTrigger className="h-10 border-slate-200 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} className="text-slate-400" />
                                            <SelectValue placeholder="เลือกสถานที่" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {mainLocations.map(loc => (
                                            <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="locationDetail" className="text-sm font-bold text-slate-700">รายละเอียดสถานที่</Label>
                                <Input id="locationDetail" placeholder="เช่น โต๊ะที่ 3, ใต้เก้าอี้" value={formData.locationDetail} onChange={handleChange} className="h-10 border-slate-200 rounded-lg" />
                            </div>
                        </div>

                        {/* Date + TimePeriod */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="date" className="text-sm font-bold text-slate-700">
                                    {isLost ? 'วันที่คิดว่าทำหาย' : 'วันที่พบ'} <span className="text-rose-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <Input id="date" type="date" value={formData.date} onChange={handleChange} required className="pl-9 h-10 border-slate-200 rounded-lg" />
                                </div>
                            </div>
                            {isLost && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="timePeriod" className="text-sm font-bold text-slate-700">ช่วงเวลาที่หาย</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                        <Input id="timePeriod" placeholder="เช่น ช่วงเช้า 9 โมง" value={formData.timePeriod} onChange={handleChange} className="pl-9 h-10 border-slate-200 rounded-lg" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <Label htmlFor="description" className="text-sm font-bold text-slate-700">รายละเอียดลักษณะสิ่งของ <span className="text-rose-500">*</span></Label>
                            <Textarea id="description" placeholder="ระบุลักษณะโดยละเอียด สี, ยี่ห้อ, จุดสังเกต..." value={formData.description} onChange={handleChange} required className="h-24 border-slate-200 rounded-lg resize-none" />
                        </div>

                        {/* Reporter Info */}
                        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="space-y-1.5">
                                <Label htmlFor="reporterIdCard" className="text-sm font-bold text-slate-700">เลขบัตรประชาชน</Label>
                                <Input id="reporterIdCard" placeholder="13 หลัก (ถ้ามี)" value={formData.reporterIdCard} maxLength={13}
                                    onChange={e => setFormData(p => ({ ...p, reporterIdCard: e.target.value.replace(/\D/g, '') }))}
                                    className="h-10 border-slate-200 bg-white rounded-lg" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="reporterPhone" className="text-sm font-bold text-slate-700">เบอร์โทรศัพท์</Label>
                                <Input id="reporterPhone" placeholder="10 หลัก (ถ้ามี)" value={formData.reporterPhone} maxLength={10}
                                    onChange={e => setFormData(p => ({ ...p, reporterPhone: e.target.value.replace(/\D/g, '') }))}
                                    className="h-10 border-slate-200 bg-white rounded-lg" />
                            </div>
                        </div>

                        {/* Storage + Notes */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="storagePosition" className="text-sm font-bold text-emerald-700">รหัสตำแหน่งจัดเก็บ</Label>
                                <Input id="storagePosition" placeholder="เช่น ตู้ A ชั้น 1" value={formData.storagePosition} onChange={handleChange} className="h-10 border-emerald-200 bg-emerald-50 rounded-lg" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="notes" className="text-sm font-bold text-slate-700">หมายเหตุ</Label>
                                <Input id="notes" placeholder="หมายเหตุเพิ่มเติม..." value={formData.notes} onChange={handleChange} className="h-10 border-slate-200 rounded-lg" />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                        <Button type="button" variant="outline" onClick={handleClose} className="font-bold border-slate-200 rounded-xl px-6">
                            ยกเลิก
                        </Button>
                        <Button type="submit" disabled={loading} className={`font-bold rounded-xl px-8 ${btnClass}`}>
                            {loading ? <><Loader2 size={16} className="animate-spin mr-2" />กำลังบันทึก...</> : 'บันทึกรายการ'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AdminAddItemModal;
