import Link from "next/link";
import { Search } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { PageBanner } from "@/components/page-banner";
import { ProductCard } from "@/components/product-card";
import { listProducts } from "@/lib/db";

export const revalidate = 60;
export const metadata = { title: "Sản phẩm" };

const SORTS = [["", "Sắp xếp mặc định"], ["gia-tang", "Giá tăng dần"], ["gia-giam", "Giá giảm dần"], ["ten", "Tên A → Z"]] as const;
const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").toLowerCase();

export default async function Products({ searchParams }: { searchParams: Promise<{ dong?: string; q?: string; sx?: string }> }) {
  const { dong, q, sx } = await searchParams;
  const all = await listProducts();
  const lines = [...new Set(all.map((p) => p.line))];
  const needle = fold((q ?? "").trim());
  let list = all.filter((p) => (!dong || p.line === dong) && (!needle || fold(`${p.name} ${p.line} ${p.short}`).includes(needle)));
  if (sx === "gia-tang") list = [...list].sort((a, b) => (a.price || Infinity) - (b.price || Infinity));
  if (sx === "gia-giam") list = [...list].sort((a, b) => b.price - a.price);
  if (sx === "ten") list = [...list].sort((a, b) => a.name.localeCompare(b.name, "vi"));
  const href = (o: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ dong, q, sx, ...o })) if (v) p.set(k, v);
    const x = p.toString();
    return `/san-pham${x ? `?${x}` : ""}`;
  };
  return (
    <>
      <Navbar />
      <PageBanner title={dong ?? "Sản phẩm"} crumbs={dong ? [["Sản phẩm", "/san-pham"], [dong]] : [["Sản phẩm"]]} img="/img/real/slide-2.webp" />
      <main className="mx-auto grid max-w-[1320px] gap-10 px-5 py-16 lg:grid-cols-[270px_1fr] lg:px-8">
        <aside className="space-y-6 lg:sticky lg:top-32 lg:self-start">
          <form action="/san-pham" className="relative">
            {dong && <input type="hidden" name="dong" value={dong} />}
            <input name="q" defaultValue={q} placeholder="Tìm sản phẩm…" aria-label="Tìm sản phẩm" className="field !rounded-full !pr-12" />
            <button aria-label="Tìm" className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-leaf-700 text-white"><Search className="h-4 w-4" /></button>
          </form>
          <div className="overflow-hidden rounded-[22px] bg-leaf-900 text-white">
            <p className="font-display border-b border-white/10 px-5 py-4 text-lg font-bold">Danh mục sản phẩm</p>
            <ul className="p-2">
              <li><Link href={href({ dong: undefined })} className={`flex justify-between rounded-xl px-3 py-2.5 text-[15px] ${!dong ? "bg-white/10 font-semibold text-straw-300" : "hover:bg-white/5"}`}>Tất cả <span className="text-white/60">{all.length}</span></Link></li>
              {lines.map((l) => (
                <li key={l}><Link href={href({ dong: l })} className={`flex justify-between rounded-xl px-3 py-2.5 text-[15px] ${dong === l ? "bg-white/10 font-semibold text-straw-300" : "hover:bg-white/5"}`}>{l} <span className="text-white/60">{all.filter((p) => p.line === l).length}</span></Link></li>
              ))}
            </ul>
          </div>
          <div className="rounded-[22px] bg-straw-100 p-5 text-[15px] text-soil-900">
            <p className="font-display text-lg font-bold">Cần số lượng lớn?</p>
            <p className="mt-1 text-soil-700">Giá tham khảo cho đơn sỉ, chưa gồm VAT. Gửi yêu cầu để nhận báo giá theo số lượng.</p>
            <Link href="/bao-gia" className="btn-primary mt-4 !py-2.5 text-sm">Nhận báo giá</Link>
          </div>
        </aside>
        <section>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-ink-soft">{q ? <>Kết quả cho “<b className="text-ink">{q}</b>”: </> : null}{list.length} sản phẩm</p>
            <div className="flex flex-wrap gap-2" aria-label="Sắp xếp">
              {SORTS.map(([v, t]) => <Link key={v} href={href({ sx: v || undefined })} className={`rounded-full px-4 py-2 text-sm font-semibold ${(sx ?? "") === v ? "bg-leaf-700 text-white" : "bg-mist text-ink hover:bg-leaf-100"}`}>{t}</Link>)}
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-6 xl:grid-cols-3">
            {list.map((p, i) => <ProductCard key={p.id} p={p} priority={i < 3} />)}
          </div>
          {list.length === 0 && <p className="mt-12 rounded-3xl bg-mist p-10 text-center text-ink-soft">Không tìm thấy sản phẩm phù hợp. <Link href="/san-pham" className="font-semibold text-leaf-700 underline">Xem tất cả</Link></p>}
        </section>
      </main>
    </>
  );
}
