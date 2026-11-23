import Link from "next/link";
import { ArrowUpRight, Eye, Flame, Target, Users } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { PageBanner } from "@/components/page-banner";
import { Reveal } from "@/components/reveal";
import { T, EImg } from "@/components/editable";
import { getSettings } from "@/lib/db";

export const metadata = { title: "Giới thiệu" };
export const revalidate = 60;

const ROADMAP = [
  ["Chốt nguyên liệu và mẫu đối chứng", "Nền giấy, pectin, tinh bột chuẩn; bộ mẫu F0–F9.", true],
  ["Tối ưu công thức tráng phủ", "Dung dịch lớp A, calcium lactate, nhũ tương sáp lớp B ổn định 7 ngày.", true],
  ["Tráng mẫu phẳng, đo Cobb và độ bền gấp", "So với giấy nền, chọn 2–3 công thức tốt nhất.", false],
  ["Làm mẫu tô, ly, túi, đệm", "Thử rò nước nóng, dầu, biến dạng và thử rơi cho đệm.", false],
  ["Kiểm nghiệm bên thứ ba, sản xuất pilot", "Tiếp xúc thực phẩm, khả năng phân huỷ, quy trình lô.", false],
] as const;

export default async function About() {
  const s = await getSettings();
  return (
    <>
      <Navbar />
      <PageBanner title="Giới thiệu" crumbs={[["Giới thiệu"]]} img="/img/straw-sheaves.webp" />
      <main>
        <section className="mx-auto grid max-w-[1320px] items-center gap-14 px-5 py-20 lg:grid-cols-2 lg:px-8">
          <Reveal className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <EImg k="about.img" src="/img/real/bo-san-pham.webp" alt="Sản phẩm Vina-Straw" fill sizes="(min-width:1024px) 600px, 100vw" className="object-cover" />
          </Reveal>
          <Reveal delay={100}>
            <p className="flex items-center gap-2 font-semibold text-soil-700"><Flame className="h-4 w-4" /> <T k="home.problem.kicker">Bài toán sau mỗi vụ lúa</T></p>
            <T k="home.problem.title" as="h2" className="font-display mt-3 block text-4xl font-bold leading-[1.08] tracking-tight text-leaf-900 sm:text-5xl">Rơm là nguyên liệu, không phải thứ để đốt</T>
            <T k="home.problem.body" as="p" multiline className="mt-6 block text-lg leading-relaxed text-ink-soft">Mỗi năm, đồng ruộng Việt Nam để lại hàng chục triệu tấn rơm rạ. Phần lớn bị đốt ngay tại ruộng, tạo khói bụi mịn và mất đi một nguồn xơ thực vật dồi dào. Vina-Straw biến lượng rơm đó thành bao bì dùng hằng ngày.</T>
            <T k="home.problem.source" as="p" className="mt-4 block text-sm text-ink-soft/80">Nguồn: Báo Nhân Dân (2025) dẫn số liệu ngành nông nghiệp; IRRI ước tính Việt Nam đốt bỏ trên 20 triệu tấn rơm mỗi năm.</T>
          </Reveal>
        </section>

        <section className="bg-mist">
          <div className="mx-auto grid max-w-[1320px] gap-6 px-5 py-20 md:grid-cols-3 lg:px-8">
            {[
              { Icon: Target, k: "about.mission", t: "Sứ mệnh", b: "Giữ lại rơm sau vụ gặt và biến nó thành bao bì dùng được hằng ngày, thay cho việc đốt bỏ." },
              { Icon: Eye, k: "about.vision", t: "Tầm nhìn", b: "Một dòng bao bì từ phụ phẩm nông nghiệp Việt Nam, minh bạch về nguồn gốc và kết quả kiểm nghiệm." },
              { Icon: Users, k: "about.team", t: "Đội ngũ", b: s.team },
            ].map(({ Icon, k, t, b }, i) => (
              <Reveal key={k} delay={i * 80} className="rounded-[28px] bg-white p-8">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-leaf-700 text-white"><Icon className="h-7 w-7" /></span>
                <T k={`${k}.t`} as="h3" className="font-display mt-6 block text-2xl font-bold text-leaf-900">{t}</T>
                <T k={`${k}.b`} as="p" multiline className="mt-3 block leading-relaxed text-ink-soft">{b}</T>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-[1320px] gap-12 px-5 py-20 lg:grid-cols-[1fr_1.3fr] lg:px-8">
          <Reveal>
            <T k="about.road.kicker" as="p" className="block text-sm font-semibold uppercase tracking-[0.18em] text-sprout">Lộ trình</T>
            <T k="aboutTitle" as="h2" className="font-display mt-3 block text-4xl font-bold leading-[1.08] tracking-tight text-leaf-900 sm:text-5xl">{s.aboutTitle}</T>
            <T k="aboutBody" as="p" multiline className="mt-6 block text-lg leading-relaxed text-ink-soft">{s.aboutBody}</T>
            <Link href="/lien-he" className="btn-primary mt-8 !px-7 !py-4">Liên hệ với chúng tôi <ArrowUpRight className="h-4 w-4" /></Link>
          </Reveal>
          <Reveal delay={120}>
            <ol className="relative border-l-2 border-leaf-100 pl-8">
              {ROADMAP.map(([t, b, done], i) => (
                <li key={i} className="relative pb-10 last:pb-0">
                  <span className={`absolute -left-[45px] grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${done ? "bg-leaf-700 text-white" : "border-2 border-leaf-200 bg-white text-leaf-700"}`}>{i + 1}</span>
                  <T k={`home.stage${i + 1}.t`} as="h3" className="font-display block text-xl font-bold text-ink">{t}</T>
                  <T k={`home.stage${i + 1}.b`} as="p" className="mt-1 block text-ink-soft">{b}</T>
                  <p className={`mt-1 text-sm font-semibold ${done ? "text-leaf-600" : "text-soil-700"}`}>{done ? "Đã xong" : "Đang làm"}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </section>
      </main>
    </>
  );
}
