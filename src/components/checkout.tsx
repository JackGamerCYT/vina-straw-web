"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import { toast } from "sonner";
import { clearCart, useCart, writeCart } from "./cart";
import { placeOrder } from "@/lib/shop-actions";
import { isRender, vnd } from "@/lib/format";
import { shippingFor, type Shop } from "@/lib/types";
import { carbonOf } from "@/lib/carbon";
import { CarbonCard } from "./carbon";

export type Lite = { id: number; slug: string; name: string; price: number; unit: string; moq: number; image: string; straw: number };

function useLines(products: Lite[]) {
  const cart = useCart();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const lines = cart.map((l) => ({ ...l, p: products.find((p) => p.id === l.id) })).filter((l): l is typeof l & { p: Lite } => Boolean(l.p));
  const subtotal = lines.reduce((t, l) => t + l.qty * l.p.price, 0);
  const carbon = carbonOf(lines.reduce((t, l) => t + l.qty * l.p.straw, 0));
  return { ready, lines, subtotal, cart, carbon };
}

function Thumb({ src }: { src: string }) {
  return (
    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-mist">
      {src && <Image src={src} alt="" fill sizes="80px" className={isRender(src) ? "object-contain p-2" : "object-cover"} unoptimized={src.startsWith("data:")} />}
    </div>
  );
}

function Totals({ subtotal, shop }: { subtotal: number; shop: Shop }) {
  const ship = shippingFor(shop, subtotal);
  return (
    <dl className="space-y-3 text-[15px]">
      <div className="flex justify-between"><dt className="text-ink-soft">Tạm tính</dt><dd className="font-semibold">{vnd(subtotal)}</dd></div>
      <div className="flex justify-between"><dt className="text-ink-soft">Phí giao hàng</dt><dd className="font-semibold">{ship > 0 ? vnd(ship) : shop.shipFee > 0 ? "Miễn phí" : "Báo sau"}</dd></div>
      {shop.freeShipOver > 0 && ship > 0 && <p className="text-xs text-ink-soft">Miễn phí giao hàng cho đơn từ {vnd(shop.freeShipOver)}.</p>}
      <div className="flex justify-between border-t border-ink/10 pt-3"><dt className="font-semibold">Tổng cộng</dt><dd className="font-display text-2xl font-bold text-leaf-700">{vnd(subtotal + ship)}</dd></div>
    </dl>
  );
}

