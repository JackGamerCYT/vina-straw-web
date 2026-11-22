"use client";
import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useTransition, type ElementType } from "react";
import { Check, ImagePlus, Pencil, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { saveContentAction, uploadSiteImageAction } from "@/lib/content-actions";
import { compressImage } from "./image-picker";

type Ctx = {
  admin: boolean;
  editing: boolean;
  texts: Record<string, string>;
  media: Record<string, string>;
  setText: (k: string, v: string) => void;
  setMedia: (k: string, v: string) => void;
};
const EditCtx = createContext<Ctx>({ admin: false, editing: false, texts: {}, media: {}, setText: () => {}, setMedia: () => {} });

/**
 * Bọc toàn bộ trang công khai. Khách thường chỉ nhận chữ/ảnh đã lưu.
 * Người quản trị có thêm thanh công cụ để bật "Sửa trực tiếp".
 */
export function EditProvider({ admin, texts, media, children }: { admin: boolean; texts: Record<string, string>; media: Record<string, string>; children: React.ReactNode }) {
  const [editing, setEditing] = useState(false);
  const [pt, setPt] = useState<Record<string, string>>({});
  const [pm, setPm] = useState<Record<string, string>>({});
  const [saving, start] = useTransition();
  const router = useRouter();
  const dirty = Object.keys(pt).length + Object.keys(pm).length;

  useEffect(() => {
    try { if (admin && sessionStorage.getItem("vs-edit") === "1") setEditing(true); } catch {}
  }, [admin]);
  useEffect(() => {
    try { sessionStorage.setItem("vs-edit", editing ? "1" : "0"); } catch {}
    document.documentElement.toggleAttribute("data-editing", editing);
    if (!editing) return;
    // Đang sửa thì bấm vào link không chuyển trang (tránh mất chữ chưa lưu).
    const block = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("[data-edit-bar]") || t.closest("[data-edit-ui]")) return;
      if (t.closest("a")) e.preventDefault();
    };
    document.addEventListener("click", block, true);
    return () => document.removeEventListener("click", block, true);
  }, [editing]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const setText = useCallback((k: string, v: string) => setPt((p) => ({ ...p, [k]: v })), []);
  const setMedia = useCallback((k: string, v: string) => setPm((p) => ({ ...p, [k]: v })), []);
  const value = useMemo<Ctx>(() => ({
    admin, editing, texts: { ...texts, ...pt }, media: { ...media, ...pm }, setText, setMedia,
  }), [admin, editing, texts, media, pt, pm, setText, setMedia]);

  const save = () => start(async () => {
    try {
      const r = await saveContentAction({ texts: pt, media: pm });
      toast.success(`Đã lưu ${r.n} chỗ thay đổi`);
      setPt({}); setPm({});
      router.refresh();
    } catch {
      toast.error("Chưa lưu được. Có thể phiên đăng nhập đã hết, hãy đăng nhập lại.");
    }
  });
  const cancel = () => {
    if (dirty && !window.confirm("Bỏ các thay đổi chưa lưu?")) return;
    setPt({}); setPm({}); setEditing(false);
    router.refresh();
  };

  return (
    <EditCtx.Provider value={value}>
      {children}
      {admin && (
        <div data-edit-bar className="fixed bottom-4 left-1/2 z-[70] flex max-w-[calc(100vw-1rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-full bg-ink p-1.5 text-sm text-white shadow-2xl">
          {!editing ? (
            <>
              <span className="hidden px-3 text-white/60 sm:inline">Quản trị</span>
              <Link href="/admin" className="whitespace-nowrap rounded-full px-3 py-1.5 hover:bg-white/10">Quản trị</Link>
              <Link href="/admin/don-hang" className="whitespace-nowrap rounded-full px-3 py-1.5 hover:bg-white/10">Đơn hàng</Link>
              <Link href="/admin/san-pham" className="whitespace-nowrap rounded-full px-3 py-1.5 hover:bg-white/10">Sản phẩm</Link>
              <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-straw-500 px-3.5 py-1.5 font-semibold text-soil-900 hover:bg-straw-300"><Pencil className="h-3.5 w-3.5" /> Sửa trực tiếp</button>
            </>
          ) : (
            <>
              <span className="whitespace-nowrap px-3 text-white/80">{dirty ? `${dirty} chỗ chưa lưu` : "Bấm vào chữ hoặc ảnh để sửa"}</span>
              <button onClick={cancel} className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 hover:bg-white/10"><X className="h-3.5 w-3.5" /> {dirty ? "Huỷ" : "Xong"}</button>
              <button onClick={save} disabled={!dirty || saving} className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-sprout px-3.5 py-1.5 font-semibold text-white disabled:opacity-40"><Check className="h-3.5 w-3.5" /> {saving ? "Đang lưu…" : "Lưu"}</button>
            </>
          )}
        </div>
      )}
    </EditCtx.Provider>
  );
}

