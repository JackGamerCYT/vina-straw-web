import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { hasDatabase, listAdmins } from "@/lib/db";
import { hasBlob } from "@/lib/upload";
import { logout } from "@/lib/actions";
import { Logo } from "@/components/logo";
import { AdminNav } from "./nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin();
  const waiting = me.role === "OWNER" ? (await listAdmins()).filter((a) => a.status === "PENDING").length : 0;
  const warn = [
    !hasDatabase && "Chưa nối Postgres: dữ liệu chỉ lưu tạm trong bộ nhớ và sẽ mất khi máy chủ khởi động lại.",
    !hasBlob && "Chưa nối Vercel Blob: ảnh tải lên được lưu dạng nhúng trong database.",
    waiting > 0 && `Có ${waiting} tài khoản đăng ký đang chờ duyệt ở mục Tài khoản.`,
  ].filter(Boolean) as string[];
  return (
    <div className="min-h-screen bg-mist">
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4 px-5 lg:px-8">
          <div className="flex items-center gap-8"><Link href="/admin"><Logo /></Link><AdminNav owner={me.role === "OWNER"} /></div>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-ink-soft xl:inline">{me.name}</span>
            <Link href="/" className="btn-ghost !py-2 text-sm"><ExternalLink className="h-4 w-4" /> Xem trang</Link>
            <form action={logout}><button className="btn-ghost !py-2 text-sm"><LogOut className="h-4 w-4" /> Thoát</button></form>
          </div>
        </div>
      </header>
      {warn.length > 0 && (
        <div className="mx-auto mt-6 max-w-[1240px] px-5 lg:px-8">
          <ul className="space-y-1 rounded-2xl bg-straw-100 p-4 text-sm text-soil-900">{warn.map((w) => <li key={w}>• {w}</li>)}</ul>
        </div>
      )}
      <main className="mx-auto max-w-[1240px] px-5 py-10 lg:px-8">{children}</main>
    </div>
  );
}
