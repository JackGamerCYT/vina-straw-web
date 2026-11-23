"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Video nền: phát lặp, dừng khi khuất màn hình; giảm chuyển động thì chỉ hiện ảnh tĩnh.
 * Điện thoại dùng bản 540p. `muted` được gán bằng JS vì React không in thuộc tính này ra HTML,
 * thiếu nó Safari trên iPhone sẽ không cho tự phát.
 */
export function HeroVideo({ src, poster, className = "" }: { src: string; poster: string; className?: string }) {
  const v = useRef<HTMLVideoElement>(null);
  const [still, setStill] = useState(false);
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setStill(true);
    setUrl(window.matchMedia("(max-width: 1024px)").matches && src.endsWith(".mp4") ? src.replace(/\.mp4$/, "-540.mp4") : src);
  }, [src]);
  useEffect(() => {
    const el = v.current;
    if (!el || !url) return;
    el.muted = true; el.defaultMuted = true; el.setAttribute("muted", ""); el.setAttribute("playsinline", "");
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? el.play().catch(() => {}) : el.pause()));
    io.observe(el);
    return () => io.disconnect();
  }, [url]);
  if (still) return <img src={poster} alt="" className={className} />; // eslint-disable-line @next/next/no-img-element
  return (
    <video ref={v} key={url} className={className} autoPlay muted loop playsInline preload="auto" poster={poster} aria-hidden onError={() => url !== src && setUrl(src)}>
      {url && <source src={url} type="video/mp4" />}
    </video>
  );
}