export const useEdit = () => useContext(EditCtx);

/** Chữ sửa được tại chỗ. children là nội dung mặc định. */
export function T({ k, children, as, className = "", multiline = false }: { k: string; children: string; as?: ElementType; className?: string; multiline?: boolean }) {
  const { editing, texts, setText } = useEdit();
  const Tag = as ?? "span";
  const value = texts[k] ?? children;
  const ref = useRef<HTMLElement>(null);
  // Lúc sửa, chữ do trình duyệt giữ (React không render con) để không đụng nhau với thao tác gõ.
  useEffect(() => { if (ref.current && ref.current.innerText !== value) ref.current.innerText = value; }, [value, editing]);
  if (!editing) return <Tag className={`${className} ${multiline ? "whitespace-pre-line" : ""}`}>{value}</Tag>;
  return (
    <Tag
      ref={ref}
      data-edit-ui
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      spellCheck={false}
      className={`${className} ${multiline ? "whitespace-pre-line" : ""} cursor-text rounded-md outline-2 outline-offset-4 outline-dashed outline-straw-500/70 hover:outline-straw-500 focus:outline-solid focus:outline-sprout`}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !multiline) { e.preventDefault(); (e.currentTarget as HTMLElement).blur(); }
        if (e.key === "Escape") { (e.currentTarget as HTMLElement).innerText = value; (e.currentTarget as HTMLElement).blur(); }
      }}
      onPaste={(e: React.ClipboardEvent) => {
        e.preventDefault();
        const t = e.clipboardData.getData("text/plain");
        document.execCommand("insertText", false, multiline ? t : t.replace(/\s*\n\s*/g, " "));
      }}
      onBlur={(e: React.FocusEvent) => {
        const v = (e.currentTarget as HTMLElement).innerText.replace(/\n{3,}/g, "\n\n").trim();
        if (v !== value) setText(k, v || children);
      }}
    />
  );
}

/** Ảnh đổi được tại chỗ (dùng kiểu `fill`, khung cha cần `relative`). */
export function EImg({ k, src, alt, ...rest }: Omit<ImageProps, "src"> & { k: string; src: string }) {
  const { editing, media, setMedia } = useEdit();
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const url = media[k] || src;
  async function pick(f: File | undefined) {
    if (!f) return;
    setBusy(true);
    const fd = new FormData();
    fd.set("file", await compressImage(f, 2000, 0.84));
    const r = await uploadSiteImageAction(fd).catch(() => ({ error: "Không tải ảnh lên được" } as { url?: string; error?: string }));
    setBusy(false);
    if (input.current) input.current.value = "";
    if (r.url) { setMedia(k, r.url); toast.success("Đã thay ảnh, bấm Lưu để áp dụng"); } else toast.error(r.error ?? "Lỗi tải ảnh");
  }
  return (
    <>
      <Image src={url} alt={alt} unoptimized={url.startsWith("data:")} {...rest} />
      {editing && (
        <div data-edit-ui className="absolute inset-0 z-10 flex items-end justify-end gap-2 p-3 outline-2 -outline-offset-2 outline-dashed outline-straw-500/80">
          {media[k] && media[k] !== src && (
            <button type="button" onClick={() => setMedia(k, "")} className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-sm font-semibold text-ink shadow" title="Dùng lại ảnh gốc"><RotateCcw className="h-4 w-4" /></button>
          )}
          <button type="button" disabled={busy} onClick={() => input.current?.click()} className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-sm font-semibold text-ink shadow">
            <ImagePlus className="h-4 w-4" /> {busy ? "Đang tải…" : "Đổi ảnh"}
          </button>
          <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
        </div>
      )}
    </>
  );
}
