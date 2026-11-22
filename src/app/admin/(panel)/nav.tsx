"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const L = [["/admin", "Đơn hàng"], ["/admin/san-pham", "Sản phẩm"], ["/admin/noi-dung", "Nội dung trang"], ["/admin/tai-khoan", "Tài khoản"]];
export function AdminNav({ owner = false }: { owner?: boolean }) {
  const p = usePathname();
  void owner;
  return (
    <nav className="flex gap-1 overflow-x-auto">
      {L.map(([h, t]) => {
        const on = h === "/admin" ? p === h : p.startsWith(h);
        return <Link key={h} href={h} className={`rounded-full px-4 py-2 text-sm font-semibold ${on ? "bg-leaf-700 text-white" : "text-ink hover:bg-mist"}`}>{t}</Link>;
      })}
    </nav>
  );
}