export function CartView({ products, shop }: { products: Lite[]; shop: Shop }) {
  const { ready, lines, subtotal, cart, carbon } = useLines(products);
  const set = (id: number, qty: number) => writeCart(cart.map((l) => (l.id === id ? { ...l, qty } : l)).filter((l) => l.qty > 0));
  if (!ready) return <div className="mt-10 h-40 animate-pulse rounded-3xl bg-mist" />;
  if (lines.length === 0) {
    return (
      <div className="mt-10 rounded-[28px] bg-mist p-12 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-leaf-600" />
        <p className="mt-4 text-lg text-ink-soft">Giỏ hàng đang trống.</p>
        <Link href="/san-pham" className="btn-primary mt-6">Xem sản phẩm</Link>
      </div>
    );
  }
  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
      <ul className="divide-y divide-ink/10 rounded-[28px] border border-ink/10">
        {lines.map(({ id, qty, p }) => {
          const step = Math.max(1, p.moq);
          return (
            <li key={id} className="flex flex-wrap items-center gap-4 p-5 sm:flex-nowrap">
              <Thumb src={p.image} />
              <div className="min-w-0 flex-1">
                <Link href={`/san-pham/${p.slug}`} className="font-display text-lg font-bold text-ink hover:text-leaf-700">{p.name}</Link>
                <p className="text-sm text-ink-soft">{vnd(p.price)} / {p.unit}{p.moq > 1 ? ` · tối thiểu ${p.moq.toLocaleString("vi-VN")}` : ""}</p>
                {qty < p.moq && <p className="mt-1 text-sm font-semibold text-red-600">Cần ít nhất {p.moq.toLocaleString("vi-VN")} {p.unit}</p>}
              </div>
              <div className="flex items-center gap-1 rounded-full border border-ink/15 p-1">
                <button type="button" onClick={() => set(id, Math.max(p.moq, qty - step))} className="grid h-9 w-9 place-items-center rounded-full hover:bg-mist" aria-label={`Giảm ${p.name}`}><Minus className="h-4 w-4" /></button>
                <input value={qty} inputMode="numeric" aria-label={`Số lượng ${p.name}`} onChange={(e) => set(id, Number(e.target.value.replace(/\D/g, "")) || 1)} className="w-16 bg-transparent text-center font-semibold outline-none" />
                <button type="button" onClick={() => set(id, qty + step)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-mist" aria-label={`Tăng ${p.name}`}><Plus className="h-4 w-4" /></button>
              </div>
              <p className="w-28 text-right font-semibold">{vnd(qty * p.price)}</p>
              <button type="button" onClick={() => set(id, 0)} className="grid h-9 w-9 place-items-center rounded-full text-red-600 hover:bg-red-50" aria-label={`Bỏ ${p.name}`}><Trash2 className="h-4 w-4" /></button>
            </li>
          );
        })}
      </ul>
      <aside className="panel space-y-6 self-start p-6 lg:sticky lg:top-28">
        <Totals subtotal={subtotal} shop={shop} />
        <CarbonCard c={carbon} title="Giỏ hàng này giúp" compact />
        <Link href="/thanh-toan" aria-disabled={lines.some((l) => l.qty < l.p.moq)} className={`btn-primary w-full !py-4 ${lines.some((l) => l.qty < l.p.moq) ? "pointer-events-none opacity-50" : ""}`}>Đặt hàng <ArrowRight className="h-4 w-4" /></Link>
        <p className="flex gap-2 text-sm text-ink-soft"><Truck className="h-4 w-4 shrink-0" /> {shop.shipNote}</p>
      </aside>
    </div>
  );
}

type Me = { name: string; phone: string; email: string; address: string; company: string } | null;

