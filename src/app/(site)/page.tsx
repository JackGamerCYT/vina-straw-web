import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, HandHeart, Phone, Recycle, ShieldCheck, Sprout, Timer, Wheat, Boxes, Layers } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { HeroSlider, type Slide } from "@/components/hero-slider";
import { Reveal } from "@/components/reveal";
import { Count } from "@/components/count";
import { ProcessScroller, type Step } from "@/components/process-scroller";
import { FilmPlayer } from "@/components/film-player";
import { ProductCard } from "@/components/product-card";
import { LineTabs, type Line } from "@/components/line-tabs";
import { ContactForm } from "@/components/site-forms";
import { T, EImg } from "@/components/editable";
import { getSettings, listPosts, listProducts } from "@/lib/db";
import { dayParts, isRender } from "@/lib/format";

export const revalidate = 60;

const STEPS: Step[] = [
  { title: "Thu gom rơm sau vụ gặt", body: "Rơm khô, không mốc, được gom ngay trên ruộng thay vì đốt. Mỗi lô ghi nguồn, ngày thu và độ ẩm.", img: "/img/straw-cart.webp" },
  { title: "Làm sạch và mở xơ", body: "Rửa bỏ đất cát, cắt ngắn, đánh tơi rồi rây tách phần sợi mịn cho vỏ và bó sợi dài cho lõi chịu lực.", img: "/img/real/soi-rom.webp" },
  { title: "Phối liệu gốc thực vật", body: "Xơ rơm trộn bột giấy carton sạch, hồ tinh bột sắn và alginate. Không dùng keo nhựa tổng hợp.", img: "/img/straw-sheaves.webp" },
  { title: "Ép khuôn nóng và sấy", body: "Huyền phù được hút chân không trên khuôn lưới, ép định hình rồi sấy đến khối lượng ổn định.", img: "/renders/bowl.webp", contain: true },
  { title: "Tráng phủ VinaPack, kiểm tra", body: "Lớp pectin và lớp sáp thực vật giúp mặt trong hạn chế thấm. Mỗi mẻ đo độ hút nước, thử rò và thử gấp.", img: "/renders/cup.webp", contain: true },
];

const FEATURES = [
  { Icon: Wheat, t: "Nguyên liệu rơm rạ", b: "Rơm sau vụ gặt được gom lại thay vì đốt trên đồng." },
  { Icon: Recycle, t: "Không keo nhựa tổng hợp", b: "Chất kết dính gốc thực vật: tinh bột sắn, alginate." },
  { Icon: HandHeart, t: "Làm mẫu theo yêu cầu", b: "Đặt mẫu thử theo kích thước, in logo của quán bạn." },
  { Icon: Timer, t: "Báo giá trong 1–2 ngày", b: "Gửi yêu cầu trực tuyến, theo dõi và sửa đơn mọi lúc." },
];

const GALLERY = [
  ["g1", "Bộ túi giấy và tấm lót rơm trong nong tre", "lg:col-span-2"],
  ["g2", "Cầm túi giấy rơm trên tay", ""],
  ["g3", "Tấm lót rơm trên nong lúa", "lg:row-span-2"],
  ["g4", "Túi và tấm lót đặt trên cỏ", "lg:col-span-2"],
  ["g5", "Hai túi giấy rơm trong nong lúa", ""],
  ["g6", "Túi giấy và tấm lót trong nong tre", ""],
] as const;

function Heading({ k, kicker, title, lead, light = false }: { k: string; kicker: string; title: string; lead?: string; light?: boolean }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <T k={`${k}.kicker`} as="p" className={`block text-sm font-semibold uppercase tracking-[0.18em] ${light ? "text-straw-300" : "text-sprout"}`}>{kicker}</T>
      <T k={`${k}.title`} as="h2" className={`font-display mt-3 block text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl ${light ? "text-white" : "text-leaf-900"}`}>{title}</T>
      {lead && <T k={`${k}.lead`} as="p" multiline className={`mt-4 block text-lg ${light ? "text-white/70" : "text-ink-soft"}`}>{lead}</T>}
    </div>
  );
}

