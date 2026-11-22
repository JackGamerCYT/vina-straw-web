import { listAdmins } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { fmtDate } from "@/lib/format";
import { ADMIN_STATUS_LABEL, ROLE_LABEL } from "@/lib/types";
import { ManageRow, PasswordForm } from "./client";

export default async function Accounts({ searchParams }: { searchParams: Promise<{ moi?: string }> }) {
  const [me, { moi }] = await Promise.all([requireAdmin(), searchParams]);
  const all = me.role === "OWNER" ? await listAdmins() : [];
  const pending = all.filter((a) => a.status === "PENDING");
  return (
    <>
      <h1 className="font-display text-4xl font-bold text-leaf-900">Tài khoản</h1>
      {moi && <p className="mt-4 rounded-2xl bg-leaf-100 p-4 text-leaf-800">Đã tạo tài khoản chủ trang. Từ giờ đăng nhập bằng email và mật khẩu vừa đặt. Người khác đăng ký ở <b>/admin/dang-ky</b>, bạn duyệt ở danh sách dưới.</p>}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <section className="panel overflow-hidden">
          {me.role === "OWNER" ? (
            <>
              <div className="flex items-center justify-between border-b border-ink/10 p-5">
                <h2 className="font-display text-xl font-bold">Người quản trị</h2>
                {pending.length > 0 && <span className="rounded-full bg-sprout px-3 py-1 text-xs font-bold text-white">{pending.length} chờ duyệt</span>}
              </div>
              <ul className="divide-y divide-ink/10">
                {all.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                    <div>
                      <p className="font-semibold text-ink">{a.name} {a.id === me.id && <span className="text-sm font-normal text-ink-soft">(bạn)</span>}</p>
                      <p className="text-sm text-ink-soft">{a.email} · {ROLE_LABEL[a.role]} · <span className={a.status === "PENDING" ? "font-semibold text-soil-700" : a.status === "LOCKED" ? "text-red-600" : ""}>{ADMIN_STATUS_LABEL[a.status]}</span></p>
                      <p className="text-xs text-ink-soft/80">Tạo {fmtDate(a.createdAt)}{a.lastLogin ? ` · Vào gần nhất ${fmtDate(a.lastLogin)}` : ""}</p>
                    </div>
                    <ManageRow a={{ id: a.id, email: a.email, role: a.role, status: a.status }} self={a.id === me.id} />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="p-6">
              <h2 className="font-display text-xl font-bold">{me.name}</h2>
              <p className="text-ink-soft">{me.email} · {ROLE_LABEL[me.role]}</p>
              <p className="mt-4 text-sm text-ink-soft">Chỉ chủ trang mới duyệt và quản lý tài khoản khác.</p>
            </div>
          )}
        </section>
        <PasswordForm />
      </div>
    </>
  );
}