export function CheckoutForm({ products, shop, me }: { products: Lite[]; shop: Shop; me: Me }) {
  const { ready, lines, subtotal, carbon } = useLines(products);
  const [pending, start] = useTransition();
  const [err, setErr] = useState("");
  const router = useRouter();
  const bank = Boolean(shop.bankName && shop.bankAccount && shop.bankHolder);
  const [method, setMethod] = useState<"COD" | "BANK">(shop.cod || !bank ? "COD" : "BANK");
  if (!ready) return <div className="mt-10 h-60 animate-pulse rounded-3xl bg-mist" />;
  if (lines.length === 0) return <p className="mt-10 rounded-3xl bg-mist p-10 text-center text-ink-soft">Giỏ hàng trống. <Link href="/san-pham" className="font-semibold text-leaf-700 underline">Chọn sản phẩm</Link></p>;
  if (!shop.cod && !bank) return <p className="mt-10 rounded-3xl bg-straw-100 p-8 text-soil-900">Cửa hàng chưa mở thanh toán trực tuyến. Hãy <Link href="/bao-gia" className="font-semibold underline">gửi yêu cầu đặt hàng</Link>, chúng tôi sẽ gọi lại.</p>;

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const g = (k: string) => String(f.get(k) ?? "");
    setErr("");
    start(async () => {
      const r = await placeOrder({
        items: lines.map((l) => ({ id: l.id, qty: l.qty })),
        name: g("name"), phone: g("phone"), email: g("email"), address: g("address"), company: g("company"), note: g("note"), method,
      });
      if (r.error) { setErr(r.error); toast.error(r.error); return; }
      clearCart();
      router.push(`/don-hang/${r.code}?k=${r.token}&moi=1`);
    });
  };
  return (
    <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
      <div className="space-y-10">
        <fieldset>
          <legend className="font-display text-2xl font-bold text-leaf-900">Thông tin giao hàng</legend>
          {!me && <p className="mt-1 text-sm text-ink-soft">Đã có tài khoản? <Link href="/dang-nhap?next=/thanh-toan" className="font-semibold text-leaf-700 underline">Đăng nhập</Link> để lưu đơn vào lịch sử mua hàng.</p>}
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div><label className="label" htmlFor="name">Họ tên người nhận *</label><input id="name" name="name" required defaultValue={me?.name} className="field" autoComplete="name" /></div>
            <div><label className="label" htmlFor="phone">Số điện thoại *</label><input id="phone" name="phone" required defaultValue={me?.phone} className="field" inputMode="tel" autoComplete="tel" /></div>
            <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" defaultValue={me?.email} className="field" autoComplete="email" /></div>
            <div><label className="label" htmlFor="company">Quán / công ty</label><input id="company" name="company" defaultValue={me?.company} className="field" autoComplete="organization" /></div>
            <div className="sm:col-span-2"><label className="label" htmlFor="address">Địa chỉ giao hàng *</label><input id="address" name="address" required defaultValue={me?.address} className="field" placeholder="Số nhà, đường, phường/xã, tỉnh/thành" autoComplete="street-address" /></div>
            <div className="sm:col-span-2"><label className="label" htmlFor="note">Ghi chú</label><textarea id="note" name="note" rows={3} className="field" placeholder="Giờ nhận hàng, in logo, xuất hoá đơn…" /></div>
          </div>
        </fieldset>
        <fieldset>
          <legend className="font-display text-2xl font-bold text-leaf-900">Thanh toán</legend>
          <div className="mt-5 grid gap-3">
            {shop.cod && (
              <label className={`flex cursor-pointer gap-3 rounded-2xl border p-4 ${method === "COD" ? "border-leaf-700 bg-leaf-100/50" : "border-ink/15"}`}>
                <input type="radio" name="method" checked={method === "COD"} onChange={() => setMethod("COD")} className="mt-1 accent-leaf-700" />
                <span><b>Thanh toán khi nhận hàng (COD)</b><span className="block text-sm text-ink-soft">Trả tiền mặt hoặc chuyển khoản cho người giao.</span></span>
              </label>
            )}
            {bank && (
              <label className={`flex cursor-pointer gap-3 rounded-2xl border p-4 ${method === "BANK" ? "border-leaf-700 bg-leaf-100/50" : "border-ink/15"}`}>
                <input type="radio" name="method" checked={method === "BANK"} onChange={() => setMethod("BANK")} className="mt-1 accent-leaf-700" />
                <span><b>Chuyển khoản ngân hàng</b><span className="block text-sm text-ink-soft">Thông tin tài khoản hiện sau khi đặt hàng; ghi mã đơn ở nội dung chuyển khoản.</span></span>
              </label>
            )}
          </div>
        </fieldset>
      </div>
      <aside className="panel space-y-6 self-start p-6 lg:sticky lg:top-28">
        <h2 className="font-display text-xl font-bold">Đơn của bạn</h2>
        <ul className="space-y-3">
          {lines.map(({ id, qty, p }) => (
            <li key={id} className="flex items-center gap-3 text-[15px]">
              <Thumb src={p.image} />
              <span className="flex-1">{p.name}<span className="block text-sm text-ink-soft">× {qty.toLocaleString("vi-VN")} {p.unit}</span></span>
              <span className="font-semibold">{vnd(qty * p.price)}</span>
            </li>
          ))}
        </ul>
        <Totals subtotal={subtotal} shop={shop} />
        <CarbonCard c={carbon} title="Đơn hàng này giúp" compact />
        {err && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{err}</p>}
        <button disabled={pending} className="btn-primary w-full !py-4 text-base">{pending ? "Đang đặt hàng…" : "Đặt hàng"}</button>
        <p className="text-xs text-ink-soft">Bấm Đặt hàng là bạn đồng ý để Vina-Straw liên hệ xác nhận đơn qua số điện thoại đã nhập.</p>
      </aside>
    </form>
  );
}
