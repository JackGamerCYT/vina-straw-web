"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { CarbonCard } from "./carbon";
import { carbonOf } from "@/lib/carbon";

export type CartLine = { id: number; qty: number };
const KEY = "vs-cart";
const EVT = "vs-cart";

function read(): CartLine[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v.filter((x) => Number.isInteger(x?.id) && x.qty > 0) : [];
  } catch { return []; }
}
let snap: CartLine[] = [];
let snapRaw = "";
function getSnap() {
  let raw = "[]";
  try { raw = localStorage.getItem(KEY) || "[]"; } catch {}
  if (raw !== snapRaw) { snapRaw = raw; snap = read(); }
  return snap;
}
const EMPTY: CartLine[] = [];
function subscribe(cb: () => void) {
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => { window.removeEventListener(EVT, cb); window.removeEventListener("storage", cb); };
}
export function writeCart(lines: CartLine[]) {
  try { localStorage.setItem(KEY, JSON.stringify(lines.filter((l) => l.qty > 0))); } catch {}
  window.dispatchEvent(new Event(EVT));
}
export function useCart() {
  return useSyncExternalStore(subscribe, getSnap, () => EMPTY);
}
export function addToCart(id: number, qty: number) {
  const lines = [...read()];
  const i = lines.findIndex((l) => l.id === id);
  if (i >= 0) lines[i] = { id, qty: lines[i].qty + qty }; else lines.push({ id, qty });
  writeCart(lines);
}
export function clearCart() { writeCart([]); }

/** Biểu tượng giỏ trên thanh điều hướng. */
export function CartBadge() {
  const lines = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const n = mounted ? lines.length : 0;
  return (
    <Link href="/gio-hang" aria-label={`Giỏ hàng, ${n} sản phẩm`} className="relative grid h-11 w-11 place-items-center rounded-full text-ink hover:bg-mist">
      <ShoppingBag className="h-5 w-5" />
      {n > 0 && <span className="absolute right-1 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-straw-500 px-1 text-[11px] font-bold text-soil-900">{n}</span>}
    </Link>
  );
}

/** Chọn số lượng + thêm vào giỏ / mua ngay (trang chi tiết sản phẩm). */
export function BuyBox({ id, moq, unit, straw = 0 }: { id: number; moq: number; unit: string; straw?: number }) {
  const [qty, setQty] = useState(moq);
  const router = useRouter();
  const step = Math.max(1, moq);
  const add = (go: boolean) => {
    addToCart(id, qty);
    if (go) router.push("/gio-hang");
    else toast.success("Đã thêm vào giỏ", { action: { label: "Xem giỏ", onClick: () => router.push("/gio-hang") } });
  };
  return (
    <div className="space-y-4">
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1 rounded-full border border-ink/15 p-1">
        <button type="button" onClick={() => setQty((q) => Math.max(moq, q - step))} className="grid h-10 w-10 place-items-center rounded-full hover:bg-mist" aria-label="Giảm"><Minus className="h-4 w-4" /></button>
        <input value={qty} inputMode="numeric" aria-label="Số lượng" onChange={(e) => setQty(Number(e.target.value.replace(/\D/g, "")) || 0)} onBlur={() => setQty((q) => Math.max(moq, q))} className="w-20 bg-transparent text-center font-semibold outline-none" />
        <button type="button" onClick={() => setQty((q) => q + step)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-mist" aria-label="Tăng"><Plus className="h-4 w-4" /></button>
      </div>
      <span className="text-sm text-ink-soft">{unit}</span>
      <button type="button" onClick={() => add(false)} className="btn-ghost !px-6 !py-3.5"><ShoppingBag className="h-4 w-4" /> Thêm vào giỏ</button>
      <button type="button" onClick={() => add(true)} className="btn-primary !px-7 !py-3.5">Mua ngay</button>
    </div>
    <CarbonCard c={carbonOf(Math.max(moq, qty) * straw)} title={`Nếu mua ${Math.max(moq, qty).toLocaleString("vi-VN")} ${unit}`} compact />
    </div>
  );
}

/** Nút giỏ nhỏ trên thẻ sản phẩm: thêm đúng số lượng tối thiểu. */
export function QuickAdd({ id, moq, name }: { id: number; moq: number; name: string }) {
  const router = useRouter();
  return (
    <button type="button" aria-label={`Thêm ${name} vào giỏ`} title="Thêm vào giỏ"
      onClick={() => { addToCart(id, moq); toast.success(`Đã thêm ${name}`, { action: { label: "Xem giỏ", onClick: () => router.push("/gio-hang") } }); }}
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-leaf-100 text-leaf-700 transition hover:bg-leaf-700 hover:text-white">
      <ShoppingBag className="h-5 w-5" />
    </button>
  );
}
