"use client";
import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

/** Chọn bản nhẹ cho màn hình nhỏ: `film.mp4` → `film-720.mp4`. */
export const lighter = (src: string, suffix: string) => src.replace(/\.mp4$/, `-${suffix}.mp4`);

export function FilmPlayer({ src, poster }: { src: string; poster: string }) {
  const v = useRef<HTMLVideoElement>(null);
  const [url, setUrl] = useState(src);
  const [playing, setPlaying] = useState(false);
  const [p, setP] = useState(0);
  const [err, setErr] = useState(false);
  useEffect(() => {
    // điện thoại, máy tính bảng hoặc mạng yếu: dùng bản 720p (H.264 Main, phát được trên hầu hết máy)
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (window.matchMedia("(max-width: 1024px)").matches || conn?.saveData || /2g|3g/.test(conn?.effectiveType ?? "")) setUrl(lighter(src, "720"));
  }, [src]);
  const toggle = () => {
    const el = v.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => fallback());
    else el.pause();
  };
  const fallback = () => {
    const small = lighter(src, "720");
    if (url !== small) { setUrl(small); setTimeout(() => v.current?.play().catch(() => setErr(true)), 50); }
    else setErr(true);
  };
  return (
    <div className="group relative overflow-hidden rounded-[28px] bg-leaf-950 shadow-[0_40px_80px_-40px_rgba(0,0,0,.6)]">
      <video
        ref={v} key={url} poster={poster} playsInline muted preload="metadata"
        className="aspect-video w-full object-cover"
        onPlay={() => { setPlaying(true); setErr(false); }} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setP(e.currentTarget.currentTime / (e.currentTarget.duration || 1))}
        onError={fallback}
        onClick={toggle}
      >
        <source src={url} type="video/mp4" />
      </video>
      {!playing && (
        <button onClick={toggle} className="absolute inset-0 grid place-items-center bg-leaf-950/25 transition hover:bg-leaf-950/10" aria-label="Phát phim giới thiệu">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-white text-leaf-800 shadow-2xl transition duration-300 group-hover:scale-105 sm:h-24 sm:w-24">
            <Play className="ml-1 h-8 w-8 fill-current sm:h-9 sm:w-9" />
          </span>
        </button>
      )}
      {err && <p className="absolute inset-x-4 top-4 rounded-xl bg-black/70 p-3 text-sm text-white">Máy chưa phát được video. <a href={lighter(src, "720")} className="font-semibold underline">Mở video trực tiếp</a></p>}
      <div className={`absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/60 to-transparent px-5 pb-4 pt-10 transition ${playing ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}>
        <button onClick={toggle} className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25" aria-label={playing ? "Tạm dừng" : "Phát"}>
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/25"><div className="h-full bg-straw-300" style={{ width: `${p * 100}%` }} /></div>
      </div>
    </div>
  );
}
