"use client";
import { useActionState } from "react";
import { ArrowUpRight, Send } from "lucide-react";
import { KeepForm, usePending } from "./keep-form";
import { sendContact, subscribe, type SiteState } from "@/lib/site-actions";
import { CONTACT_SUBJECTS } from "@/lib/types";

function Btn({ children, className }: { children: React.ReactNode; className: string }) {
  const pending = usePending();
  return <button disabled={pending} className={className}>{pending ? "Đang gửi…" : children}</button>;
}

export function NewsletterForm() {
  const [s, action] = useActionState<SiteState, FormData>(subscribe, undefined);
  if (s?.ok) return <p className="rounded-full bg-white/10 px-5 py-3 font-semibold text-straw-300">{s.message}</p>;
  return (
    <KeepForm action={action} className="w-full">
      <div className="flex w-full items-center gap-2 border-b border-white/25 pb-2">
        <input name="email" type="email" required placeholder="Email của bạn" aria-label="Email nhận tin" className="min-w-0 flex-1 bg-transparent py-2 text-white outline-none placeholder:text-white/50" />
        <Btn className="flex items-center gap-1.5 rounded-full bg-sprout px-5 py-2.5 text-sm font-semibold text-white hover:bg-leaf-500">Đăng ký <ArrowUpRight className="h-4 w-4" /></Btn>
      </div>
      {s?.error && <p className="mt-2 text-sm text-red-300">{s.error}</p>}
    </KeepForm>
  );
}

export function ContactForm({ compact = false }: { compact?: boolean }) {
  const [s, action] = useActionState<SiteState, FormData>(sendContact, undefined);
  if (s?.ok) return <p className="toast-pop rounded-2xl bg-leaf-700 p-6 text-lg font-semibold text-white">{s.message}</p>;
  return (
    <KeepForm action={action} className="space-y-4">
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required placeholder="Họ và tên *" aria-label="Họ và tên" className="field !bg-white" autoComplete="name" />
        <input name="phone" placeholder="Số điện thoại" aria-label="Số điện thoại" className="field !bg-white" inputMode="tel" autoComplete="tel" />
        <input name="email" type="email" placeholder="Email" aria-label="Email" className="field !bg-white sm:col-span-2" autoComplete="email" />
        <select name="subject" aria-label="Chủ đề" className="field !bg-white sm:col-span-2" defaultValue={CONTACT_SUBJECTS[0]}>
          {CONTACT_SUBJECTS.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <textarea name="message" required rows={compact ? 4 : 6} placeholder="Viết tin nhắn của bạn…" aria-label="Nội dung" className="field !bg-white" />
      {s?.error && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{s.error}</p>}
      <Btn className="btn-primary !px-8 !py-4"><Send className="h-4 w-4" /> Gửi tin nhắn</Btn>
    </KeepForm>
  );
}
