"use client";
import { KeepForm, usePending } from "@/components/keep-form";
import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { loginAction, type AccState } from "@/lib/account-actions";

function Btn() {
  const pending = usePending();
  return <button disabled={pending} className="btn-primary w-full !py-4"><LogIn className="h-4 w-4" />{pending ? "Đang vào…" : "Đăng nhập"}</button>;
}
export function LoginForm({ next }: { next: string }) {
  const [s, action] = useActionState<AccState, FormData>(loginAction, undefined);
  return (
    <KeepForm action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required autoFocus className="field" autoComplete="username" /></div>
      <div><label className="label" htmlFor="pw">Mật khẩu</label><input id="pw" name="password" type="password" required className="field" autoComplete="current-password" /></div>
      {s?.error && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{s.error}</p>}
      <Btn />
    </KeepForm>
  );
}
