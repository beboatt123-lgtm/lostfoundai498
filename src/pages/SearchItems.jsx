import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Search, Filter, MapPin, Calendar, Loader2, Sparkles,
    Smartphone, Shirt, Wallet, Briefcase, Gem, Glasses,
    FileBadge, BookText, HeartPulse, PawPrint, Trophy,
    Music, Wrench, ToyBrick, Boxes, LayoutGrid, ArrowRight,
    ChevronDown, SlidersHorizontal, Grid, List, SortAsc, SortDesc, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import { Badge } from "@/components/ui/badge";

const SearchItems = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [type, setType] = useState('all');
    const [category, setCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const { user: currentUser } = useAuth();

    const categoryIcons = {
        'electronics': Smartphone,
        'wallet': Wallet,
        'clothing': Shirt,
        'bag': Briefcase,
        'jewelry': Gem,
        'glasses': Glasses,
        'documents': FileBadge,
        'stationery': BookText,
        'health': HeartPulse,
        'pets': PawPrint,
        'sports': Trophy,
        'music': Music,
        'tools': Wrench,
        'toy': ToyBrick,
        'others': Boxes,
    };

    const fetchItems = async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            if (type && type !== 'all') params.type = type;
            if (category && category !== 'all') params.category = category;
            if (sortBy) params.sort = sortBy;

            const res = await api.get('/items', { params });
            // Client-side sorting for now if backend doesn't support it fully yet
            let data = res.data;
            if (sortBy === 'newest') data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            else if (sortBy === 'oldest') data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

            setItems(data);
        } catch (err) {
            console.error("Failed to fetch items", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [type, category, sortBy]); // Refetch on filter change

    const handleSearch = (e) => {
        e?.preventDefault();
        fetchItems();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 antialiased italic-text-none">
            {/* Contextual Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                {currentUser && currentUser.role !== 'admin' ? 'รายการประกาศของคุณ' : 'ค้นหารายการสิ่งของ'}
                            </h1>
                            <p className="text-sm text-slate-500 font-medium tracking-normal">
                                {currentUser && currentUser.role !== 'admin' 
                                    ? `คุณมีรายการประกาศทั้งหมด ${items.length} รายการ`
                                    : `พบข้อมูลทั้งหมด ${items.length} รายการในระบบขณะนี้`}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                             <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="h-9 w-[160px] bg-white border-slate-200 text-xs font-bold rounded-lg shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <SortAsc size={14} className="text-slate-400" />
                                        <span>{sortBy === 'newest' ? 'ล่าสุดก่อน' : 'เก่าสุดก่อน'}</span>
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl shadow-xl">
                                    <SelectItem value="newest" className="text-xs font-bold">ล่าสุดก่อน (Default)</SelectItem>
                                    <SelectItem value="oldest" className="text-xs font-bold">เก่าสุดก่อน</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Integrated Multi-Filter Bar */}
                    <div className="p-1 px-1 bg-slate-100/80 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center gap-1">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <Input
                                placeholder="ค้นหาตามชื่อของ, สถานที่ หรือคีย์เวิร์ด..."
                                className="pl-11 h-12 text-sm border-none bg-transparent focus-visible:ring-0 font-medium placeholder:text-slate-400"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        
                        <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

                        <div className="flex items-center gap-1 p-1">
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger className="h-10 border-none bg-white md:bg-transparent px-4 rounded-xl font-bold text-slate-600 text-xs hover:bg-white transition-all shadow-none focus:ring-0">
                                    <SelectValue placeholder="ทุกประเภท" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl shadow-xl border-slate-100">
                                    <SelectItem value="all" className="text-xs font-bold">ทุกประเภท</SelectItem>
                                    <SelectItem value="lost" className="text-xs font-bold text-rose-600">ของหาย</SelectItem>
                                    <SelectItem value="found" className="text-xs font-bold text-emerald-600">พบสิ่งของ</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="h-10 border-none bg-white md:bg-transparent px-4 rounded-xl font-bold text-slate-600 text-xs hover:bg-white transition-all shadow-none focus:ring-0 min-w-[140px]">
                                    <SelectValue placeholder="ทุกหมวดหมู่" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl shadow-xl border-slate-100 max-h-[400px]">
                                    <SelectItem value="all" className="text-xs font-bold">ทุกหมวดหมู่</SelectItem>
                                    {Object.entries(categoryIcons).map(([key, Icon]) => (
                                        <SelectItem key={key} value={key} className="py-2">
                                            <div className="flex items-center gap-2.5">
                                                <Icon size={12} className="text-slate-400" />
                                                <span className="text-xs font-bold text-slate-700">{
                                                    key === 'electronics' ? 'อิเล็กทรอนิกส์' :
                                                    key === 'wallet' ? 'กระเป๋าสตางค์/บัตร' :
                                                    key === 'clothing' ? 'เสื้อผ้า' :
                                                    key === 'bag' ? 'กระเป๋า' :
                                                    key === 'jewelry' ? 'เครื่องประดับ' :
                                                    key === 'glasses' ? 'แว่นตา' :
                                                    key === 'documents' ? 'เอกสารสำคัญ' :
                                                    key === 'stationery' ? 'เครื่องเขียน/หนังสือ' :
                                                    key === 'health' ? 'สุขภาพ' :
                                                    key === 'pets' ? 'สัตว์เลี้ยง' :
                                                    key === 'sports' ? 'กีฬา' :
                                                    key === 'music' ? 'ดนตรี/หูฟัง' :
                                                    key === 'tools' ? 'เครื่องมือช่าง' :
                                                    key === 'toy' ? 'ของเล่น' : 'อื่นๆ'
                                                }</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button 
                                onClick={handleSearch} 
                                className="h-10 px-6 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-slate-900/10 ml-2"
                            >
                                <Filter size={14} className="mr-2" /> ค้นหา
                            </Button>
                        </div>
                    </div>
                    
                    {/* Active Filters Display */}
                    {(search || type !== 'all' || category !== 'all') && (
                        <div className="mt-4 flex flex-wrap gap-2 animate-in fade-in duration-300">
                             <span className="text-[10px] font-black uppercase text-slate-400 self-center mr-2 tracking-widest">Active Filters:</span>
                             {type !== 'all' && (
                                <Badge variant="secondary" className="bg-white border-slate-200 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold">
                                    ประเภท: {type === 'lost' ? 'ของหาย' : 'พบสิ่งของ'}
                                    <X size={10} className="ml-2 cursor-pointer hover:text-rose-500" onClick={() => setType('all')} />
                                </Badge>
                             )}
                             {category !== 'all' && (
                                <Badge variant="secondary" className="bg-white border-slate-200 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold">
                                    หมวดหมู่: {category}
                                    <X size={10} className="ml-2 cursor-pointer hover:text-rose-500" onClick={() => setCategory('all')} />
                                </Badge>
                             )}
                             {search && (
                                <Badge variant="secondary" className="bg-white border-slate-200 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold">
                                    ค้นหา: "{search}"
                                    <X size={10} className="ml-2 cursor-pointer hover:text-rose-500" onClick={() => setSearch('')} />
                                </Badge>
                             )}
                             <button 
                                onClick={() => { setSearch(''); setType('all'); setCategory('all'); }} 
                                className="text-[10px] font-bold text-slate-400 hover:text-slate-900 underline underline-offset-2 ml-auto"
                             >
                                Clear all
                             </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Results */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="space-y-4 animate-pulse">
                                <div className="aspect-[4/3] bg-slate-200 rounded-2xl"></div>
                                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="max-w-md mx-auto text-center py-20">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-6">
                            <Search size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            {!currentUser ? 'กรุณาเข้าสู่ระบบ' : 'ไม่พบข้อมูลที่ต้องการ'}
                        </h3>
                        <p className="text-slate-500 text-sm font-medium mb-8">
                            {!currentUser 
                                ? 'กรุณาเข้าสู่ระบบเพื่อดูรายการประกาศของคุณครับ' 
                                : 'ลองค้นหาด้วยคำที่กว้างขึ้น หรือเปลี่ยนหมวดหมู่ในการค้นหาดูอีกครั้งนะครับ'}
                        </p>
                        {!currentUser ? (
                            <Link to="/login">
                                <Button className="rounded-xl font-bold bg-emerald-600">เข้าสู่ระบบเลย</Button>
                            </Link>
                        ) : (
                            <Button variant="outline" className="rounded-xl font-bold border-slate-200" onClick={() => { setSearch(''); setType('all'); setCategory('all'); }}>
                                รีเซ็ตการค้นหาทั้งหมด
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-x-10 lg:gap-y-12">
                        {items.map((item) => (
                            <Link key={item._id} to={`/item/${item._id}`} className="group relative">
                                <div className="absolute -inset-2 bg-slate-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
                                <div className="flex flex-col h-full space-y-4">
                                    <div className="aspect-[4/3] relative overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                                        <img
                                            src={item.images?.[0] || 'https://via.placeholder.com/500x500?text=No+Image'}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                                        />
                                        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-white shadow-sm ring-1 ring-white/30 ${item.type === 'lost' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
                                            {item.type === 'lost' ? 'Lost' : 'Found'}
                                        </div>
                                    </div>
                                    
                                    <div className="px-1 flex-1 flex flex-col space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                                    {(() => {
                                                        const Icon = categoryIcons[item.category] || Boxes;
                                                        return <Icon size={12} />;
                                                    })()}
                                                </div>
                                                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider truncate">
                                                    {item.category?.replace('-', ' ')}
                                                </span>
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-300">#LF{item._id.toString().slice(-4)}</span>
                                        </div>
                                        
                                        <h3 className="font-bold text-slate-900 text-sm md:text-base leading-snug group-hover:text-slate-600 transition-colors line-clamp-2">
                                            {item.title}
                                        </h3>
                                        
                                        <div className="pt-2 mt-auto space-y-1.5 border-t border-slate-100">
                                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold truncate">
                                                <MapPin size={12} className="text-slate-400 shrink-0" />
                                                <span className="truncate">{item.location}</span>
                                            </div>
                                            <div className="flex md:items-center flex-col md:flex-row justify-between gap-1">
                                                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold">
                                                    <Calendar size={12} className="text-slate-400 shrink-0" />
                                                    <span>
                                                        {new Date(item.date).toLocaleDateString('th-TH', { 
                                                            day: 'numeric', 
                                                            month: 'short',
                                                            year: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter self-end md:self-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
                                                    Details <ArrowRight size={12} />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchItems;