export default async function Home() {
  const [s, products, posts] = await Promise.all([getSettings(), listProducts(), listPosts({ limit: 3 })]);
  const featured = products.filter((p) => p.featured);
  const shown = [...featured, ...products.filter((p) => !p.featured)].slice(0, 8);
  const lineNames = [...new Set(products.map((p) => p.line))];
  const lines: Line[] = lineNames.map((name) => {
    const ps = products.filter((p) => p.line === name);
    const withReal = ps.find((p) => p.images[0] && !isRender(p.images[0]));
    const lead = withReal ?? ps[0];
    return { name, title: name, items: ps.map((p) => p.name), body: lead.short, image: lead.images[0] ?? "", count: ps.length, real: Boolean(withReal) };
  });
  const slides: Slide[] = [
    { kicker: "Bao bì từ rơm rạ Việt Nam", big: "Rơm", rest: "thành bao bì mỗi ngày", lead: s.heroLead, video: { src: s.heroVideo, poster: s.heroPoster } },
    { kicker: "Mẫu thật đầu tiên của nhóm", big: "Túi giấy", rest: "và tấm lót từ rơm", lead: "Làm từ xơ rơm sau vụ gặt, giữ vân sợi tự nhiên trên từng chiếc.", img: "/img/real/slide-2.webp" },
    { kicker: "Đặt mẫu thử theo yêu cầu", big: "Xanh", rest: "từ cánh đồng Việt", lead: "Gửi kích thước và logo của quán bạn, chúng tôi báo giá trong 1–2 ngày làm việc.", img: "/img/real/slide-3.webp" },
  ];

  return (
    <>
      <Navbar />
      <HeroSlider slides={slides} />

      {/* ───────── 4 điểm mạnh ───────── */}
      <section className="mx-auto grid max-w-[1320px] gap-8 px-5 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {FEATURES.map(({ Icon, t, b }, i) => (
          <Reveal key={t} delay={i * 80} className="group flex gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-leaf-100 text-leaf-700 transition group-hover:-translate-y-1 group-hover:bg-leaf-700 group-hover:text-white"><Icon className="h-7 w-7" /></span>
            <div>
              <T k={`home.feat${i + 1}.t`} as="h3" className="font-display block text-lg font-bold text-ink">{t}</T>
              <T k={`home.feat${i + 1}.b`} as="p" className="mt-1 block text-[15px] leading-relaxed text-ink-soft">{b}</T>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ───────── Về chúng tôi ───────── */}
      <section id="du-an" className="scroll-mt-28 bg-mist">
        <div className="mx-auto grid max-w-[1320px] items-center gap-14 px-5 py-24 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <T k="home.about2.kicker" as="p" className="block text-sm font-semibold uppercase tracking-[0.18em] text-sprout">Về Vina-Straw</T>
            <T k="heroTitle" as="h2" className="font-display mt-3 block text-4xl font-bold leading-[1.08] tracking-tight text-leaf-900 sm:text-5xl">{s.heroTitle}</T>
            <T k="home.problem.body" as="p" multiline className="mt-6 block text-lg leading-relaxed text-ink-soft">Mỗi năm, đồng ruộng Việt Nam để lại hàng chục triệu tấn rơm rạ. Phần lớn bị đốt ngay tại ruộng, tạo khói bụi mịn và mất đi một nguồn xơ thực vật dồi dào. Vina-Straw biến lượng rơm đó thành bao bì dùng hằng ngày.</T>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {["Rơm thu gom sau vụ gặt", "Kết dính gốc thực vật", "Mẫu thử theo yêu cầu", "Minh bạch về kiểm nghiệm"].map((t, i) => (
                <li key={t} className="flex items-center gap-2.5 font-medium text-ink"><span className="grid h-6 w-6 place-items-center rounded-full bg-sprout text-white"><Check className="h-3.5 w-3.5" /></span><T k={`home.about2.c${i + 1}`}>{t}</T></li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link href="/gioi-thieu" className="btn-primary !px-7 !py-4">Về chúng tôi <ArrowUpRight className="h-4 w-4" /></Link>
              <a href={`tel:${s.contactPhone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-straw-500 text-soil-900"><Phone className="h-5 w-5" /></span>
                <span><span className="block text-sm text-ink-soft">Điện thoại</span><span className="font-display text-xl font-bold text-leaf-700">{s.contactPhone}</span></span>
              </a>
            </div>
          </Reveal>
          <Reveal delay={120} className="relative">
            <div className="zoom-frame relative aspect-[4/5] w-[78%] overflow-hidden rounded-[28px] shadow-xl">
              <EImg k="home.about2.img1" src="/img/real/gallery/g2.webp" alt="Túi giấy rơm Vina-Straw" fill sizes="(min-width:1024px) 480px, 80vw" className="object-cover" />
            </div>
            <div className="zoom-frame absolute bottom-[-6%] right-0 aspect-square w-[46%] overflow-hidden rounded-[24px] border-8 border-mist shadow-xl">
              <EImg k="home.about2.img2" src="/img/real/tam-lot-2.webp" alt="Cận cảnh tấm lót rơm" fill sizes="300px" className="object-cover" />
            </div>
            <div className="absolute right-[4%] top-[8%] w-[44%] rounded-[24px] bg-straw-500 p-6 text-soil-900 shadow-xl">
              <T k="home.about2.stat.k" as="p" className="block text-sm font-semibold">Rơm rạ mỗi năm ở Việt Nam</T>
              <p className="font-display mt-2 text-4xl font-bold sm:text-5xl"><Count to={47} /> <span className="text-2xl">triệu tấn</span></p>
              <T k="home.about2.stat.src" as="p" className="mt-2 block text-xs text-soil-900/80">Nguồn: Báo Nhân Dân (2025)</T>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────── Dòng sản phẩm ───────── */}
      <section className="mx-auto max-w-[1320px] px-5 py-24 lg:px-8">
        <Heading k="home.lines" kicker="Dòng sản phẩm" title="Một nguồn rơm, nhiều dòng sản phẩm" lead="Từ túi giấy, tấm lót đến tô, ly, đệm chống sốc và màng bọc. Chọn một dòng để xem chi tiết." />
        <div className="mt-12"><LineTabs lines={lines} /></div>
      </section>

      {/* ───────── Dải số liệu ───────── */}
      <section className="weave-dark">
        <div className="mx-auto grid max-w-[1320px] gap-8 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {[
            { Icon: Boxes, n: products.length, u: "", t: "Mẫu sản phẩm" },
            { Icon: Layers, n: lineNames.length, u: "", t: "Dòng công nghệ" },
            { Icon: Wheat, n: 47, u: "tr. tấn", t: "Rơm rạ mỗi năm ở Việt Nam" },
            { Icon: Sprout, n: 0, u: "", t: "Keo nhựa tổng hợp" },
          ].map(({ Icon, n, u, t }, i) => (
            <div key={t} className="flex items-center gap-4 text-white">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/5 text-straw-300"><Icon className="h-8 w-8" /></span>
              <div><p className="font-display text-4xl font-bold"><Count to={n} />{u && <span className="ml-1 text-xl">{u}</span>}</p><T k={`home.stat${i + 1}`} as="p" className="block text-white/70">{t}</T></div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── Quy trình ───────── */}
      <section id="quy-trinh" className="scroll-mt-28">
        <ProcessScroller steps={STEPS} />
      </section>

      {/* ───────── Thư viện ảnh ───────── */}
      <section className="bg-mist">
        <div className="mx-auto max-w-[1320px] px-5 py-24 lg:px-8">
          <Heading k="home.gallery" kicker="Thư viện" title="Hình ảnh sản phẩm thật" lead="Ảnh do nhóm Vina-Straw tự chụp các mẫu túi giấy và tấm lót rơm." />
          <div className="mt-12 grid auto-rows-[220px] grid-cols-2 gap-4 lg:auto-rows-[260px] lg:grid-cols-4">
            {GALLERY.map(([id, alt, cls], i) => (
              <Reveal key={id} delay={i * 60} className={`zoom-frame relative overflow-hidden rounded-[22px] ${cls}`}>
                <EImg k={`home.gallery.${id}`} src={`/img/real/gallery/${id}.webp`} alt={alt} fill sizes="(min-width:1024px) 640px, 50vw" className="object-cover" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Banner kêu gọi ───────── */}
      <section className="mx-auto max-w-[1320px] px-5 py-24 lg:px-8">
        <div className="relative overflow-hidden rounded-[36px] bg-leaf-700 text-white">
          <div className="grid items-center lg:grid-cols-[1.2fr_1fr]">
            <div className="p-8 sm:p-14">
              <T k="home.cta.kicker" as="p" className="block text-sm font-semibold uppercase tracking-[0.18em] text-straw-300">Đặt hàng cho quán của bạn</T>
              <T k="home.cta.title" as="h2" className="font-display mt-3 block text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">Cần túi, tấm lót hay tô, ly cho quán của bạn?</T>
              <T k="home.cta.body" as="p" multiline className="mt-5 block max-w-lg text-lg text-white/80">Chọn sản phẩm, số lượng và gửi kèm ảnh mẫu bạn muốn. Chúng tôi báo giá trong 1–2 ngày làm việc.</T>
              <div className="mt-9 flex flex-wrap items-center gap-6">
                <Link href="/bao-gia" className="inline-flex items-center gap-2 rounded-full bg-straw-500 px-7 py-4 font-semibold text-soil-900 hover:bg-straw-300"><T k="home.cta.btn">Gửi yêu cầu báo giá</T> <ArrowUpRight className="h-4 w-4" /></Link>
                <a href={`tel:${s.contactPhone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-straw-500 text-soil-900"><Phone className="h-5 w-5" /></span>
                  <span><span className="block text-sm text-white/70">Gọi ngay</span><span className="font-display text-xl font-bold">{s.contactPhone}</span></span>
                </a>
              </div>
            </div>
            <div className="relative h-72 lg:h-full lg:min-h-[460px]">
              <EImg k="home.cta.img" src="/img/real/tui-cam-tay.webp" alt="Túi giấy rơm và tấm lót rơm Vina-Straw" fill sizes="(min-width:1024px) 560px, 100vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Sản phẩm nổi bật ───────── */}
      <section id="san-pham" className="scroll-mt-28 mx-auto max-w-[1320px] px-5 pb-24 lg:px-8">
        <Heading k="home.products" kicker="Sản phẩm" title="Sản phẩm nổi bật" lead="Túi giấy và tấm lót rơm là mẫu thật nhóm đã làm ra. Các sản phẩm khác đang ở giai đoạn thiết kế, hình là ảnh dựng 3D." />
        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          {shown.map((p, i) => <Reveal key={p.id} delay={(i % 4) * 80}><ProductCard p={p} /></Reveal>)}
        </div>
        <div className="mt-10 text-center"><Link href="/san-pham" className="btn-ghost !px-8 !py-3.5">Xem tất cả sản phẩm <ArrowUpRight className="h-4 w-4" /></Link></div>
      </section>

      {/* ───────── Video ───────── */}
      <section id="phim" className="scroll-mt-28 weave-dark">
        <div className="mx-auto max-w-[1320px] px-5 py-24 lg:px-8">
          <Heading k="home.film" kicker="Video" title="Sản phẩm thật của Vina-Straw" lead="Túi giấy rơm và tấm lót rơm do nhóm tự làm, quay ngoài nắng trên cỏ." light />
          <div className="mx-auto mt-12 max-w-5xl"><FilmPlayer src="/video/film.mp4" poster="/video/film-poster.jpg" /></div>
        </div>
      </section>

      {/* ───────── Minh bạch ───────── */}
      <section className="mx-auto grid max-w-[1320px] gap-12 px-5 py-24 lg:grid-cols-2 lg:px-8">
        <Reveal>
          <p className="flex items-center gap-2 font-semibold text-leaf-700"><ShieldCheck className="h-4 w-4" /> <T k="home.about.kicker">Nói rõ để khách yên tâm</T></p>
          <T k="aboutTitle" as="h2" className="font-display mt-4 block text-4xl font-bold leading-[1.08] tracking-tight text-leaf-900 sm:text-5xl">{s.aboutTitle}</T>
          <T k="aboutBody" as="p" multiline className="mt-6 block text-lg leading-relaxed text-ink-soft">{s.aboutBody}</T>
        </Reveal>
        <Reveal delay={120} className="rounded-[32px] bg-straw-100 p-8 sm:p-10">
          <ShieldCheck className="h-10 w-10 text-soil-700" />
          <T k="home.about.note" as="p" multiline className="font-display mt-5 block text-2xl font-semibold leading-snug text-soil-900">Chúng tôi chỉ công bố “kháng nước”, “an toàn thực phẩm” hay “phân huỷ sinh học” sau khi có kết quả kiểm nghiệm của bên thứ ba.</T>
          <T k="home.about.note2" as="p" className="mt-4 block text-soil-700">Đơn đặt mẫu thử được ưu tiên trong giai đoạn này.</T>
        </Reveal>
      </section>

      {/* ───────── Liên hệ ───────── */}
      <section className="bg-mist">
        <div className="mx-auto grid max-w-[1600px] lg:grid-cols-2">
          <div className="px-5 py-20 sm:px-12 lg:px-16">
            <T k="home.contact.kicker" as="p" className="block text-sm font-semibold uppercase tracking-[0.18em] text-sprout">Liên hệ với chúng tôi</T>
            <T k="home.contact.title" as="h2" className="font-display mt-3 block text-4xl font-bold leading-[1.08] tracking-tight text-leaf-900 sm:text-5xl">Cần tư vấn về sản phẩm?</T>
            <T k="home.contact.lead" as="p" className="mb-8 mt-4 block text-lg text-ink-soft">Để lại lời nhắn, chúng tôi trả lời trong 1–2 ngày làm việc.</T>
            <ContactForm compact />
          </div>
          <div className="relative min-h-[360px]">
            <EImg k="home.contact.img" src="/img/real/gallery/g6.webp" alt="Sản phẩm Vina-Straw trong nong tre" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* ───────── Tin tức ───────── */}
      {posts.length > 0 && (
        <section className="mx-auto max-w-[1320px] px-5 py-24 lg:px-8">
          <Heading k="home.news" kicker="Tin tức" title="Tin tức & bài viết mới nhất" />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {posts.map((p, i) => {
              const d = dayParts(p.createdAt);
              return (
                <Reveal key={p.id} delay={i * 80}>
                  <Link href={`/tin-tuc/${p.slug}`} className="group block">
                    <div className="relative">
                      <div className="zoom-frame relative aspect-[4/3] overflow-hidden rounded-[24px] bg-mist">{p.cover && <Image src={p.cover} alt="" fill sizes="(min-width:768px) 400px, 100vw" className="object-cover" unoptimized={p.cover.startsWith("data:")} />}</div>
                      <span className="absolute bottom-0 left-6 grid h-16 w-16 translate-y-1/2 place-items-center rounded-full bg-straw-500 text-center font-display font-bold leading-none text-soil-900 shadow-lg"><span>{d.d}<span className="block text-xs font-semibold">{d.m}</span></span></span>
                    </div>
                    <div className="px-1 pt-12">
                      <p className="text-sm font-semibold text-sprout">Tin tức</p>
                      <h3 className="font-display mt-2 line-clamp-2 text-xl font-bold text-ink group-hover:text-leaf-700">{p.title}</h3>
                      <p className="mt-2 line-clamp-2 text-ink-soft">{p.excerpt}</p>
                      <p className="mt-4 flex items-center gap-1 font-semibold text-leaf-700">Đọc tiếp <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></p>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
