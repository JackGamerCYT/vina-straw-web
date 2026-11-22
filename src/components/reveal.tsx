"use client";
import { useEffect, useRef, type ReactNode } from "react";

/** Hiện dần khi cuộn tới. Chỉ dùng cho vài khối chính, không rải khắp trang. */
export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } }, { threshold: 0.18 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

/** Thêm class "entered" cho phần tử cha sau khi tải để các [data-enter] trồi lên lần lượt. */
export function Enter({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { requestAnimationFrame(() => ref.current?.classList.add("entered")); }, []);
  return <div ref={ref} className={className}>{children}</div>;
}
