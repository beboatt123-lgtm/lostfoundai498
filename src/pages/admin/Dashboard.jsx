import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, CheckCircle2, AlertCircle, TrendingUp, Users, ArrowUpRight, ArrowDownRight, Clock, Loader2, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const data = [
    { name: 'จันทร์', lost: 40, found: 24, returned: 24 },
    { name: 'อังคาร', lost: 30, found: 13, returned: 22 },
    { name: 'พุธ', lost: 20, found: 58, returned: 22 },
    { name: 'พฤหัส', lost: 27, found: 39, returned: 20 },
    { name: 'ศุกร์', lost: 18, found: 48, returned: 21 },
    { name: 'เสาร์', lost: 23, found: 38, returned: 25 },
    { name: 'อาทิตย์', lost: 34, found: 43, returned: 21 },
];

const AdminDashboard = () => {
    const get7DaysAgo = () => {
        const d = new Date();
        d.setDate(d.getDate() - 6);
        return d.toISOString().split('T')[0];
    };
    
    const getToday = () => {
        return new Date().toISOString().split('T')[0];
    };

    const [startDate, setStartDate] = useState(get7DaysAgo());
    const [endDate, setEndDate] = useState(getToday());
    const [statsData, setStatsData] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/stats', {
                params: { startDate, endDate }
            });
            setStatsData(res.data.stats);
            setChartData(res.data.chartData);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (startDate && endDate) {
            fetchStats();
        }
    }, [startDate, endDate]);

    const stats = [
        { title: 'รายการแจ้งทั้งหมด', value: statsData?.totalItems || '0', icon: <Package className="h-4 w-4 text-blue-600" />, change: '+0%', trend: 'up', color: 'bg-gradient-to-br from-blue-50 to-blue-50/10 border-blue-100 shadow-blue-100/50' },
        { title: 'ส่งคืนสำเร็จ', value: statsData?.resolvedItems || '0', icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />, change: '+0%', trend: 'up', color: 'bg-gradient-to-br from-emerald-50 to-emerald-50/10 border-emerald-100 shadow-emerald-100/50' },
        { title: 'กำลังติดตามหา', value: statsData?.lostItems || '0', icon: <AlertCircle className="h-4 w-4 text-amber-600" />, change: '-0%', trend: 'down', color: 'bg-gradient-to-br from-amber-50 to-amber-50/10 border-amber-100 shadow-amber-100/50' },
        { title: 'ผู้ใช้งานทั้งหมด', value: statsData?.totalUsers || '0', icon: <Users className="h-4 w-4 text-indigo-600" />, change: '+0%', trend: 'up', color: 'bg-gradient-to-br from-indigo-50 to-indigo-50/10 border-indigo-100 shadow-indigo-100/50' },
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto font-sans">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">ภาพรวมระบบ (Dashboard)</h2>
                    <p className="text-slate-500 mt-2 text-base">สรุปสถานะการทำงานและสถิติการใช้งานระบบตามช่วงเวลา</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ตั้งแต่</span>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all h-10 cursor-pointer"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ถึง</span>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all h-10 cursor-pointer"
                            />
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium pl-2 border-l border-slate-100">
                        <Clock size={12} className="text-emerald-500 animate-pulse" />
                        <span>เรียลไทม์</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Card key={index} className={`border shadow-sm backdrop-blur-sm transition-all hover:shadow-md ${stat.color}`}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-700">
                                {stat.title}
                            </CardTitle>
                            <div className="p-2 bg-white rounded-lg shadow-sm ring-1 ring-slate-100">
                                {stat.icon}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</div>
                            <div className="flex items-center mt-2">
                                <span className={`flex items-center text-xs font-bold px-1.5 py-0.5 rounded-full ${stat.trend === 'up' ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'}`}>
                                    {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                                    {stat.change}
                                </span>
                                <span className="text-xs text-slate-500 ml-2 font-medium">เทียบกับเดือนก่อน</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-8 md:grid-cols-7">
                <Card className="col-span-4 shadow-xl shadow-slate-200/40 border-slate-200 overflow-hidden relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-20 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                        </div>
                    )}
                    <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                        <CardTitle className="text-lg font-bold text-slate-800">สถิติการแจ้งหายและเจอของคืน</CardTitle>
                        <CardDescription className="text-slate-500">เปรียบเทียบจำนวนรายการตามช่วงเวลาที่กำหนด</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div style={{ width: '100%', height: 350, minWidth: 1, minHeight: 1 }}>
                            {chartData && chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorFound" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorLost" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                                        labelStyle={{ color: '#64748b', marginBottom: '8px', fontSize: '13px' }}
                                    />
                                    <Area type="monotone" dataKey="found" name="เจอของคืนแล้ว" stackId="1" stroke="#10b981" fillOpacity={1} fill="url(#colorFound)" strokeWidth={3} />
                                    <Area type="monotone" dataKey="lost" name="แจ้งหาย" stackId="1" stroke="#f43f5e" fillOpacity={1} fill="url(#colorLost)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    ไม่มีข้อมูลสถิติในช่วงเวลานี้
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 shadow-xl shadow-slate-200/40 border-slate-200">
                    <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                        <CardTitle className="text-lg font-bold text-slate-800">กิจกรรมล่าสุด</CardTitle>
                        <CardDescription className="text-slate-500">ความเคลื่อนไหวล่าสุดในระบบ</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            {[
                                { text: 'ยืนยันรับคืน "iPhone 15 Pro" แล้ว', user: 'สมชาย ใจดี', time: '2 นาทีที่แล้ว', type: 'success' },
                                { text: 'แจ้งพบ "กระเป๋าสตางค์ Coach"', user: 'วิภาดา รักดี', time: '15 นาทีที่แล้ว', type: 'info' },
                                { text: 'Admin อนุมัติโพสต์ "กุญแจรถ"', user: 'System Admin', time: '1 ชั่วโมงที่แล้ว', type: 'admin' },
                                { text: 'แจ้งของหาย "iPad Air 5"', user: 'กิตติศักดิ์', time: '3 ชั่วโมงที่แล้ว', type: 'alert' }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 items-start p-5 hover:bg-slate-50/50 transition-colors group">
                                    <div className={`mt-1 h-2.5 w-2.5 rounded-full ring-4 ${item.type === 'success' ? 'bg-emerald-500 ring-emerald-100' :
                                        item.type === 'info' ? 'bg-blue-500 ring-blue-100' :
                                            item.type === 'admin' ? 'bg-indigo-500 ring-indigo-100' : 'bg-rose-500 ring-rose-100'
                                        }`}></div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors">
                                            {item.text}
                                        </p>
                                        <p className="text-xs text-slate-500 font-medium">
                                            โดย <span className="text-slate-700">{item.user}</span> • {item.time}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
