import Link from "next/link";
import { listCustomers, listOrdersByCustomer } from "@/lib/db";
import { fmtDate, vnd } from "@/lib/format";
import { STATUS_LABEL } from "@/lib/types";
import { CustomerActions } from "./client";

export default async function Customers({ searchParams }: { searchParams: Promise<{ q?: string; id?: string }> }) {
  const { q, id } = await searchParams;
  const all = await listCustomers();
  const needle = (q ?? "").trim().toLowerCase();
  const list = all.filter((c) => (!id || c.id === Number(id)) && (!needle || [c.name, c.email, c.phone].some((v) => v.toLowerCase().includes(needle))));
  const picked = id ? list[0] : undefined;
  const orders = picked ? await listOrdersByCustomer(picked.id) : [];
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl font-bold text-leaf-900">Khách hàng</h1>
        <form action="/admin/khach-hang" className="flex gap-2">
          <input name="q" defaultValue={q} placeholder="Tìm tên, email, SĐT" className="field !w-64 !py-2" />
          <button className="btn-ghost !py-2 text-sm">Tìm</button>
          {(q || id) && <Link href="/admin/khach-hang" className="btn-ghost !py-2 text-sm">Bỏ lọc</Link>}
        </form>
      </div>
      <p className="mt-2 text-ink-soft">{all.length} tài khoản khách. Khách tự đăng ký ở trang /dang-ky; khách quên mật khẩu thì cấp mật khẩu tạm ở đây.</p>
      <div className="panel mt-6 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-ink/10 text-ink-soft">
            <tr><th className="p-4">Khách hàng</th><th className="p-4">Liên hệ</th><th className="p-4">Đơn</th><th className="p-4">Đã thanh toán</th><th className="p-4">Tham gia</th><th className="p-4"></th></tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {list.map((c) => (
              <tr key={c.id} className={c.status === "LOCKED" ? "opacity-60" : ""}>
                <td className="p-4"><Link href={`/admin/khach-hang?id=${c.id}`} className="font-semibold text-ink hover:text-leaf-700">{c.name}</Link>{c.status === "LOCKED" && <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">Đã khoá</span>}{c.company && <span className="block text-ink-soft">{c.company}</span>}</td>
                <td className="p-4">{c.email}<span className="block text-ink-soft">{c.phone}</span></td>
                <td className="p-4">{c.orders}</td>
                <td className="p-4 font-semibold">{vnd(c.spent)}</td>
                <td className="p-4 text-ink-soft">{fmtDate(c.createdAt)}</td>
                <td className="p-4"><CustomerActions id={c.id} email={c.email} locked={c.status === "LOCKED"} /></td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-ink-soft">Chưa có khách hàng nào.</td></tr>}
          </tbody>
        </table>
      </div>
      {picked && (
        <section className="panel mt-6 p-6">
          <h2 className="font-display text-xl font-bold">Đơn của {picked.name}</h2>
          <p className="mt-1 text-sm text-ink-soft">Địa chỉ: {picked.address || "—"}</p>
          <ul className="mt-4 divide-y divide-ink/10">
            {orders.map((o) => (
              <li key={o.id} className="flex flex-wrap gap-x-5 py-3 text-sm">
                <Link href={`/admin/don-hang?q=${o.code}`} className="font-semibold underline">{o.code}</Link>
                <span>{STATUS_LABEL[o.status]}</span><span className="text-ink-soft">{fmtDate(o.createdAt)}</span>
                <span className="ml-auto font-semibold">{vnd(o.subtotal + o.shippingFee)}</span>
              </li>
            ))}
            {orders.length === 0 && <li className="py-3 text-ink-soft">Chưa có đơn.</li>}
          </ul>
        </section>
      )}
    </>
  );
}
