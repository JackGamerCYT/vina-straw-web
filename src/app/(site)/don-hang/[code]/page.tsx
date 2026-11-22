import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Landmark, Lock } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { OrderForm } from "@/components/order-form";
import { getOrderByCode, getShop, listProducts } from "@/lib/db";
import { CHECKOUT_KIND, EDITABLE, METHOD_LABEL, PAYMENT_LABEL, STATUS_LABEL } from "@/lib/types";
import { fmtDate, vnd } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Đơn của bạn", robots: { index: false } };

const QUOTE_STEPS = ["NEW", "QUOTING", "QUOTED", "CONFIRMED", "DONE"] as const;
const BUY_STEPS = ["NEW", "CONFIRMED", "SHIPPING", "DONE"] as const;

export default async function MyOrder({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ k?: string; moi?: string }> }) {
  const [{ code }, { k, moi }] = await Promise.all([params, searchParams]);
  const order = await getOrderByCode(code);
  if (!order || order.token !== k) notFound();
  const [products, shop] = await Promise.all([listProducts(), getShop()]);
  const buy = order.kind === CHECKOUT_KIND;
  const STEPS: readonly string[] = buy ? BUY_STEPS : QUOTE_STEPS;
  const editable = !buy && EDITABLE.includes(order.status);
  const step = Math.max(STEPS.indexOf(order.status), order.status === "QUOTED" && buy ? 0 : -1);
  const total = order.subtotal + order.shippingFee;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[1000px] px-5 pb-24 pt-32 lg:px-8">
        <p className="text-ink-soft">Gửi lúc {fmtDate(order.createdAt)} · {order.kind}</p>
        <h1 className="font-display mt-2 text-5xl font-bold tracking-tight text-leaf-900">Đơn {order.code}</h1>
        {moi && (
          <p className="toast-pop mt-6 flex items-start gap-3 rounded-2xl bg-leaf-700 p-5 text-white">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-straw-300" />
            <span>Đặt hàng thành công. Chúng tôi sẽ gọi xác nhận trong giờ làm việc. Lưu lại trang này (hoặc mã đơn và số điện thoại) để theo dõi đơn.</span>
          </p>
        )}

        {order.status === "CANCELLED" ? (
          <p className="mt-8 rounded-2xl bg-red-50 p-5 font-semibold text-red-700">Đơn này đã huỷ.</p>
        ) : (
          <ol className={`mt-10 grid gap-2 ${buy ? "grid-cols-4" : "grid-cols-5"}`}>
            {STEPS.map((s, i) => (
              <li key={s}>
                <div className={`h-1.5 rounded-full ${i <= step ? "bg-leaf-600" : "bg-leaf-100"}`} />
                <p className={`mt-2 text-xs font-semibold sm:text-sm ${i <= step ? "text-leaf-800" : "text-ink-soft"}`}>{STATUS_LABEL[s as keyof typeof STATUS_LABEL]}</p>
              </li>
            ))}
          </ol>
        )}

        {buy && (
          <section className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[28px] border border-ink/10 p-6">
              <h2 className="font-display text-xl font-bold">Sản phẩm</h2>
              <ul className="mt-4 divide-y divide-ink/10">
                {order.items.map((i) => <li key={i.productId} className="flex justify-between py-3"><span>{i.name} × {i.qty.toLocaleString("vi-VN")} {i.unit}</span><span className="font-semibold">{vnd(i.qty * i.price)}</span></li>)}
              </ul>
              <dl className="mt-3 space-y-2 border-t border-ink/10 pt-3 text-[15px]">
                <div className="flex justify-between"><dt className="text-ink-soft">Tạm tính</dt><dd>{vnd(order.subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-soft">Phí giao hàng</dt><dd>{order.shippingFee > 0 ? vnd(order.shippingFee) : "Báo sau"}</dd></div>
                <div className="flex justify-between font-semibold"><dt>Tổng cộng</dt><dd className="font-display text-2xl text-leaf-700">{vnd(total)}</dd></div>
              </dl>
            </div>
            <div className="space-y-4">
              <div className="rounded-[28px] bg-mist p-6 text-[15px]">
                <h2 className="font-display text-xl font-bold">Giao đến</h2>
                <p className="mt-3">{order.name} · {order.phone}</p>
                <p className="text-ink-soft">{order.address}</p>
                {order.note && <p className="mt-2 whitespace-pre-line text-ink-soft">Ghi chú: {order.note}</p>}
                <p className="mt-4"><b>Thanh toán:</b> {order.paymentMethod ? METHOD_LABEL[order.paymentMethod] : "—"} · <span className={order.paymentStatus === "PAID" ? "font-semibold text-leaf-700" : "font-semibold text-soil-700"}>{PAYMENT_LABEL[order.paymentStatus]}</span></p>
              </div>
              {order.paymentMethod === "BANK" && order.paymentStatus === "UNPAID" && order.status !== "CANCELLED" && shop.bankAccount && (
                <div className="rounded-[28px] bg-straw-100 p-6 text-[15px] text-soil-900">
                  <h2 className="font-display flex items-center gap-2 text-xl font-bold"><Landmark className="h-5 w-5" /> Chuyển khoản</h2>
                  <dl className="mt-3 space-y-1.5">
                    <div><dt className="inline text-soil-700">Ngân hàng: </dt><dd className="inline font-semibold">{shop.bankName}</dd></div>
                    <div><dt className="inline text-soil-700">Số tài khoản: </dt><dd className="inline font-display text-lg font-bold">{shop.bankAccount}</dd></div>
                    <div><dt className="inline text-soil-700">Chủ tài khoản: </dt><dd className="inline font-semibold">{shop.bankHolder}</dd></div>
                    <div><dt className="inline text-soil-700">Số tiền: </dt><dd className="inline font-semibold">{vnd(total)}{order.shippingFee === 0 && shop.shipFee === 0 ? " (chưa gồm phí giao hàng)" : ""}</dd></div>
                    <div><dt className="inline text-soil-700">Nội dung: </dt><dd className="inline font-display text-lg font-bold">{order.code}</dd></div>
                  </dl>
                </div>
              )}
              <p className="text-sm text-ink-soft">Cần đổi thông tin đơn? Liên hệ cửa hàng, hoặc xem <Link href="/tai-khoan" className="underline">đơn trong tài khoản</Link>.</p>
            </div>
          </section>
        )}

        {order.quote && (
          <section className="mt-10 rounded-[28px] bg-straw-100 p-7">
            <h2 className="font-display text-2xl font-bold text-soil-900">Báo giá từ Vina-Straw</h2>
            <p className="mt-3 whitespace-pre-line text-[17px] leading-relaxed text-soil-900">{order.quote}</p>
          </section>
        )}

        {!buy && <section className="mt-12">
          {editable ? (
            <OrderForm products={products} order={order} />
          ) : (
            <div className="space-y-8">
              <p className="flex items-center gap-2 rounded-2xl bg-mist p-5 text-ink-soft"><Lock className="h-4 w-4" /> Đơn đã được xác nhận nên không chỉnh sửa trực tuyến được nữa.</p>
              <ul className="divide-y divide-ink/10 rounded-3xl border border-ink/10">
                {order.items.map((i) => (
                  <li key={i.productId} className="flex justify-between p-4"><span>{i.name} × {i.qty.toLocaleString("vi-VN")} {i.unit}</span><span className="font-semibold">{vnd(i.qty * i.price)}</span></li>
                ))}
              </ul>
              {order.images.length > 0 && (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {order.images.map((u) => <div key={u} className="relative aspect-square overflow-hidden rounded-2xl bg-mist"><Image src={u} alt="" fill sizes="160px" className="object-cover" unoptimized={u.startsWith("data:")} /></div>)}
                </div>
              )}
            </div>
          )}
        </section>}
      </main>
    </>
  );
}
