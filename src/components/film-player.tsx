"use client";
import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

export function FilmPlayer({ src, poster }: { src: string; poster: string }) {
  const v = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [p, setP] = useState(0);
  const toggle = () => { const el = v.current!; if (el.paused) { el.play(); } else el.pause(); };
  return (
    <div className="group relative overflow-hidden rounded-[28px] bg-leaf-950 shadow-[0_40px_80px_-40px_rgba(0,0,0,.6)]">
      <video
        ref={v} src={src} poster={poster} playsInline muted preload="metadata"
        className="aspect-video w-full object-cover"
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setP(e.currentTarget.currentTime / (e.currentTarget.duration || 1))}
        onClick={toggle}
      />
      {!playing && (
        <button onClick={toggle} className="absolute inset-0 grid place-items-center bg-leaf-950/25 transition hover:bg-leaf-950/10" aria-label="Phát phim giới thiệu">
          <span className="grid h-24 w-24 place-items-center rounded-full bg-white text-leaf-800 shadow-2xl transition duration-300 group-hover:scale-105">
            <Play className="ml-1 h-9 w-9 fill-current" />
          </span>
        </button>
      )}
      <div className={`absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/60 to-transparent px-5 pb-4 pt-10 transition ${playing ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}>
        <button onClick={toggle} className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25" aria-label={playing ? "Tạm dừng" : "Phát"}>
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/25"><div className="h-full bg-straw-300" style={{ width: `${p * 100}%` }} /></div>
      </div>
    </div>
  );
}
