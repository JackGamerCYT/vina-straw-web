"use client";
import { useActionState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { KeepForm, usePending } from "@/components/keep-form";
import { saveShopAction, type ShopState } from "@/lib/shop-actions";
import type { Shop } from "@/lib/types";

function Btn() {
  const pending = usePending();
  return <button disabled={pending} className="btn-primary !px-8"><Save className="h-4 w-4" />{pending ? "Đang lưu…" : "Lưu cài đặt"}</button>;
}
export function ShopForm({ shop }: { shop: Shop }) {
  const [s, action] = useActionState<ShopState, FormData>(async (st, f) => {
    const r = await saveShopAction(st, f);
    if (r?.ok) toast.success(r.message ?? "Đã lưu");
    if (r?.error) toast.error(r.error);
    return r;
  }, undefined);
  void s;
  return (
    <KeepForm action={action} className="mt-8 grid gap-6 lg:grid-cols-2">
      <section className="panel space-y-5 p-6">
        <h2 className="font-display text-xl font-bold">Giao hàng</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label" htmlFor="shipFee">Phí giao hàng (₫)</label><input id="shipFee" name="shipFee" type="number" min={0} step={1000} defaultValue={shop.shipFee} className="field" /><p className="mt-1 text-xs text-ink-soft">0 = báo phí sau khi gọi xác nhận</p></div>
          <div><label className="label" htmlFor="freeShipOver">Miễn phí từ (₫)</label><input id="freeShipOver" name="freeShipOver" type="number" min={0} step={10000} defaultValue={shop.freeShipOver} className="field" /><p className="mt-1 text-xs text-ink-soft">0 = không áp dụng</p></div>
        </div>
        <div><label className="label" htmlFor="shipNote">Ghi chú giao hàng (hiện ở giỏ hàng)</label><textarea id="shipNote" name="shipNote" rows={3} defaultValue={shop.shipNote} className="field" /></div>
      </section>
      <section className="panel space-y-5 p-6">
        <h2 className="font-display text-xl font-bold">Thanh toán</h2>
        <label className="flex items-center gap-3 font-medium"><input type="checkbox" name="cod" defaultChecked={shop.cod} className="h-5 w-5 accent-leaf-700" /> Nhận thanh toán khi nhận hàng (COD)</label>
        <p className="text-sm text-ink-soft">Điền đủ 3 ô dưới để bật chuyển khoản ngân hàng. Để trống thì khách không thấy lựa chọn này.</p>
        <div><label className="label" htmlFor="bankName">Ngân hàng</label><input id="bankName" name="bankName" defaultValue={shop.bankName} className="field" placeholder="VD: Vietcombank" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label" htmlFor="bankAccount">Số tài khoản</label><input id="bankAccount" name="bankAccount" defaultValue={shop.bankAccount} className="field" inputMode="numeric" /></div>
          <div><label className="label" htmlFor="bankHolder">Chủ tài khoản</label><input id="bankHolder" name="bankHolder" defaultValue={shop.bankHolder} className="field" /></div>
        </div>
      </section>
      <div className="lg:col-span-2"><Btn /></div>
    </KeepForm>
  );
}
