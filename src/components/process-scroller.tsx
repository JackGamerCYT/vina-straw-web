"use client";
import { T, EImg } from "./editable";
import { useCallback, useEffect, useRef, useState } from "react";

export type Step = { title: string; body: string; img: string; contain?: boolean };

/** Quy trình 5 bước: băng thẻ ngang, chuyển bằng nút mũi tên (vẫn vuốt được trên điện thoại). */
export function ProcessScroller({ steps }: { steps: Step[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [edge, setEdge] = useState({ start: true, end: false });

  const sync = useCallback(() => {
    const t = track.current;
    if (!t) return;
    const cards = [...t.children] as HTMLElement[];
    const left = t.scrollLeft;
    let best = 0;
    cards.forEach((c, i) => { if (Math.abs(c.offsetLeft - t.offsetLeft - left) < Math.abs(cards[best].offsetLeft - t.offsetLeft - left)) best = i; });
    const end = left + t.clientWidth >= t.scrollWidth - 4;
    setIdx(end ? cards.length - 1 : best);
    setEdge({ start: left <= 4, end });
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [sync]);

  const go = (i: number) => {
    const t = track.current;
    if (!t) return;
    const n = Math.max(0, Math.min(steps.length - 1, i));
    const card = t.children[n] as HTMLElement;
    t.scrollTo({ left: card.offsetLeft - t.offsetLeft, behavior: "smooth" });
  };

  const btn = "grid h-12 w-12 place-items-center rounded-full border border-leaf-900/15 bg-white text-leaf-900 shadow-sm transition hover:bg-leaf-900 hover:text-white disabled:pointer-events-none disabled:opacity-35";

  return (
    <div className="relative py-20 lg:py-24">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-end justify-between gap-6 px-5 lg:px-8">
        <div>
          <T k="process.title" as="h2" className="font-display block max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-leaf-900 sm:text-5xl lg:text-6xl">Từ bó rơm đến chiếc tô trên bàn</T>
          <T k="process.lead" as="p" className="mt-4 block max-w-xl text-lg text-ink-soft">Năm công đoạn, mỗi công đoạn có thông số ghi lại để mẫu sau giống mẫu trước.</T>
        </div>
        <div className="flex items-center gap-3">
          <span className="mr-2 font-display text-sm font-semibold tabular-nums text-ink-soft">{String(idx + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}</span>
          <button type="button" aria-label="Công đoạn trước" className={btn} disabled={edge.start} onClick={() => go(idx - 1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button type="button" aria-label="Công đoạn tiếp theo" className={btn} disabled={edge.end} onClick={() => go(idx + 1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      </div>

      <div
        ref={track}
        onScroll={sync}
        className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-5 pb-2 [scrollbar-width:none] lg:gap-8 lg:px-[max(2rem,calc((100vw-1240px)/2+2rem))] lg:scroll-px-[max(2rem,calc((100vw-1240px)/2+2rem))] [&::-webkit-scrollbar]:hidden"
      >
        {steps.map((s, i) => (
          <article key={i} className="flex w-[86vw] shrink-0 snap-start flex-col overflow-hidden rounded-[28px] bg-mist sm:w-[440px] lg:h-[440px] lg:w-[min(600px,46vw)] lg:flex-row">
            <div className={`relative aspect-[4/3] overflow-hidden lg:aspect-auto lg:w-[50%] ${s.contain ? "bg-straw-100" : ""}`}>
              <EImg k={`process.${i + 1}.img`} src={s.img} alt="" fill sizes="(min-width:1024px) 300px, 86vw" className={s.contain ? "object-contain p-[14%]" : "object-cover"} />
            </div>
            <div className="flex flex-1 flex-col justify-between gap-6 p-7">
              <span className="font-display text-6xl font-bold text-straw-500/80">{i + 1}</span>
              <div>
                <T k={`process.${i + 1}.t`} as="h3" className="font-display block text-2xl font-bold text-leaf-900">{s.title}</T>
                <T k={`process.${i + 1}.b`} as="p" multiline className="mt-3 block leading-relaxed text-ink-soft">{s.body}</T>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mx-auto mt-8 flex max-w-[1240px] gap-2 px-5 lg:px-8">
        {steps.map((_, i) => (
          <button key={i} type="button" aria-label={`Công đoạn ${i + 1}`} onClick={() => go(i)}
            className={`h-[5px] rounded-full transition-all ${i === idx ? "w-10 bg-straw-500" : "w-5 bg-leaf-900/15 hover:bg-leaf-900/30"}`} />
        ))}
      </div>
    </div>
  );
}
