import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';

const QRPrintModal = ({ item, open, onClose }) => {
    if (!item) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
                {/* Print area */}
                <div id="print-area" className="p-8 bg-white text-center space-y-4">
                    <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Lost &amp; Found System</div>

                    <div className="flex justify-center">
                        <div className="p-3 bg-white border-2 border-slate-200 rounded-2xl shadow-sm inline-block">
                            <QRCodeSVG
                                value={item.customId || item._id}
                                size={180}
                                level="H"
                                includeMargin={false}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="text-2xl font-black text-slate-900 tracking-widest font-mono">
                            {item.customId}
                        </div>
                        <div className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${item.type === 'lost' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {item.type === 'lost' ? 'ของหาย' : 'พบสิ่งของ'}
                        </div>
                    </div>

                    <div className="text-slate-800 font-bold text-base">{item.title}</div>

                    <div className="text-xs text-slate-500 space-y-0.5">
                        <div>สถานที่: {item.locationMain}</div>
                        <div>วันที่: {new Date(item.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        {item.storagePosition && <div>ตำแหน่งเก็บ: {item.storagePosition}</div>}
                    </div>

                    <div className="text-[10px] text-slate-300 pt-2 border-t border-slate-100">
                        สแกน QR Code เพื่อดูรายละเอียดสิ่งของ
                    </div>
                </div>

                {/* Buttons (hidden on print) */}
                <div className="no-print p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                    <Button variant="outline" onClick={onClose} className="flex-1 font-bold rounded-xl gap-2">
                        <X size={16} /> ปิด
                    </Button>
                    <Button onClick={handlePrint} className="flex-1 bg-slate-900 hover:bg-black text-white font-bold rounded-xl gap-2">
                        <Printer size={16} /> พิมพ์ QR
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default QRPrintModal;
