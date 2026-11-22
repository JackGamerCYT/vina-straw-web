import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { ProductCard } from "@/components/product-card";
import { listProducts } from "@/lib/db";

export const revalidate = 60;
export const metadata = { title: "Sản phẩm" };

export default async function Products({ searchParams }: { searchParams: Promise<{ dong?: string }> }) {
  const { dong } = await searchParams;
  const all = await listProducts();
  const lines = [...new Set(all.map((p) => p.line))];
  const list = dong ? all.filter((p) => p.line === dong) : all;
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[1240px] px-5 pb-24 pt-32 lg:px-8">
        <h1 className="font-display text-5xl font-bold tracking-tight text-leaf-900 sm:text-6xl">Sản phẩm</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-soft">Giá tham khảo cho đơn sỉ, chưa gồm VAT và vận chuyển. Số lượng tối thiểu ghi trong từng sản phẩm; đơn mẫu thử được báo giá riêng.</p>
        <nav className="mt-10 flex flex-wrap gap-2" aria-label="Lọc theo dòng sản phẩm">
          <Link href="/san-pham" className={`rounded-full px-4 py-2 text-sm font-semibold transition ${!dong ? "bg-leaf-700 text-white" : "bg-mist text-leaf-800 hover:bg-leaf-100"}`}>Tất cả</Link>
          {lines.map((l) => (
            <Link key={l} href={`/san-pham?dong=${encodeURIComponent(l)}`} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${dong === l ? "bg-leaf-700 text-white" : "bg-mist text-leaf-800 hover:bg-leaf-100"}`}>{l}</Link>
          ))}
        </nav>
        <div className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p, i) => <ProductCard key={p.id} p={p} priority={i < 3} />)}
        </div>
        {list.length === 0 && <p className="mt-12 text-ink-soft">Chưa có sản phẩm trong dòng này. <Link href="/san-pham" className="font-semibold text-leaf-700 underline">Xem tất cả</Link></p>}
      </main>
    </>
  );
}
