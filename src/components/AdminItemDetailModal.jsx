import { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Loader2, MapPin, Calendar, Clock, Phone, CreditCard,
    Warehouse, Sparkles, CheckCircle2, User as UserIcon,
    AlertCircle, Package
} from 'lucide-react';
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
    pending:  { label: 'รออนุมัติ',       cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    open:     { label: 'เผยแพร่แล้ว',     cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    resolved: { label: 'ส่งคืนสำเร็จ',   cls: 'bg-blue-100 text-blue-700 border-blue-200' },
    closed:   { label: 'ปิดประกาศ',       cls: 'bg-slate-100 text-slate-700 border-slate-200' },
    rejected: { label: 'ปฏิเสธ',          cls: 'bg-rose-100 text-rose-700 border-rose-200' },
};

const chipColors = {
    slate:   { wrap: 'bg-slate-50 border-slate-100',   icon: 'text-slate-500',   label: 'text-slate-400',   val: 'text-slate-900' },
    indigo:  { wrap: 'bg-indigo-50 border-indigo-100', icon: 'text-indigo-500',  label: 'text-indigo-400',  val: 'text-indigo-900' },
    emerald: { wrap: 'bg-emerald-50 border-emerald-100', icon: 'text-emerald-500', label: 'text-emerald-400', val: 'text-emerald-900' },
};

const Chip = ({ icon: Icon, label, value, color = 'slate' }) => {
    const c = chipColors[color] || chipColors.slate;
    return (
        <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border ${c.wrap}`}>
            <Icon size={15} className={`${c.icon} shrink-0`} />
            <div className="min-w-0">
                <p className={`text-[10px] font-black uppercase tracking-wider leading-none mb-0.5 ${c.label}`}>{label}</p>
                <p className={`text-sm font-bold leading-snug truncate ${c.val}`}>{value || '—'}</p>
            </div>
        </div>
    );
};

const AdminItemDetailModal = ({ itemId, open, onClose }) => {
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeImg, setActiveImg] = useState(0);

    useEffect(() => {
        if (!open || !itemId) return;
        setLoading(true);
        setActiveImg(0);
        setItem(null);
        api.get(`/items/${itemId}`)
            .then(res => setItem(res.data))
            .catch(() => setItem(null))
            .finally(() => setLoading(false));
    }, [open, itemId]);

    const isLost = item?.type === 'lost';

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[92vh] overflow-hidden flex flex-col p-0 border-none rounded-2xl shadow-2xl">
                <DialogTitle className="sr-only">รายละเอียดสิ่งของ</DialogTitle>
                <DialogDescription className="sr-only">ข้อมูลสิ่งของในระบบ Lost & Found</DialogDescription>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                    </div>
                )}

                {!loading && !item && (
                    <div className="flex items-center justify-center h-64 text-slate-400 font-medium">
                        ไม่พบข้อมูลรายการนี้
                    </div>
                )}

                {!loading && item && (
                    <div className="flex-1 overflow-y-auto">

                        {/* Hero image + overlay header */}
                        <div className="relative">
                            <div className="w-full aspect-[16/7] bg-slate-100 overflow-hidden">
                                <img
                                    src={item.images?.[activeImg] || 'https://via.placeholder.com/800x400?text=No+Image'}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            </div>

                            {/* Thumbnails */}
                            {item.images?.length > 1 && (
                                <div className="absolute bottom-3 left-4 flex gap-2">
                                    {item.images.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImg(i)}
                                            className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${activeImg === i ? 'border-white scale-110' : 'border-white/30 opacity-60 hover:opacity-90'}`}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Badges overlay */}
                            <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                                <Badge className={`${statusMap[item.status]?.cls} border font-bold shadow-sm`}>
                                    {statusMap[item.status]?.label || item.status}
                                </Badge>
                                <Badge className={`${isLost ? 'bg-rose-600' : 'bg-emerald-600'} text-white font-bold shadow-sm`}>
                                    {isLost ? 'ของหาย' : 'พบสิ่งของ'}
                                </Badge>
                            </div>

                            {/* Title overlay */}
                            <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
                                <p className="text-white font-black text-xl leading-tight drop-shadow">{item.title}</p>
                                <p className="text-white/70 text-xs font-medium mt-0.5">
                                    {item.customId} · {categories[item.category] || item.category}
                                </p>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-5 space-y-5">

                            {/* Description */}
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">รายละเอียดสิ่งของ</p>
                                <p className="text-slate-700 text-sm leading-relaxed font-medium">{item.description}</p>
                            </div>

                            {item.notes && (
                                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1">หมายเหตุ</p>
                                    <p className="text-slate-700 text-sm leading-relaxed font-medium">{item.notes}</p>
                                </div>
                            )}

                            {/* Location + Date */}
                            <div className="grid grid-cols-2 gap-3">
                                <Chip icon={MapPin} label="สถานที่หลัก" value={item.locationMain} color="slate" />
                                {item.locationDetail
                                    ? <Chip icon={MapPin} label="รายละเอียดสถานที่" value={item.locationDetail} color="slate" />
                                    : <Chip icon={Calendar} label={isLost ? 'วันที่คิดว่าหาย' : 'วันที่พบ'} value={new Date(item.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })} color="slate" />
                                }
                                {item.locationDetail && (
                                    <Chip icon={Calendar} label={isLost ? 'วันที่คิดว่าหาย' : 'วันที่พบ'} value={new Date(item.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })} color="slate" />
                                )}
                                {item.timePeriod && (
                                    <Chip icon={Clock} label="ช่วงเวลา" value={item.timePeriod} color="slate" />
                                )}
                            </div>

                            {/* Admin info */}
                            <div className="rounded-xl border border-indigo-100 overflow-hidden">
                                <div className="bg-indigo-50 px-4 py-2.5 flex items-center gap-2">
                                    <Package size={14} className="text-indigo-500" />
                                    <p className="text-xs font-black uppercase tracking-widest text-indigo-500">ข้อมูลสำหรับเจ้าหน้าที่</p>
                                </div>
                                <div className="p-4 grid grid-cols-2 gap-3">
                                    <Chip icon={CreditCard} label="เลขบัตรประชาชน" value={item.reporterIdCard} color="indigo" />
                                    <Chip icon={Phone} label="เบอร์โทรศัพท์" value={item.reporterPhone} color="indigo" />
                                    <Chip icon={Warehouse} label="ตำแหน่งจัดเก็บ" value={item.storagePosition || 'ไม่ได้ระบุ'} color="indigo" />
                                    <Chip icon={Calendar} label="วันที่แจ้ง" value={new Date(item.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })} color="indigo" />
                                </div>
                            </div>

                            {/* Reporter */}
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <Avatar className="h-10 w-10 border-2 border-white shadow-sm shrink-0">
                                    <AvatarImage src={item.user?.avatar} />
                                    <AvatarFallback className="bg-slate-200 text-slate-600 font-bold">
                                        {item.user?.firstname?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">ผู้แจ้ง</p>
                                    <p className="font-bold text-slate-800 text-sm">{item.user?.firstname} {item.user?.lastname}</p>
                                    <p className="text-xs text-slate-400">{item.user?.email}</p>
                                </div>
                            </div>

                            {/* Resolved info */}
                            {item.status === 'resolved' && (
                                <div className="rounded-xl border border-emerald-100 overflow-hidden">
                                    <div className="bg-emerald-50 px-4 py-2.5 flex items-center gap-2">
                                        <CheckCircle2 size={14} className="text-emerald-600" />
                                        <p className="text-xs font-black uppercase tracking-widest text-emerald-600">ข้อมูลการส่งคืนสำเร็จ</p>
                                    </div>
                                    <div className="p-4 grid grid-cols-3 gap-3">
                                        <Chip icon={UserIcon} label="ชื่อผู้รับ" value={item.receiverName} color="emerald" />
                                        <Chip icon={Phone} label="เบอร์โทร" value={item.receiverPhone} color="emerald" />
                                        <Chip icon={CreditCard} label="เลขบัตร" value={item.receiverIdCard} color="emerald" />
                                    </div>
                                    {item.receiverImage && (
                                        <div className="px-4 pb-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">รูปหลักฐานการรับมอบ</p>
                                            <img src={item.receiverImage} alt="หลักฐาน" className="h-36 rounded-xl object-cover border-2 border-emerald-100 shadow-sm" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* AI Tags */}
                            {(item.aiTags?.length > 0 || item.aiDescription) && (
                                <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 space-y-3">
                                    <div className="flex items-center gap-2 text-violet-600">
                                        <Sparkles size={14} />
                                        <p className="text-[10px] font-black uppercase tracking-widest">AI วิเคราะห์สิ่งของ</p>
                                    </div>
                                    {item.aiTags?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {item.aiTags.map((tag, i) => (
                                                <Badge key={i} variant="secondary" className="bg-white/80 border-violet-100 text-violet-700 text-xs font-semibold">
                                                    #{tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                    {item.aiDescription && (
                                        <p className="text-slate-500 text-xs italic leading-relaxed">"{item.aiDescription}"</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default AdminItemDetailModal;
