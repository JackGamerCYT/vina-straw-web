import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

/** Banner đầu trang con: ảnh nền tối, tiêu đề giữa, breadcrumb. */
export function PageBanner({ title, crumbs = [], img = "/img/real/slide-3.webp", heading = true }: { title: string; crumbs?: [string, string?][]; img?: string; heading?: boolean }) {
  const H = heading ? "h1" : "p";
  return (
    <section className="px-3 pt-[76px] sm:px-5 lg:pt-[124px]">
      <div className="relative isolate mx-auto flex h-64 max-w-[1600px] items-center justify-center overflow-hidden rounded-[28px] bg-leaf-900 sm:h-80 sm:rounded-[36px]">
        <Image src={img} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-45" />
        <div className="text-center text-white">
          <nav aria-label="Đường dẫn" className="flex items-center justify-center gap-1.5 text-sm text-white/80">
            <Link href="/" className="hover:text-white">Trang chủ</Link>
            {crumbs.map(([t, h], i) => (
              <span key={i} className="flex items-center gap-1.5"><ChevronRight className="h-3.5 w-3.5" />{h ? <Link href={h} className="hover:text-white">{t}</Link> : <span className="text-straw-300">{t}</span>}</span>
            ))}
          </nav>
          <H className="font-display mt-3 px-5 text-4xl font-bold uppercase tracking-tight sm:text-6xl">{title}</H>
        </div>
      </div>
    </section>
  );
}
