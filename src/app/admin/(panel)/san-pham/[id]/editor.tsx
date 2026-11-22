"use client";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { ImagePicker } from "@/components/image-picker";
import { deleteProductAction, saveProductAction, type FormState } from "@/lib/actions";
import type { Product } from "@/lib/types";

function SaveBtn() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="btn-primary !px-8"><Save className="h-4 w-4" />{pending ? "Đang lưu…" : "Lưu sản phẩm"}</button>;
}

export function ProductEditor({ p }: { p: Product | null }) {
  const [state, action] = useActionState<FormState, FormData>(async (s, f) => {
    const r = await saveProductAction(s, f);
    if (r?.ok) toast.success("Đã lưu. Trang web cập nhật ngay.");
    if (r?.error) toast.error(r.error);
    return r;
  }, undefined);
  const [specs, setSpecs] = useState(p?.specs.length ? p.specs : [{ k: "", v: "" }]);
  void state;

  return (
    <>
      <form action={action} key={p?.images.join("|")} className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
        {p && <input type="hidden" name="id" value={p.id} />}
        <div className="space-y-6">
          <section className="panel space-y-5 p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2"><label className="label">Tên sản phẩm *</label><input name="name" required defaultValue={p?.name} className="field" /></div>
              <div><label className="label">Dòng sản phẩm</label><input name="line" defaultValue={p?.line ?? "RơmDish"} className="field" list="lines" />
                <datalist id="lines">{["RơmDish", "RơmFlex-Pack", "RơmCell-Cushion", "RơmBioFilm", "RơmTherm-Mineral", "VinaPack"].map((l) => <option key={l} value={l} />)}</datalist></div>
              <div><label className="label">Đường dẫn (slug)</label><input name="slug" defaultValue={p?.slug} className="field" placeholder="tự tạo từ tên" /></div>
              <div className="sm:col-span-2"><label className="label">Mô tả ngắn</label><input name="short" defaultValue={p?.short} className="field" maxLength={300} /></div>
              <div className="sm:col-span-2"><label className="label">Mô tả chi tiết</label><textarea name="description" rows={8} defaultValue={p?.description} className="field" /></div>
            </div>
          </section>
          <section className="panel p-6">
            <h2 className="font-display text-xl font-bold text-ink">Thông số</h2>
            <div className="mt-4 space-y-2">
              {specs.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input name="spec_k" defaultValue={s.k} className="field" placeholder="Tên thông số" />
                  <input name="spec_v" defaultValue={s.v} className="field" placeholder="Giá trị" />
                  <button type="button" onClick={() => setSpecs(specs.filter((_, k) => k !== i))} className="grid w-12 shrink-0 place-items-center rounded-2xl border border-ink/15 text-red-600 hover:bg-red-50" aria-label="Xoá dòng"><X className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setSpecs([...specs, { k: "", v: "" }])} className="btn-ghost mt-3 !py-2 text-sm"><Plus className="h-4 w-4" /> Thêm thông số</button>
          </section>
          <section className="panel p-6">
            <h2 className="font-display text-xl font-bold text-ink">Ảnh sản phẩm</h2>
            <p className="mb-4 mt-1 text-sm text-ink-soft">Ảnh đầu tiên là ảnh chính. Dùng mũi tên để đổi thứ tự, dấu × để xoá. Bấm Lưu để áp dụng.</p>
            <ImagePicker existing={p?.images ?? []} max={10} label="Tải ảnh lên" />
          </section>
        </div>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="panel space-y-5 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Giá (₫)</label><input name="price" type="number" min={0} defaultValue={p?.price ?? 0} className="field" /></div>
              <div><label className="label">Đơn vị</label><input name="unit" defaultValue={p?.unit ?? "cái"} className="field" /></div>
              <div><label className="label">SL tối thiểu</label><input name="moq" type="number" min={1} defaultValue={p?.moq ?? 100} className="field" /></div>
              <div><label className="label">Thứ tự</label><input name="sort" type="number" defaultValue={p?.sort ?? 10} className="field" /></div>
            </div>
            <label className="flex items-center gap-3 font-medium"><input type="checkbox" name="active" defaultChecked={p?.active ?? true} className="h-5 w-5 accent-leaf-700" /> Hiện trên web</label>
            <label className="flex items-center gap-3 font-medium"><input type="checkbox" name="featured" defaultChecked={p?.featured ?? false} className="h-5 w-5 accent-leaf-700" /> Nổi bật ở trang chủ</label>
            <SaveBtn />
          </section>
        </aside>
      </form>
      {p && (
        <form action={deleteProductAction} className="mt-10" onSubmit={(e) => { if (!confirm(`Xoá sản phẩm “${p.name}”?`)) e.preventDefault(); }}>
          <input type="hidden" name="id" value={p.id} />
          <button className="btn-danger !py-2 text-sm"><Trash2 className="h-4 w-4" /> Xoá sản phẩm</button>
        </form>
      )}
    </>
  );
}
