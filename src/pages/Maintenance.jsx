const Maintenance = ({ orgName }) => {
    return (
        <div className="min-h-screen bg-[#060b18] flex items-center justify-center px-6">
            <div className="text-center max-w-md">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="h-24 w-24 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                </div>

                <h1 className="text-2xl font-extrabold text-white mb-3">
                    ระบบปิดปรับปรุงชั่วคราว
                </h1>
                <p className="text-slate-400 text-base leading-relaxed mb-2">
                    {orgName || 'ระบบ Lost & Found'} กำลังอยู่ระหว่างการปรับปรุงระบบ
                </p>
                <p className="text-slate-500 text-sm">
                    กรุณากลับมาใหม่ในภายหลัง ขออภัยในความไม่สะดวก
                </p>

                <div className="mt-8 inline-flex items-center gap-2 text-xs text-slate-600 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                    Maintenance in progress
                </div>
            </div>
        </div>
    );
};

export default Maintenance;
