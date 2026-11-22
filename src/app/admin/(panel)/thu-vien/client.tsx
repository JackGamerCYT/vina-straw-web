"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Copy, ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { compressImage } from "@/components/image-picker";
import { deleteMediaAction, uploadMediaAction } from "@/lib/shop-actions";

type M = { id: number; url: string; name: string; size: number };
export function MediaGrid({ items }: { items: M[] }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState("");
  const [, start] = useTransition();
  const router = useRouter();
  async function upload(list: FileList | null) {
    if (!list) return;
    const files = Array.from(list).filter((f) => f.type.startsWith("image/"));
    for (let i = 0; i < files.length; i++) {
      setBusy(`Đang tải ${i + 1}/${files.length}…`);
      const f = new FormData(); f.set("file", await compressImage(files[i], 2000, 0.84));
      const r = await uploadMediaAction(f).catch(() => ({ error: "Lỗi kết nối" } as { error?: string }));
      if (r.error) toast.error(`${files[i].name}: ${r.error}`);
    }
    setBusy(""); if (input.current) input.current.value = "";
    toast.success("Đã tải ảnh lên"); router.refresh();
  }
  const copy = (u: string) => { navigator.clipboard.writeText(u.startsWith("/") ? location.origin + u : u); toast.success("Đã chép đường dẫn ảnh"); };
  const remove = (id: number) => {
    if (!window.confirm("Xoá ảnh này khỏi thư viện? Chỗ nào đang dùng ảnh sẽ mất ảnh.")) return;
    const f = new FormData(); f.set("id", String(id));
    start(async () => { await deleteMediaAction(f); toast.success("Đã xoá"); router.refresh(); });
  };
  return (
    <div className="mt-6">
      <button type="button" disabled={!!busy} onClick={() => input.current?.click()} className="btn-primary"><ImagePlus className="h-4 w-4" /> {busy || "Tải ảnh lên"}</button>
      <input ref={input} type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {items.map((m) => (
          <figure key={m.id} className="panel overflow-hidden">
            <div className="relative aspect-square bg-mist"><Image src={m.url} alt={m.name} fill sizes="240px" className="object-cover" unoptimized={m.url.startsWith("data:")} /></div>
            <figcaption className="space-y-2 p-3">
              <p className="truncate text-xs text-ink-soft" title={m.name}>{m.name} · {Math.round(m.size / 1024)} KB</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => copy(m.url)} className="flex flex-1 items-center justify-center gap-1 rounded-full border border-ink/15 py-1.5 text-xs font-semibold hover:bg-mist"><Copy className="h-3.5 w-3.5" /> Chép link</button>
                <button type="button" onClick={() => remove(m.id)} className="grid w-9 place-items-center rounded-full border border-ink/15 text-red-600 hover:bg-red-50" aria-label="Xoá ảnh"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
      {items.length === 0 && <p className="mt-6 rounded-2xl bg-white p-10 text-center text-ink-soft">Chưa có ảnh nào.</p>}
    </div>
  );
}
