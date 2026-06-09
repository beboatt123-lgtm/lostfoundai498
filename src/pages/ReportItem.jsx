import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    Upload, Camera, Loader2, X, MapPin, Calendar, Type, 
    FileText, ImagePlus, AlertCircle, CheckCircle2, 
    Smartphone, Shirt, Wallet, Briefcase, Key, FileBadge, 
    PawPrint, Gem, Glasses, BookText, HeartPulse, Trophy, 
    Music, Wrench, ToyBrick, Boxes, LayoutGrid, Sparkles, Clock
} from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const validateThaiIDCard = (id) => {
    const cleanId = id.replace(/-/g, "").trim();
    if (!cleanId || cleanId.length !== 13) return false;
    if (!/^[0-9]{13}$/.test(cleanId)) return false;
    
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(cleanId.charAt(i)) * (13 - i);
    }
    const checkDigit = (11 - (sum % 11)) % 10;
    return checkDigit === parseInt(cleanId.charAt(12));
};

const ReportItem = () => {
    const { type } = useParams(); // 'lost' or 'found'
    const isLost = type === 'lost';
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [matches, setMatches] = useState([]);
    const [showMatches, setShowMatches] = useState(false);
    const [mainLocations, setMainLocations] = useState([]);
    const [locationsLoading, setLocationsLoading] = useState(false);
    const [aiGenerating, setAiGenerating] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [formData, setFormData] = useState({
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
        notes: ''
    });

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                setLocationsLoading(true);
                const res = await api.get('locations');
                setMainLocations(res.data.map(loc => loc.name));
            } catch (err) {
                console.error("Failed to fetch locations", err);
                // Fallback to default if API fails
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

    const theme = isLost ? {
        primary: 'rose',
        button: 'bg-rose-600 hover:bg-rose-700',
        text: 'text-rose-600',
        bg: 'bg-rose-50',
        icon: AlertCircle,
        title: 'แบบฟอร์มแจ้งทำของหาย',
        subtitle: 'ระบุข้อมูลสิ่งของที่คุณทำหายเพื่อให้ระบบช่วยทำการค้นหา'
    } : {
        primary: 'emerald',
        button: 'bg-emerald-600 hover:bg-emerald-700',
        text: 'text-emerald-600',
        bg: 'bg-emerald-50',
        icon: CheckCircle2,
        title: 'แบบฟอร์มแจ้งเจอของ',
        subtitle: 'ระบุรายละเอียดสิ่งของที่คุณพบเพื่อส่งคืนเจ้าของ'
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleCategoryChange = (value) => {
        setFormData({ ...formData, category: value });
    };

    const handleLocationMainChange = (value) => {
        setFormData({ ...formData, locationMain: value });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 5) {
            setError('สามารถอัปโหลดรูปภาพได้สูงสุด 5 รูป');
            return;
        }

        const newImages = [...images, ...files];
        setImages(newImages);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);
        setError(null);
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setImages(newImages);
        setImagePreviews(newPreviews);
    };

    const handleGenerateAIImage = async () => {
        if (!formData.title || !formData.description) {
            setError('กรุณากรอกชื่อสิ่งของและรายละเอียดเพื่อใช้ในการเจนรูปภาพ');
            return;
        }

        try {
            setAiGenerating(true);
            setError(null);
            
            const response = await api.post('items/generate-image', {
                title: formData.title,
                description: formData.description
            });

            const imageUrl = response.data.imageUrl;
            
            setImagePreviews([...imagePreviews, imageUrl]);
            setFormData(prev => ({
                ...prev,
                aiGeneratedImage: imageUrl
            }));

        } catch (err) {
            console.error("AI Generation failed", err);
            setError("เกิดข้อผิดพลาดในการเจนรูปภาพ กรุณาลองใหม่อีกครั้ง");
        } finally {
            setAiGenerating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!user) {
            setError('กรุณาเข้าสู่ระบบก่อนดำเนินการต่อ');
            setLoading(false);
            return;
        }

        if (images.length === 0 && !formData.aiGeneratedImage) {
            setError('กรุณาอัปโหลดรูปภาพสิ่งของ หรือกดสร้างรูปด้วย AI อย่างน้อย 1 รูป');
            setLoading(false);
            return;
        }

        // Validate Thai ID Card Number using Checksum algorithm
        const cleanedIdCard = formData.reporterIdCard.replace(/-/g, "").trim();
        if (!validateThaiIDCard(cleanedIdCard)) {
            setError('เลขบัตรประชาชนไม่ถูกต้องตามหลักรูปแบบบัตรประชาชนไทย กรุณาตรวจสอบความถูกต้องและกรอกใหม่อีกครั้ง');
            setLoading(false);
            return;
        }

        // Validate Thai Phone Number
        const cleanedPhone = formData.reporterPhone.replace(/-/g, "").trim();
        if (!/^(0[689])[0-9]{8}$/.test(cleanedPhone) && !/^(02)[0-9]{7,8}$/.test(cleanedPhone)) {
            setError('เบอร์โทรศัพท์ติดต่อไม่ถูกต้อง (ควรขึ้นต้นด้วย 0 และมี 9-10 หลัก)');
            setLoading(false);
            return;
        }

        // Validate Terms of Service Agreement
        if (!acceptTerms) {
            setError('กรุณายอมรับเงื่อนไขการใช้บริการและนโยบายความเป็นส่วนตัวของระบบก่อนทำการโพสต์');
            setLoading(false);
            return;
        }

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('category', formData.category);
            data.append('description', formData.description);
            data.append('locationMain', formData.locationMain);
            data.append('locationDetail', formData.locationDetail);
            data.append('date', formData.date);
            if (isLost) data.append('timePeriod', formData.timePeriod || '');
            data.append('reporterIdCard', cleanedIdCard);
            data.append('reporterPhone', cleanedPhone);
            data.append('type', type);
            data.append('notes', formData.notes || '');
            
            if (user.role === 'admin' || user.role === 'staff') {
                data.append('storagePosition', formData.storagePosition);
            }

            images.forEach(image => {
                data.append('images', image);
            });

            if (formData.aiGeneratedImage) {
                data.append('aiGeneratedImage', formData.aiGeneratedImage);
            }

            const response = await api.post('items', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (user.role !== 'admin' && user.role !== 'staff') {
                setShowSuccessModal(true);
            } else {
                if (response.data.matches && response.data.matches.length > 0) {
                    setMatches(response.data.matches);
                    setShowMatches(true);
                } else {
                    navigate('/');
                }
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 font-sans antialiased text-slate-900">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`p-1.5 rounded-lg ${theme.bg} ${theme.text}`}>
                                <theme.icon size={20} />
                            </div>
                            <span className={`text-sm font-bold uppercase tracking-wider ${theme.text}`}>
                                {isLost ? 'Lost Report' : 'Found Report'}
                            </span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{theme.title}</h1>
                        <p className="text-slate-500 font-medium">{theme.subtitle}</p>
                    </div>
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
                            {/* Photos Section */}
                            <div className="p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-bold text-slate-800 flex items-center gap-2">
                                        รูปภาพสิ่งของ <span className="text-slate-400 font-normal">(จำเป็น) (สูงสุด 5 รูป)</span>
                                    </Label>
                                    <Button 
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleGenerateAIImage}
                                        disabled={aiGenerating || !formData.title}
                                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-bold gap-2"
                                    >
                                        {aiGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                        สร้างรูปด้วย AI
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                            <img src={preview} alt="item" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    
                                    {imagePreviews.length < 5 && (
                                        <label className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition-all cursor-pointer group">
                                            <Camera className="w-8 h-8 text-slate-400 group-hover:text-slate-600 mb-2" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-600">เพิ่มรูปภาพ</span>
                                            <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageChange} />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Core Details Section */}
                            <div className="p-8">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="title" className="text-sm font-bold text-slate-700">ชื่อสิ่งของ <span className="text-rose-500">*</span></Label>
                                            <Input
                                                id="title"
                                                placeholder={`เช่น ${isLost ? 'กระเป๋าสตางค์สีดำ' : 'เจอกุญแจกุญแจรถยนต์'}`}
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

                                        {/* Requirement 16: Location Dropdown */}
                                        <div className="space-y-2">
                                            <Label htmlFor="locationMain" className="text-sm font-bold text-slate-700">{isLost ? 'สถานที่ล่าสุดที่คาดว่าพบเจอสิ่งของครั้งสุดท้าย (สถานที่หลัก)' : 'สถานที่ที่พบของ (สถานที่หลัก)'} <span className="text-rose-500">*</span></Label>
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

                                        {/* Requirement 17: Location Detail */}
                                        <div className="space-y-2">
                                            <Label htmlFor="locationDetail" className="text-sm font-bold text-slate-700">{isLost ? 'รายละเอียดจุดหรือบริเวณที่พบเจอครั้งสุดท้าย' : 'รายละเอียดจุดที่พบ'} <span className="text-slate-400 font-normal">{isLost ? '(เช่น โต๊ะเรียนเลขที่ 3, บนชั้นวางของ)' : '(เช่น โต๊ะที่ 3, ใต้เก้าอี้)'}</span></Label>
                                            <Input
                                                id="locationDetail"
                                                placeholder={isLost ? "ระบุรายละเอียดจุดหรือบริเวณเพิ่มเติม..." : "ระบุจุดย่อยอย่างละเอียด..."}
                                                value={formData.locationDetail}
                                                onChange={handleChange}
                                                className="h-11 border-slate-200 rounded-lg font-medium"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="date" className="text-sm font-bold text-slate-700">{isLost ? 'วันที่คิดว่าทำหาย' : 'วันที่พบ'} <span className="text-rose-500">*</span></Label>
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

                                        {isLost && (
                                            <div className="space-y-2">
                                                <Label htmlFor="timePeriod" className="text-sm font-bold text-slate-700">
                                                    ช่วงเวลาไหนที่คิดว่าหาย <span className="text-slate-400 font-normal">(ไม่บังคับ)</span>
                                                </Label>
                                                <div className="relative">
                                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                    <Input
                                                        id="timePeriod"
                                                        placeholder="เช่น ช่วงเช้า 9 โมง, ตอนพักเที่ยง, หลังเลิกงาน..."
                                                        value={formData.timePeriod}
                                                        onChange={handleChange}
                                                        className="pl-10 h-11 border-slate-200 rounded-lg font-medium"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="description" className="text-sm font-bold text-slate-700">รายละเอียดลักษณะของสิ่งของ <span className="text-rose-500">*</span></Label>
                                            <Textarea
                                                id="description"
                                                placeholder="ระบุลักษณะโดยละเอียด เช่น สี, ยี่ห้อ, จุดสังเกตเฉพาะ เพื่อให้เจ้าของยืนยันได้ถูกต้อง"
                                                className="h-32 border-slate-200 rounded-lg p-4 font-medium"
                                                value={formData.description}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        {/* Requirement 18: User Identity */}
                                        <div className="grid grid-cols-1 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                                            <div className="space-y-2">
                                                <Label htmlFor="reporterIdCard" className="text-sm font-bold text-slate-700">เลขบัตรประชาชน (เพื่อยืนยันตัวตน) <span className="text-rose-500">*</span></Label>
                                                <Input
                                                    id="reporterIdCard"
                                                    placeholder="เลขบัตร 13 หลัก (เฉพาะตัวเลข)"
                                                    value={formData.reporterIdCard}
                                                    maxLength={13}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9]/g, ""); // Allow only digits
                                                        setFormData(prev => ({ ...prev, reporterIdCard: val }));
                                                    }}
                                                    required
                                                    className="h-11 border-slate-200 bg-white"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="reporterPhone" className="text-sm font-bold text-slate-700">เบอร์โทรศัพท์ติดต่อ <span className="text-rose-500">*</span></Label>
                                                <Input
                                                    id="reporterPhone"
                                                    placeholder="เบอร์โทรศัพท์ 10 หลัก (เฉพาะตัวเลข)"
                                                    value={formData.reporterPhone}
                                                    maxLength={10}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9]/g, ""); // Allow only digits
                                                        setFormData(prev => ({ ...prev, reporterPhone: val }));
                                                    }}
                                                    required
                                                    className="h-11 border-slate-200 bg-white"
                                                />
                                            </div>
                                        </div>

                                        {/* Notes field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="notes" className="text-sm font-bold text-slate-700">หมายเหตุเพิ่มเติม <span className="text-slate-400 font-normal">(ไม่บังคับ)</span></Label>
                                            <Textarea
                                                id="notes"
                                                placeholder={isLost ? "ข้อมูลเพิ่มเติมที่อยากให้เจ้าหน้าที่ทราบ เช่น สภาพของหาย, สิ่งที่อยู่ภายใน..." : "ข้อมูลเพิ่มเติมเกี่ยวกับสิ่งของที่พบ เช่น สภาพของ, จุดที่ฝากไว้..."}
                                                className="h-24 border-slate-200 rounded-lg p-4 font-medium"
                                                value={formData.notes}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        {/* Requirement 10: Position Code (Only for Admin) */}
                                        {(user?.role === 'admin' || user?.role === 'staff') && (
                                            <div className="space-y-2 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                                                <Label htmlFor="storagePosition" className="text-sm font-bold text-emerald-700">รหัสตำแหน่งจัดเก็บ (เฉพาะแอดมิน)</Label>
                                                <Input
                                                    id="storagePosition"
                                                    placeholder="เช่น ตู้ A ชั้น 1"
                                                    value={formData.storagePosition}
                                                    onChange={handleChange}
                                                    className="h-11 border-emerald-200 bg-white focus:ring-emerald-500"
                                                />
                                            </div>
                                        )}
                                </div>
                            </div>

                            {/* Terms of Service Section */}
                            <div className="px-8 py-6 bg-slate-50/30 border-t border-slate-100">
                                <div className="flex items-start gap-3">
                                    <input
                                        id="acceptTerms"
                                        type="checkbox"
                                        checked={acceptTerms}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            if (checked) {
                                                // Prevent instant checking, open the modal first to let them agree
                                                setShowTermsModal(true);
                                            } else {
                                                // Uncheck instantly if already checked
                                                setAcceptTerms(false);
                                            }
                                        }}
                                        className={`mt-1 h-4.5 w-4.5 rounded border-slate-300 focus:ring-${theme.primary}-500/30 accent-${isLost ? 'rose-600' : 'emerald-600'} cursor-pointer`}
                                    />
                                    <div className="space-y-1">
                                        <Label htmlFor="acceptTerms" className="text-sm font-bold text-slate-700 cursor-pointer selection:bg-transparent">
                                            ฉันยอมรับและตกลงตาม{" "}
                                            <span 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setShowTermsModal(true);
                                                }}
                                                className={`${theme.text} hover:underline cursor-pointer`}
                                            >
                                                เงื่อนไขการใช้บริการ
                                            </span>{" "}
                                            และ{" "}
                                            <span 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setShowPrivacyModal(true);
                                                }}
                                                className={`${theme.text} hover:underline cursor-pointer`}
                                            >
                                                นโยบายความเป็นส่วนตัว
                                            </span>{" "}
                                            ของระบบ Lost&Found
                                        </Label>
                                        <p className="text-xs text-slate-500 font-medium">
                                            ข้อมูลเลขบัตรประชาชนและข้อมูลติดต่อของคุณจะถูกใช้เพื่อการยืนยันตัวตนและการติดต่อประสานงานรับสิ่งของคืนเท่านั้น
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Submission Area */}
                            <div className="p-8 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="text-sm text-slate-500 font-medium italic">
                                    * โปรดตรวจสอบข้อมูลให้ถูกต้องก่อนกดบันทึก
                                </p>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 sm:flex-none h-11 rounded-lg font-bold border-slate-200"
                                        onClick={() => navigate(-1)}
                                    >
                                        ยกเลิก
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading || !acceptTerms}
                                        className={`flex-1 sm:flex-none h-11 px-8 rounded-lg font-bold text-white shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${theme.button}`}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                กำลังบันทึก...
                                            </>
                                        ) : (
                                            'Submit'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Info Footer */}
                <div className="grid md:grid-cols-2 gap-6 px-2">
                    <div className="flex gap-3 p-4 rounded-xl bg-slate-100/50 border border-slate-100">
                        <Sparkles className="text-amber-500 shrink-0 mt-1" size={18} />
                        <p className="text-sm text-slate-600 font-medium">
                            <span className="font-bold text-slate-900">AI Matching:</span> ระบบจะนำข้อมูลรายละเอียดที่คุณกรอก ไปเปรียบเทียบกับรายการอื่นๆ ในระบบทันที เพื่อหาความน่าจะเป็นที่ตรงกัน
                        </p>
                    </div>
                    <div className="flex gap-3 p-4 rounded-xl bg-slate-100/50 border border-slate-100">
                        <AlertCircle className="text-slate-400 shrink-0 mt-1" size={18} />
                        <p className="text-sm text-slate-600 font-medium">
                            <span className="font-bold text-slate-900">ความปลอดภัย:</span> ข้อมูลติดต่อของคุณจะไม่ได้รับการเปิดเผยต่อสาธารณะจนกว่าคุณจะเป็นผู้เริ่มสนทนาผ่านระบบแชท
                        </p>
                    </div>
                </div>

            {/* AI Matching Modal (Requirement 14) */}
            <Dialog open={showMatches} onOpenChange={(open) => {
                if (!open) navigate('/');
                setShowMatches(open);
            }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none rounded-2xl shadow-2xl">
                    <DialogHeader className="p-6 bg-emerald-600 text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Sparkles size={24} className="text-white" />
                            </div>
                            <DialogTitle className="text-2xl font-black">ตรวจพบรายการที่คล้ายคลึงกัน!</DialogTitle>
                        </div>
                        <DialogDescription className="text-emerald-50 font-medium">
                            เราพบว่ามีคนเคยแจ้ง {isLost ? 'พบ' : 'หาย'} สิ่งของที่คล้ายกับที่คุณเพิ่งรายงาน กรุณาตรวจสอบว่าใช่ของชิ้นเดียวกันหรือไม่
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                        {matches.map((match) => (
                            <div key={match._id} className="flex gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all group">
                                <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-slate-100">
                                    <img src={match.images[0]} alt={match.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-slate-900 truncate">{match.title}</h3>
                                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">{match.description}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            <span className="flex items-center gap-1"><MapPin size={10} /> {match.locationMain}</span>
                                            <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(match.date).toLocaleDateString()}</span>
                                        </div>
                                        <Button 
                                            size="sm" 
                                            className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                                            onClick={() => navigate(`/item/${match._id}`)}
                                        >
                                            ดูรายละเอียด
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
                        <Button variant="outline" className="font-bold border-slate-200" onClick={() => navigate('/')}>
                            ไม่ใช่ของที่ค้นหา
                        </Button>
                        <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold" onClick={() => navigate('/')}>
                            ปิดหน้าต่าง
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Terms of Service Modal */}
            <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
                <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col p-0 border-none rounded-2xl shadow-2xl">
                    <DialogHeader className="p-6 bg-slate-900 text-white">
                        <DialogTitle className="text-xl font-bold">เงื่อนไขการใช้บริการระบบ Lost&Found</DialogTitle>
                        <DialogDescription className="text-slate-400 font-medium text-xs mt-1">
                            มีผลบังคับใช้ตั้งแต่วันที่ 1 มกราคม 2569 เป็นต้นไป
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm text-slate-600 leading-relaxed">
                        <p className="font-bold text-slate-800">โปรดอ่านเงื่อนไขการใช้บริการอย่างละเอียดก่อนตกลงเปิดใช้งานโพสต์ของคุณ:</p>
                        
                        <div className="space-y-2">
                            <h4 className="font-bold text-slate-800">1. ความถูกต้องและสิทธิ์ในข้อมูล</h4>
                            <p>ผู้ใช้บริการตกลงและรับรองว่า ข้อมูลรายละเอียดสิ่งของ รูปภาพ เลขประจำตัวประชาชน และข้อมูลติดต่อที่กรอกเข้าสู่ระบบนั้น เป็นข้อมูลที่เป็นความจริง ถูกต้อง และเป็นสิทธิ์ของผู้ใช้โดยชอบธรรมทุกประการ</p>
                        </div>
                        
                        <div className="space-y-2">
                            <h4 className="font-bold text-slate-800">2. ข้อห้ามการใช้งานระบบ</h4>
                            <p>ห้ามมิให้ลงประกาศสิ่งของที่เป็นสิ่งของผิดกฎหมายทุกประเภท รวมถึงอาวุธ สารเสพติด วัตถุอันตราย หรือสิ่งของที่เข้าข่ายลามกอนาจารและละเมิดสิทธิ์บุคคลอื่น</p>
                        </div>
                        
                        <div className="space-y-2">
                            <h4 className="font-bold text-slate-800">3. การคุ้มครองความเป็นส่วนตัว</h4>
                            <p>ระบบจะเก็บรักษาข้อมูลบัตรประชาชนและข้อมูลติดต่อของท่านไว้เป็นความลับ และจะเปิดเผยให้แก่คู่สนทนาเมื่อมีการทักแชทประสานงานยืนยันตัวตนเจ้าของทรัพย์สินที่แท้จริงเท่านั้น</p>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-bold text-slate-800">4. ขอบเขตความรับผิดชอบ</h4>
                            <p>ระบบ Lost&Found เป็นเพียงสื่อกลางเพื่อช่วยติดตามและประสานงานเท่านั้น ทางเราไม่มีส่วนรับผิดชอบต่อความเสียหาย สูญหาย หรือข้อพิพาทใดๆ ที่เกิดขึ้นระหว่างกระบวนการส่งคืนของ</p>
                        </div>
                    </div>
                    <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                        <Button 
                            variant="outline" 
                            className="font-bold border-slate-200 text-xs h-9 px-4 rounded-lg" 
                            onClick={() => {
                                setAcceptTerms(false);
                                setShowTermsModal(false);
                            }}
                        >
                            ปฏิเสธ
                        </Button>
                        <Button 
                            className={`text-white font-bold text-xs h-9 px-6 rounded-lg shadow-sm ${theme.button}`}
                            onClick={() => {
                                setAcceptTerms(true);
                                setShowTermsModal(false);
                            }}
                        >
                            ยอมรับและตกลง
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Privacy Policy Modal */}
            <Dialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
                <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col p-0 border-none rounded-2xl shadow-2xl">
                    <DialogHeader className="p-6 bg-slate-900 text-white">
                        <DialogTitle className="text-xl font-bold">นโยบายความเป็นส่วนตัว (Privacy Policy)</DialogTitle>
                        <DialogDescription className="text-slate-400 font-medium text-xs mt-1">
                            การจัดการและปกป้องข้อมูลส่วนบุคคลตามกฎหมาย PDPA
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm text-slate-600 leading-relaxed">
                        <p className="font-bold text-slate-800">ระบบ Lost&Found ให้ความสำคัญสูงสุดต่อการรักษาความปลอดภัยของข้อมูลส่วนตัวของท่าน:</p>
                        
                        <div className="space-y-2">
                            <h4 className="font-bold text-slate-800">1. ข้อมูลส่วนบุคคลที่เราจัดเก็บ</h4>
                            <p>เรามีการจัดเก็บข้อมูล ได้แก่ ชื่อ-นามสกุล, เบอร์โทรศัพท์ติดต่อ, รูปภาพสิ่งของ และเลขบัตรประจำตัวประชาชน 13 หลัก เพื่อนำมาใช้ประโยชน์ในการยืนยันตัวตนเจ้าของสิทธิ์</p>
                        </div>
                        
                        <div className="space-y-2">
                            <h4 className="font-bold text-slate-800">2. วัตถุประสงค์ในการประมวลผลข้อมูล</h4>
                            <p>ข้อมูลทั้งหมดจะถูกใช้เพื่อการจับคู่สิ่งของหายด้วยระบบ AI Matching, ส่งการแจ้งเตือน, และเป็นหลักฐานในการติดต่อยืนยันรับสิ่งของคืนเพื่อความปลอดภัยสูงสุดของทรัพย์สินของท่าน</p>
                        </div>
                        
                        <div className="space-y-2">
                            <h4 className="font-bold text-slate-800">3. การเก็บรักษาและระยะเวลา</h4>
                            <p>ข้อมูลส่วนบุคคลจะถูกเก็บรักษาอย่างมีมาตรการความปลอดภัยขั้นสูง และระบบจะลบหรือปกปิดข้อมูลเหล่านั้นเมื่อสิ่งของชิ้นดังกล่าวได้รับการยืนยันการส่งคืนเสร็จสิ้นสมบูรณ์เป็นที่เรียบร้อย</p>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-bold text-slate-800">4. สิทธิ์ของท่านในฐานะเจ้าของข้อมูล</h4>
                            <p>ตามกฎหมาย PDPA ท่านมีสิทธิ์ในการเข้าถึง ขอสำเนา แก้ไข คัดค้าน หรือขอให้ระงับและทำลายข้อมูลส่วนบุคคลของท่านที่อยู่ในระบบได้ทุกเมื่อผ่านการติดต่อฝ่ายบริการดูแลระบบ</p>
                        </div>
                    </div>
                    <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                        <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 rounded-lg text-xs h-9" onClick={() => setShowPrivacyModal(false)}>
                            ปิดหน้าต่าง
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Success / Pending Admin Approval Modal */}
            <Dialog open={showSuccessModal} onOpenChange={(open) => {
                if (!open) {
                    setShowSuccessModal(false);
                    navigate('/');
                }
            }}>
                <DialogContent className="max-w-md p-0 border-none rounded-2xl shadow-2xl overflow-hidden font-sans">
                    <div className="p-8 text-center space-y-6">
                        <div className="mx-auto h-20 w-20 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100 shadow-sm animate-pulse">
                            <Clock className="h-10 w-10 text-amber-600" />
                        </div>
                        <div className="space-y-2">
                            <DialogTitle className="text-2xl font-black text-slate-800">
                                ส่งข้อมูลสำเร็จ!
                            </DialogTitle>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                                อยู่ระหว่างรอผู้ดูแลระบบตรวจสอบ
                            </p>
                        </div>
                        <DialogDescription className="text-sm text-slate-600 leading-relaxed font-medium">
                            เนื่องจากคุณเป็นผู้ใช้งานทั่วไป เพื่อความปลอดภัยและป้องกันการแอบอ้างสิทธิ์ โพสต์ประกาศสิ่งของของคุณจะได้รับการอนุมัติและเผยแพร่สู่ระบบสาธารณะหลังจากที่ผู้ดูแลระบบ (Admin) ตรวจสอบความถูกต้องเรียบร้อยแล้ว
                        </DialogDescription>
                    </div>
                    <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-center">
                        <Button 
                            className={`w-full text-white font-bold py-2.5 rounded-xl shadow-md transition-all active:scale-95 ${theme.button}`}
                            onClick={() => {
                                setShowSuccessModal(false);
                                navigate('/');
                            }}
                        >
                            ตกลง และกลับหน้าแรก
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    </div>
);
};

export default ReportItem;
