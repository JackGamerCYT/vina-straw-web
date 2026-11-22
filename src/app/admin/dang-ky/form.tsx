"use client";
import { KeepForm, usePending } from "@/components/keep-form";
import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { registerAction, type AccState } from "@/lib/account-actions";

function Btn() {
  const pending = usePending();
  return <button disabled={pending} className="btn-primary w-full !py-4"><UserPlus className="h-4 w-4" />{pending ? "Đang gửi…" : "Đăng ký"}</button>;
}
export function RegisterForm({ first }: { first: boolean }) {
  const [s, action] = useActionState<AccState, FormData>(registerAction, undefined);
  if (s?.ok) return <p className="rounded-2xl bg-leaf-100 px-4 py-4 text-[15px] font-medium text-leaf-800">{s.message}</p>;
  return (
    <KeepForm action={action} className="space-y-5">
      <div><label className="label" htmlFor="name">Họ tên</label><input id="name" name="name" required className="field" autoComplete="name" /></div>
      <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required className="field" autoComplete="email" /></div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label className="label" htmlFor="pw">Mật khẩu</label><input id="pw" name="password" type="password" minLength={8} required className="field" autoComplete="new-password" /></div>
        <div><label className="label" htmlFor="pw2">Nhập lại</label><input id="pw2" name="password2" type="password" minLength={8} required className="field" autoComplete="new-password" /></div>
      </div>
      {first && (
        <div><label className="label" htmlFor="setup">Mật khẩu quản trị hiện tại</label><input id="setup" name="setup" type="password" required className="field" autoComplete="off" />
          <p className="mt-1.5 text-xs text-ink-soft">Mật khẩu chung dùng trước đây (biến ADMIN_PASSWORD trên Vercel). Sau bước này, mật khẩu chung không còn dùng để đăng nhập.</p></div>
      )}
      {s?.error && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{s.error}</p>}
      <Btn />
    </KeepForm>
  );
}
