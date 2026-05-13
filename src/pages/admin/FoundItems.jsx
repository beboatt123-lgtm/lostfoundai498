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
import { Phone, User as UserIcon, Camera, Image as ImageIcon, CheckCircle, Search, Filter, Calendar, ShieldCheck, Loader2, Plus, MoreHorizontal, Eye } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api from '../../lib/axios';
import { useNavigate } from 'react-router-dom';

const AdminFoundItems = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [resolveLoading, setResolveLoading] = useState(false);
    const [resolveData, setResolveData] = useState({
        receiverIdCard: '',
        receiverPhone: '',
    });
    const [receiverImage, setReceiverImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const navigate = useNavigate();

    const fetchFoundItems = async () => {
        try {
            setLoading(true);
            const res = await api.get('/items?type=found');
            setItems(res.data);
        } catch (err) {
            console.error("Failed to fetch found items", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFoundItems();
    }, []);

    const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status) => {
        switch (status) {
            case 'open': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 shadow-sm">กำลังประกาศเจอ</Badge>;
            case 'resolved': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 shadow-sm">จับคู่แล้ว / คืนแล้ว</Badge>;
            case 'closed': return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 shadow-sm">ปิดประกาศ</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
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
        if (!resolveData.receiverIdCard || !resolveData.receiverPhone || !receiverImage) {
            alert('กรุณากรอกข้อมูลและอัปโหลดรูปภาพให้ครบถ้วน');
            return;
        }

        try {
            setResolveLoading(true);
            const formData = new FormData();
            formData.append('status', 'resolved');
            formData.append('receiverIdCard', resolveData.receiverIdCard);
            formData.append('receiverPhone', resolveData.receiverPhone);
            formData.append('receiverImage', receiverImage);

            await api.patch(`/items/${selectedItemId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setIsResolveModalOpen(false);
            setResolveData({ receiverIdCard: '', receiverPhone: '' });
            setReceiverImage(null);
            setImagePreview(null);
            fetchFoundItems();
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
                        <div className="p-2.5 bg-emerald-100 rounded-2xl shadow-sm">
                            <ShieldCheck className="text-emerald-600 h-7 w-7" />
                        </div>
                        จัดการของที่พบ (Found Items)
                    </h2>
                    <p className="text-slate-500 mt-2 ml-1">รายการสิ่งของที่ถูกพบและแจ้งในระบบ รอส่งคืนเจ้าของ</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
                {/* Toolbar */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <Input
                            placeholder="ค้นหาชื่องของที่แจ้งพบ หรือ สถานที่..."
                            className="pl-10 h-11 bg-white border-slate-200 focus-visible:ring-emerald-500/20 shadow-sm rounded-xl font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            onClick={fetchFoundItems}
                            className="gap-2 bg-white text-slate-600 hover:text-emerald-600 border-slate-200 h-11 rounded-xl px-5 transition-all"
                        >
                            รีเฟรชข้อมูล
                        </Button>
                        <Button
                            onClick={() => navigate('/report/found')}
                            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 h-11 rounded-xl px-5 transition-all font-bold"
                        >
                            <Plus size={18} /> เพิ่มรายการที่พบ
                        </Button>
                    </div>
                </div>

                <div className="relative w-full overflow-auto">
                    {loading ? (
                        <div className="p-20 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
                            <p className="text-slate-400 font-medium">กำลังโหลดข้อมูลจริง...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-md">
                                <TableRow className="hover:bg-transparent border-slate-200 h-14">
                                    <TableHead className="font-bold text-slate-800 px-6">รายการ</TableHead>
                                    <TableHead className="font-bold text-slate-800">หมวดหมู่</TableHead>
                                    <TableHead className="font-bold text-slate-800">ผู้พบ</TableHead>
                                    <TableHead className="font-bold text-slate-800">สถานที่</TableHead>
                                    <TableHead className="font-bold text-slate-800">สถานะ</TableHead>
                                    <TableHead className="text-right font-bold text-slate-800 pr-6">จัดการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-60 text-center text-slate-400 font-medium">ไม่มีรายการแจ้งเจอของในระบบ</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredItems.map((item) => (
                                        <TableRow key={item._id} className="hover:bg-slate-50/50 transition-all border-b border-slate-100 last:border-0 h-20">
                                            <TableCell className="px-6">
                                                <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate(`/items/${item._id}`)}>
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
                                                <div className="flex items-center gap-2.5">
                                                    <Avatar className="h-7 w-7 border border-slate-100 shadow-sm">
                                                        <AvatarImage src={item.user?.avatar} />
                                                        <AvatarFallback className="text-[10px] bg-emerald-50 text-emerald-600 font-bold">{item.user?.firstname?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm font-bold text-slate-700">{item.user?.firstname}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-600 text-sm font-medium"><div className="truncate max-w-[150px]">{item.location}</div></TableCell>
                                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                                            <TableCell className="text-right pr-6">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-10 w-10 p-0 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors">
                                                            <MoreHorizontal className="h-5 w-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-slate-200">
                                                        <DropdownMenuLabel className="font-bold text-slate-500">จัดการข้อมูล</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="cursor-pointer py-2.5" onClick={() => navigate(`/items/${item._id}`)}>
                                                            <Eye className="mr-2.5 h-4 w-4 text-slate-400" /> ดูรายละเอียดจริง
                                                        </DropdownMenuItem>
                                                        {item.status === 'open' && (
                                                            <DropdownMenuItem className="cursor-pointer py-2.5 text-blue-600 font-bold focus:text-blue-700 focus:bg-blue-50" onClick={() => handleResolveClick(item._id)}>
                                                                <CheckCircle className="mr-2.5 h-4 w-4" /> บันทึกการส่งคืนสำเร็จ
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
                    <div className="bg-slate-900 p-8 text-center text-white relative">
                        <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
                        <div className="bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/40">
                            <CheckCircle size={32} />
                        </div>
                        <DialogTitle className="text-2xl font-black mb-2">บันทึกการส่งคืนสำเร็จ</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            กรุณากรอกข้อมูลผู้รับสิ่งของเพื่อเป็นหลักฐานในระบบ
                        </DialogDescription>
                    </div>

                    <form onSubmit={handleResolveSubmit} className="p-8 bg-white space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="receiverIdCard" className="text-xs font-black uppercase tracking-widest text-slate-500">เลขบัตรประชาชนผู้มารับ</Label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input 
                                    id="receiverIdCard"
                                    placeholder="กรอกเลข 13 หลัก"
                                    className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl"
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
                                    className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl"
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
                                className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center cursor-pointer hover:bg-slate-50 transition-all overflow-hidden aspect-video flex flex-col items-center justify-center gap-2"
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} className="w-full h-full object-cover rounded-lg" alt="Preview" />
                                ) : (
                                    <>
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                            <Camera size={24} />
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
                                className="flex-1 h-12 rounded-xl font-bold"
                                onClick={() => setIsResolveModalOpen(false)}
                            >
                                ยกเลิก
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={resolveLoading}
                                className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200"
                            >
                                {resolveLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'ยืนยันบันทึกการส่งคืน'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminFoundItems;
