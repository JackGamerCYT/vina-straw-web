"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Leaf } from "lucide-react";
import { HeroVideo } from "./hero-video";
import { EImg, T, useEdit } from "./editable";

export type Slide = { kicker: string; big: string; rest: string; lead: string; img?: string; video?: { src: string; poster: string } };

// Slide đầu là tiêu đề chính của trang (h1), các slide sau là h2.
const Heading = ({ k, ...p }: { k: number; className: string; children: React.ReactNode }) => (k === 0 ? <h1 {...p} /> : <h2 {...p} />);

/** Banner đầu trang dạng thẻ bo góc, tự chuyển sau 7 giây (tạm dừng khi rê chuột hoặc khi đang sửa). */
export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  const { editing } = useEdit();
  const n = slides.length;
  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);
  useEffect(() => {
    if (hold || editing || n < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => go(1), 7000);
    return () => clearTimeout(t);
  }, [i, hold, editing, go, n]);

  return (
    <section className="px-3 pt-[76px] sm:px-5 lg:pt-[124px]" aria-roledescription="carousel" aria-label="Giới thiệu Vina-Straw">
      <div className="relative isolate mx-auto h-[min(78svh,760px)] min-h-[520px] max-w-[1600px] overflow-hidden rounded-[28px] bg-leaf-900 sm:rounded-[36px]"
        onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)}>
        {slides.map((s, k) => (
          <div key={k} aria-hidden={k !== i} className={`absolute inset-0 transition-opacity duration-1000 ${k === i ? "z-10 opacity-100" : "pointer-events-none opacity-0"}`}>
            <div className={`absolute inset-0 ${k === i ? "scale-100" : "scale-105"} transition-transform duration-[7000ms] ease-out`}>
              {s.video ? <HeroVideo src={s.video.src} poster={s.video.poster} className="h-full w-full object-cover" />
                : s.img ? <EImg k={`home.slide${k + 1}.img`} src={s.img} alt="" fill priority={k === 0} sizes="100vw" className="object-cover" /> : null}
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(13,42,27,.55),rgba(13,42,27,.78))]" />
            <div className="relative flex h-full flex-col items-center justify-center px-6 text-center text-white">
              <p className="flex items-center gap-2 text-[15px] font-semibold text-white/90 sm:text-base"><Leaf className="h-4 w-4 text-straw-300" /> <T k={`home.slide${k + 1}.kicker`}>{s.kicker}</T></p>
              <Heading k={k} className="font-display mt-5 leading-[0.92] tracking-tight">
                <T k={`home.slide${k + 1}.big`} className="block text-[64px] font-extrabold uppercase sm:text-[110px] lg:text-[150px]">{s.big}</T>
                <T k={`home.slide${k + 1}.rest`} className="mt-2 block text-3xl font-bold sm:text-5xl lg:text-6xl">{s.rest}</T>
              </Heading>
              <T k={`home.slide${k + 1}.lead`} as="p" multiline className="mt-6 block max-w-2xl text-base text-white/85 sm:text-lg">{s.lead}</T>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Link href="/san-pham" className="inline-flex items-center gap-2 rounded-full bg-straw-500 px-7 py-4 font-semibold text-soil-900 transition hover:bg-straw-300">Xem sản phẩm <ArrowUpRight className="h-4 w-4" /></Link>
                <Link href="/bao-gia" className="inline-flex items-center gap-2 rounded-full border border-white/60 px-7 py-4 font-semibold text-white backdrop-blur transition hover:bg-white/10">Nhận báo giá <ArrowUpRight className="h-4 w-4" /></Link>
              </div>
            </div>
          </div>
        ))}
        {n > 1 && (
          <>
            <button onClick={() => go(-1)} aria-label="Ảnh trước" className="absolute left-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/40 text-white backdrop-blur hover:bg-white/15 md:grid"><ArrowLeft className="h-5 w-5" /></button>
            <button onClick={() => go(1)} aria-label="Ảnh sau" className="absolute right-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/40 text-white backdrop-blur hover:bg-white/15 md:grid"><ArrowRight className="h-5 w-5" /></button>
            <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center gap-2">
              {slides.map((_, k) => <button key={k} onClick={() => setI(k)} aria-label={`Ảnh ${k + 1}`} aria-current={k === i} className={`h-2.5 rounded-full transition-all ${k === i ? "w-9 bg-straw-500" : "w-2.5 bg-white/60"}`} />)}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
