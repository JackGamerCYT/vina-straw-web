import Link from "next/link";
import { ArrowRight, Banknote, Package, Pencil, ShoppingCart, Users } from "lucide-react";
import { stats, strawTotals } from "@/lib/db";
import { carbonOf, fmtCredits, fmtMass } from "@/lib/carbon";
import { fmtDate, vnd } from "@/lib/format";
import { PAYMENT_LABEL, STATUS_LABEL } from "@/lib/types";

export default async function Dashboard() {
  const [s, st] = await Promise.all([stats(), strawTotals()]);
  const c = carbonOf(st.all);
  const cards = [
    { t: "Đơn mới chờ xử lý", v: s.newOrders.toLocaleString("vi-VN"), href: "/admin/don-hang?tt=NEW", Icon: ShoppingCart },
    { t: "Doanh thu 30 ngày (đã thu)", v: vnd(s.revenue30), href: "/admin/don-hang?loai=mua", Icon: Banknote },
    { t: "Khách hàng", v: s.customers.toLocaleString("vi-VN"), href: "/admin/khach-hang", Icon: Users },
    { t: "Sản phẩm đang bán", v: s.products.toLocaleString("vi-VN"), href: "/admin/san-pham", Icon: Package },
  ];
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl font-bold text-leaf-900">Tổng quan</h1>
        <Link href="/" className="btn-straw !py-2.5"><Pencil className="h-4 w-4" /> Sửa trực tiếp trang chủ</Link>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ t, v, href, Icon }) => (
          <Link key={t} href={href} className="panel group p-6 transition hover:-translate-y-0.5">
            <Icon className="h-6 w-6 text-leaf-600" />
            <p className="font-display mt-4 text-3xl font-bold text-ink">{v}</p>
            <p className="mt-1 text-sm text-ink-soft">{t}</p>
          </Link>
        ))}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="panel p-5"><p className="text-sm text-ink-soft">Đơn trong 30 ngày</p><p className="font-display mt-1 text-2xl font-bold">{s.orders30}</p></div>
        <div className="panel p-5"><p className="text-sm text-ink-soft">Đơn mua chưa thanh toán</p><p className="font-display mt-1 text-2xl font-bold text-soil-700">{s.unpaid}</p></div>
        <div className="panel p-5"><p className="text-sm text-ink-soft">Tổng doanh thu đã thu</p><p className="font-display mt-1 text-2xl font-bold text-leaf-700">{vnd(s.revenueAll)}</p></div>
      </div>
      <div className="mt-4 grid gap-4 rounded-[24px] bg-leaf-700 p-6 text-white sm:grid-cols-3">
        <div><p className="text-sm text-white/70">Rơm giữ lại qua các đơn</p><p className="font-display mt-1 text-2xl font-bold">{fmtMass(c.strawG)}</p></div>
        <div><p className="text-sm text-white/70">CO2e tránh được (ước tính)</p><p className="font-display mt-1 text-2xl font-bold">{fmtMass(c.co2eG)}</p></div>
        <div><p className="text-sm text-white/70">Tín chỉ carbon tích luỹ</p><p className="font-display mt-1 text-2xl font-bold text-straw-300">{fmtCredits(c.credits)}</p></div>
      </div>
      <section className="panel mt-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink/10 p-5">
          <h2 className="font-display text-xl font-bold">Đơn gần đây</h2>
          <Link href="/admin/don-hang" className="flex items-center gap-1 text-sm font-semibold text-leaf-700">Tất cả đơn <ArrowRight className="h-4 w-4" /></Link>
        </div>
        {s.recent.length === 0 ? <p className="p-8 text-center text-ink-soft">Chưa có đơn nào.</p> : (
          <ul className="divide-y divide-ink/10">
            {s.recent.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/don-hang?q=${o.code}`} className="flex flex-wrap items-center gap-x-5 gap-y-1 px-5 py-3.5 hover:bg-mist">
                  <span className="font-semibold">{o.code}</span>
                  <span className="text-sm">{o.name}</span>
                  <span className="rounded-full bg-mist px-2.5 py-0.5 text-xs font-semibold">{STATUS_LABEL[o.status]}</span>
                  <span className="text-xs text-ink-soft">{o.kind}{o.paymentMethod ? ` · ${PAYMENT_LABEL[o.paymentStatus]}` : ""}</span>
                  <span className="ml-auto text-sm text-ink-soft">{fmtDate(o.createdAt)}</span>
                  <span className="w-28 text-right font-semibold text-leaf-700">{vnd(o.subtotal + o.shippingFee)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
