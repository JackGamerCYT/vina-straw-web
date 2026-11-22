import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Pencil } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { ProductCard } from "@/components/product-card";
import { Viewer3D, SHAPES } from "@/components/viewer3d";
import { getProductBySlug, listProducts } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { priceText } from "@/lib/format";
import { Gallery } from "./gallery";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getProductBySlug((await params).slug);
  return p ? { title: p.name, description: p.short, openGraph: { images: p.images[0]?.startsWith("/") ? [p.images[0]] : [] } } : {};
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [p, all, admin] = await Promise.all([getProductBySlug(slug), listProducts(), isAdmin()]);
  if (!p || (!p.active && !admin)) notFound();
  const related = all.filter((x) => x.id !== p.id && x.line === p.line).concat(all.filter((x) => x.line !== p.line)).slice(0, 3);
  const shape = SHAPES[p.slug];

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[1240px] px-5 pb-24 pt-28 lg:px-8">
        <Link href="/san-pham" className="inline-flex items-center gap-1.5 text-sm font-semibold text-leaf-700 hover:text-leaf-900"><ArrowLeft className="h-4 w-4" /> Tất cả sản phẩm</Link>
        <div className="mt-6 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-4">
            <Gallery images={p.images} name={p.name} />
            {shape && <Viewer3D shape={shape} />}
          </div>
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-semibold text-straw-600">{p.line}</p>
            <h1 className="font-display mt-2 text-4xl font-bold leading-tight tracking-tight text-leaf-900 sm:text-5xl">{p.name}</h1>
            <p className="mt-4 text-lg text-ink-soft">{p.short}</p>
            <div className="mt-8 flex items-end gap-3 border-y border-ink/10 py-6">
              <span className="font-display text-4xl font-bold text-leaf-700">{priceText(p.price)}</span>
              <span className="pb-1 text-ink-soft">{p.price > 0 ? `/ ${p.unit} · ` : "giá theo số lượng · "}tối thiểu {p.moq.toLocaleString("vi-VN")} {p.unit}</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/bao-gia?sp=${p.id}`} className="btn-primary group !px-7 !py-4 text-base">Nhận báo giá sản phẩm này <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></Link>
              <Link href={`/bao-gia?sp=${p.id}&loai=mau`} className="btn-ghost !px-7 !py-4 text-base">Đặt mẫu thử</Link>
              {admin && <Link href={`/admin/san-pham/${p.id}`} className="btn-straw !py-4"><Pencil className="h-4 w-4" /> Sửa sản phẩm, ảnh</Link>}
            </div>
            {p.specs.length > 0 && (
              <dl className="mt-10 divide-y divide-ink/10 rounded-3xl bg-mist px-6">
                {p.specs.map((s) => (
                  <div key={s.k} className="flex justify-between gap-6 py-3.5 text-[15px]">
                    <dt className="text-ink-soft">{s.k}</dt><dd className="text-right font-semibold text-ink">{s.v}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="mt-10 max-w-[62ch] space-y-4 whitespace-pre-line text-[17px] leading-relaxed text-ink">{p.description}</div>
          </div>
        </div>

        <section className="mt-28">
          <h2 className="font-display text-3xl font-bold text-leaf-900">Sản phẩm khác</h2>
          <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => <ProductCard key={r.id} p={r} />)}
          </div>
        </section>
      </main>
    </>
  );
}
