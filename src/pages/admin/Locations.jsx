import { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    MapPin, 
    Plus, 
    Search, 
    Loader2, 
    MoreHorizontal, 
    Edit, 
    Trash2, 
    CheckCircle2, 
    XCircle 
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from '../../lib/axios';

const AdminLocations = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isActive: true
    });
    const [submitLoading, setSubmitLoading] = useState(false);

    const fetchLocations = async () => {
        try {
            setLoading(true);
            const res = await api.get('locations/admin');
            setLocations(res.data);
        } catch (err) {
            console.error("Failed to fetch locations", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    const handleOpenModal = (mode, location = null) => {
        setModalMode(mode);
        if (mode === 'edit' && location) {
            setSelectedLocation(location);
            setFormData({
                name: location.name,
                description: location.description || '',
                isActive: location.isActive
            });
        } else {
            setSelectedLocation(null);
            setFormData({ name: '', description: '', isActive: true });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitLoading(true);
            if (modalMode === 'add') {
                await api.post('locations', formData);
            } else {
                await api.put(`locations/${selectedLocation._id}`, formData);
            }
            setIsModalOpen(false);
            fetchLocations();
        } catch (err) {
            console.error("Failed to save location", err);
            alert(err.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('คุณต้องการลบสถานที่นี้ใช่หรือไม่?')) {
            try {
                await api.delete(`locations/${id}`);
                fetchLocations();
            } catch (err) {
                console.error("Failed to delete location", err);
                alert("ไม่สามารถลบข้อมูลได้");
            }
        }
    };

    const filteredLocations = locations.filter(loc =>
        loc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-5xl mx-auto font-sans pb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-4">
                        <div className="p-2.5 bg-blue-100 rounded-2xl shadow-sm">
                            <MapPin className="text-blue-600 h-7 w-7" />
                        </div>
                        จัดการสถานที่ (Locations)
                    </h2>
                    <p className="text-slate-500 mt-2 ml-1">จัดการรายชื่อสถานที่หลักสำหรับเลือกในระบบแจ้งของหาย</p>
                </div>
                <Button 
                    onClick={() => handleOpenModal('add')}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-6 font-bold shadow-lg shadow-blue-200 gap-2"
                >
                    <Plus size={20} /> เพิ่มสถานที่ใหม่
                </Button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
                {/* Toolbar */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="ค้นหาชื่อสถานที่..."
                            className="pl-10 h-11 bg-white border-slate-200 focus-visible:ring-blue-500/20 shadow-sm rounded-xl font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="relative w-full overflow-auto">
                    {loading ? (
                        <div className="p-20 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                            <p className="text-slate-400 font-medium">กำลังโหลดรายชื่อสถานที่...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-md">
                                <TableRow className="hover:bg-transparent border-slate-200 h-14">
                                    <TableHead className="font-bold text-slate-800 px-6">ชื่อสถานที่</TableHead>
                                    <TableHead className="font-bold text-slate-800">คำอธิบาย</TableHead>
                                    <TableHead className="font-bold text-slate-800">สถานะ</TableHead>
                                    <TableHead className="text-right font-bold text-slate-800 pr-6">จัดการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLocations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-60 text-center text-slate-400 font-medium">ยังไม่มีข้อมูลสถานที่ในระบบ</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLocations.map((loc) => (
                                        <TableRow key={loc._id} className="hover:bg-slate-50/50 transition-all border-b border-slate-100 last:border-0 h-16">
                                            <TableCell className="px-6 font-bold text-slate-900">{loc.name}</TableCell>
                                            <TableCell className="text-slate-500 text-sm">{loc.description || '-'}</TableCell>
                                            <TableCell>
                                                {loc.isActive ? (
                                                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs bg-emerald-50 w-fit px-2.5 py-1 rounded-full border border-emerald-100">
                                                        <CheckCircle2 size={12} /> เปิดใช้งาน
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs bg-slate-50 w-fit px-2.5 py-1 rounded-full border border-slate-100">
                                                        <XCircle size={12} /> ปิดใช้งาน
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-9 w-9 p-0 text-slate-400 hover:text-slate-900 rounded-full transition-colors">
                                                            <MoreHorizontal className="h-5 w-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl border-slate-200">
                                                        <DropdownMenuLabel className="font-bold text-slate-500">จัดการข้อมูล</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="cursor-pointer py-2.5" onClick={() => handleOpenModal('edit', loc)}>
                                                            <Edit className="mr-2.5 h-4 w-4 text-blue-500" /> แก้ไขข้อมูล
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="cursor-pointer py-2.5 text-rose-600 focus:text-rose-700 focus:bg-rose-50" onClick={() => handleDelete(loc._id)}>
                                                            <Trash2 className="mr-2.5 h-4 w-4" /> ลบสถานที่
                                                        </DropdownMenuItem>
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

            {/* Add/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md rounded-3xl p-8 border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">{modalMode === 'add' ? 'เพิ่มสถานที่ใหม่' : 'แก้ไขข้อมูลสถานที่'}</DialogTitle>
                        <DialogDescription>ระบุชื่อสถานที่เพื่อแสดงให้ผู้ใช้งานเลือกในระบบ</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-slate-500">ชื่อสถานที่ (เช่น ตึก A6)</Label>
                            <Input 
                                id="name"
                                placeholder="เช่น ตึก A6 ชั้น 1"
                                className="h-12 bg-slate-50 border-slate-200 rounded-xl font-bold"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-slate-500">คำอธิบายเพิ่มเติม (ถ้ามี)</Label>
                            <Input 
                                id="description"
                                placeholder="คำอธิบายสั้นๆ..."
                                className="h-12 bg-slate-50 border-slate-200 rounded-xl"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <input 
                                type="checkbox" 
                                id="isActive"
                                className="w-5 h-5 rounded-md accent-blue-600 cursor-pointer"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                            />
                            <Label htmlFor="isActive" className="font-bold text-slate-700 cursor-pointer">เปิดใช้งานสถานที่นี้</Label>
                        </div>

                        <DialogFooter className="gap-3 pt-4 sm:justify-between">
                            <Button 
                                type="button" 
                                variant="outline" 
                                className="flex-1 h-12 rounded-xl font-bold"
                                onClick={() => setIsModalOpen(false)}
                            >
                                ยกเลิก
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={submitLoading}
                                className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200"
                            >
                                {submitLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'บันทึกข้อมูล'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminLocations;
