"use client";
import { useEffect, useState } from "react";
import { ArrowUp, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { telHref, useSite, zaloHref } from "./site-context";

/** Nút liên hệ nổi bên phải (máy tính) và thanh 4 nút dưới đáy (điện thoại). */
export function ContactDock() {
  const s = useSite();
  const [top, setTop] = useState(false);
  useEffect(() => {
    const on = () => setTop(window.scrollY > 600);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const map = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address || "Thủ Đức, TP. Hồ Chí Minh")}`;
  const items = [
    s.phone && { href: telHref(s.phone), label: "Gọi điện", Icon: Phone, cls: "bg-red-500" },
    s.phone && { href: zaloHref(s.phone), label: "Zalo", Icon: MessageCircle, cls: "bg-sky-600", ext: true },
    s.email && { href: `mailto:${s.email}`, label: "Email", Icon: Mail, cls: "bg-leaf-600" },
    { href: map, label: "Bản đồ", Icon: MapPin, cls: "bg-straw-600", ext: true },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof Phone; cls: string; ext?: boolean }[];
  return (
    <>
      <div className="fixed bottom-24 right-4 z-40 hidden flex-col gap-2.5 lg:flex">
        {items.map(({ href, label, Icon, cls, ext }) => (
          <a key={label} href={href} target={ext ? "_blank" : undefined} rel={ext ? "noreferrer" : undefined} aria-label={label} title={label}
            className={`group relative grid h-11 w-11 place-items-center rounded-full text-white shadow-lg transition hover:scale-110 ${cls}`}>
            <Icon className="h-5 w-5" />
            <span className="pointer-events-none absolute right-14 whitespace-nowrap rounded-full bg-ink px-3 py-1 text-xs font-semibold opacity-0 transition group-hover:opacity-100">{label}</span>
          </a>
        ))}
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Lên đầu trang"
          className={`grid h-11 w-11 place-items-center rounded-full bg-ink text-white shadow-lg transition ${top ? "opacity-100" : "pointer-events-none opacity-0"}`}>
          <ArrowUp className="h-5 w-5" />
        </button>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-black/5 lg:hidden" aria-label="Liên hệ nhanh">
        {items.map(({ href, label, Icon, cls, ext }) => (
          <a key={label} href={href} target={ext ? "_blank" : undefined} rel={ext ? "noreferrer" : undefined} className={`flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-white ${cls}`}>
            <Icon className="h-5 w-5" /> {label}
          </a>
        ))}
      </nav>
      <div className="h-14 lg:hidden" aria-hidden />
    </>
  );
}
