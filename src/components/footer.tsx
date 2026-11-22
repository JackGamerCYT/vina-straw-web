import Link from "next/link";
import { Logo } from "./logo";
import type { Settings } from "@/lib/types";

export function Footer({ s }: { s: Settings }) {
  return (
    <footer className="weave-dark text-white/80">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-5 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Logo light />
          <p className="mt-5 max-w-sm leading-relaxed text-white/70">Bao bì từ rơm rạ Việt Nam. Dự án nghiên cứu và phát triển của sinh viên, đang ở giai đoạn mẫu thử.</p>
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
            <li><Link className="link-draw hover:text-white" href="/don-hang">Tra cứu và sửa đơn</Link></li>
            <li><Link className="link-draw hover:text-white" href="/#phim">Phim giới thiệu</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-display text-lg font-semibold text-white">Liên hệ</p>
          <ul className="mt-4 space-y-2.5">
            <li>{s.team}</li>
            <li>{s.contactAddress}</li>
            <li>{s.contactEmail}</li>
            <li>{s.contactPhone}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-2 px-5 py-6 text-xs text-white/50 lg:flex-row lg:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} Vina-Straw. Hình sản phẩm là ảnh dựng 3D từ bản vẽ kỹ thuật.</p>
          <p>Ảnh đồng ruộng: Wikimedia Commons (CC BY / CC BY-SA / PD) · <Link href="/nguon-anh" className="underline hover:text-white">Nguồn ảnh</Link> · <Link href="/admin" className="underline hover:text-white">Quản trị</Link></p>
        </div>
      </div>
    </footer>
  );
}
