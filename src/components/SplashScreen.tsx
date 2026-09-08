"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("splash-seen") === "1";
    } catch {
      seen = false;
    }
    if (seen) return;
    try {
      sessionStorage.setItem("splash-seen", "1");
    } catch {
      /* ignore */
    }
    const raf = requestAnimationFrame(() => setShow(true));
    const t = setTimeout(() => setShow(false), 1500);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center text-white"
      style={{ background: "linear-gradient(135deg, #0d9488 0%, #134e4a 45%, #1e3a8a 100%)" }}
    >
      <div className="relative w-28 h-28 mb-8">
        <svg className="absolute inset-0 animate-spin" style={{ animationDuration: "2s" }} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="90 210"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center text-3xl">🏫</div>
        </div>
      </div>
      <h1 className="text-2xl font-bold">ระบบนิเทศภายในโรงเรียน</h1>
      <p className="text-sm opacity-80 mt-1">ระบบบริหารจัดการและประเมินการนิเทศ</p>
      <div className="mt-8 w-64 h-1.5 rounded-full bg-white/20 overflow-hidden">
        <div className="h-full bg-white/90 rounded-full animate-[splash-bar_1.5s_ease-in-out]" style={{ width: "100%" }} />
      </div>
      <p className="text-xs opacity-70 mt-3">กำลังโหลดระบบ...</p>
      <style>{`@keyframes splash-bar { from { width: 0% } to { width: 100% } }`}</style>
    </div>
  );
}
