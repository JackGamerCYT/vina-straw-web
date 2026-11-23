"use client";
import Image from "next/image";
import { useActionState, useRef, useState } from "react";
import { ImagePlus, Save } from "lucide-react";
import { toast } from "sonner";
import { KeepForm, usePending } from "@/components/keep-form";
import { compressImage } from "@/components/image-picker";
import { savePostAction, type SiteState } from "@/lib/site-actions";
import type { Post } from "@/lib/types";

function Btn() {
  const pending = usePending();
  return <button disabled={pending} className="btn-primary !px-8"><Save className="h-4 w-4" />{pending ? "Đang lưu…" : "Lưu bài viết"}</button>;
}
export function PostEditor({ p }: { p: Post | null }) {
  const [preview, setPreview] = useState(p?.cover ?? "");
  const real = useRef<HTMLInputElement>(null);
  const [s, action] = useActionState<SiteState, FormData>(async (st, f) => {
    const r = await savePostAction(st, f);
    if (r?.ok) toast.success(r.message ?? "Đã lưu");
    if (r?.error) toast.error(r.error);
    return r;
  }, undefined);
  async function pick(file?: File) {
    if (!file) return;
    const c = await compressImage(file, 1800, 0.84);
    const dt = new DataTransfer(); dt.items.add(c);
    if (real.current) real.current.files = dt.files;
    setPreview(URL.createObjectURL(c));
  }
  return (
    <KeepForm action={action} className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
      {p && <input type="hidden" name="id" value={p.id} />}
      <input type="hidden" name="coverKeep" value={p?.cover ?? ""} />
      <section className="panel space-y-5 p-6">
        <div><label className="label" htmlFor="title">Tiêu đề *</label><input id="title" name="title" required defaultValue={p?.title} className="field font-display text-xl" /></div>
        <div><label className="label" htmlFor="excerpt">Tóm tắt (hiện ở danh sách tin)</label><textarea id="excerpt" name="excerpt" rows={2} defaultValue={p?.excerpt} className="field" /></div>
        <div>
          <label className="label" htmlFor="body">Nội dung</label>
          <textarea id="body" name="body" rows={18} defaultValue={p?.body} className="field font-mono text-[15px] leading-relaxed" />
          <p className="mt-1.5 text-xs text-ink-soft">Cách một dòng trống để tách đoạn. Dòng bắt đầu bằng “## ” là tiêu đề nhỏ, “- ” là gạch đầu dòng.</p>
        </div>
      </section>
      <aside className="space-y-6">
        <section className="panel space-y-4 p-6">
          <p className="font-display text-lg font-bold">Ảnh bìa</p>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-mist">{preview && <Image src={preview} alt="" fill sizes="300px" className="object-cover" unoptimized />}</div>
          <label className="btn-ghost w-full cursor-pointer !py-2.5 text-sm"><ImagePlus className="h-4 w-4" /> Chọn ảnh<input type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} /></label>
          <input ref={real} type="file" name="cover" className="hidden" tabIndex={-1} aria-hidden />
        </section>
        <section className="panel space-y-4 p-6">
          <div><label className="label" htmlFor="slug">Đường dẫn</label><input id="slug" name="slug" defaultValue={p?.slug} placeholder="tự tạo từ tiêu đề" className="field" /></div>
          <label className="flex items-center gap-3 font-medium"><input type="checkbox" name="published" defaultChecked={p ? p.published : true} className="h-5 w-5 accent-leaf-700" /> Hiện trên web</label>
          {s?.error && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{s.error}</p>}
          <Btn />
        </section>
      </aside>
    </KeepForm>
  );
}
