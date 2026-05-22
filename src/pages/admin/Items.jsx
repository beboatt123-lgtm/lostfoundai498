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
    MoreHorizontal,
    Eye,
    CheckCircle,
    Trash2,
    Search,
    Filter,
    Download,
    Shield,
    Calendar,
    MapPin,
    XCircle
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";

const AdminItems = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchItems = async () => {
        try {
            const res = await api.get('/items', {
                params: { search, status: 'all' }
            });
            setItems(res.data);
        } catch (err) {
            console.error('Failed to fetch items:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [search]);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.put(`/items/${id}`, { status: newStatus });
            fetchItems();
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) {
            try {
                await api.delete(`/items/${id}`);
                setItems(prev => prev.filter(item => item._id !== id));
            } catch (err) {
                console.error('Failed to delete item:', err);
            }
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 shadow-sm font-bold animate-pulse">รออนุมัติ</Badge>;
            case 'rejected': return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200 shadow-sm font-medium">ปฏิเสธการเผยแพร่</Badge>;
            case 'resolved': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 shadow-sm font-medium">สำเร็จแล้ว</Badge>;
            case 'closed': return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 shadow-sm font-medium">ปิดรายการ</Badge>;
            case 'open': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 shadow-sm font-medium">เผยแพร่แล้ว (กำลังดำเนินการ)</Badge>;
            default: return <Badge variant="outline" className="text-slate-600 border-slate-300 font-medium">{status}</Badge>;
        }
    };

    const getTypeBadge = (type) => {
        return type === 'lost'
            ? <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 font-bold">แจ้งหาย</Badge>
            : <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">เจอของ</Badge>;
    };

    const handleExport = async () => {
        try {
            const response = await api.get('/items/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'lostfound_report.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Export failed:', err);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto font-sans">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">จัดการรายการทั้งหมด</h2>
                    <p className="text-slate-500 mt-1">บริหารจัดการรายการแจ้งหายและพบสิ่งของทั้งหมดในระบบ</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleExport} variant="outline" className="gap-2 bg-white hover:bg-slate-50 border-slate-300 shadow-sm text-slate-700 font-bold">
                        <Download size={16} /> Export to Excel
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-200/40 overflow-hidden">

                {/* Toolbar */}
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <Input
                            placeholder="ค้นหา ID, ชื่อของ, สถานที่..."
                            className="pl-10 bg-white border-slate-200 focus-visible:ring-emerald-500/20 shadow-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="relative w-full overflow-auto">
                    <Table>
                        <TableHeader className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
                            <TableRow className="hover:bg-transparent border-slate-200">
                                <TableHead className="w-[140px] font-bold text-slate-700 uppercase tracking-wider text-[10px]">Unique ID</TableHead>
                                <TableHead className="font-bold text-slate-700 min-w-[180px]">รายละเอียดสิ่งของ</TableHead>
                                <TableHead className="font-bold text-slate-700">ประเภท</TableHead>
                                <TableHead className="font-bold text-slate-700">ผู้รายงาน</TableHead>
                                <TableHead className="font-bold text-slate-700">สถานที่</TableHead>
                                <TableHead className="font-bold text-slate-700">ตำแหน่งเก็บ</TableHead>
                                <TableHead className="font-bold text-slate-700">สถานะ</TableHead>
                                <TableHead className="text-right font-bold text-slate-700">จัดการ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-20 text-slate-400 font-medium">ไม่พบรายการข้อมูล</TableCell>
                                </TableRow>
                            )}
                            {items.map((item) => (
                                <TableRow key={item._id} className="hover:bg-slate-50 transition-all border-b border-slate-100 last:border-0 group cursor-pointer">
                                    <TableCell className="font-mono text-[11px] font-black text-emerald-600">
                                        {item.customId || `#ID${item._id.substring(0, 8)}`}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col py-1">
                                            <span className="font-bold text-slate-800 text-sm">{item.title}</span>
                                            <span className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                                <Calendar size={10} /> {new Date(item.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getTypeBadge(item.type)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-0.5 py-1">
                                            <span className="text-sm font-bold text-slate-800">
                                                {item.user && typeof item.user === 'object' && item.user.firstname
                                                    ? `${item.user.firstname} ${item.user.lastname || ''}`.trim()
                                                    : 'ไม่ระบุชื่อ'}
                                            </span>
                                            {item.reporterPhone && <span className="text-[10px] font-bold text-slate-500">{item.reporterPhone}</span>}
                                            {item.reporterIdCard && <span className="text-[9px] font-medium text-slate-400">บัตร: {item.reporterIdCard}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm max-w-[150px]">
                                            <span className="font-bold text-slate-700 truncate">{item.locationMain}</span>
                                            <span className="text-xs text-slate-400 truncate">{item.locationDetail}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold text-[10px]">{item.storagePosition || '-'}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(item.status)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 shadow-xl border-slate-200">
                                                <DropdownMenuLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider">ตัวเลือกจัดการ</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="cursor-pointer font-medium py-2" onClick={() => navigate(`/item/${item._id}`)}>
                                                    <Eye className="mr-2 h-4 w-4 text-slate-500" /> ดูรายละเอียด
                                                </DropdownMenuItem>
                                                
                                                {item.status === 'pending' && (
                                                    <>
                                                        <DropdownMenuItem className="cursor-pointer font-bold py-2 text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50" onClick={() => handleStatusUpdate(item._id, 'open')}>
                                                            <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" /> อนุมัติเผยแพร่
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="cursor-pointer font-bold py-2 text-rose-600 focus:text-rose-700 focus:bg-rose-50" onClick={() => handleStatusUpdate(item._id, 'rejected')}>
                                                            <XCircle className="mr-2 h-4 w-4 text-rose-500" /> ปฏิเสธโพสต์
                                                        </DropdownMenuItem>
                                                    </>
                                                )}

                                                {item.status === 'open' && (
                                                    <DropdownMenuItem className="cursor-pointer font-medium py-2 text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50" onClick={() => handleStatusUpdate(item._id, 'resolved')}>
                                                        <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" /> ทำเครื่องหมายเสร็จสิ้น
                                                    </DropdownMenuItem>
                                                )}

                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="cursor-pointer font-medium py-2 text-red-600 focus:text-red-700 focus:bg-red-50" onClick={() => handleDelete(item._id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> ลบรายการ
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Wrapper */}
                <div className="flex items-center justify-between px-4 py-4 border-t border-slate-200 bg-slate-50/50">
                    <div className="text-xs text-slate-500 font-medium">
                        พบทั้งหมด <span className="font-bold text-slate-800">{items.length}</span> รายการ
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminItems;
