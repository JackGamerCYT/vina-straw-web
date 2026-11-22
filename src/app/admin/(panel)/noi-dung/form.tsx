"use client";
import Image from "next/image";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { saveSettingsAction, type FormState } from "@/lib/actions";
import { compressImage } from "@/components/image-picker";
import type { Settings } from "@/lib/types";

function Btn() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="btn-primary !px-8"><Save className="h-4 w-4" />{pending ? "Đang lưu…" : "Lưu nội dung"}</button>;
}

export function SettingsForm({ s }: { s: Settings }) {
  const [, action] = useActionState<FormState, FormData>(async (st, f) => {
    const file = f.get("heroPoster");
    if (file instanceof File && file.size > 0) f.set("heroPoster", await compressImage(file, 1920, 0.85));
    const r = await saveSettingsAction(st, f);
    if (r?.ok) toast.success("Đã lưu nội dung");
    if (r?.error) toast.error(r.error);
    return r;
  }, undefined);
  const F = ({ k, label, area = false }: { k: keyof Settings; label: string; area?: boolean }) => (
    <div>
      <label className="label" htmlFor={k}>{label}</label>
      {area ? <textarea id={k} name={k} rows={4} defaultValue={s[k]} className="field" /> : <input id={k} name={k} defaultValue={s[k]} className="field" />}
    </div>
  );
  return (
    <form action={action} className="mt-8 grid gap-6 lg:grid-cols-2">
      <section className="panel space-y-5 p-6">
        <h2 className="font-display text-xl font-bold">Phần đầu trang chủ</h2>
        <F k="heroTitle" label="Tiêu đề lớn" />
        <F k="heroLead" label="Đoạn giới thiệu" area />
        <div>
          <p className="label">Ảnh hiện khi video chưa tải / tắt chuyển động</p>
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-mist"><Image src={s.heroPoster} alt="" fill sizes="500px" className="object-cover" unoptimized={s.heroPoster.startsWith("data:")} /></div>
          <input type="file" name="heroPoster" accept="image/*" className="mt-3 block text-sm" />
          <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" name="resetPoster" /> Dùng lại ảnh mặc định</label>
        </div>
      </section>
      <section className="panel space-y-5 p-6">
        <h2 className="font-display text-xl font-bold">Giới thiệu dự án & liên hệ</h2>
        <F k="aboutTitle" label="Tiêu đề phần giới thiệu" />
        <F k="aboutBody" label="Nội dung giới thiệu" area />
        <F k="team" label="Tên nhóm / đơn vị" />
        <F k="contactAddress" label="Khu vực" />
        <F k="contactEmail" label="Email" />
        <F k="contactPhone" label="Điện thoại" />
      </section>
      <div className="lg:col-span-2"><Btn /></div>
    </form>
  );
}
