import { MapPin, Phone, Mail, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 font-sans">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div className="col-span-1 md:col-span-1">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                            <MapPin size={18} fill="currentColor" />
                        </div>
                        <span className="text-xl font-bold text-white">Lost&Found</span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                        ระบบติดตามของหายอัจฉริยะด้วย AI ช่วยให้คุณค้นหาและส่งคืนสิ่งของได้อย่างรวดเร็วและปลอดภัย
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"><Facebook size={18} /></a>
                        <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"><Twitter size={18} /></a>
                        <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"><Instagram size={18} /></a>
                    </div>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-6">เมนูลัด</h4>
                    <ul className="space-y-3 text-sm">
                        <li><a href="#" className="hover:text-emerald-400 transition-colors">หน้าแรก</a></li>
                        <li><a href="#" className="hover:text-emerald-400 transition-colors">ค้นหาของหาย</a></li>
                        <li><a href="#" className="hover:text-emerald-400 transition-colors">แจ้งของหาย</a></li>
                        <li><a href="#" className="hover:text-emerald-400 transition-colors">แจ้งเจอของ</a></li>
                        <li><a href="#" className="hover:text-emerald-400 transition-colors">เข้าสู่ระบบ</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-6">ช่วยเหลือ</h4>
                    <ul className="space-y-3 text-sm">
                        <li><a href="#" className="hover:text-emerald-400 transition-colors">ศูนย์ช่วยเหลือ</a></li>
                        <li><a href="#" className="hover:text-emerald-400 transition-colors">คำถามที่พบบ่อย</a></li>
                        <li><a href="#" className="hover:text-emerald-400 transition-colors">นโยบายความเป็นส่วนตัว</a></li>
                        <li><a href="#" className="hover:text-emerald-400 transition-colors">เงื่อนไขการใช้งาน</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-6">ติดต่อเรา</h4>
                    <ul className="space-y-4 text-sm">
                        <li className="flex items-start gap-3">
                            <MapPin className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                            <span>123 อาคารสาทรทาวเวอร์ ชั้น 15<br />ถนนสาทร, กรุงเทพฯ 10120</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone className="text-emerald-500 shrink-0" size={18} />
                            <span>02-123-4567</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail className="text-emerald-500 shrink-0" size={18} />
                            <span>support@lostfound.com</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
                <p>&copy; 2024 Lost&Found. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
