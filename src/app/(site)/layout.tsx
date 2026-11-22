import Link from "next/link";
import { Footer } from "@/components/footer";
import { getSettings } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [s, admin] = await Promise.all([getSettings(), isAdmin()]);
  return (
    <>
      {children}
      <Footer s={s} />
      {admin && (
        <div className="fixed bottom-4 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-1 rounded-full bg-ink p-1.5 text-sm text-white shadow-2xl">
          <span className="px-3 text-white/60">Chế độ quản trị</span>
          <Link href="/admin" className="rounded-full px-3 py-1.5 hover:bg-white/10">Đơn hàng</Link>
          <Link href="/admin/san-pham" className="rounded-full px-3 py-1.5 hover:bg-white/10">Sản phẩm</Link>
          <Link href="/admin/noi-dung" className="rounded-full bg-straw-500 px-3 py-1.5 font-semibold text-soil-900 hover:bg-straw-300">Sửa nội dung</Link>
        </div>
      )}
    </>
  );
}
