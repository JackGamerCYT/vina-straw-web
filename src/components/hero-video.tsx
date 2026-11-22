"use client";
import { useEffect, useRef, useState } from "react";

/** Video nền hero: phát lặp, dừng khi khuất màn hình; giảm chuyển động thì chỉ hiện ảnh tĩnh. */
export function HeroVideo({ src, poster, className = "" }: { src: string; poster: string; className?: string }) {
  const v = useRef<HTMLVideoElement>(null);
  const [still, setStill] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setStill(true);
    const el = v.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? el.play().catch(() => {}) : el.pause()));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return still ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={poster} alt="" className={className} />
  ) : (
    <video ref={v} className={className} autoPlay muted loop playsInline preload="auto" poster={poster} aria-hidden>
      <source src={src} type="video/mp4" />
    </video>
  );
}
