import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, MessageCircle, Loader2, Sparkles } from 'lucide-react';
import api from '../lib/axios';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '../context/AuthContext';

const ItemDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [item, setItem] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const categories = {
        'electronics': 'อุปกรณ์อิเล็กทรอนิกส์',
        'wallet': 'กระเป๋าสตางค์/บัตร',
        'clothing': 'เสื้อผ้า/เครื่องแต่งกาย',
        'bag': 'กระเป๋า/เป้',
        'jewelry': 'เครื่องประดับ/นาฬิกา',
        'glasses': 'แว่นตา',
        'documents': 'เอกสารสำคัญ',
        'stationery': 'เครื่องเขียน/หนังสือ',
        'health': 'อุปกรณ์สุขภาพ/ยา',
        'pets': 'สัตว์เลี้ยง',
        'sports': 'อุปกรณ์กีฬา',
        'music': 'เครื่องดนตรี/หูฟัง',
        'tools': 'เครื่องมือ/อุปกรณ์ช่าง',
        'toy': 'ของเล่น/ของสะสม',
        'others': 'อื่นๆ'
    };

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const res = await api.get(`/items/${id}`);
                setItem(res.data);
            } catch (err) {
                console.error("Failed to fetch item", err);
                setError("ไม่พบข้อมูลรายการนี้");
            } finally {
                setLoading(false);
            }
        };

        fetchItem();
    }, [id]);

    if (loading) {
        return (
            <div className="h-[50vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="h-[50vh] flex items-center justify-center text-slate-500">
                {error || "ไม่พบข้อมูล"}
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-12 px-6 font-sans">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                {/* Image Section */}
                <div className="space-y-4">
                    <div className="aspect-square rounded-3xl overflow-hidden bg-slate-100 shadow-lg border border-slate-100 relative group">
                        <img
                            src={item.images?.[0] || 'https://via.placeholder.com/600x600?text=No+Image'}
                            alt={item.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {/* Thumbnail gallery could go here if multiple images */}
                </div>

                {/* Details Section */}
                <div className="space-y-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Badge className={`px-3 py-1 text-sm ${item.type === 'lost' ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>
                                {item.type === 'lost' ? 'ประกาศหาย' : 'ประกาศเจอของ'}
                            </Badge>
                            <Badge variant="outline" className="text-slate-500">{categories[item.category] || item.category}</Badge>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">{item.title}</h1>
                        <p className="text-slate-500 text-lg leading-relaxed">{item.description}</p>

                        {/* AI Analysis Result */}
                        {(item.aiTags?.length > 0 || item.aiDescription) && (
                            <div className="mt-8 p-6 bg-gradient-to-br from-indigo-50/50 to-emerald-50/50 border border-indigo-100 rounded-3xl space-y-4">
                                <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                                    <Sparkles size={16} className="text-indigo-500" />
                                    <span>AI วิเคราะห์สิ่งของ</span>
                                </div>

                                {item.aiTags?.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {item.aiTags.map((tag, i) => (
                                            <Badge key={i} variant="secondary" className="bg-white/80 border-indigo-100 text-indigo-700 hover:bg-white">
                                                #{tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {item.aiDescription && (
                                    <p className="text-slate-600 text-sm italic leading-relaxed">
                                        "{item.aiDescription}"
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-6 space-y-4 border border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm border border-slate-100">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">สถานที่</p>
                                <p className="font-semibold text-slate-800">{item.location}</p>
                            </div>
                        </div>
                        <div className="w-full h-px bg-slate-200"></div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm border border-slate-100">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">วันและเวลา</p>
                                <p className="font-semibold text-slate-800">
                                    {new Date(item.date).toLocaleDateString('th-TH', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button
                            size="lg"
                            className="w-full h-15 rounded-2xl text-lg font-black bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all active:scale-95"
                            onClick={() => {
                                navigate('/admin/chat');
                            }}
                        >
                            <MessageCircle className="mr-3 h-6 w-6" /> ติดต่อพูดคุยกับผู้ประกาศ
                        </Button>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                        <Avatar className="h-10 w-10 border border-slate-200">
                            <AvatarImage src={item.user?.avatar} alt={item.user?.firstname} />
                            <AvatarFallback>{item.user?.firstname?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm text-slate-500">ประกาศโดย</p>
                            <p className="font-bold text-slate-800">{item.user?.firstname} {item.user?.lastname}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemDetail;
