import Image from "next/image";
import Link from "next/link";
import { ChevronsRight, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./logo";
import { T } from "./editable";
import { NewsletterForm } from "./site-forms";
import { fmtDay } from "@/lib/format";
import type { Post, Settings } from "@/lib/types";

const LINKS = [["/gioi-thieu", "Giới thiệu"], ["/san-pham", "Sản phẩm"], ["/tin-tuc", "Tin tức"], ["/tin-chi-carbon", "Tín chỉ carbon"], ["/lien-he", "Liên hệ"], ["/bao-gia", "Nhận báo giá"], ["/don-hang", "Tra cứu đơn hàng"], ["/tai-khoan", "Tài khoản của tôi"]];

export function Footer({ s, posts = [], lines = [] }: { s: Settings; posts?: Post[]; lines?: string[] }) {
  const tel = `tel:${s.contactPhone.replace(/[^\d+]/g, "")}`;
  return (
    <footer className="weave-dark text-white/80">
      <div className="mx-auto max-w-[1320px] px-5 lg:px-8">
        <div className="grid items-center gap-8 border-b border-white/10 py-12 lg:grid-cols-[1fr_1.1fr_1.6fr]">
          <Logo light />
          <T k="footer.news.title" as="p" className="font-display block text-2xl font-bold text-white">Đăng ký nhận tin từ Vina-Straw</T>
          <NewsletterForm />
        </div>
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_0.9fr_1.4fr]">
          <div>
            <p className="font-display text-xl font-bold text-white">Liên hệ</p>
            <ul className="mt-6 space-y-5">
              <li className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-straw-500 text-soil-900"><Mail className="h-4 w-4" /></span><span><span className="block text-sm text-white/60">Email</span><a href={`mailto:${s.contactEmail}`} className="font-semibold text-white hover:text-straw-300"><T k="contactEmail">{s.contactEmail}</T></a></span></li>
              <li className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-straw-500 text-soil-900"><MapPin className="h-4 w-4" /></span><span><span className="block text-sm text-white/60">Địa chỉ</span><span className="font-semibold text-white"><T k="contactAddress">{s.contactAddress}</T></span></span></li>
              <li className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-straw-500 text-soil-900"><Phone className="h-4 w-4" /></span><span><span className="block text-sm text-white/60">Điện thoại</span><a href={tel} className="font-semibold text-white hover:text-straw-300"><T k="contactPhone">{s.contactPhone}</T></a></span></li>
            </ul>
          </div>
          <div>
            <p className="font-display text-xl font-bold text-white">Liên kết</p>
            <ul className="mt-6 space-y-3 text-[15px]">
              {LINKS.map(([h, t]) => <li key={h}><Link href={h} className="flex items-center gap-1.5 hover:text-white"><ChevronsRight className="h-3.5 w-3.5 text-straw-300" />{t}</Link></li>)}
            </ul>
          </div>
          <div>
            <p className="font-display text-xl font-bold text-white">Sản phẩm</p>
            <ul className="mt-6 space-y-3 text-[15px]">
              {lines.map((l) => <li key={l}><Link href={`/san-pham?dong=${encodeURIComponent(l)}`} className="flex items-center gap-1.5 hover:text-white"><ChevronsRight className="h-3.5 w-3.5 text-straw-300" />{l}</Link></li>)}
            </ul>
          </div>
          <div>
            <p className="font-display text-xl font-bold text-white">Tin mới</p>
            <ul className="mt-6 space-y-5">
              {posts.slice(0, 2).map((p) => (
                <li key={p.id}>
                  <Link href={`/tin-tuc/${p.slug}`} className="group flex gap-4">
                    <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-white/10">{p.cover && <Image src={p.cover} alt="" fill sizes="80px" className="object-cover transition group-hover:scale-105" unoptimized={p.cover.startsWith("data:")} />}</span>
                    <span><span className="block text-sm text-straw-300">{fmtDay(p.createdAt)}</span><span className="line-clamp-2 font-semibold text-white group-hover:text-straw-300">{p.title}</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-white/10 py-6 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Vina-Straw. <T k="footer.copy">Bao bì từ rơm rạ Việt Nam.</T></p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-semibold text-white/80">COD</span>
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-semibold text-white/80">Chuyển khoản</span>
            <Link href="/nguon-anh" className="underline hover:text-white">Nguồn ảnh</Link>
            <Link href="/admin" className="underline hover:text-white">Quản trị</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
