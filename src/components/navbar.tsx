"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Mail, Menu, Phone, Search, UserRound, X } from "lucide-react";
import { CartBadge } from "./cart";
import { Logo } from "./logo";
import { telHref, useSite } from "./site-context";

const NAV = [
  { href: "/", label: "Trang chủ" },
  { href: "/gioi-thieu", label: "Giới thiệu" },
  { href: "/san-pham", label: "Sản phẩm", sub: true },
  { href: "/tin-chi-carbon", label: "Tín chỉ carbon" },
  { href: "/tin-tuc", label: "Tin tức" },
  { href: "/lien-he", label: "Liên hệ" },
];

/** Đầu trang hai tầng: thanh liên hệ + thanh menu. Cao 116px trên máy tính, 72px trên điện thoại. */
export function Navbar(_: { overlay?: boolean } = {}) {
  const path = usePathname();
  const router = useRouter();
  const site = useSite();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => { setOpen(false); setSearch(false); }, [path]);
  useEffect(() => { if (search) input.current?.focus(); }, [search]);
  const active = (h: string) => (h === "/" ? path === "/" : !h.includes("#") && path.startsWith(h));
  const go = (e: React.FormEvent) => {
    e.preventDefault();
    const q = input.current?.value.trim();
    router.push(q ? `/san-pham?q=${encodeURIComponent(q)}` : "/san-pham");
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? "shadow-[0_6px_24px_-12px_rgba(22,36,27,.25)]" : ""}`}>
      <div className={`hidden overflow-hidden bg-straw-100/70 text-sm text-ink-soft transition-[height] duration-300 lg:block ${scrolled ? "h-0" : "h-11"}`}>
        <div className="mx-auto flex h-11 max-w-[1320px] items-center justify-between px-8">
          <div className="flex items-center gap-6">
            {site.email && <a href={`mailto:${site.email}`} className="flex items-center gap-2 hover:text-leaf-700"><Mail className="h-4 w-4 text-leaf-600" /> {site.email}</a>}
            {site.phone && <a href={telHref(site.phone)} className="flex items-center gap-2 hover:text-leaf-700"><Phone className="h-4 w-4 text-leaf-600" /> {site.phone}</a>}
          </div>
          <div className="flex items-center gap-5">
            <Link href="/don-hang" className="hover:text-leaf-700">Tra cứu đơn hàng</Link>
            <Link href="/tai-khoan" className="hover:text-leaf-700">Tài khoản</Link>
            <Link href="/bao-gia" className="font-semibold text-leaf-700 hover:text-leaf-900">Nhận báo giá</Link>
          </div>
        </div>
      </div>
      <div className="border-b border-ink/5">
        <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between gap-4 px-5 lg:px-8">
          <Link href="/" aria-label="Vina-Straw, về trang chủ" className="shrink-0"><Logo /></Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <div key={n.href} className="group relative">
                <Link href={n.href} className={`flex items-center gap-1 rounded-full px-3.5 py-2 text-[15px] font-semibold transition ${active(n.href) ? "text-leaf-700" : "text-ink/80 hover:text-leaf-700"}`}>
                  {n.label} {n.sub && site.lines.length > 0 && <ChevronDown className="h-3.5 w-3.5 transition group-hover:rotate-180" />}
                  {active(n.href) && <span className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-sprout" />}
                </Link>
                {n.sub && site.lines.length > 0 && (
                  <div className="invisible absolute left-0 top-full z-10 min-w-56 translate-y-2 rounded-2xl border border-ink/5 bg-white p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <Link href="/san-pham" className="block rounded-xl px-3 py-2 text-sm font-semibold hover:bg-mist">Tất cả sản phẩm</Link>
                    {site.lines.map((l) => <Link key={l} href={`/san-pham?dong=${encodeURIComponent(l)}`} className="block rounded-xl px-3 py-2 text-sm hover:bg-mist">{l}</Link>)}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <button onClick={() => setSearch((v) => !v)} aria-label="Tìm sản phẩm" aria-expanded={search} className="grid h-11 w-11 place-items-center rounded-full text-ink hover:bg-mist"><Search className="h-5 w-5" /></button>
            <Link href="/tai-khoan" aria-label="Tài khoản" className="hidden h-11 w-11 place-items-center rounded-full text-ink hover:bg-mist sm:grid"><UserRound className="h-5 w-5" /></Link>
            <CartBadge />
            <Link href="/lien-he" className="btn-primary ml-2 hidden !py-2.5 xl:inline-flex">Liên hệ</Link>
            <button className="grid h-11 w-11 place-items-center rounded-full text-ink lg:hidden" onClick={() => setOpen(!open)} aria-label={open ? "Đóng menu" : "Mở menu"} aria-expanded={open}>
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {search && (
          <form onSubmit={go} className="toast-pop mx-auto flex max-w-[1320px] gap-2 px-5 pb-4 lg:px-8">
            <input ref={input} type="search" placeholder="Tìm túi, tấm lót, tô, ly…" className="field !rounded-full" aria-label="Từ khoá tìm sản phẩm" />
            <button className="btn-primary !px-6">Tìm</button>
          </form>
        )}
      </div>
      {open && (
        <nav className="toast-pop max-h-[calc(100svh-72px)] overflow-y-auto border-t border-ink/10 bg-white px-5 pb-6 pt-2 lg:hidden">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`block border-b border-ink/5 py-3.5 text-lg font-semibold ${active(n.href) ? "text-leaf-700" : "text-ink"}`}>{n.label}</Link>
          ))}
          <Link href="/tai-khoan" className="block border-b border-ink/5 py-3.5 text-lg font-semibold text-ink">Tài khoản</Link>
          <Link href="/don-hang" className="block border-b border-ink/5 py-3.5 text-lg font-semibold text-ink">Tra cứu đơn hàng</Link>
          <Link href="/bao-gia" className="btn-primary mt-5 w-full">Nhận báo giá</Link>
        </nav>
      )}
    </header>
  );
}
