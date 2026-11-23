import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { PageBanner } from "@/components/page-banner";
import { PostBody } from "@/components/post-body";
import { isAdmin } from "@/lib/auth";
import { getPost, listPosts } from "@/lib/db";
import { fmtDay } from "@/lib/format";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getPost(decodeURIComponent((await params).slug));
  return p ? { title: p.title, description: p.excerpt, openGraph: p.cover && !p.cover.startsWith("data:") ? { images: [p.cover] } : undefined } : {};
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = decodeURIComponent((await params).slug);
  const [p, others, admin] = await Promise.all([getPost(slug), listPosts({ limit: 4 }), isAdmin()]);
  if (!p || (!p.published && !admin)) notFound();
  return (
    <>
      <Navbar />
      <PageBanner heading={false} title="Tin tức" crumbs={[["Tin tức", "/tin-tuc"], [p.title.length > 40 ? p.title.slice(0, 40) + "…" : p.title]]} img={p.cover && !p.cover.startsWith("data:") ? p.cover : "/img/field-burnt.webp"} />
      <main className="mx-auto grid max-w-[1320px] gap-14 px-5 py-16 lg:grid-cols-[1fr_340px] lg:px-8">
        <article className="min-w-0">
          {!p.published && <p className="mb-6 rounded-2xl bg-straw-100 p-4 text-sm font-semibold text-soil-900">Bài đang ẩn, chỉ quản trị viên thấy.</p>}
          <p className="flex items-center gap-2 text-sm font-semibold text-sprout"><CalendarDays className="h-4 w-4" /> {fmtDay(p.createdAt)}</p>
          <h1 className="font-display mt-3 text-4xl font-bold leading-tight tracking-tight text-leaf-900 sm:text-5xl">{p.title}</h1>
          {p.excerpt && <p className="mt-5 text-xl leading-relaxed text-ink-soft">{p.excerpt}</p>}
          {p.cover && <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-[28px] bg-mist"><Image src={p.cover} alt="" fill sizes="(min-width:1024px) 860px, 100vw" className="object-cover" unoptimized={p.cover.startsWith("data:")} /></div>}
          <div className="mt-10"><PostBody body={p.body} /></div>
          {admin && <Link href={`/admin/tin-tuc/${p.id}`} className="btn-ghost mt-10">Sửa bài này</Link>}
        </article>
        <aside className="space-y-6 lg:sticky lg:top-32 lg:self-start">
          <div className="rounded-[24px] border border-ink/10 p-6">
            <p className="font-display text-lg font-bold">Bài viết khác</p>
            <ul className="mt-4 space-y-4">
              {others.filter((o) => o.id !== p.id).slice(0, 3).map((o) => (
                <li key={o.id}>
                  <Link href={`/tin-tuc/${o.slug}`} className="group flex gap-3">
                    <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-mist">{o.cover && <Image src={o.cover} alt="" fill sizes="80px" className="object-cover" unoptimized={o.cover.startsWith("data:")} />}</span>
                    <span><span className="block text-xs text-ink-soft">{fmtDay(o.createdAt)}</span><span className="line-clamp-2 font-semibold group-hover:text-leaf-700">{o.title}</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[24px] bg-leaf-700 p-6 text-white">
            <p className="font-display text-xl font-bold">Cần bao bì từ rơm?</p>
            <p className="mt-2 text-white/80">Gửi yêu cầu, chúng tôi báo giá trong 1–2 ngày làm việc.</p>
            <Link href="/bao-gia" className="mt-5 inline-flex rounded-full bg-straw-500 px-6 py-3 font-semibold text-soil-900">Nhận báo giá</Link>
          </div>
        </aside>
      </main>
    </>
  );
}
