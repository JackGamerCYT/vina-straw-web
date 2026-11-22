import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { Logo } from "./logo";
import { T } from "./editable";
import type { Settings } from "@/lib/types";

export function Footer({ s }: { s: Settings }) {
  return (
    <footer className="weave-dark text-white/80">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-5 py-16 lg:grid-cols-[1.3fr_0.9fr_1fr_1.4fr] lg:px-8">
        <div>
          <Logo light />
          <T k="footer.about" as="p" multiline className="mt-5 block max-w-sm leading-relaxed text-white/70">Bao bì từ rơm rạ Việt Nam. Dự án nghiên cứu và phát triển của sinh viên, đang ở giai đoạn mẫu thử.</T>
        </div>
        <div>
          <p className="font-display text-lg font-semibold text-white">Sản phẩm</p>
          <ul className="mt-4 space-y-2.5">
            {["RơmDish", "RơmFlex-Pack", "RơmCell-Cushion", "RơmBioFilm", "RơmTherm-Mineral"].map((l) => (
              <li key={l}><Link className="link-draw hover:text-white" href={`/san-pham?dong=${encodeURIComponent(l)}`}>{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-display text-lg font-semibold text-white">Khách hàng</p>
          <ul className="mt-4 space-y-2.5">
            <li><Link className="link-draw hover:text-white" href="/bao-gia">Nhận báo giá, đặt hàng</Link></li>
            <li><Link className="link-draw hover:text-white" href="/gio-hang">Giỏ hàng</Link></li>
            <li><Link className="link-draw hover:text-white" href="/tai-khoan">Tài khoản của tôi</Link></li>
            <li><Link className="link-draw hover:text-white" href="/don-hang">Tra cứu và sửa đơn</Link></li>
            <li><Link className="link-draw hover:text-white" href="/#phim">Phim giới thiệu</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-display text-lg font-semibold text-white">Liên hệ</p>
          <ul className="mt-4 space-y-2.5">
            <li><T k="team">{s.team}</T></li>
            <li><T k="contactAddress">{s.contactAddress}</T></li>
            <li><a href={`tel:${s.contactPhone.replace(/[^\d+]/g, "")}`} className="link-draw inline-flex items-center gap-2 hover:text-white"><Phone className="h-4 w-4 text-straw-300" /><T k="contactPhone">{s.contactPhone}</T></a></li>
            <li><a href={`mailto:${s.contactEmail}`} className="link-draw inline-flex items-center gap-2 [overflow-wrap:anywhere] hover:text-white"><Mail className="h-4 w-4 shrink-0 text-straw-300" /><span>Mail: <T k="contactEmail">{s.contactEmail}</T></span></a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-2 px-5 py-6 text-xs text-white/50 lg:flex-row lg:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} Vina-Straw. Túi giấy và tấm lót rơm là ảnh chụp thật; các sản phẩm khác là ảnh dựng 3D.</p>
          <p>Một số ảnh đồng ruộng: Wikimedia Commons · <Link href="/nguon-anh" className="underline hover:text-white">Nguồn ảnh</Link> · <Link href="/admin" className="underline hover:text-white">Quản trị</Link></p>
        </div>
      </div>
    </footer>
  );
}
