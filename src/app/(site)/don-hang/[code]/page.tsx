import Image from "next/image";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { OrderForm } from "@/components/order-form";
import { getOrderByCode, listProducts } from "@/lib/db";
import { EDITABLE, STATUS_LABEL } from "@/lib/types";
import { fmtDate, vnd } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Đơn của bạn", robots: { index: false } };

const STEPS = ["NEW", "QUOTING", "QUOTED", "CONFIRMED", "DONE"] as const;

export default async function MyOrder({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ k?: string }> }) {
  const [{ code }, { k }] = await Promise.all([params, searchParams]);
  const order = await getOrderByCode(code);
  if (!order || order.token !== k) notFound();
  const products = await listProducts();
  const editable = EDITABLE.includes(order.status);
  const step = STEPS.indexOf(order.status as (typeof STEPS)[number]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[1000px] px-5 pb-24 pt-32 lg:px-8">
        <p className="text-ink-soft">Gửi lúc {fmtDate(order.createdAt)} · {order.kind}</p>
        <h1 className="font-display mt-2 text-5xl font-bold tracking-tight text-leaf-900">Đơn {order.code}</h1>

        {order.status === "CANCELLED" ? (
          <p className="mt-8 rounded-2xl bg-red-50 p-5 font-semibold text-red-700">Đơn này đã huỷ.</p>
        ) : (
          <ol className="mt-10 grid grid-cols-5 gap-2">
            {STEPS.map((s, i) => (
              <li key={s}>
                <div className={`h-1.5 rounded-full ${i <= step ? "bg-leaf-600" : "bg-leaf-100"}`} />
                <p className={`mt-2 text-xs font-semibold sm:text-sm ${i <= step ? "text-leaf-800" : "text-ink-soft"}`}>{STATUS_LABEL[s]}</p>
              </li>
            ))}
          </ol>
        )}

        {order.quote && (
          <section className="mt-10 rounded-[28px] bg-straw-100 p-7">
            <h2 className="font-display text-2xl font-bold text-soil-900">Báo giá từ Vina-Straw</h2>
            <p className="mt-3 whitespace-pre-line text-[17px] leading-relaxed text-soil-900">{order.quote}</p>
          </section>
        )}

        <section className="mt-12">
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
        </section>
      </main>
    </>
  );
}
