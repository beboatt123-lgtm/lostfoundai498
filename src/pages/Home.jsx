import { Button } from "@/components/ui/button";
import {
    Search, AlertCircle, CheckCircle2, MapPin,
    Activity, Smartphone, Wallet, Shirt, Briefcase,
    Gem, Glasses, FileBadge, BookText, HeartPulse, PawPrint, Trophy,
    Music, Wrench, ToyBrick, Boxes, Calendar, Loader2, SortAsc
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import heroBg from '../assets/hero-bg.png';

const Home = () => {
    const { user: currentUser } = useAuth();
    
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState('newest');

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
            const res = await api.get('/items');
            let data = res.data;

            if (sortBy === 'newest') data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            else data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

            setItems(data);
        } catch (err) {
            console.error("Failed to fetch items", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [sortBy]);

    return (
        <div className="min-h-screen bg-[#060b18] font-sans text-slate-100 antialiased selection:bg-emerald-500/30 mobile-optimized">
            {/* High-Tech Dark Hero (Requirement 5: Search Bar on Top) */}
            <section className="relative pt-20 pb-12 lg:pt-28 lg:pb-20 border-b border-white/5 overflow-hidden">
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-luminosity pointer-events-none" 
                    style={{ backgroundImage: `url(${heroBg})` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#060b18]/80 via-[#060b18]/10 to-[#060b18] pointer-events-none"></div>

                <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight mb-8">
                        ตามหาสิ่งของที่หายไป <br/>
                        <span className="text-emerald-500 uppercase tracking-widest text-xl md:text-2xl mt-2 block">Search Intelligent</span>
                    </h1>

                    {/* Requirement 2: Quick Actions (Hidded if not logged in - though here they are protected routes anyway) */}
                    {currentUser && (
                        <div className="flex items-center justify-center gap-3 mt-10">
                            <Link to="/report/lost">
                                <Button className="h-11 px-8 rounded-xl font-black bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 text-xs uppercase tracking-widest transition-all">
                                    <AlertCircle size={16} className="mr-2" /> แจ้งทำของหาย
                                </Button>
                            </Link>
                            <Link to="/report/found">
                                <Button className="h-11 px-8 rounded-xl font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs uppercase tracking-widest transition-all">
                                    <CheckCircle2 size={16} className="mr-2" /> แจ้งเจอของ
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Requirement 5: Feed Area (Search Results) */}
            <div className="max-w-6xl mx-auto px-6 py-16">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <Activity className="text-emerald-500" />
                        รายการประกาศล่าสุด
                    </h2>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-40 h-10 bg-white/5 border-white/10 text-xs font-bold text-slate-400">
                            <div className="flex items-center gap-2">
                                <SortAsc size={14} />
                                <span>{sortBy === 'newest' ? 'ล่าสุดก่อน' : 'เก่าสุดก่อน'}</span>
                            </div>
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f172a] border-white/10 text-white">
                            <SelectItem value="newest">ล่าสุดก่อน</SelectItem>
                            <SelectItem value="oldest">เก่าสุดก่อน</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="space-y-4 animate-pulse">
                                <div className="aspect-[4/3] bg-white/5 rounded-2xl"></div>
                                <div className="h-4 bg-white/5 rounded w-3/4"></div>
                                <div className="h-3 bg-white/5 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    // Requirement 7: Fix white screen / empty state
                    <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/5">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-slate-600 mx-auto mb-6">
                            <Search size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">ยังไม่มีรายการประกาศ</h3>
                        <p className="text-slate-500 text-sm font-medium">ยังไม่มีรายการที่ได้รับการอนุมัติในขณะนี้</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
                        {items.map((item) => (
                            <Link key={item._id} to={`/item/${item._id}`} className="group relative">
                                <div className="absolute -inset-2 bg-white/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-all -z-10 blur-sm"></div>
                                <div className="flex flex-col h-full space-y-4">
                                    <div className="aspect-[4/3] relative overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
                                        <img
                                            src={item.images?.[0] || 'https://via.placeholder.com/500x500?text=No+Image'}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                                        />
                                        <div className={`absolute top-3 left-3 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-white shadow-lg ring-1 ring-white/20 ${item.type === 'lost' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
                                            {item.type === 'lost' ? 'Lost' : 'Found'}
                                        </div>
                                    </div>
                                    
                                    <div className="px-1 flex-1 flex flex-col space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-emerald-500 shrink-0">
                                                    {(() => {
                                                        const Icon = categoryIcons[item.category] || Boxes;
                                                        return <Icon size={12} />;
                                                    })()}
                                                </div>
                                                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider truncate">
                                                    {item.category?.replace('-', ' ')}
                                                </span>
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-700">#ID{item._id.toString().slice(-4)}</span>
                                        </div>
                                        
                                        {/* Requirement 6: Dynamic Title */}
                                        <h3 className="font-bold text-white text-sm md:text-base leading-snug group-hover:text-emerald-400 transition-colors line-clamp-2">
                                            {item.title}
                                        </h3>
                                        
                                        <div className="pt-3 mt-auto space-y-2 border-t border-white/5">
                                            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold truncate">
                                                <MapPin size={12} className="text-emerald-500 shrink-0" />
                                                <span className="truncate">{item.location}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold">
                                                    <Calendar size={12} className="text-slate-600 shrink-0" />
                                                    <span>
                                                        {new Date(item.date).toLocaleDateString('th-TH', { 
                                                            day: 'numeric', 
                                                            month: 'short',
                                                            year: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="py-20 border-t border-white/5 px-6 bg-[#060b18]">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                    <div className="space-y-2">
                         <div className="font-black text-2xl tracking-tighter text-white">LOSTFOUND <span className="text-emerald-500 italic">SYSTEM</span></div>
                         <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Professional Intelligent Service</p>
                    </div>
                    <div className="flex items-center gap-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
                        <Link to="/about" className="hover:text-white transition-colors">About</Link>
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link to="/contact" className="hover:text-white transition-colors">Support</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
