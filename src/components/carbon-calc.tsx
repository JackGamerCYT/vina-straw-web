"use client";
import Image from "next/image";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { carbonOf, fmtCredits, fmtMass, unitsPerCredit } from "@/lib/carbon";
import { isRender } from "@/lib/format";
import { CarbonCard } from "./carbon";
import { addToCart } from "./cart";
import { toast } from "sonner";

type P = { id: number; name: string; unit: string; moq: number; straw: number; image: string; price: number };

/** Máy tính: chọn sản phẩm và số lượng, xem rơm giữ lại, CO2e tránh được và số tín chỉ. */
export function CarbonCalc({ products }: { products: P[] }) {
  const [q, setQ] = useState<Record<number, number>>(() => Object.fromEntries(products.slice(0, 2).map((p) => [p.id, Math.max(p.moq, 100)])));
  const set = (id: number, v: number) => setQ((x) => ({ ...x, [id]: Math.max(0, v) }));
  const straw = products.reduce((t, p) => t + (q[p.id] ?? 0) * p.straw, 0);
  const c = carbonOf(straw);
  const chosen = products.filter((p) => (q[p.id] ?? 0) > 0);
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
      <ul className="divide-y divide-ink/10 rounded-[28px] border border-ink/10 bg-white">
        {products.map((p) => {
          const n = q[p.id] ?? 0;
          const step = Math.max(1, p.moq);
          return (
            <li key={p.id} className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap">
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-mist">{p.image && <Image src={p.image} alt="" fill sizes="56px" className={isRender(p.image) ? "object-contain p-1" : "object-cover"} unoptimized={p.image.startsWith("data:")} />}</span>
              <span className="min-w-0 flex-1"><span className="block font-semibold">{p.name}</span><span className="text-xs text-ink-soft">{fmtMass(p.straw)} rơm / {p.unit} · cần {unitsPerCredit(p.straw).toLocaleString("vi-VN")} {p.unit} cho 1 tín chỉ</span></span>
              <span className="flex items-center gap-1 rounded-full border border-ink/15 p-1">
                <button type="button" onClick={() => set(p.id, n - step)} aria-label={`Giảm ${p.name}`} className="grid h-8 w-8 place-items-center rounded-full hover:bg-mist"><Minus className="h-4 w-4" /></button>
                <input value={n} inputMode="numeric" aria-label={`Số lượng ${p.name}`} onChange={(e) => set(p.id, Number(e.target.value.replace(/\D/g, "")) || 0)} className="w-20 bg-transparent text-center font-semibold outline-none" />
                <button type="button" onClick={() => set(p.id, n + step)} aria-label={`Tăng ${p.name}`} className="grid h-8 w-8 place-items-center rounded-full hover:bg-mist"><Plus className="h-4 w-4" /></button>
              </span>
            </li>
          );
        })}
      </ul>
      <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
        <div className="rounded-[28px] bg-leaf-700 p-7 text-white">
          <p className="text-sm text-white/70">Tín chỉ carbon ước tính</p>
          <p className="font-display mt-1 text-5xl font-bold">{fmtCredits(c.credits)}</p>
          <p className="mt-1 text-white/80">tương đương {fmtMass(c.co2eG)} CO2e không thải ra</p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-straw-300" style={{ width: `${Math.min(100, (c.credits % 1 || (c.credits >= 1 ? 1 : 0)) * 100)}%` }} /></div>
          <p className="mt-2 text-xs text-white/70">{c.credits >= 1 ? `Đủ ${Math.floor(c.credits).toLocaleString("vi-VN")} tín chỉ.` : `${(c.credits * 100).toLocaleString("vi-VN", { maximumFractionDigits: 3 })}% của 1 tín chỉ.`}</p>
        </div>
        <CarbonCard c={c} title="Chi tiết" compact />
        {chosen.some((p) => p.price > 0) && (
          <button type="button" className="btn-primary w-full" onClick={() => { chosen.filter((p) => p.price > 0).forEach((p) => addToCart(p.id, Math.max(p.moq, q[p.id]))); toast.success("Đã thêm vào giỏ hàng"); }}>Thêm các sản phẩm có giá vào giỏ</button>
        )}
      </aside>
    </div>
  );
}
