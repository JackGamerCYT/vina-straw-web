"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Package } from "lucide-react";
import { isRender } from "@/lib/format";

export type Line = { name: string; title: string; items: string[]; body: string; image: string; count: number; real: boolean };

export function LineTabs({ lines }: { lines: Line[] }) {
  const [i, setI] = useState(0);
  const l = lines[i];
  if (!l) return null;
  return (
    <div>
      <div role="tablist" className="flex flex-wrap justify-center gap-2">
        {lines.map((x, k) => (
          <button key={x.name} role="tab" aria-selected={k === i} onClick={() => setI(k)}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${k === i ? "bg-leaf-700 text-white shadow" : "bg-white text-ink hover:bg-leaf-100"}`}>{x.name}</button>
        ))}
      </div>
      <div key={l.name} role="tabpanel" className="toast-pop mt-10 grid items-center gap-10 rounded-[32px] border border-ink/5 bg-white p-6 sm:p-10 lg:grid-cols-2">
        <div>
          <span className="grid h-16 w-16 place-items-center rounded-full bg-leaf-100 text-leaf-700"><Package className="h-7 w-7" /></span>
          <h3 className="font-display mt-6 text-3xl font-bold text-leaf-900 sm:text-4xl">{l.title}</h3>
          <ul className="mt-4 flex flex-wrap gap-2">{l.items.map((t) => <li key={t} className="rounded-full bg-mist px-3 py-1 text-sm font-semibold text-leaf-800">{t}</li>)}</ul>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">{l.body}</p>
          <p className="mt-4 text-sm font-semibold text-soil-700">{l.count} sản phẩm · {l.real ? "có ảnh chụp mẫu thật" : "ảnh dựng 3D theo bản vẽ"}</p>
          <Link href={`/san-pham?dong=${encodeURIComponent(l.name)}`} className="btn-primary mt-8 !px-7 !py-3.5">Xem chi tiết <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-mist">
          {l.image && <Image src={l.image} alt={l.title} fill sizes="(min-width:1024px) 560px, 100vw" className={isRender(l.image) ? "object-contain p-[8%]" : "object-cover"} unoptimized={l.image.startsWith("data:")} />}
        </div>
      </div>
    </div>
  );
}
