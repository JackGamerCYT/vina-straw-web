import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { PageBanner } from "@/components/page-banner";
import { listPosts } from "@/lib/db";
import { dayParts } from "@/lib/format";

export const revalidate = 60;
export const metadata = { title: "Tin tức" };

export default async function News() {
  const posts = await listPosts();
  return (
    <>
      <Navbar />
      <PageBanner title="Tin tức" crumbs={[["Tin tức"]]} img="/img/field-burnt.webp" />
      <main className="mx-auto max-w-[1320px] px-5 py-16 lg:px-8">
        <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => {
            const d = dayParts(p.createdAt);
            return (
              <Link key={p.id} href={`/tin-tuc/${p.slug}`} className="group block">
                <div className="relative">
                  <div className="zoom-frame relative aspect-[4/3] overflow-hidden rounded-[24px] bg-mist">{p.cover && <Image src={p.cover} alt="" fill sizes="(min-width:1024px) 420px, 100vw" className="object-cover" unoptimized={p.cover.startsWith("data:")} />}</div>
                  <span className="absolute bottom-0 left-6 grid h-16 w-16 translate-y-1/2 place-items-center rounded-full bg-straw-500 text-center font-display font-bold leading-none text-soil-900 shadow-lg"><span>{d.d}<span className="block text-xs font-semibold">{d.m}</span></span></span>
                </div>
                <div className="px-1 pt-12">
                  <h2 className="font-display line-clamp-2 text-xl font-bold text-ink group-hover:text-leaf-700">{p.title}</h2>
                  <p className="mt-2 line-clamp-3 text-ink-soft">{p.excerpt}</p>
                  <p className="mt-4 flex items-center gap-1 font-semibold text-leaf-700">Đọc tiếp <ArrowUpRight className="h-4 w-4" /></p>
                </div>
              </Link>
            );
          })}
        </div>
        {posts.length === 0 && <p className="rounded-3xl bg-mist p-10 text-center text-ink-soft">Chưa có bài viết.</p>}
      </main>
    </>
  );
}
