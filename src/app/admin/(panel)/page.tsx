import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { listOrders } from "@/lib/db";
import { deleteOrderAction, updateOrderAdminAction } from "@/lib/actions";
import { STATUS_LABEL, type OrderStatus } from "@/lib/types";
import { fmtDate, vnd } from "@/lib/format";
import { ConfirmButton } from "@/components/confirm-button";

const COLOR: Record<OrderStatus, string> = {
  NEW: "bg-sprout text-white", QUOTING: "bg-straw-500 text-soil-900", QUOTED: "bg-straw-300 text-soil-900",
  CONFIRMED: "bg-leaf-700 text-white", DONE: "bg-leaf-100 text-leaf-800", CANCELLED: "bg-red-100 text-red-700",
};

export default async function Orders({ searchParams }: { searchParams: Promise<{ tt?: string }> }) {
  const { tt } = await searchParams;
  const all = await listOrders();
  const list = tt ? all.filter((o) => o.status === tt) : all;
  const count = (s: string) => all.filter((o) => o.status === s).length;
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl font-bold text-leaf-900">Đơn hàng & yêu cầu báo giá</h1>
        <p className="text-ink-soft">{all.length} đơn</p>
      </div>
      <nav className="mt-6 flex flex-wrap gap-2">
        <Link href="/admin" className={`rounded-full px-4 py-2 text-sm font-semibold ${!tt ? "bg-ink text-white" : "bg-white"}`}>Tất cả</Link>
        {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => (
          <Link key={s} href={`/admin?tt=${s}`} className={`rounded-full px-4 py-2 text-sm font-semibold ${tt === s ? "bg-ink text-white" : "bg-white"}`}>{STATUS_LABEL[s]} ({count(s)})</Link>
        ))}
      </nav>
      {list.length === 0 && <div className="panel mt-8 p-10 text-center text-ink-soft">Chưa có đơn nào. Khi khách gửi biểu mẫu <Link href="/bao-gia" className="font-semibold text-leaf-700 underline">Nhận báo giá</Link>, đơn sẽ hiện ở đây.</div>}
      <div className="mt-8 space-y-5">
        {list.map((o) => {
          const total = o.items.reduce((t, i) => t + i.qty * i.price, 0);
          return (
            <details key={o.id} className="panel group overflow-hidden" open={o.status === "NEW"}>
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-6 gap-y-2 p-5">
                <span className="font-display text-xl font-bold text-ink">{o.code}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${COLOR[o.status]}`}>{STATUS_LABEL[o.status]}</span>
                <span className="text-ink">{o.name} · {o.phone}{o.company && ` · ${o.company}`}</span>
                <span className="text-sm text-ink-soft">{o.kind} · {fmtDate(o.createdAt)}</span>
                <span className="ml-auto font-semibold text-leaf-700">{vnd(total)}</span>
              </summary>
              <div className="grid gap-8 border-t border-ink/10 p-6 lg:grid-cols-2">
                <div className="space-y-4 text-[15px]">
                  <ul className="divide-y divide-ink/10 rounded-2xl bg-mist">
                    {o.items.map((i) => <li key={i.productId} className="flex justify-between px-4 py-2.5"><span>{i.name} × {i.qty.toLocaleString("vi-VN")} {i.unit}</span><span>{vnd(i.qty * i.price)}</span></li>)}
                  </ul>
                  <p><b>Email:</b> {o.email || "—"}</p>
                  <p><b>Địa chỉ:</b> {o.address || "—"}</p>
                  <p className="whitespace-pre-line"><b>Ghi chú:</b> {o.note || "—"}</p>
                  {o.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {o.images.map((u) => <a key={u} href={u} target="_blank" rel="noreferrer" className="relative aspect-square overflow-hidden rounded-xl bg-mist"><Image src={u} alt="" fill sizes="120px" className="object-cover" unoptimized={u.startsWith("data:")} /></a>)}
                    </div>
                  )}
                  <p className="text-xs text-ink-soft">Sửa lần cuối: {fmtDate(o.updatedAt)} · <Link className="underline" href={`/don-hang/${o.code}?k=${o.token}`} target="_blank">Xem trang khách</Link></p>
                </div>
                <form action={updateOrderAdminAction} className="space-y-4">
                  <input type="hidden" name="id" value={o.id} />
                  <div><label className="label">Trạng thái</label>
                    <select name="status" defaultValue={o.status} className="field">{(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select>
                  </div>
                  <div><label className="label">Báo giá gửi khách (khách thấy)</label><textarea name="quote" rows={4} defaultValue={o.quote} className="field" placeholder="VD: Tô 500 mL × 2.000 cái: 2.300 ₫/cái, giao trong 10 ngày…" /></div>
                  <div><label className="label">Ghi chú nội bộ</label><textarea name="adminNote" rows={2} defaultValue={o.adminNote} className="field" /></div>
                  <div className="flex gap-2"><button className="btn-primary">Lưu đơn</button></div>
                </form>
                <form action={deleteOrderAction} className="lg:col-span-2"><input type="hidden" name="id" value={o.id} /><ConfirmButton message={`Xoá vĩnh viễn đơn ${o.code}?`}><Trash2 className="h-4 w-4" /> Xoá đơn</ConfirmButton></form>
              </div>
            </details>
          );
        })}
      </div>
    </>
  );
}
