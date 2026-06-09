import { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, MapPin, Calendar, Clock, Package, Phone, CreditCard, Warehouse, Sparkles, CheckCircle2, User as UserIcon } from 'lucide-react';
import api from '../lib/axios';

const categories = {
    electronics: 'อุปกรณ์อิเล็กทรอนิกส์', wallet: 'กระเป๋าสตางค์/บัตร',
    clothing: 'เสื้อผ้า/เครื่องแต่งกาย', bag: 'กระเป๋า/เป้',
    jewelry: 'เครื่องประดับ/นาฬิกา', glasses: 'แว่นตา',
    documents: 'เอกสารสำคัญ', stationery: 'เครื่องเขียน/หนังสือ',
    health: 'อุปกรณ์สุขภาพ/ยา', pets: 'สัตว์เลี้ยง',
    sports: 'อุปกรณ์กีฬา', music: 'เครื่องดนตรี/หูฟัง',
    tools: 'เครื่องมือ/อุปกรณ์ช่าง', toy: 'ของเล่น/ของสะสม', others: 'อื่นๆ'
};

const statusMap = {
    pending: { label: 'รออนุมัติ', class: 'bg-amber-100 text-amber-700 border-amber-200' },
    open: { label: 'เผยแพร่แล้ว', class: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    resolved: { label: 'ส่งคืนสำเร็จ', class: 'bg-blue-100 text-blue-700 border-blue-200' },
    closed: { label: 'ปิดประกาศ', class: 'bg-slate-100 text-slate-700 border-slate-200' },
    rejected: { label: 'ปฏิเสธ', class: 'bg-rose-100 text-rose-700 border-rose-200' },
};

const InfoRow = ({ icon: Icon, label, value, accent = 'slate' }) => (
    <div className={`flex items-start gap-3 p-3 rounded-xl bg-${accent}-50 border border-${accent}-100`}>
        <div className={`mt-0.5 p-1.5 rounded-lg bg-${accent}-100`}>
            <Icon size={14} className={`text-${accent}-600`} />
        </div>
        <div className="min-w-0">
            <p className={`text-[10px] font-black uppercase tracking-widest text-${accent}-500 mb-0.5`}>{label}</p>
            <p className={`font-bold text-${accent}-900 text-sm leading-snug`}>{value || '—'}</p>
        </div>
    </div>
);

const AdminItemDetailModal = ({ itemId, open, onClose }) => {
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeImg, setActiveImg] = useState(0);

    useEffect(() => {
        if (!open || !itemId) return;
        setLoading(true);
        setActiveImg(0);
        api.get(`/items/${itemId}`)
            .then(res => setItem(res.data))
            .catch(() => setItem(null))
            .finally(() => setLoading(false));
    }, [open, itemId]);

    const isLost = item?.type === 'lost';

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none rounded-2xl shadow-2xl">
                <DialogTitle className="sr-only">รายละเอียดสิ่งของ</DialogTitle>
                <DialogDescription className="sr-only">ข้อมูลสิ่งของในระบบ Lost & Found</DialogDescription>

                {loading || !item ? (
                    <div className="flex items-center justify-center h-64">
                        {loading
                            ? <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                            : <p className="text-slate-400 font-medium">ไม่พบข้อมูลรายการนี้</p>
                        }
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        {/* Header bar */}
                        <div className={`px-6 py-4 flex items-center gap-3 ${isLost ? 'bg-rose-600' : 'bg-emerald-600'} text-white`}>
                            <div className="p-2 bg-white/20 rounded-lg shrink-0">
                                <Package size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-lg leading-tight truncate">{item.title}</p>
                                <p className="text-white/70 text-xs font-medium">{item.customId} · {categories[item.category] || item.category}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Badge className={`${statusMap[item.status]?.class} border text-xs font-bold`}>
                                    {statusMap[item.status]?.label || item.status}
                                </Badge>
                                <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold">
                                    {isLost ? 'ของหาย' : 'พบสิ่งของ'}
                                </Badge>
                            </div>
                        </div>

                        <div className="p-6 grid md:grid-cols-5 gap-6">
                            {/* Images */}
                            <div className="md:col-span-2 space-y-3">
                                <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                                    <img
                                        src={item.images?.[activeImg] || 'https://via.placeholder.com/500?text=No+Image'}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {item.images?.length > 1 && (
                                    <div className="grid grid-cols-4 gap-2">
                                        {item.images.map((img, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setActiveImg(i)}
                                                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${activeImg === i ? 'border-emerald-500 shadow-md' : 'border-slate-200 opacity-60 hover:opacity-100'}`}
                                            >
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Reporter */}
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <Avatar className="h-9 w-9 border border-slate-200">
                                        <AvatarImage src={item.user?.avatar} />
                                        <AvatarFallback className="bg-slate-200 text-slate-600 text-sm font-bold">
                                            {item.user?.firstname?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">ผู้แจ้ง</p>
                                        <p className="font-bold text-slate-800 text-sm truncate">{item.user?.firstname} {item.user?.lastname}</p>
                                        <p className="text-xs text-slate-400 truncate">{item.user?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="md:col-span-3 space-y-4">
                                {/* Description */}
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">รายละเอียด</p>
                                    <p className="text-slate-700 font-medium text-sm leading-relaxed">{item.description}</p>
                                </div>

                                {item.notes && (
                                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">หมายเหตุ</p>
                                        <p className="text-slate-700 font-medium text-sm leading-relaxed">{item.notes}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <InfoRow icon={MapPin} label="สถานที่หลัก" value={item.locationMain} accent="slate" />
                                    {item.locationDetail && (
                                        <InfoRow icon={MapPin} label="รายละเอียดสถานที่" value={item.locationDetail} accent="slate" />
                                    )}
                                    <InfoRow icon={Calendar} label={isLost ? 'วันที่คิดว่าทำหาย' : 'วันที่พบ'}
                                        value={new Date(item.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        accent="slate"
                                    />
                                    {item.timePeriod && (
                                        <InfoRow icon={Clock} label="ช่วงเวลา" value={item.timePeriod} accent="slate" />
                                    )}
                                </div>

                                {/* Admin-only info */}
                                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 space-y-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">ข้อมูลสำหรับเจ้าหน้าที่</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <InfoRow icon={CreditCard} label="เลขบัตรประชาชน" value={item.reporterIdCard} accent="indigo" />
                                        <InfoRow icon={Phone} label="เบอร์โทรศัพท์" value={item.reporterPhone} accent="indigo" />
                                        <InfoRow icon={Warehouse} label="ตำแหน่งจัดเก็บ" value={item.storagePosition || 'ไม่ได้ระบุ'} accent="indigo" />
                                        <InfoRow icon={Calendar} label="วันที่แจ้ง"
                                            value={new Date(item.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            accent="indigo"
                                        />
                                    </div>
                                </div>

                                {/* Resolved info */}
                                {item.status === 'resolved' && (
                                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 size={14} className="text-emerald-600" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">ข้อมูลการส่งคืนสำเร็จ</p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <InfoRow icon={UserIcon} label="ชื่อผู้รับ" value={item.receiverName} accent="emerald" />
                                            <InfoRow icon={Phone} label="เบอร์โทร" value={item.receiverPhone} accent="emerald" />
                                            <InfoRow icon={CreditCard} label="เลขบัตร" value={item.receiverIdCard} accent="emerald" />
                                        </div>
                                        {item.receiverImage && (
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">รูปหลักฐานการรับมอบ</p>
                                                <img src={item.receiverImage} alt="หลักฐาน" className="h-32 rounded-xl object-cover border-2 border-emerald-200 shadow-sm" />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* AI Tags */}
                                {(item.aiTags?.length > 0 || item.aiDescription) && (
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-emerald-50 border border-indigo-100 space-y-2">
                                        <div className="flex items-center gap-2 text-indigo-600">
                                            <Sparkles size={13} />
                                            <p className="text-[10px] font-black uppercase tracking-widest">AI วิเคราะห์</p>
                                        </div>
                                        {item.aiTags?.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {item.aiTags.map((tag, i) => (
                                                    <Badge key={i} variant="secondary" className="bg-white/80 border-indigo-100 text-indigo-700 text-xs">#{tag}</Badge>
                                                ))}
                                            </div>
                                        )}
                                        {item.aiDescription && (
                                            <p className="text-slate-600 text-xs italic leading-relaxed">"{item.aiDescription}"</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default AdminItemDetailModal;
