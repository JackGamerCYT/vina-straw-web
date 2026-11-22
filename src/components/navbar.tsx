"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, UserRound, X } from "lucide-react";
import { CartBadge } from "./cart";
import { Logo } from "./logo";

const NAV = [
  { href: "/#du-an", label: "Dự án" },
  { href: "/san-pham", label: "Sản phẩm" },
  { href: "/#quy-trinh", label: "Quy trình" },
  { href: "/#phim", label: "Video" },
  { href: "/don-hang", label: "Tra cứu đơn" },
];

export function Navbar({ overlay = false }: { overlay?: boolean }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setOpen(false), [path]);
  const solid = scrolled || !overlay || open;

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-[background,box-shadow] duration-300 ${solid ? "bg-white/90 shadow-[0_1px_0_rgba(22,36,27,.08)] backdrop-blur-md" : "bg-transparent"}`}>
      <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-5 lg:px-8">
        <Link href="/" aria-label="Vina-Straw, về trang chủ"><Logo /></Link>
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`link-draw py-1 text-[15px] font-medium ${path === n.href ? "text-leaf-700" : "text-ink/80 hover:text-ink"}`}>{n.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <Link href="/tai-khoan" aria-label="Tài khoản" className="grid h-11 w-11 place-items-center rounded-full text-ink hover:bg-mist"><UserRound className="h-5 w-5" /></Link>
          <CartBadge />
          <Link href="/bao-gia" className="btn-primary ml-1 hidden !py-2.5 sm:inline-flex">Nhận báo giá</Link>
          <button className="grid h-11 w-11 place-items-center rounded-full text-ink lg:hidden" onClick={() => setOpen(!open)} aria-label={open ? "Đóng menu" : "Mở menu"} aria-expanded={open}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="toast-pop border-t border-ink/10 bg-white px-5 pb-6 pt-2 lg:hidden">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="block border-b border-ink/5 py-3.5 text-lg font-medium text-ink">{n.label}</Link>
          ))}
          <Link href="/tai-khoan" className="block border-b border-ink/5 py-3.5 text-lg font-medium text-ink">Tài khoản</Link>
          <Link href="/gio-hang" className="block border-b border-ink/5 py-3.5 text-lg font-medium text-ink">Giỏ hàng</Link>
          <Link href="/bao-gia" className="btn-primary mt-5 w-full">Nhận báo giá</Link>
        </nav>
      )}
    </header>
  );
}
