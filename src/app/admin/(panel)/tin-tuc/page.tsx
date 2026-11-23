import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { listPosts } from "@/lib/db";
import { fmtDay } from "@/lib/format";

export default async function AdminPosts() {
  const posts = await listPosts({ all: true });
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl font-bold text-leaf-900">Tin tức</h1>
        <Link href="/admin/tin-tuc/moi" className="btn-primary"><Plus className="h-4 w-4" /> Viết bài mới</Link>
      </div>
      <div className="panel mt-6 divide-y divide-ink/10 overflow-hidden">
        {posts.map((p) => (
          <Link key={p.id} href={`/admin/tin-tuc/${p.id}`} className="flex items-center gap-4 p-4 hover:bg-mist">
            <span className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-mist">{p.cover && <Image src={p.cover} alt="" fill sizes="96px" className="object-cover" unoptimized={p.cover.startsWith("data:")} />}</span>
            <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{p.title}</span><span className="text-sm text-ink-soft">{fmtDay(p.createdAt)} · /tin-tuc/{p.slug}</span></span>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${p.published ? "bg-leaf-100 text-leaf-800" : "bg-straw-100 text-soil-900"}`}>{p.published ? "Đang hiện" : "Đang ẩn"}</span>
          </Link>
        ))}
        {posts.length === 0 && <p className="p-10 text-center text-ink-soft">Chưa có bài viết.</p>}
      </div>
    </>
  );
}
