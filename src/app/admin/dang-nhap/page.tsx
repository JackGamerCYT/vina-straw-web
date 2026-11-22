"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { login, type FormState } from "@/lib/actions";
import { Logo } from "@/components/logo";

function Btn() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="btn-primary w-full !py-4"><LogIn className="h-4 w-4" />{pending ? "Đang vào…" : "Đăng nhập"}</button>;
}
export default function Login() {
  const [s, action] = useActionState<FormState, FormData>(login, undefined);
  return (
    <main className="weave grid min-h-screen place-items-center px-5">
      <form action={action} className="panel w-full max-w-sm space-y-6 p-9 shadow-xl">
        <Link href="/"><Logo /></Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-leaf-900">Trang quản trị</h1>
          <p className="mt-1 text-sm text-ink-soft">Quản lý đơn hàng, sản phẩm, ảnh và nội dung trang.</p>
        </div>
        <div><label className="label" htmlFor="pw">Mật khẩu</label><input id="pw" name="password" type="password" required autoFocus className="field" autoComplete="current-password" /></div>
        {s?.error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{s.error}</p>}
        <Btn />
      </form>
    </main>
  );
}
