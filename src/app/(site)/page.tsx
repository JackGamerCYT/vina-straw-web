import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, ShieldCheck, Flame, Recycle } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { HeroVideo } from "@/components/hero-video";
import { Enter, Reveal } from "@/components/reveal";
import { Count } from "@/components/count";
import { ProcessScroller, type Step } from "@/components/process-scroller";
import { FilmPlayer } from "@/components/film-player";
import { ProductCard } from "@/components/product-card";
import { getSettings, listProducts } from "@/lib/db";

export const revalidate = 60;

const LINES = ["RơmDish", "RơmFlex-Pack", "RơmCell-Cushion", "RơmBioFilm", "RơmTherm-Mineral", "VinaPack"];

const STEPS: Step[] = [
  { title: "Thu gom rơm sau vụ gặt", body: "Rơm khô, không mốc, được gom ngay trên ruộng thay vì đốt. Mỗi lô ghi nguồn, ngày thu và độ ẩm.", img: "/img/straw-cart.webp" },
  { title: "Làm sạch và mở xơ", body: "Rửa bỏ đất cát, cắt ngắn, đánh tơi rồi rây tách phần sợi mịn cho vỏ và bó sợi dài cho lõi chịu lực.", img: "/img/straw-macro.webp" },
  { title: "Phối liệu gốc thực vật", body: "Xơ rơm trộn bột giấy carton sạch, hồ tinh bột sắn và alginate. Không dùng keo nhựa tổng hợp.", img: "/img/straw-sheaves.webp" },
  { title: "Ép khuôn nóng và sấy", body: "Huyền phù được hút chân không trên khuôn lưới, ép định hình rồi sấy đến khối lượng ổn định.", img: "/renders/bowl.webp", contain: true },
  { title: "Tráng phủ VinaPack, kiểm tra", body: "Lớp pectin và lớp sáp thực vật giúp mặt trong hạn chế thấm. Mỗi mẻ đo độ hút nước, thử rò và thử gấp.", img: "/renders/cup.webp", contain: true },
];

