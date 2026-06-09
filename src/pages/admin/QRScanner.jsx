import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
    QrCode, Camera, CameraOff, Search, Loader2, CheckCircle2,
    AlertCircle, MapPin, Calendar, Clock, Phone, CreditCard,
    Warehouse, RefreshCw, XCircle, CheckCircle, User as UserIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/axios';

const statusMap = {
    pending:  { label: 'รออนุมัติ',     cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    open:     { label: 'เผยแพร่แล้ว',   cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    resolved: { label: 'ส่งคืนสำเร็จ', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
    closed:   { label: 'ปิดประกาศ',     cls: 'bg-slate-100 text-slate-600 border-slate-200' },
    rejected: { label: 'ปฏิเสธ',        cls: 'bg-rose-100 text-rose-700 border-rose-200' },
};

const categories = {
    electronics: 'อุปกรณ์อิเล็กทรอนิกส์', wallet: 'กระเป๋าสตางค์/บัตร',
    clothing: 'เสื้อผ้า/เครื่องแต่งกาย', bag: 'กระเป๋า/เป้',
    jewelry: 'เครื่องประดับ/นาฬิกา', glasses: 'แว่นตา',
    documents: 'เอกสารสำคัญ', stationery: 'เครื่องเขียน/หนังสือ',
    health: 'อุปกรณ์สุขภาพ/ยา', pets: 'สัตว์เลี้ยง',
    sports: 'อุปกรณ์กีฬา', music: 'เครื่องดนตรี/หูฟัง',
    tools: 'เครื่องมือ/อุปกรณ์ช่าง', toy: 'ของเล่น/ของสะสม', others: 'อื่นๆ'
};

const InfoRow = ({ icon: Icon, label, value, color = 'slate' }) => {
    if (!value) return null;
    const colors = {
        slate:   'bg-slate-50 border-slate-100 text-slate-500',
        indigo:  'bg-indigo-50 border-indigo-100 text-indigo-500',
        emerald: 'bg-emerald-50 border-emerald-100 text-emerald-500',
    };
    return (
        <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border ${colors[color]}`}>
            <Icon size={13} className="shrink-0" />
            <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-wider opacity-60 leading-none mb-0.5">{label}</p>
                <p className="text-xs font-bold text-slate-800 leading-snug truncate">{value}</p>
            </div>
        </div>
    );
};

const QRScanner = () => {
    const scannerRef = useRef(null);
    const [scanning, setScanning] = useState(false);
    const [searching, setSearching] = useState(false);
    const [manualId, setManualId] = useState('');
    const [foundItem, setFoundItem] = useState(null);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionSuccess, setActionSuccess] = useState('');

    // Resolve form state
    const [showResolveForm, setShowResolveForm] = useState(false);
    const [resolveData, setResolveData] = useState({ receiverName: '', receiverIdCard: '', receiverPhone: '' });
    const [receiverImage, setReceiverImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const startScanner = () => {
        setError(null);
        setFoundItem(null);
        setActionSuccess('');
        setScanning(true);

        setTimeout(async () => {
            try {
                const html5QrCode = new Html5Qrcode('qr-reader');
                scannerRef.current = html5QrCode;

                await html5QrCode.start(
                    { facingMode: 'environment' },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    async (decodedText) => {
                        await html5QrCode.stop();
                        setScanning(false);
                        await handleQRResult(decodedText);
                    },
                    () => {}
                );
            } catch (err) {
                try {
                    await scannerRef.current.start(
                        { facingMode: 'user' },
                        { fps: 10, qrbox: { width: 250, height: 250 } },
                        async (decodedText) => {
                            await scannerRef.current.stop();
                            setScanning(false);
                            await handleQRResult(decodedText);
                        },
                        () => {}
                    );
                } catch (fallbackErr) {
                    setError(`ไม่สามารถเปิดกล้องได้: ${err?.message || err}`);
                    setScanning(false);
                }
            }
        }, 100);
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try { await scannerRef.current.stop(); } catch (_) {}
        }
        setScanning(false);
    };

    const handleQRResult = async (text) => {
        // Support customId like L00001, BU0001, or a URL ending with the ID
        const idMatch = text.match(/[A-Z]+\d+/);
        const customId = idMatch ? idMatch[0] : text.trim();
        await searchByCustomId(customId);
    };

    const searchByCustomId = async (customId) => {
        setSearching(true);
        setFoundItem(null);
        setError(null);
        setActionSuccess('');
        setShowResolveForm(false);
        try {
            const res = await api.get('/items', { params: { search: customId, status: 'all' } });
            const match = res.data.find(item =>
                item.customId?.toLowerCase() === customId.toLowerCase()
            );
            if (match) {
                // Fetch full item detail for complete data
                const detail = await api.get(`/items/${match._id}`);
                setFoundItem(detail.data);
            } else {
                setError(`ไม่พบรายการ "${customId}" ในระบบ`);
            }
        } catch {
            setError('เกิดข้อผิดพลาดในการค้นหา');
        } finally {
            setSearching(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        setActionLoading(true);
        try {
            await api.put(`/items/${foundItem._id}`, { status: newStatus });
            const detail = await api.get(`/items/${foundItem._id}`);
            setFoundItem(detail.data);
            setActionSuccess(`เปลี่ยนสถานะเป็น "${statusMap[newStatus]?.label}" เรียบร้อยแล้ว`);
        } catch {
            setError('ไม่สามารถเปลี่ยนสถานะได้');
        } finally {
            setActionLoading(false);
        }
    };

    const handleResolveSubmit = async (e) => {
        e.preventDefault();
        if (!resolveData.receiverName || !resolveData.receiverIdCard || !resolveData.receiverPhone || !receiverImage) {
            setError('กรุณากรอกข้อมูลและอัปโหลดรูปให้ครบถ้วน');
            return;
        }
        setActionLoading(true);
        try {
            const formData = new FormData();
            formData.append('status', 'resolved');
            formData.append('receiverName', resolveData.receiverName);
            formData.append('receiverIdCard', resolveData.receiverIdCard);
            formData.append('receiverPhone', resolveData.receiverPhone);
            formData.append('receiverImage', receiverImage);
            await api.patch(`/items/${foundItem._id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const detail = await api.get(`/items/${foundItem._id}`);
            setFoundItem(detail.data);
            setShowResolveForm(false);
            setResolveData({ receiverName: '', receiverIdCard: '', receiverPhone: '' });
            setReceiverImage(null);
            setImagePreview(null);
            setActionSuccess('บันทึกการส่งคืนสำเร็จแล้ว');
        } catch {
            setError('ไม่สามารถบันทึกข้อมูลได้');
        } finally {
            setActionLoading(false);
        }
    };

    const handleManualSearch = (e) => {
        e.preventDefault();
        if (!manualId.trim()) return;
        searchByCustomId(manualId.trim().toUpperCase());
    };

    useEffect(() => {
        return () => { stopScanner(); };
    }, []);

    const item = foundItem;

    return (
        <div className="max-w-xl mx-auto space-y-5 pb-12">
            <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-4">
                    <div className="p-2.5 bg-indigo-100 rounded-2xl shadow-sm">
                        <QrCode className="text-indigo-600 h-7 w-7" />
                    </div>
                    สแกน QR Code
                </h2>
                <p className="text-slate-500 mt-2 ml-1 text-sm">สแกน QR Code หรือพิมพ์รหัสเพื่อค้นหาและจัดการสิ่งของ</p>
            </div>

            {/* Camera */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                <div className="p-4">
                    <div
                        id="qr-reader"
                        className={`w-full rounded-xl overflow-hidden bg-slate-900 ${scanning ? 'block' : 'hidden'}`}
                        style={{ minHeight: '280px' }}
                    />
                    {!scanning && (
                        <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-400">
                            <div className="w-20 h-20 border-4 border-dashed border-slate-200 rounded-2xl flex items-center justify-center">
                                <QrCode size={36} className="text-slate-300" />
                            </div>
                            <p className="text-sm font-medium">กดปุ่มด้านล่างเพื่อเปิดกล้อง</p>
                        </div>
                    )}
                </div>
                <div className="px-4 pb-4 flex gap-3">
                    {!scanning ? (
                        <Button onClick={startScanner} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-11 gap-2">
                            <Camera size={18} /> เปิดกล้องสแกน
                        </Button>
                    ) : (
                        <Button onClick={stopScanner} variant="outline" className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 font-bold rounded-xl h-11 gap-2">
                            <CameraOff size={18} /> หยุดสแกน
                        </Button>
                    )}
                </div>
            </div>

            {/* Manual Search */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-4">
                <p className="text-sm font-bold text-slate-700 mb-3">หรือพิมพ์รหัสสิ่งของ</p>
                <form onSubmit={handleManualSearch} className="flex gap-2">
                    <Input
                        placeholder="เช่น L00001"
                        value={manualId}
                        onChange={(e) => setManualId(e.target.value.toUpperCase())}
                        className="h-11 font-mono font-bold tracking-wider border-slate-200 rounded-xl flex-1"
                    />
                    <Button type="submit" disabled={searching} className="bg-slate-900 hover:bg-black text-white font-bold rounded-xl h-11 px-5 gap-2">
                        {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                        ค้นหา
                    </Button>
                </form>
            </div>

            {/* Searching spinner */}
            {searching && (
                <div className="flex items-center justify-center gap-3 py-8 text-indigo-600">
                    <Loader2 size={22} className="animate-spin" />
                    <span className="font-bold text-sm">กำลังค้นหา...</span>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700">
                    <AlertCircle size={18} className="shrink-0" />
                    <p className="font-medium text-sm">{error}</p>
                </div>
            )}

            {/* Success */}
            {actionSuccess && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700">
                    <CheckCircle2 size={18} className="shrink-0" />
                    <p className="font-bold text-sm">{actionSuccess}</p>
                </div>
            )}

            {/* Item Detail */}
            {item && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">

                    {/* Hero */}
                    <div className="relative">
                        <div className="w-full aspect-[16/7] bg-slate-100">
                            <img
                                src={item.images?.[0] || 'https://via.placeholder.com/800x400?text=No+Image'}
                                alt={item.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        </div>
                        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                            <Badge className={`${statusMap[item.status]?.cls} border font-bold shadow-sm`}>
                                {statusMap[item.status]?.label}
                            </Badge>
                            <Badge className={`${item.type === 'lost' ? 'bg-rose-600' : 'bg-emerald-600'} text-white font-bold shadow-sm`}>
                                {item.type === 'lost' ? 'ของหาย' : 'พบสิ่งของ'}
                            </Badge>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
                            <p className="text-white font-black text-lg leading-tight drop-shadow">{item.title}</p>
                            <p className="text-white/70 text-xs font-medium mt-0.5">
                                <span className="font-mono">{item.customId}</span> · {categories[item.category] || item.category}
                            </p>
                        </div>
                    </div>

                    <div className="p-4 space-y-4">

                        {/* Description */}
                        <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>

                        {/* Location / Date */}
                        <div className="grid grid-cols-2 gap-2">
                            <InfoRow icon={MapPin} label="สถานที่หลัก" value={item.locationMain} />
                            {item.locationDetail && <InfoRow icon={MapPin} label="รายละเอียดสถานที่" value={item.locationDetail} />}
                            <InfoRow icon={Calendar} label={item.type === 'lost' ? 'วันที่คิดว่าหาย' : 'วันที่พบ'} value={new Date(item.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })} />
                            {item.timePeriod && <InfoRow icon={Clock} label="ช่วงเวลา" value={item.timePeriod} />}
                        </div>

                        {/* Staff info */}
                        <div className="rounded-xl border border-indigo-100 overflow-hidden">
                            <div className="bg-indigo-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-500">
                                ข้อมูลสำหรับเจ้าหน้าที่
                            </div>
                            <div className="p-3 grid grid-cols-2 gap-2">
                                <InfoRow icon={CreditCard} label="เลขบัตรประชาชน" value={item.reporterIdCard} color="indigo" />
                                <InfoRow icon={Phone} label="เบอร์โทรศัพท์" value={item.reporterPhone} color="indigo" />
                                {item.storagePosition && <InfoRow icon={Warehouse} label="ตำแหน่งจัดเก็บ" value={item.storagePosition} color="indigo" />}
                            </div>
                        </div>

                        {item.notes && (
                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-sm text-slate-700">
                                <span className="font-black text-amber-600 text-[10px] uppercase tracking-wider">หมายเหตุ: </span>
                                {item.notes}
                            </div>
                        )}

                        {/* Resolved info */}
                        {item.status === 'resolved' && (
                            <div className="rounded-xl border border-emerald-100 overflow-hidden">
                                <div className="bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                    ข้อมูลการส่งคืน
                                </div>
                                <div className="p-3 grid grid-cols-2 gap-2">
                                    <InfoRow icon={UserIcon} label="ชื่อผู้รับ" value={item.receiverName} color="emerald" />
                                    <InfoRow icon={Phone} label="เบอร์โทร" value={item.receiverPhone} color="emerald" />
                                    <InfoRow icon={CreditCard} label="เลขบัตร" value={item.receiverIdCard} color="emerald" />
                                </div>
                            </div>
                        )}

                        {/* ─── Action Buttons ─── */}
                        <div className="pt-1 space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">เปลี่ยนสถานะ</p>

                            {item.status === 'pending' && (
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleStatusUpdate('open')}
                                        disabled={actionLoading}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-11 gap-2"
                                    >
                                        {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                        อนุมัติเผยแพร่
                                    </Button>
                                    <Button
                                        onClick={() => handleStatusUpdate('rejected')}
                                        disabled={actionLoading}
                                        variant="outline"
                                        className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 font-bold rounded-xl h-11 gap-2"
                                    >
                                        <XCircle size={16} /> ปฏิเสธ
                                    </Button>
                                </div>
                            )}

                            {item.status === 'rejected' && (
                                <Button
                                    onClick={() => handleStatusUpdate('open')}
                                    disabled={actionLoading}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-11 gap-2"
                                >
                                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                    อนุมัติใหม่
                                </Button>
                            )}

                            {item.status === 'open' && !showResolveForm && (
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => setShowResolveForm(true)}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-11 gap-2"
                                    >
                                        <CheckCircle2 size={16} /> ส่งคืนสำเร็จ
                                    </Button>
                                    <Button
                                        onClick={() => handleStatusUpdate('closed')}
                                        disabled={actionLoading}
                                        variant="outline"
                                        className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl h-11 gap-2"
                                    >
                                        <XCircle size={16} /> ปิดประกาศ
                                    </Button>
                                </div>
                            )}

                            {item.status === 'closed' && (
                                <Button
                                    onClick={() => handleStatusUpdate('open')}
                                    disabled={actionLoading}
                                    variant="outline"
                                    className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold rounded-xl h-11 gap-2"
                                >
                                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                                    เปิดประกาศอีกครั้ง
                                </Button>
                            )}

                            {item.status === 'resolved' && (
                                <div className="flex items-center justify-center gap-2 py-3 text-blue-600 bg-blue-50 rounded-xl border border-blue-100">
                                    <CheckCircle2 size={16} />
                                    <span className="text-sm font-bold">รายการนี้ส่งคืนเจ้าของแล้ว</span>
                                </div>
                            )}
                        </div>

                        {/* Resolve form */}
                        {showResolveForm && (
                            <div className="rounded-xl border border-blue-100 overflow-hidden">
                                <div className="bg-blue-50 px-4 py-3 flex items-center justify-between">
                                    <p className="text-xs font-black uppercase tracking-widest text-blue-600">บันทึกการรับมอบสิ่งของ</p>
                                    <button onClick={() => setShowResolveForm(false)} className="text-slate-400 hover:text-slate-600">
                                        <XCircle size={16} />
                                    </button>
                                </div>
                                <form onSubmit={handleResolveSubmit} className="p-4 space-y-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">ชื่อ-นามสกุลผู้รับ</Label>
                                        <Input
                                            placeholder="ชื่อและนามสกุล"
                                            className="h-10 bg-slate-50 border-slate-200 rounded-xl text-sm"
                                            value={resolveData.receiverName}
                                            onChange={(e) => setResolveData({ ...resolveData, receiverName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">เลขบัตรประชาชน</Label>
                                            <Input
                                                placeholder="13 หลัก"
                                                className="h-10 bg-slate-50 border-slate-200 rounded-xl text-sm"
                                                value={resolveData.receiverIdCard}
                                                onChange={(e) => setResolveData({ ...resolveData, receiverIdCard: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">เบอร์โทรศัพท์</Label>
                                            <Input
                                                placeholder="08X-XXX-XXXX"
                                                className="h-10 bg-slate-50 border-slate-200 rounded-xl text-sm"
                                                value={resolveData.receiverPhone}
                                                onChange={(e) => setResolveData({ ...resolveData, receiverPhone: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">รูปหลักฐานการรับมอบ</Label>
                                        <div
                                            onClick={() => document.getElementById('qr-receiverImage').click()}
                                            className="border-2 border-dashed border-slate-200 rounded-xl h-24 flex items-center justify-center cursor-pointer hover:bg-slate-50 overflow-hidden"
                                        >
                                            {imagePreview
                                                ? <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                                : <p className="text-xs text-slate-400 font-medium">คลิกเพื่ออัปโหลดรูป</p>
                                            }
                                        </div>
                                        <input id="qr-receiverImage" type="file" accept="image/*" className="hidden"
                                            onChange={(e) => {
                                                const f = e.target.files[0];
                                                if (f) { setReceiverImage(f); setImagePreview(URL.createObjectURL(f)); }
                                            }}
                                        />
                                    </div>
                                    <Button type="submit" disabled={actionLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-11 gap-2">
                                        {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                        ยืนยันการส่งคืน
                                    </Button>
                                </form>
                            </div>
                        )}

                        {/* Scan again */}
                        <Button
                            onClick={() => { setFoundItem(null); setActionSuccess(''); setError(null); setManualId(''); }}
                            variant="outline"
                            className="w-full border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl h-10 gap-2 text-sm"
                        >
                            <RefreshCw size={14} /> สแกนรายการใหม่
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QRScanner;
