import { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    Send,
    Sparkles,
    Bot,
    User,
    ArrowRight,
    MapPin,
    Calendar,
    Loader2
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';

const AIChatSearch = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            content: 'สวัสดีครับ! ผมคือ AI ผู้ช่วยค้นหาสิ่งของ คุณทำอะไรหาย หรือเจออะไรมา ลองพิมพ์บอกผมได้เลยนะครับ เช่น "ทำกุญแจรถหายแถวสยาม" หรือ "มีใครเก็บไอโฟนได้บ้างไหม"'
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { id: Date.now(), type: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setLoading(true);

        try {
            const res = await api.post('/items/ai-search', { query: currentInput });

            const botMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: res.data.answer,
                matches: res.data.matches
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (err) {
            console.error("AI Search Frontend Error detailed:", err);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'bot',
                content: 'ขออภัยครับ ระบบประมวลผลขัดข้องเล็กน้อย ลองใหม่อีกครั้งนะครับ'
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full bg-slate-50/50 rounded-3xl overflow-hidden">
            <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-180px)] bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden relative">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 tracking-tight">AI ค้นหาสิ่งของอัจฉริยะ</h1>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Online Helper</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <ScrollArea className="flex-1 p-6 bg-slate-50/30">
                    <div className="space-y-8">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-4 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${msg.type === 'user' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-100 text-emerald-600'
                                        }`}>
                                        {msg.type === 'user' ? <User size={20} /> : <Bot size={22} />}
                                    </div>

                                    <div className="space-y-4">
                                        <div className={`p-5 rounded-3xl text-[15px] leading-relaxed shadow-sm ${msg.type === 'user'
                                            ? 'bg-slate-800 text-white rounded-tr-none'
                                            : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none font-medium'
                                            }`}>
                                            {msg.content}
                                        </div>

                                        {/* Matches Card if any */}
                                        {msg.matches && msg.matches.length > 0 && (
                                            <div className="grid grid-cols-1 gap-4 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                {msg.matches.map((item) => (
                                                    <Card key={item._id} className="overflow-hidden border-slate-200 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-100/50 transition-all group">
                                                        <div className="flex flex-col sm:flex-row h-full">
                                                            <div className="w-full sm:w-40 h-40 sm:h-full relative overflow-hidden bg-slate-100">
                                                                <img
                                                                    src={item.images?.[0] || 'https://via.placeholder.com/150'}
                                                                    alt={item.title}
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                />
                                                                <div className="absolute top-2 left-2">
                                                                    <Badge className={item.type === 'lost' ? 'bg-rose-500' : 'bg-emerald-500'}>
                                                                        {item.type === 'lost' ? 'ของหาย' : 'เจอของ'}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 p-5 flex flex-col">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <h4 className="font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">
                                                                        {item.title}
                                                                    </h4>
                                                                </div>
                                                                <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed italic font-medium">
                                                                    "{item.description}"
                                                                </p>
                                                                <div className="mt-auto flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-bold text-slate-400">
                                                                    <span className="flex items-center gap-1.5"><MapPin size={12} className="text-emerald-500" /> {item.location}</span>
                                                                    <span className="flex items-center gap-1.5"><Calendar size={12} className="text-emerald-500" /> {new Date(item.date).toLocaleDateString('th-TH')}</span>
                                                                </div>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="mt-4 text-emerald-600 font-bold justify-start p-0 h-auto hover:bg-transparent hover:translate-x-1 transition-all"
                                                                    onClick={() => navigate(`/item/${item._id}`)}
                                                                >
                                                                    ดูรายละเอียดรายการนี้ <ArrowRight size={14} className="ml-2" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="flex gap-4 items-center">
                                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-emerald-600 shadow-sm animate-bounce">
                                        <Bot size={22} />
                                    </div>
                                    <div className="bg-white border border-slate-100 p-4 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-3">
                                        <Loader2 size={16} className="animate-spin text-emerald-500" />
                                        <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">AI กำลังคิดหาคำตอบ...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-6 bg-white border-t border-slate-100 shrink-0">
                    <form onSubmit={handleSend} className="relative flex items-center gap-4">
                        <div className="relative flex-1">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="พิมพ์อธิบายสิ่งของที่ต้องการค้นหา..."
                                className="h-16 pl-6 pr-16 bg-slate-50 border-slate-200 rounded-3xl focus-visible:ring-emerald-500/20 text-lg shadow-inner font-medium"
                                disabled={loading}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest pointer-events-none hidden sm:block">
                                Press Enter to Search
                            </div>
                        </div>
                        <Button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="h-16 w-16 rounded-3xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50"
                        >
                            <Send size={24} className="ml-1" />
                        </Button>
                    </form>
                    <p className="mt-4 text-center text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                        Powered by Gemini 1.5 Flash • Lost & Found AI intelligence
                    </p>
                </div>

            </div>
        </div>
    );
};

export default AIChatSearch;