export default async function Home() {
  const [s, products] = await Promise.all([getSettings(), listProducts()]);
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const shown = featured.length >= 3 ? featured : products.slice(0, 4);
  const lines = [...new Set(products.map((p) => p.line))];

  return (
    <>
      <Navbar overlay />

      {/* ───────── Hero ───────── */}
      <section className="relative isolate min-h-[100svh] overflow-hidden bg-white">
        <div className="absolute inset-0 -z-10 lg:left-auto lg:right-[-6%] lg:w-[80%] [mask-image:linear-gradient(to_right,transparent,#000_30%)] max-lg:opacity-40">
          <HeroVideo src={s.heroVideo} poster={s.heroPoster} className="h-full w-full object-cover object-[75%_60%]" />
        </div>
        <Enter className="mx-auto flex min-h-[100svh] max-w-[1240px] flex-col justify-center px-5 pb-16 pt-28 lg:px-8">
          <p data-enter style={{ ["--i" as string]: 0 }} className="flex items-center gap-2 text-[15px] font-semibold text-leaf-700">
            <Leaf className="h-4 w-4 text-sprout" /> Bao bì từ rơm rạ Việt Nam
          </p>
          <h1 data-enter style={{ ["--i" as string]: 1 }} className="font-display mt-5 max-w-[13ch] text-[44px] font-bold leading-[0.98] tracking-[-0.03em] text-leaf-900 sm:text-6xl lg:text-[82px]">
            {s.heroTitle}
          </h1>
          <p data-enter style={{ ["--i" as string]: 2 }} className="mt-6 max-w-[46ch] text-lg leading-relaxed text-ink-soft sm:text-xl">{s.heroLead}</p>
          <div data-enter style={{ ["--i" as string]: 3 }} className="mt-9 flex flex-wrap gap-3">
            <Link href="/bao-gia" className="btn-primary group !px-7 !py-4 text-base">
              Nhận báo giá <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <Link href="/san-pham" className="btn-ghost !px-7 !py-4 text-base">Xem sản phẩm</Link>
          </div>
          <ul data-enter style={{ ["--i" as string]: 4 }} className="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-ink/10 pt-6">
            <li><span className="font-display block text-3xl font-bold text-leaf-800">{products.length}</span><span className="text-sm text-ink-soft">mẫu sản phẩm</span></li>
            <li><span className="font-display block text-3xl font-bold text-leaf-800">{lines.length}</span><span className="text-sm text-ink-soft">dòng công nghệ</span></li>
            <li><span className="font-display block text-3xl font-bold text-leaf-800">0</span><span className="text-sm text-ink-soft">keo nhựa tổng hợp</span></li>
          </ul>
        </Enter>
      </section>

      {/* ───────── Dải tên dòng sản phẩm ───────── */}
      <div className="weave overflow-hidden border-y border-straw-300/60 py-5" aria-hidden>
        <div className="marquee gap-14 pr-14">
          {[...LINES, ...LINES, ...LINES, ...LINES].map((t, i) => (
            <span key={i} className="font-display flex items-center gap-14 whitespace-nowrap text-2xl font-bold text-soil-700">
              {t} <span className="h-2 w-2 rotate-45 bg-leaf-600" />
            </span>
          ))}
        </div>
      </div>

      {/* ───────── Vấn đề: rơm bị đốt ───────── */}
      <section id="du-an" className="scroll-mt-16">
        <div className="mx-auto grid max-w-[1240px] gap-12 px-5 py-24 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:py-32">
          <Reveal className="lg:col-span-5">
            <p className="flex items-center gap-2 font-semibold text-soil-700"><Flame className="h-4 w-4" /> Bài toán sau mỗi vụ lúa</p>
            <h2 className="font-display mt-4 text-4xl font-bold leading-[1.05] tracking-tight text-leaf-900 sm:text-5xl">Rơm là nguyên liệu, không phải thứ để đốt</h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">
              Mỗi năm, đồng ruộng Việt Nam để lại hàng chục triệu tấn rơm rạ. Phần lớn bị đốt ngay tại ruộng, tạo khói bụi mịn và mất đi một nguồn xơ thực vật dồi dào. Vina-Straw biến lượng rơm đó thành bao bì dùng hằng ngày.
            </p>
            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8">
              <div>
                <dt className="text-sm text-ink-soft">Rơm rạ phát sinh mỗi năm</dt>
                <dd className="font-display mt-1 text-5xl font-bold text-leaf-800"><Count to={47} /><span className="ml-1 text-2xl">triệu tấn</span></dd>
              </div>
              <div>
                <dt className="text-sm text-ink-soft">Được thu gom, sử dụng</dt>
                <dd className="font-display mt-1 text-5xl font-bold text-straw-600">~<Count to={30} />%</dd>
              </div>
            </dl>
            <p className="mt-6 text-xs text-ink-soft/80">Nguồn: Báo Nhân Dân (2025) dẫn số liệu ngành nông nghiệp; IRRI ước tính Việt Nam đốt bỏ trên 20 triệu tấn rơm mỗi năm.</p>
          </Reveal>
          <Reveal className="grid grid-cols-6 grid-rows-[auto_auto] gap-4 lg:col-span-7" delay={120}>
            <div className="zoom-frame relative col-span-6 aspect-[16/9] rounded-[28px]">
              <Image src="/img/field-burnt.webp" alt="Cánh đồng sau khi đốt rơm, còn lại những bó rơm cuối cùng" fill sizes="(min-width:1024px) 700px, 100vw" className="object-cover" />
            </div>
            <div className="zoom-frame relative col-span-3 aspect-[4/3] rounded-[28px]">
              <Image src="/img/straw-sheaves.webp" alt="Những bó rơm dựng trên ruộng sau thu hoạch" fill sizes="(min-width:1024px) 340px, 50vw" className="object-cover" />
            </div>
            <div className="col-span-3 flex flex-col justify-end rounded-[28px] bg-leaf-700 p-6 text-white">
              <Recycle className="h-8 w-8 text-straw-300" />
              <p className="font-display mt-4 text-2xl font-bold leading-tight">Sợi rơm chiếm một nửa khối lượng khô của vỏ đệm RơmCell.</p>
              <p className="mt-2 text-sm text-white/70">Phần còn lại là bột giấy carton tái chế, tinh bột sắn và alginate.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────── Quy trình (ghim + trượt ngang) ───────── */}
      <section id="quy-trinh" className="scroll-mt-0 bg-white">
        <ProcessScroller steps={STEPS} />
      </section>

      {/* ───────── Sản phẩm ───────── */}
      <section id="san-pham" className="bg-mist">
        <div className="mx-auto max-w-[1240px] px-5 py-24 lg:px-8 lg:py-32">
          <div className="grid items-end gap-10 lg:grid-cols-2">
            <Reveal>
              <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-leaf-900 sm:text-5xl">Một nguồn rơm, năm dòng sản phẩm</h2>
              <p className="mt-5 max-w-lg text-lg text-ink-soft">Đồ dùng bữa ăn, túi mang đi, đệm chống sốc, màng bọc và tấm cách nhiệt. Giá dưới đây là giá tham khảo cho đơn sỉ; báo giá chính thức theo số lượng.</p>
            </Reveal>
            <Reveal delay={120} className="relative aspect-[3/2]">
              <Image src="/renders/lineup.webp" alt="Bộ tô, ly, chén, dĩa và túi Vina-Straw" fill sizes="(min-width:1024px) 600px, 100vw" className="object-contain" />
            </Reveal>
          </div>
          <div className="mt-16 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {shown.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
          <div className="mt-14 flex justify-center">
            <Link href="/san-pham" className="btn-ghost group !px-7 !py-4">Xem tất cả {products.length} sản phẩm <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></Link>
          </div>
        </div>
      </section>

      {/* ───────── Phim giới thiệu ───────── */}
      <section id="phim" className="weave-dark scroll-mt-16 text-white">
        <div className="mx-auto max-w-[1240px] px-5 py-24 lg:px-8 lg:py-32">
          <Reveal className="grid gap-6 lg:grid-cols-2 lg:items-end">
            <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">Xem Vina-Straw trong 30 giây</h2>
            <p className="max-w-lg text-lg text-white/70 lg:justify-self-end">Từ cánh đồng Cần Thơ đến bộ đồ ăn ép từ xơ rơm. Phim dựng bằng mô hình 3D theo đúng bản vẽ kỹ thuật của dự án.</p>
          </Reveal>
          <Reveal delay={100} className="mt-12">
            <FilmPlayer src="/video/film.mp4" poster="/video/film-poster.jpg" />
          </Reveal>
        </div>
      </section>

      {/* ───────── Minh bạch giai đoạn ───────── */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-[1240px] gap-14 px-5 py-24 lg:grid-cols-12 lg:px-8 lg:py-32">
          <Reveal className="lg:col-span-5">
            <p className="flex items-center gap-2 font-semibold text-leaf-700"><ShieldCheck className="h-4 w-4" /> Nói rõ để khách yên tâm</p>
            <h2 className="font-display mt-4 text-4xl font-bold leading-[1.05] tracking-tight text-leaf-900 sm:text-5xl">{s.aboutTitle}</h2>
            <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-ink-soft">{s.aboutBody}</p>
            <p className="mt-6 rounded-2xl bg-straw-100 p-5 text-[15px] leading-relaxed text-soil-900">
              Chúng tôi chỉ công bố “kháng nước”, “an toàn thực phẩm” hay “phân huỷ sinh học” sau khi có kết quả kiểm nghiệm của bên thứ ba. Đơn đặt mẫu thử được ưu tiên trong giai đoạn này.
            </p>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-7">
            <ol className="relative border-l-2 border-leaf-100 pl-8">
              {[
                ["Chốt nguyên liệu và mẫu đối chứng", "Nền giấy, pectin, tinh bột chuẩn; bộ mẫu F0–F9.", true],
                ["Tối ưu công thức tráng phủ", "Dung dịch lớp A, calcium lactate, nhũ tương sáp lớp B ổn định 7 ngày.", true],
                ["Tráng mẫu phẳng, đo Cobb và độ bền gấp", "So với giấy nền, chọn 2–3 công thức tốt nhất.", false],
                ["Làm mẫu tô, ly, túi, đệm", "Thử rò nước nóng, dầu, biến dạng và thử rơi cho đệm.", false],
                ["Kiểm nghiệm bên thứ ba, sản xuất pilot", "Tiếp xúc thực phẩm, khả năng phân huỷ, quy trình lô.", false],
              ].map(([t, b, done], i) => (
                <li key={i} className="relative pb-10 last:pb-0">
                  <span className={`absolute -left-[45px] grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${done ? "bg-leaf-700 text-white" : "border-2 border-leaf-200 bg-white text-leaf-700"}`}>{i + 1}</span>
                  <h3 className="font-display text-xl font-bold text-ink">{t as string}</h3>
                  <p className="mt-1 text-ink-soft">{b as string}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* ───────── Kêu gọi báo giá ───────── */}
      <section className="px-5 pb-24 lg:px-8">
        <div className="relative mx-auto grid max-w-[1240px] overflow-hidden rounded-[36px] bg-leaf-700 text-white lg:grid-cols-2">
          <div className="p-10 sm:p-14">
            <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">Cần tô, ly hay túi cho quán của bạn?</h2>
            <p className="mt-5 max-w-md text-lg text-white/75">Chọn sản phẩm, số lượng và gửi kèm ảnh mẫu bạn muốn. Chúng tôi báo giá trong 1–2 ngày làm việc. Bạn có thể sửa yêu cầu bất cứ lúc nào trước khi xác nhận.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/bao-gia" className="btn-straw group !px-7 !py-4 text-base">Gửi yêu cầu báo giá <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></Link>
              <Link href="/don-hang" className="btn !border !border-white/30 !px-7 !py-4 text-base text-white hover:bg-white/10">Tra cứu đơn</Link>
            </div>
          </div>
          <div className="zoom-frame relative min-h-[320px]">
            <Image src="/img/takeaway.webp" alt="Hộp, khay và túi giấy mang đi" fill sizes="(min-width:1024px) 620px, 100vw" className="object-cover" />
          </div>
        </div>
      </section>
    </>
  );
}
