"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, X, ArrowLeft, ArrowRight } from "lucide-react";

/** Nén ảnh ở trình duyệt (cạnh dài ≤ max px, WebP) trước khi gửi để tải lên nhanh. */
export async function compressImage(file: File, max = 1600, quality = 0.82): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") return file;
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    const blob: Blob | null = await new Promise((r) => c.toBlob(r, "image/webp", quality));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" });
  } catch { return file; }
}

/**
 * Chọn / xoá / sắp xếp ảnh (cả ảnh cũ lẫn ảnh vừa chọn).
 * - Ảnh đã có: input hidden `keep`.
 * - Ảnh mới: nén rồi gắn vào input file `name` qua DataTransfer.
 * - `order`: thứ tự hiển thị, ảnh cũ ghi URL, ảnh mới ghi `new:<vị trí trong input file>`.
 */
type Item = { key: string; url: string; file?: File };
export function ImagePicker({ name = "images", existing = [], max = 6, label = "Thêm ảnh" }: { name?: string; existing?: string[]; max?: number; label?: string }) {
  const [items, setItems] = useState<Item[]>(existing.map((u) => ({ key: u, url: u })));
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const realInput = useRef<HTMLInputElement>(null);
  const added = items.filter((x) => x.file);

  useEffect(() => {
    const dt = new DataTransfer();
    added.forEach((a) => dt.items.add(a.file!));
    if (realInput.current) realInput.current.files = dt.files;
  }, [items]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => items.forEach((a) => a.file && URL.revokeObjectURL(a.url)), []); // eslint-disable-line react-hooks/exhaustive-deps

  const room = max - items.length;
  async function onPick(list: FileList | null) {
    if (!list) return;
    setBusy(true);
    const picked = Array.from(list).filter((f) => f.type.startsWith("image/")).slice(0, Math.max(0, room));
    const out: Item[] = [];
    for (const f of picked) { const c = await compressImage(f); const url = URL.createObjectURL(c); out.push({ key: url, url, file: c }); }
    setItems((a) => [...a, ...out]);
    setBusy(false);
    if (fileInput.current) fileInput.current.value = "";
  }
  const move = (i: number, d: number) => setItems((k) => { const n = [...k]; const j = i + d; if (j < 0 || j >= n.length) return n; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const order = items.map((x) => (x.file ? `new:${added.indexOf(x)}` : x.url)).join("|");

  return (
    <div>
      {items.filter((x) => !x.file).map((x) => <input key={x.key} type="hidden" name="keep" value={x.url} />)}
      <input type="hidden" name="order" value={order} />
      <input ref={realInput} type="file" name={name} multiple className="hidden" tabIndex={-1} aria-hidden />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {items.map((x, i) => (
          <figure key={x.key} className={`group relative aspect-square overflow-hidden rounded-2xl bg-mist ${x.file ? "border-2 border-dashed border-sprout" : "border border-ink/10"}`}>
            {x.file
              ? <img src={x.url} alt="" className="h-full w-full object-contain p-1" /> // eslint-disable-line @next/next/no-img-element
              : <Image src={x.url} alt="" fill sizes="160px" className="object-contain p-1" unoptimized={x.url.startsWith("data:")} />}
            {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-leaf-700 px-2 py-0.5 text-[11px] font-semibold text-white">Ảnh chính</span>}
            {x.file && i !== 0 && <span className="absolute left-2 top-2 rounded-full bg-sprout px-2 py-0.5 text-[11px] font-semibold text-white">Mới</span>}
            <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
              <button type="button" onClick={() => move(i, -1)} className="grid h-7 w-7 place-items-center rounded-full bg-white/95 shadow" aria-label="Đưa lên trước"><ArrowLeft className="h-3.5 w-3.5" /></button>
              {i !== 0 && <button type="button" onClick={() => setItems((k) => [k[i], ...k.filter((_, j) => j !== i)])} className="rounded-full bg-white/95 px-2 text-[11px] font-semibold shadow">Làm ảnh chính</button>}
              <button type="button" onClick={() => move(i, 1)} className="grid h-7 w-7 place-items-center rounded-full bg-white/95 shadow" aria-label="Đưa ra sau"><ArrowRight className="h-3.5 w-3.5" /></button>
            </div>
            <button type="button" onClick={() => setItems((k) => k.filter((y) => y.key !== x.key))} className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-white/95 text-red-600 shadow" aria-label="Xoá ảnh"><X className="h-4 w-4" /></button>
          </figure>
        ))}
        {room > 0 && (
          <button type="button" onClick={() => fileInput.current?.click()} disabled={busy}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-ink/15 text-sm font-semibold text-leaf-700 transition hover:border-leaf-500 hover:bg-mist">
            <ImagePlus className="h-6 w-6" /> {busy ? "Đang nén…" : label}
          </button>
        )}
      </div>
      <input ref={fileInput} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onPick(e.target.files)} />
      <p className="mt-2 text-xs text-ink-soft">Tối đa {max} ảnh. Ảnh được nén tự động trước khi gửi.</p>
    </div>
  );
}
