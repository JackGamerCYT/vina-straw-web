import Link from "next/link";
import { LogOut, Package } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { CustomerPasswordForm, ProfileForm } from "@/components/customer-forms";
import { requireCustomer } from "@/lib/customer-auth";
import { customerLogout } from "@/lib/shop-actions";
import { listOrdersByCustomer } from "@/lib/db";
import { fmtDate, vnd } from "@/lib/format";
import { PAYMENT_LABEL, STATUS_LABEL } from "@/lib/types";

export const metadata = { title: "Tài khoản của tôi", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Account() {
  const me = await requireCustomer();
  const orders = await listOrdersByCustomer(me.id);
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[1240px] px-5 pb-24 pt-32 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-ink-soft">Xin chào,</p>
            <h1 className="font-display text-5xl font-bold tracking-tight text-leaf-900">{me.name}</h1>
          </div>
          <form action={customerLogout}><button className="btn-ghost !py-2.5"><LogOut className="h-4 w-4" /> Đăng xuất</button></form>
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_400px]">
          <section className="panel self-start overflow-hidden">
            <h2 className="font-display border-b border-ink/10 p-6 text-xl font-bold">Đơn hàng của bạn</h2>
            {orders.length === 0 ? (
              <div className="p-10 text-center text-ink-soft"><Package className="mx-auto h-8 w-8" /><p className="mt-3">Chưa có đơn nào.</p><Link href="/san-pham" className="btn-primary mt-5">Mua sắm</Link></div>
            ) : (
              <ul className="divide-y divide-ink/10">
                {orders.map((o) => (
                  <li key={o.id}>
                    <Link href={`/don-hang/${o.code}?k=${o.token}`} className="flex flex-wrap items-center gap-x-5 gap-y-1 p-5 hover:bg-mist">
                      <span className="font-display text-lg font-bold">{o.code}</span>
                      <span className="rounded-full bg-leaf-100 px-3 py-0.5 text-xs font-bold text-leaf-800">{STATUS_LABEL[o.status]}</span>
                      {o.paymentMethod && <span className="text-xs font-semibold text-soil-700">{PAYMENT_LABEL[o.paymentStatus]}</span>}
                      <span className="text-sm text-ink-soft">{fmtDate(o.createdAt)} · {o.items.length} sản phẩm</span>
                      <span className="ml-auto font-semibold text-leaf-700">{vnd(o.subtotal + o.shippingFee)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <div className="space-y-8">
            <ProfileForm me={{ name: me.name, phone: me.phone, email: me.email, address: me.address, company: me.company }} />
            <CustomerPasswordForm />
          </div>
        </div>
      </main>
    </>
  );
}
