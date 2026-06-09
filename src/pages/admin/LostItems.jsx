import { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Phone, User as UserIcon, Camera, Image as ImageIcon, CheckCircle, Search, Filter, Calendar, AlertCircle, Loader2, Plus, MoreHorizontal, Eye, XCircle, FileText, QrCode } from "lucide-react";
import QRPrintModal from '@/components/QRPrintModal';
import { Textarea } from "@/components/ui/textarea";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api from '../../lib/axios';
import { useNavigate } from 'react-router-dom';

const AdminLostItems = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [resolveLoading, setResolveLoading] = useState(false);
    const [resolveData, setResolveData] = useState({
        receiverName: '',
        receiverIdCard: '',
        receiverPhone: '',
    });
    const [receiverImage, setReceiverImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
    const [notesItemId, setNotesItemId] = useState(null);
    const [notesValue, setNotesValue] = useState('');
    const [notesLoading, setNotesLoading] = useState(false);
    const [qrItem, setQrItem] = useState(null);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const navigate = useNavigate();

    const categoryOptions = [
        { value: "all", label: "ทุกหมวดหมู่" },
        { value: "electronics", label: "อุปกรณ์อิเล็กทรอนิกส์" },
        { value: "wallet", label: "กระเป๋าสตางค์/บัตร/กุญแจ" },
        { value: "clothing", label: "เสื้อผ้า/เครื่องแต่งกาย" },
        { value: "bag", label: "กระเป๋า/เป้" },
        { value: "jewelry", label: "เครื่องประดับ/นาฬิกา" },
        { value: "glasses", label: "แว่นตา" },
        { value: "documents", label: "เอกสารสำคัญ/พาสปอร์ต" },
        { value: "stationery", label: "เครื่องเขียน/หนังสือ" },
        { value: "health", label: "อุปกรณ์สุขภาพ/ยา" },
        { value: "pets", label: "สัตว์เลี้ยง/สิ่งมีชีวิต" },
        { value: "sports", label: "อุปกรณ์กีฬา/สันทการ" },
        { value: "music", label: "เครื่องดนตรี/ลำโพง/หูฟัง" },
        { value: "tools", label: "เครื่องมือ/อุปกรณ์ช่าง" },
        { value: "toy", label: "ของเล่น/ของสะสม" },
        { value: "others", label: "อื่นๆ" },
    ];

    const fetchLostItems = async () => {
        try {
            setLoading(true);
            const res = await api.get('items?type=lost&status=all');
            setItems(res.data);
        } catch (err) {
            console.error("Failed to fetch lost items", err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.put(`items/${id}`, { status: newStatus });
            fetchLostItems();
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    useEffect(() => {
        fetchLostItems();
    }, []);

    const filteredItems = items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              item.location.toLowerCase().includes(searchTerm.toLowerCase());
        
        let matchesDate = true;
        if (filterDate) {
            const itemDate = new Date(item.date).toISOString().split('T')[0];
            matchesDate = itemDate === filterDate;
        }

        const matchesCategory = filterCategory === 'all' || item.category === filterCategory;

        return matchesSearch && matchesDate && matchesCategory;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 shadow-sm font-bold animate-pulse">รออนุมัติ</Badge>;
            case 'rejected': return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200 shadow-sm font-medium">ปฏิเสธการเผยแพร่</Badge>;
            case 'open': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 shadow-sm">เผยแพร่แล้ว</Badge>;
            case 'resolved': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 shadow-sm">ส่งคืนสำเร็จ</Badge>;
            case 'closed': return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 shadow-sm">ปิดประกาศ</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handleNotesClick = (item) => {
        setNotesItemId(item._id);
        setNotesValue(item.notes || '');
        setIsNotesModalOpen(true);
    };

    const handleNotesSave = async () => {
        setNotesLoading(true);
        try {
            await api.put(`items/${notesItemId}`, { notes: notesValue });
            setIsNotesModalOpen(false);
            fetchLostItems();
        } catch (err) {
            alert('ไม่สามารถบันทึกหมายเหตุได้');
        } finally {
            setNotesLoading(false);
        }
    };

    const handleResolveClick = (id) => {
        setSelectedItemId(id);
        setIsResolveModalOpen(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setReceiverImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleResolveSubmit = async (e) => {
        e.preventDefault();
        if (!resolveData.receiverName || !resolveData.receiverIdCard || !resolveData.receiverPhone || !receiverImage) {
            alert('กรุณากรอกข้อมูลและอัปโหลดรูปภาพให้ครบถ้วน');
            return;
        }

        try {
            setResolveLoading(true);
            const formData = new FormData();
            formData.append('status', 'resolved');
            formData.append('receiverName', resolveData.receiverName);
            formData.append('receiverIdCard', resolveData.receiverIdCard);
            formData.append('receiverPhone', resolveData.receiverPhone);
            formData.append('receiverImage', receiverImage);

            await api.patch(`items/${selectedItemId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setIsResolveModalOpen(false);
            setResolveData({ receiverName: '', receiverIdCard: '', receiverPhone: '' });
            setReceiverImage(null);
            setImagePreview(null);
            fetchLostItems();
        } catch (err) {
            console.error("Resolve failed", err);
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        } finally {
            setResolveLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto font-sans pb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-4">
                        <div className="p-2.5 bg-rose-100 rounded-2xl shadow-sm">
                            <AlertCircle className="text-rose-600 h-7 w-7" />
                        </div>
                        จัดการของหาย (Lost Items)
                    </h2>
                    <p className="text-slate-500 mt-2 ml-1">รายการแจ้งของหายทั้งหมดที่ต้องการความช่วยเหลือในระบบ</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
                {/* Toolbar */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
                        <div className="relative w-full sm:w-80 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                            <Input
                                placeholder="ค้นหาชื่อของหาย หรือ สถานที่..."
                                className="pl-10 h-11 bg-white border-slate-200 focus-visible:ring-rose-500/20 shadow-sm rounded-xl font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative w-full sm:w-48 group">
                            <Input
                                type="date"
                                className="h-11 bg-white border-slate-200 focus-visible:ring-rose-500/20 shadow-sm rounded-xl font-medium"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                            />
                            {filterDate && (
                                <button 
                                    onClick={() => setFilterDate('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <XCircle className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <div className="relative w-full sm:w-48 group">
                            <Select value={filterCategory} onValueChange={setFilterCategory}>
                                <SelectTrigger className="h-11 bg-white border-slate-200 focus-visible:ring-rose-500/20 shadow-sm rounded-xl font-medium">
                                    <SelectValue placeholder="เลือกหมวดหมู่" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categoryOptions.map(cat => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            onClick={fetchLostItems}
                            className="gap-2 bg-white text-slate-600 hover:text-rose-600 border-slate-200 h-11 rounded-xl px-5 transition-all"
                        >
                            รีเฟรชข้อมูล
                        </Button>
                        <Button
                            onClick={() => navigate('/report/lost')}
                            className="gap-2 bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200 h-11 rounded-xl px-5 transition-all font-bold"
                        >
                            <Plus size={18} /> เพิ่มรายการของหาย
                        </Button>
                    </div>
                </div>

                <div className="relative w-full overflow-auto">
                    {loading ? (
                        <div className="p-20 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-rose-500" />
                            <p className="text-slate-400 font-medium">กำลังโหลดข้อมูลจริง...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-md">
                                <TableRow className="hover:bg-transparent border-slate-200 h-14">
                                    <TableHead className="font-bold text-slate-800 px-6">รายการ</TableHead>
                                    <TableHead className="font-bold text-slate-800">หมวดหมู่</TableHead>
                                    <TableHead className="font-bold text-slate-800">ผู้แจ้ง</TableHead>
                                    <TableHead className="font-bold text-slate-800">สถานที่</TableHead>
                                    <TableHead className="font-bold text-slate-800">หมายเหตุ</TableHead>
                                    <TableHead className="font-bold text-slate-800">สถานะ</TableHead>
                                    <TableHead className="text-right font-bold text-slate-800 pr-6">จัดการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-60 text-center text-slate-400 font-medium">ไม่พบรายการแจ้งของหายในขณะนี้</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredItems.map((item) => (
                                        <TableRow key={item._id} className="hover:bg-slate-50/50 transition-all border-b border-slate-100 last:border-0 h-20">
                                            <TableCell className="px-6">
                                                <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate(`/item/${item._id}`)}>
                                                    <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 shrink-0">
                                                        <img src={item.images?.[0] || 'https://via.placeholder.com/150'} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex flex-col py-1 overflow-hidden">
                                                        <span className="font-bold text-slate-900 text-[15px] truncate max-w-[200px]">{item.title}</span>
                                                        <span className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                                                            <Calendar size={12} className="text-slate-300" />
                                                            {new Date(item.date).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell><Badge variant="outline" className="text-slate-500 bg-slate-50 border-slate-200 py-1 capitalize px-3">{item.category}</Badge></TableCell>
                                            <TableCell>
                                                <div className="flex flex-col py-1 gap-1">
                                                    <div className="flex items-center gap-2.5">
                                                        <Avatar className="h-7 w-7 border border-slate-100 shadow-sm shrink-0">
                                                            <AvatarImage src={item.user && typeof item.user === 'object' ? item.user.avatar : ''} />
                                                            <AvatarFallback className="text-[10px] bg-rose-50 text-rose-600 font-bold">
                                                                {item.user && typeof item.user === 'object' && item.user.firstname 
                                                                    ? item.user.firstname.charAt(0) 
                                                                    : 'U'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-slate-800 leading-none">
                                                                {item.user && typeof item.user === 'object' && item.user.firstname 
                                                                    ? `${item.user.firstname} ${item.user.lastname || ''}`.trim() 
                                                                    : 'ไม่ระบุชื่อ'}
                                                            </span>
                                                            {item.user && typeof item.user === 'object' && item.user.email && (
                                                                <span className="text-[11px] text-slate-400 mt-0.5">{item.user.email}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                                        {item.reporterPhone && (
                                                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 rounded-lg px-2 py-0.5 w-fit flex items-center gap-1">
                                                                <Phone size={10} className="text-slate-400" />
                                                                {item.reporterPhone}
                                                            </span>
                                                        )}
                                                        {item.reporterIdCard && (
                                                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 rounded-lg px-2 py-0.5 w-fit flex items-center gap-1">
                                                                บัตร: {item.reporterIdCard}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-600 text-sm font-medium"><div className="truncate max-w-[150px]">{item.location}</div></TableCell>
                                            <TableCell>
                                                {item.notes ? (
                                                    <div className="max-w-[160px] text-xs text-slate-600 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1 truncate cursor-pointer hover:bg-amber-100 transition-colors" onClick={() => handleNotesClick(item)} title={item.notes}>
                                                        {item.notes}
                                                    </div>
                                                ) : (
                                                    <button onClick={() => handleNotesClick(item)} className="text-xs text-slate-400 hover:text-amber-600 flex items-center gap-1 transition-colors">
                                                        <FileText size={12} /> เพิ่มหมายเหตุ
                                                    </button>
                                                )}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                                            <TableCell className="text-right pr-6">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-10 w-10 p-0 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors">
                                                            <MoreHorizontal className="h-5 w-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-slate-200">
                                                        <DropdownMenuLabel className="font-bold text-slate-500">จัดการข้อมูล</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="cursor-pointer py-2.5" onClick={() => navigate(`/item/${item._id}`)}>
                                                            <Eye className="mr-2.5 h-4 w-4 text-slate-400" /> ดูรายละเอียด
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="cursor-pointer py-2.5 text-amber-600 font-bold focus:text-amber-700 focus:bg-amber-50" onClick={() => handleNotesClick(item)}>
                                                            <FileText className="mr-2.5 h-4 w-4" /> กรอกหมายเหตุ
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="cursor-pointer py-2.5 text-indigo-600 font-bold focus:text-indigo-700 focus:bg-indigo-50" onClick={() => { setQrItem(item); setIsQrModalOpen(true); }}>
                                                            <QrCode className="mr-2.5 h-4 w-4" /> พิมพ์ QR Code
                                                        </DropdownMenuItem>
                                                        
                                                        {item.status === 'pending' && (
                                                            <>
                                                                <DropdownMenuItem className="cursor-pointer py-2.5 text-emerald-600 font-bold focus:text-emerald-700 focus:bg-emerald-50" onClick={() => handleStatusUpdate(item._id, 'open')}>
                                                                    <CheckCircle className="mr-2.5 h-4 w-4" /> อนุมัติเผยแพร่
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="cursor-pointer py-2.5 text-rose-600 font-bold focus:text-rose-700 focus:bg-rose-50" onClick={() => handleStatusUpdate(item._id, 'rejected')}>
                                                                    <XCircle className="mr-2.5 h-4 w-4" /> ปฏิเสธโพสต์
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}

                                                        {item.status === 'open' && (
                                                            <DropdownMenuItem className="cursor-pointer py-2.5 text-emerald-600 font-bold focus:text-emerald-700 focus:bg-emerald-50" onClick={() => handleResolveClick(item._id)}>
                                                                <CheckCircle className="mr-2.5 h-4 w-4" /> ปิดรับ (ส่งคืนสำเร็จ)
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>

            {/* Resolve Modal (Identity Verification) */}
            <Dialog open={isResolveModalOpen} onOpenChange={setIsResolveModalOpen}>
                <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-slate-900 p-6 text-center text-white relative">
                        <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
                        <div className="bg-blue-500 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-900/40">
                            <CheckCircle size={24} />
                        </div>
                        <DialogTitle className="text-2xl font-black mb-2">บันทึกการส่งคืนสำเร็จ</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            กรุณากรอกข้อมูลผู้รับสิ่งของเพื่อเป็นหลักฐานในระบบ
                        </DialogDescription>
                    </div>

                    <form onSubmit={handleResolveSubmit} className="p-6 bg-white space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="receiverName" className="text-xs font-black uppercase tracking-widest text-slate-500">ชื่อ-นามสกุลผู้มารับ</Label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input 
                                    id="receiverName"
                                    placeholder="ชื่อและนามสกุล"
                                    className="pl-10 h-10 bg-slate-50 border-slate-200 rounded-xl"
                                    value={resolveData.receiverName}
                                    onChange={(e) => setResolveData({...resolveData, receiverName: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="receiverIdCard" className="text-xs font-black uppercase tracking-widest text-slate-500">เลขบัตรประชาชนผู้มารับ</Label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input 
                                    id="receiverIdCard"
                                    placeholder="กรอกเลข 13 หลัก"
                                    className="pl-10 h-10 bg-slate-50 border-slate-200 rounded-xl"
                                    value={resolveData.receiverIdCard}
                                    onChange={(e) => setResolveData({...resolveData, receiverIdCard: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="receiverPhone" className="text-xs font-black uppercase tracking-widest text-slate-500">เบอร์โทรศัพท์ติดต่อ</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input 
                                    id="receiverPhone"
                                    placeholder="08X-XXX-XXXX"
                                    className="pl-10 h-10 bg-slate-50 border-slate-200 rounded-xl"
                                    value={resolveData.receiverPhone}
                                    onChange={(e) => setResolveData({...resolveData, receiverPhone: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">รูปถ่ายหลักฐานการรับมอบ</Label>
                            <div 
                                onClick={() => document.getElementById('receiverImage').click()}
                                className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center cursor-pointer hover:bg-slate-50 transition-all overflow-hidden h-24 flex flex-col items-center justify-center gap-2"
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} className="w-full h-full object-cover rounded-lg" alt="Preview" />
                                ) : (
                                    <>
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                            <Camera size={20} />
                                        </div>
                                        <p className="text-xs font-bold text-slate-400">คลิกเพื่ออัปโหลดรูปถ่าย</p>
                                    </>
                                )}
                            </div>
                            <input 
                                id="receiverImage" 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleImageChange}
                                required 
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button 
                                type="button" 
                                variant="outline" 
                                className="flex-1 h-10 rounded-xl font-bold"
                                onClick={() => setIsResolveModalOpen(false)}
                            >
                                ยกเลิก
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={resolveLoading}
                                className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200"
                            >
                                {resolveLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'ยืนยันปิดรายการ'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
            {/* Notes Modal */}
            <Dialog open={isNotesModalOpen} onOpenChange={setIsNotesModalOpen}>
                <DialogContent className="max-w-sm rounded-2xl border-none shadow-2xl">
                    <DialogHeader>
                        <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-2">
                            <FileText className="h-6 w-6 text-amber-600" />
                        </div>
                        <DialogTitle className="text-center text-xl font-black text-slate-800">หมายเหตุรายการ</DialogTitle>
                        <DialogDescription className="text-center text-slate-500 text-sm">
                            บันทึกหมายเหตุภายในสำหรับเจ้าหน้าที่
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 mt-2">
                        <Textarea
                            placeholder="กรอกหมายเหตุ เช่น สถานะการติดตาม, ข้อสังเกตพิเศษ, การติดต่อ..."
                            className="h-32 resize-none border-slate-200 rounded-xl"
                            value={notesValue}
                            onChange={(e) => setNotesValue(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-3 mt-4">
                        <Button variant="outline" className="flex-1 font-bold rounded-xl" onClick={() => setIsNotesModalOpen(false)}>ยกเลิก</Button>
                        <Button onClick={handleNotesSave} disabled={notesLoading} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl">
                            {notesLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'บันทึกหมายเหตุ'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <QRPrintModal item={qrItem} open={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} />
        </div>
    );
};

export default AdminLostItems;
