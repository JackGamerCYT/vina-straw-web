import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { getPost } from "@/lib/db";
import { deletePostAction } from "@/lib/site-actions";
import { ConfirmButton } from "@/components/confirm-button";
import { PostEditor } from "./editor";

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = id === "moi" ? null : await getPost(Number(id));
  if (id !== "moi" && !p) notFound();
  return (
    <>
      <Link href="/admin/tin-tuc" className="flex items-center gap-1.5 text-sm font-semibold text-leaf-700"><ArrowLeft className="h-4 w-4" /> Tất cả bài viết</Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl font-bold text-leaf-900">{p ? "Sửa bài viết" : "Viết bài mới"}</h1>
        {p && <Link href={`/tin-tuc/${p.slug}`} target="_blank" className="btn-ghost !py-2 text-sm"><ExternalLink className="h-4 w-4" /> Xem trên web</Link>}
      </div>
      <PostEditor key={p?.updatedAt ?? "new"} p={p} />
      {p && <form action={deletePostAction} className="mt-6"><input type="hidden" name="id" value={p.id} /><ConfirmButton message="Xoá vĩnh viễn bài viết này?"><Trash2 className="h-4 w-4" /> Xoá bài</ConfirmButton></form>}
    </>
  );
}
