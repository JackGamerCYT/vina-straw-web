import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { hasDatabase, listAdmins, listMessages, listOrders } from "@/lib/db";
import { hasBlob } from "@/lib/upload";
import { logout } from "@/lib/actions";
import { Logo } from "@/components/logo";
import { ROLE_LABEL } from "@/lib/types";
import { AdminNav } from "./nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin();
  const [admins, orders, msgs] = await Promise.all([me.role === "OWNER" ? listAdmins() : Promise.resolve([]), listOrders(), listMessages()]);
  const waiting = admins.filter((a) => a.status === "PENDING").length;
  const fresh = orders.filter((o) => o.status === "NEW").length;
  const warn = [
    !hasDatabase && "Chưa nối Postgres: dữ liệu chỉ lưu tạm trong bộ nhớ và sẽ mất khi máy chủ khởi động lại.",
    !hasBlob && "Chưa nối Vercel Blob: ảnh tải lên được lưu dạng nhúng trong database.",
    waiting > 0 && `Có ${waiting} quản trị viên đăng ký đang chờ duyệt.`,
  ].filter(Boolean) as string[];
  return (
    <div className="min-h-screen bg-mist">
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-white/90 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-4 px-5 lg:px-8">
          <Link href="/admin" className="flex items-center gap-3"><Logo /><span className="hidden rounded-full bg-mist px-2.5 py-0.5 text-xs font-semibold text-ink-soft sm:inline">Quản trị</span></Link>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-ink-soft md:inline">{me.name} · {ROLE_LABEL[me.role]}</span>
            <Link href="/" className="btn-ghost !py-2 text-sm"><ExternalLink className="h-4 w-4" /> <span className="hidden sm:inline">Xem trang</span></Link>
            <form action={logout}><button className="btn-ghost !py-2 text-sm"><LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Thoát</span></button></form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1440px] gap-6 px-5 py-6 lg:grid-cols-[230px_1fr] lg:px-8">
        <aside className="lg:sticky lg:top-22 lg:self-start"><AdminNav badges={{ "/admin/don-hang": fresh, "/admin/tai-khoan": waiting, "/admin/hop-thu": msgs.filter((m) => !m.handled).length }} /></aside>
        <main className="min-w-0 pb-16">
          {warn.length > 0 && <ul className="mb-6 space-y-1 rounded-2xl bg-straw-100 p-4 text-sm text-soil-900">{warn.map((w) => <li key={w}>• {w}</li>)}</ul>}
          {children}
        </main>
      </div>
    </div>
  );
}
