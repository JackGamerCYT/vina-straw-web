"use client";
import { T, EImg } from "./editable";
import { useEffect, useRef } from "react";

export type Step = { title: string; body: string; img: string; contain?: boolean };

/**
 * Quy trình 5 bước: desktop ghim lại và trượt ngang theo cuộn (GSAP ScrollTrigger),
 * mobile xếp dọc bình thường.
 */
export function ProcessScroller({ steps }: { steps: Step[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;
    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const t = track.current!, w = wrap.current!;
        const dist = () => t.scrollWidth - window.innerWidth + 64;
        const tween = gsap.to(t, {
          x: () => -dist(), ease: "none",
          scrollTrigger: { trigger: w, start: "top top", end: () => "+=" + dist(), pin: true, scrub: 0.6, invalidateOnRefresh: true,
            onUpdate: (s) => { if (bar.current) bar.current.style.transform = `scaleX(${s.progress})`; } },
        });
        t.querySelectorAll<HTMLElement>("[data-par]").forEach((img) => {
          gsap.fromTo(img, { xPercent: -8 }, { xPercent: 8, ease: "none", scrollTrigger: { trigger: img, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
        });
      });
      ctx = mm;
    })();
    return () => { cancelled = true; ctx?.revert(); };
  }, []);

  return (
    <div ref={wrap} className="relative overflow-hidden lg:h-screen">
      <div className="mx-auto max-w-[1240px] px-5 pt-24 lg:px-8 lg:pt-[13vh]">
        <T k="process.title" as="h2" className="font-display block max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-leaf-900 sm:text-5xl lg:text-6xl">Từ bó rơm đến chiếc tô trên bàn</T>
        <T k="process.lead" as="p" className="mt-4 block max-w-xl text-lg text-ink-soft">Năm công đoạn, mỗi công đoạn có thông số ghi lại để mẫu sau giống mẫu trước.</T>
        <div className="mt-6 hidden h-[3px] w-64 overflow-hidden rounded-full bg-leaf-100 lg:block"><div ref={bar} className="h-full origin-left scale-x-0 bg-straw-500" /></div>
      </div>
      <div ref={track} className="mt-10 flex flex-col gap-8 px-5 pb-24 will-change-transform lg:mt-[5vh] lg:flex-row lg:gap-8 lg:pb-0 lg:pl-[max(2rem,calc((100vw-1240px)/2+2rem))]">
        {steps.map((s, i) => (
          <article key={i} className="flex shrink-0 flex-col overflow-hidden rounded-[28px] bg-mist lg:h-[56vh] lg:w-[min(560px,42vw)] lg:flex-row">
            <div className={`relative aspect-[4/3] overflow-hidden lg:aspect-auto lg:w-[52%] ${s.contain ? "bg-straw-100" : ""}`}>
              <div data-par className="absolute inset-[-10%_-12%]">
                <EImg k={`process.${i + 1}.img`} src={s.img} alt="" fill sizes="(min-width:1024px) 300px, 100vw" className={s.contain ? "object-contain p-[14%]" : "object-cover"} />
              </div>
            </div>
            <div className="flex flex-1 flex-col justify-between p-7">
              <span className="font-display text-6xl font-bold text-straw-500/80">{i + 1}</span>
              <div>
                <T k={`process.${i + 1}.t`} as="h3" className="font-display block text-2xl font-bold text-leaf-900">{s.title}</T>
                <T k={`process.${i + 1}.b`} as="p" multiline className="mt-3 block leading-relaxed text-ink-soft">{s.body}</T>
              </div>
            </div>
          </article>
        ))}
        <div className="hidden w-8 shrink-0 lg:block" />
      </div>
    </div>
  );
}
