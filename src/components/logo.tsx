/** Logo Vina-Straw: lòng tô bằng nét rơm, một lá mạ mọc lên từ giữa. */
export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <circle cx="24" cy="24" r="23" fill="#1e5a3c" />
      <path d="M9 25c1.5 8 7.5 13 15 13s13.5-5 15-13" fill="none" stroke="#d4ab5a" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M12 25h24" stroke="#ead49d" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 25c0-7 2-12 8-15-1 7-3.5 11-8 15Z" fill="#7cb342" />
      <path d="M24 25c0-5-1.5-8.5-6-11 .6 5 2.4 8.4 6 11Z" fill="#cfe3c6" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className={`font-display text-[21px] font-bold tracking-tight ${light ? "text-white" : "text-leaf-800"}`}>
        Vina<span className={light ? "text-straw-300" : "text-straw-600"}>-</span>Straw
      </span>
    </span>
  );
}
