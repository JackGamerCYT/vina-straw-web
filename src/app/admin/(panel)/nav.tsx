"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Images, LayoutDashboard, Package, Settings, ShieldCheck, ShoppingCart, Users } from "lucide-react";

const L = [
  ["/admin", "Tổng quan", LayoutDashboard],
  ["/admin/don-hang", "Đơn hàng", ShoppingCart],
  ["/admin/san-pham", "Sản phẩm", Package],
  ["/admin/khach-hang", "Khách hàng", Users],
  ["/admin/thu-vien", "Thư viện ảnh", Images],
  ["/admin/noi-dung", "Nội dung trang", FileText],
  ["/admin/cai-dat", "Cài đặt bán hàng", Settings],
  ["/admin/tai-khoan", "Quản trị viên", ShieldCheck],
] as const;

export function AdminNav({ badges = {} }: { badges?: Record<string, number> }) {
  const p = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col">
      {L.map(([h, t, Icon]) => {
        const on = h === "/admin" ? p === h : p.startsWith(h);
        return (
          <Link key={h} href={h} className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold ${on ? "bg-leaf-700 text-white" : "text-ink hover:bg-white"}`}>
            <Icon className="h-4 w-4" /> {t}
            {badges[h] ? <span className={`ml-auto rounded-full px-2 text-xs ${on ? "bg-white/20" : "bg-sprout text-white"}`}>{badges[h]}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
