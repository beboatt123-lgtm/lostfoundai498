import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, Camera, CameraOff, Search, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/axios';

const QRScanner = () => {
    const navigate = useNavigate();
    const scannerRef = useRef(null);
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [manualId, setManualId] = useState('');
    const [searching, setSearching] = useState(false);
    const [foundItem, setFoundItem] = useState(null);

    const startScanner = async () => {
        setError(null);
        setResult(null);
        setFoundItem(null);

        try {
            const html5QrCode = new Html5Qrcode('qr-reader');
            scannerRef.current = html5QrCode;

            await html5QrCode.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                async (decodedText) => {
                    await html5QrCode.stop();
                    setScanning(false);
                    await handleQRResult(decodedText);
                },
                () => {}
            );
            setScanning(true);
        } catch (err) {
            setError('ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการใช้งานกล้องในเบราว์เซอร์');
            setScanning(false);
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
            } catch (_) {}
        }
        setScanning(false);
    };

    const handleQRResult = async (text) => {
        // QR contains customId (e.g. BU0001) or full URL ending with item id
        const customIdMatch = text.match(/BU\d+/);
        const customId = customIdMatch ? customIdMatch[0] : text.trim();

        setResult(customId);
        await searchByCustomId(customId);
    };

    const searchByCustomId = async (customId) => {
        setSearching(true);
        setFoundItem(null);
        setError(null);
        try {
            const res = await api.get('/items', { params: { search: customId, status: 'all' } });
            const match = res.data.find(item =>
                item.customId?.toLowerCase() === customId.toLowerCase()
            );
            if (match) {
                setFoundItem(match);
            } else {
                setError(`ไม่พบรายการ "${customId}" ในระบบ`);
            }
        } catch (err) {
            setError('เกิดข้อผิดพลาดในการค้นหา');
        } finally {
            setSearching(false);
        }
    };

    const handleManualSearch = async (e) => {
        e.preventDefault();
        if (!manualId.trim()) return;
        await searchByCustomId(manualId.trim().toUpperCase());
    };

    useEffect(() => {
        return () => { stopScanner(); };
    }, []);

    const statusColor = {
        pending: 'text-amber-600 bg-amber-50 border-amber-200',
        open: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        resolved: 'text-blue-600 bg-blue-50 border-blue-200',
        closed: 'text-slate-600 bg-slate-50 border-slate-200',
        rejected: 'text-rose-600 bg-rose-50 border-rose-200',
    };
    const statusLabel = {
        pending: 'รออนุมัติ', open: 'เผยแพร่แล้ว',
        resolved: 'สำเร็จแล้ว', closed: 'ปิดรายการ', rejected: 'ปฏิเสธ'
    };

    return (
        <div className="max-w-xl mx-auto space-y-6 pb-10">
            <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-4">
                    <div className="p-2.5 bg-indigo-100 rounded-2xl shadow-sm">
                        <QrCode className="text-indigo-600 h-7 w-7" />
                    </div>
                    สแกน QR Code
                </h2>
                <p className="text-slate-500 mt-2 ml-1">สแกน QR Code จากสติ๊กเกอร์เพื่อค้นหาสิ่งของในระบบ</p>
            </div>

            {/* Scanner Area */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                    <div
                        id="qr-reader"
                        className={`w-full rounded-xl overflow-hidden bg-slate-900 ${scanning ? 'block' : 'hidden'}`}
                        style={{ minHeight: '280px' }}
                    />
                    {!scanning && (
                        <div className="flex flex-col items-center justify-center py-12 gap-4 text-slate-400">
                            <div className="w-24 h-24 border-4 border-dashed border-slate-200 rounded-2xl flex items-center justify-center">
                                <QrCode size={40} className="text-slate-300" />
                            </div>
                            <p className="text-sm font-medium">กดปุ่มด้านล่างเพื่อเปิดกล้อง</p>
                        </div>
                    )}
                </div>

                <div className="p-4 flex gap-3">
                    {!scanning ? (
                        <Button onClick={startScanner} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-11 gap-2">
                            <Camera size={18} /> เปิดกล้องสแกน
                        </Button>
                    ) : (
                        <Button onClick={stopScanner} variant="outline" className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 font-bold rounded-xl h-11 gap-2">
                            <CameraOff size={18} /> หยุดสแกน
                        </Button>
                    )}
                </div>
            </div>

            {/* Manual Search */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-5">
                <p className="text-sm font-bold text-slate-700 mb-3">หรือพิมพ์รหัสสิ่งของด้วยตนเอง</p>
                <form onSubmit={handleManualSearch} className="flex gap-2">
                    <Input
                        placeholder="เช่น BU0001"
                        value={manualId}
                        onChange={(e) => setManualId(e.target.value.toUpperCase())}
                        className="h-11 font-mono font-bold tracking-wider border-slate-200 rounded-xl flex-1"
                    />
                    <Button type="submit" disabled={searching} className="bg-slate-900 hover:bg-black text-white font-bold rounded-xl h-11 px-5 gap-2">
                        {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                        ค้นหา
                    </Button>
                </form>
            </div>

            {/* Result */}
            {error && (
                <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700">
                    <AlertCircle size={20} className="shrink-0" />
                    <p className="font-medium text-sm">{error}</p>
                </div>
            )}

            {foundItem && (
                <div className="bg-white rounded-2xl border border-emerald-200 shadow-lg overflow-hidden">
                    <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2 text-emerald-700">
                        <CheckCircle2 size={18} />
                        <span className="font-bold text-sm">พบรายการในระบบ</span>
                    </div>
                    <div className="p-5 flex gap-4">
                        <img
                            src={foundItem.images?.[0] || 'https://via.placeholder.com/100'}
                            alt={foundItem.title}
                            className="w-20 h-20 rounded-xl object-cover border border-slate-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-mono text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                                    {foundItem.customId}
                                </span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${statusColor[foundItem.status] || ''}`}>
                                    {statusLabel[foundItem.status] || foundItem.status}
                                </span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${foundItem.type === 'lost' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                    {foundItem.type === 'lost' ? 'ของหาย' : 'พบของ'}
                                </span>
                            </div>
                            <h3 className="font-bold text-slate-900 truncate">{foundItem.title}</h3>
                            <p className="text-xs text-slate-500 mt-0.5 truncate">{foundItem.locationMain}</p>
                            {foundItem.notes && (
                                <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1 mt-2 line-clamp-2">
                                    หมายเหตุ: {foundItem.notes}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="px-5 pb-5">
                        <Button
                            onClick={() => navigate(`/item/${foundItem._id}`)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-11"
                        >
                            ดูรายละเอียดเต็ม
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QRScanner;
