import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Edit, LogOut, Loader2, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { Alert, AlertDescription } from "@/components/ui/alert";

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserItems = async () => {
            if (!user) return;
            try {
                // Fetch all items by this user (including 'found' status if implemented, or just force status='all')
                const res = await api.get('/items', {
                    params: {
                        user: user.id,
                        status: 'all'
                    }
                });
                setItems(res.data);
            } catch (err) {
                console.error("Failed to fetch user items", err);
                setError("ไม่สามารถโหลดรายการของคุณได้");
            } finally {
                setLoading(false);
            }
        };

        fetchUserItems();
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleDelete = async (itemId) => {
        if (!window.confirm("คุณต้องการลบรายการนี้ใช่หรือไม่?")) return;

        try {
            await api.delete(`/items/${itemId}`);
            setItems(items.filter(item => item._id !== itemId));
        } catch (err) {
            console.error("Failed to delete item", err);
            alert("ไม่สามารถลบรายการได้");
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>กรุณาเข้าสู่ระบบ</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-12 px-6 font-sans">
            <div className="grid md:grid-cols-3 gap-8">
                {/* Sidebar - User Info */}
                <Card className="h-fit shadow-lg border-slate-200 sticky top-24">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto mb-4 relative">
                            <Avatar className="h-32 w-32 border-4 border-emerald-100 shadow-xl">
                                <AvatarImage src={user.avatar} alt={user.firstname} />
                                <AvatarFallback className="text-4xl bg-emerald-50 text-emerald-600">{user.firstname?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {/* <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full shadow-md w-8 h-8">
                                <Edit size={14} />
                            </Button> */}
                        </div>
                        <CardTitle className="text-2xl font-bold text-slate-900">{user.firstname} {user.lastname}</CardTitle>
                        <CardDescription className="text-slate-500">{user.email}</CardDescription>

                        <div className="flex gap-2 justify-center mt-2">
                            <Badge variant="outline" className="capitalize">{user.role}</Badge>
                            {/* <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0">ยืนยันตัวตนแล้ว</Badge> */}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        {/* <Button variant="outline" className="w-full justify-start border-slate-200">
                            <Edit className="mr-2 h-4 w-4" /> แก้ไขข้อมูลส่วนตัว
                        </Button> */}
                        <Button variant="destructive" onClick={handleLogout} className="w-full justify-start bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 shadow-none">
                            <LogOut className="mr-2 h-4 w-4" /> ออกจากระบบ
                        </Button>
                    </CardContent>
                </Card>

                {/* Main Content - Items */}
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-6">รายการประกาศของคุณ</h2>

                        <Tabs defaultValue="all" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 mb-6 rounded-xl">
                                <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">ทั้งหมด</TabsTrigger>
                                <TabsTrigger value="lost" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">ของหาย</TabsTrigger>
                                <TabsTrigger value="found" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">เจอของ</TabsTrigger>
                            </TabsList>

                            {error && (
                                <Alert variant="destructive" className="mb-4">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                                </div>
                            ) : items.length === 0 ? (
                                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-slate-500 mb-4">คุณยังไม่มีรายการประกาศ</p>
                                    <div className="flex gap-4 justify-center">
                                        <Link to="/report/lost">
                                            <Button variant="outline">แจ้งของหาย</Button>
                                        </Link>
                                        <Link to="/report/found">
                                            <Button>แจ้งเจอของ</Button>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <TabsContent value="all" className="space-y-4">
                                        {items.map(item => <ItemCard key={item._id} item={item} onDelete={handleDelete} />)}
                                    </TabsContent>
                                    <TabsContent value="lost" className="space-y-4">
                                        {items.filter(i => i.type === 'lost').length > 0 ? (
                                            items.filter(i => i.type === 'lost').map(item => <ItemCard key={item._id} item={item} onDelete={handleDelete} />)
                                        ) : <div className="text-center py-8 text-slate-400">ไม่มีรายการของหาย</div>}
                                    </TabsContent>
                                    <TabsContent value="found" className="space-y-4">
                                        {items.filter(i => i.type === 'found').length > 0 ? (
                                            items.filter(i => i.type === 'found').map(item => <ItemCard key={item._id} item={item} onDelete={handleDelete} />)
                                        ) : <div className="text-center py-8 text-slate-400">ไม่มีรายการเจอของ</div>}
                                    </TabsContent>
                                </>
                            )}
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ItemCard = ({ item, onDelete }) => {
    return (
        <Card className="overflow-hidden border-slate-200 hover:shadow-md transition-shadow group">
            <div className="flex flex-col sm:flex-row">
                <div className="sm:w-48 h-48 sm:h-auto relative bg-slate-100">
                    <img
                        src={item.images?.[0] || 'https://via.placeholder.com/200?text=No+Image'}
                        alt={item.title}
                        className="w-full h-full object-cover"
                    />
                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm ${item.type === 'lost' ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                        {item.type === 'lost' ? 'หาย' : 'เจอ'}
                    </div>
                </div>
                <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-slate-900 text-lg line-clamp-1">{item.title}</h3>
                            <Badge 
                                variant="outline" 
                                className={`font-bold capitalize ${
                                    item.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' :
                                    item.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                    item.status === 'resolved' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    item.status === 'closed' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                                    'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}
                            >
                                {item.status === 'pending' ? 'รอแอดมินอนุมัติ' :
                                 item.status === 'rejected' ? 'ปฏิเสธการเผยแพร่' :
                                 item.status === 'resolved' ? 'สำเร็จแล้ว' :
                                 item.status === 'closed' ? 'ปิดประกาศ' :
                                 'กำลังประกาศ'}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                            <MapPin size={14} className="text-emerald-500" />
                            <span className="truncate">{item.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                            <Calendar size={14} className="text-emerald-500" />
                            <span>{new Date(item.date).toLocaleDateString('th-TH')}</span>
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                        <Link to={`/item/${item._id}`}>
                            <Button variant="outline" size="sm" className="h-8">ดูรายละเอียด</Button>
                        </Link>
                        {/* <Button variant="outline" size="sm" className="h-8">
                            <Edit size={14} className="mr-1" /> แก้ไข
                        </Button> */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                            onClick={() => onDelete(item._id)}
                        >
                            <Trash2 size={14} className="mr-1" /> ลบ
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default Profile;
