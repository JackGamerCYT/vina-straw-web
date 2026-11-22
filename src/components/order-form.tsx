"use client";
import { KeepForm, usePending } from "@/components/keep-form";
import Image from "next/image";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { CheckCircle2, Copy, Minus, Plus, Send } from "lucide-react";
import { toast } from "sonner";
import { ImagePicker } from "./image-picker";
import { submitOrder, updateMyOrder, type FormState } from "@/lib/actions";
import { ORDER_KINDS, type Order, type Product } from "@/lib/types";
import { vnd, priceText, isRender } from "@/lib/format";

function Submit({ children }: { children: React.ReactNode }) {
  const pending = usePending();
  return (
    <button disabled={pending} className="btn-primary w-full !py-4 text-base sm:w-auto sm:!px-10">
      <Send className="h-4 w-4" /> {pending ? "Đang gửi…" : children}
    </button>
  );
}

export function OrderForm({ products, order, preselect, kind }: { products: Product[]; order?: Order; preselect?: number; kind?: string }) {
  const edit = Boolean(order);
  const [state, action] = useActionState<FormState, FormData>(async (s, f) => {
    const r = await (edit ? updateMyOrder : submitOrder)(s, f);
    if (r?.ok && edit) toast.success("Đã lưu thay đổi");
    if (r?.error) toast.error(r.error);
    return r;
  }, undefined);

  const init = useMemo(() => {
    const m: Record<number, number> = {};
    order?.items.forEach((i) => (m[i.productId] = i.qty));
    if (!order && preselect) { const p = products.find((x) => x.id === preselect); if (p) m[p.id] = p.moq; }
    return m;
  }, [order, preselect, products]);
  const [qty, setQty] = useState<Record<number, number>>(init);
  const total = products.reduce((t, p) => t + (qty[p.id] || 0) * p.price, 0);
  const setQ = (id: number, v: number) => setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(10_000_000, Math.floor(v || 0))) }));

  if (state?.ok && !edit && state.code) {
    const link = `/don-hang/${state.code}?k=${state.token}`;
    return (
      <div className="toast-pop rounded-[32px] bg-leaf-700 p-10 text-white sm:p-14">
        <CheckCircle2 className="h-14 w-14 text-straw-300" />
        <h2 className="font-display mt-6 text-4xl font-bold">Đã nhận yêu cầu của bạn</h2>
        <p className="mt-3 max-w-lg text-lg text-white/80">Mã đơn của bạn là</p>
        <p className="font-display mt-2 text-5xl font-bold tracking-wider text-straw-300">{state.code}</p>
        <p className="mt-6 max-w-lg text-white/80">Lưu lại mã đơn và số điện thoại để tra cứu. Bạn có thể sửa thông tin, số lượng và ảnh đính kèm cho tới khi đơn được xác nhận.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={link} className="btn-straw !px-7 !py-4">Xem và sửa đơn</Link>
          <button type="button" onClick={() => { navigator.clipboard.writeText(location.origin + link); toast.success("Đã chép liên kết sửa đơn"); }} className="btn !border !border-white/30 !px-6 !py-4 text-white hover:bg-white/10"><Copy className="h-4 w-4" /> Chép liên kết</button>
        </div>
      </div>
    );
  }

  return (
    <KeepForm action={action} className="space-y-12">
      {edit && <><input type="hidden" name="code" value={order!.code} /><input type="hidden" name="token" value={order!.token} /></>}

      <fieldset>
        <legend className="font-display text-2xl font-bold text-leaf-900">Bạn cần gì?</legend>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {ORDER_KINDS.map((k, i) => (
            <label key={k} className="cursor-pointer">
              <input type="radio" name="kind" value={k} defaultChecked={order ? order.kind === k : kind === "mau" ? k === "Đặt mẫu thử" : i === 0} className="peer sr-only" />
              <span className="flex h-full items-center justify-center rounded-2xl border border-ink/15 px-4 py-4 text-center font-semibold text-ink transition peer-checked:border-leaf-700 peer-checked:bg-leaf-700 peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-leaf-100 hover:border-leaf-500">{k}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-display text-2xl font-bold text-leaf-900">Sản phẩm và số lượng</legend>
        <p className="mt-1 text-ink-soft">Nhập số lượng cho sản phẩm bạn quan tâm. Để 0 nếu không cần.</p>
        <ul className="mt-5 divide-y divide-ink/10 rounded-3xl border border-ink/10">
          {products.map((p) => {
            const v = qty[p.id] || 0;
            return (
              <li key={p.id} className={`flex flex-wrap items-center gap-4 p-4 transition sm:flex-nowrap ${v > 0 ? "bg-sprout-soft/60" : ""}`}>
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-mist">
                  {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="64px" className={isRender(p.images[0]) ? "object-contain p-1.5" : "object-cover"} unoptimized={p.images[0].startsWith("data:")} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{p.name}</p>
                  <p className="text-sm text-ink-soft">{priceText(p.price)}{p.price > 0 ? ` / ${p.unit}` : ""} · tối thiểu {p.moq.toLocaleString("vi-VN")}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => setQ(p.id, v - (v > p.moq ? p.moq : v))} className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 hover:bg-mist" aria-label={`Giảm ${p.name}`}><Minus className="h-4 w-4" /></button>
                  <input name={`qty_${p.id}`} inputMode="numeric" value={v || ""} placeholder="0" onChange={(e) => setQ(p.id, Number(e.target.value.replace(/\D/g, "")))} className="field !w-28 text-center !py-2" aria-label={`Số lượng ${p.name}`} />
                  <button type="button" onClick={() => setQ(p.id, v + p.moq)} className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 hover:bg-mist" aria-label={`Tăng ${p.name}`}><Plus className="h-4 w-4" /></button>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-right text-ink-soft">Tạm tính theo giá tham khảo: <span className="font-display text-2xl font-bold text-leaf-700">{vnd(total)}</span></p>
        {products.some((p) => p.price === 0 && (qty[p.id] || 0) > 0) && <p className="mt-1 text-right text-sm text-ink-soft">Chưa gồm sản phẩm ghi “Liên hệ”, sẽ báo giá riêng.</p>}
      </fieldset>

      <fieldset>
        <legend className="font-display text-2xl font-bold text-leaf-900">Thông tin liên hệ</legend>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div><label className="label" htmlFor="name">Họ và tên *</label><input id="name" name="name" required defaultValue={order?.name} className="field" placeholder="Nguyễn Văn A" autoComplete="name" /></div>
          <div><label className="label" htmlFor="phone">Số điện thoại *</label><input id="phone" name="phone" required defaultValue={order?.phone} className="field" placeholder="09xx xxx xxx" inputMode="tel" autoComplete="tel" /></div>
          <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" defaultValue={order?.email} className="field" placeholder="ban@congty.vn" autoComplete="email" /></div>
          <div><label className="label" htmlFor="company">Quán / công ty</label><input id="company" name="company" defaultValue={order?.company} className="field" placeholder="Quán bún Cô Ba" autoComplete="organization" /></div>
          <div className="sm:col-span-2"><label className="label" htmlFor="address">Địa chỉ giao hàng</label><input id="address" name="address" defaultValue={order?.address} className="field" placeholder="Số nhà, đường, phường, tỉnh/thành" autoComplete="street-address" /></div>
          <div className="sm:col-span-2"><label className="label" htmlFor="note">Ghi chú</label><textarea id="note" name="note" rows={4} defaultValue={order?.note} className="field resize-y" placeholder="In logo, thời gian cần hàng, yêu cầu về kích thước…" /></div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-display text-2xl font-bold text-leaf-900">Ảnh tham khảo</legend>
        <p className="mb-4 mt-1 text-ink-soft">Logo cần in, mẫu bao bì đang dùng, ảnh món ăn… giúp chúng tôi báo giá sát hơn.</p>
        <ImagePicker existing={order?.images ?? []} max={6} />
      </fieldset>

      <div className="flex flex-col items-start gap-4 border-t border-ink/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-sm text-ink-soft">Chúng tôi chỉ dùng thông tin này để báo giá và giao hàng cho bạn.</p>
        <Submit>{edit ? "Lưu thay đổi" : "Gửi yêu cầu"}</Submit>
      </div>
    </KeepForm>
  );
}
