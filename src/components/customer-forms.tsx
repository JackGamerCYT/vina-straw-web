"use client";
import { useActionState } from "react";
import { KeyRound, LogIn, Save, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { KeepForm, usePending } from "./keep-form";
import { changeCustomerPassword, customerLogin, customerRegister, updateProfile, type ShopState } from "@/lib/shop-actions";

function Btn({ icon, label, busy }: { icon: React.ReactNode; label: string; busy: string }) {
  const pending = usePending();
  return <button disabled={pending} className="btn-primary w-full !py-4">{icon}{pending ? busy : label}</button>;
}
const Err = ({ s }: { s: ShopState }) => (s?.error ? <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{s.error}</p> : null);

export function CustomerLoginForm({ next }: { next: string }) {
  const [s, action] = useActionState<ShopState, FormData>(customerLogin, undefined);
  return (
    <KeepForm action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required autoFocus className="field" autoComplete="username" /></div>
      <div><label className="label" htmlFor="pw">Mật khẩu</label><input id="pw" name="password" type="password" required className="field" autoComplete="current-password" /></div>
      <Err s={s} />
      <Btn icon={<LogIn className="h-4 w-4" />} label="Đăng nhập" busy="Đang vào…" />
    </KeepForm>
  );
}

export function CustomerRegisterForm({ next }: { next: string }) {
  const [s, action] = useActionState<ShopState, FormData>(customerRegister, undefined);
  return (
    <KeepForm action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <div><label className="label" htmlFor="name">Họ tên</label><input id="name" name="name" required className="field" autoComplete="name" /></div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required className="field" autoComplete="email" /></div>
        <div><label className="label" htmlFor="phone">Số điện thoại</label><input id="phone" name="phone" required className="field" inputMode="tel" autoComplete="tel" /></div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label className="label" htmlFor="pw">Mật khẩu</label><input id="pw" name="password" type="password" minLength={8} required className="field" autoComplete="new-password" /></div>
        <div><label className="label" htmlFor="pw2">Nhập lại</label><input id="pw2" name="password2" type="password" minLength={8} required className="field" autoComplete="new-password" /></div>
      </div>
      <Err s={s} />
      <Btn icon={<UserPlus className="h-4 w-4" />} label="Tạo tài khoản" busy="Đang tạo…" />
    </KeepForm>
  );
}

type P = { name: string; phone: string; email: string; address: string; company: string };
export function ProfileForm({ me }: { me: P }) {
  const [s, action] = useActionState<ShopState, FormData>(async (st, f) => {
    const r = await updateProfile(st, f);
    if (r?.ok) toast.success(r.message ?? "Đã lưu");
    return r;
  }, undefined);
  return (
    <KeepForm action={action} className="panel space-y-5 p-6">
      <h2 className="font-display text-xl font-bold">Thông tin của bạn</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label className="label" htmlFor="name">Họ tên</label><input id="name" name="name" required defaultValue={me.name} className="field" /></div>
        <div><label className="label" htmlFor="phone">Số điện thoại</label><input id="phone" name="phone" required defaultValue={me.phone} className="field" /></div>
        <div><label className="label">Email</label><input value={me.email} disabled className="field opacity-70" /></div>
        <div><label className="label" htmlFor="company">Quán / công ty</label><input id="company" name="company" defaultValue={me.company} className="field" /></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="address">Địa chỉ giao hàng mặc định</label><input id="address" name="address" defaultValue={me.address} className="field" /></div>
      </div>
      <Err s={s} />
      <div className="sm:w-56"><Btn icon={<Save className="h-4 w-4" />} label="Lưu thông tin" busy="Đang lưu…" /></div>
    </KeepForm>
  );
}

export function CustomerPasswordForm() {
  const [s, action] = useActionState<ShopState, FormData>(async (st, f) => {
    const r = await changeCustomerPassword(st, f);
    if (r?.ok) toast.success(r.message ?? "Đã đổi mật khẩu");
    return r;
  }, undefined);
  return (
    <KeepForm action={action} key={s?.ok ? Date.now() : "f"} className="panel space-y-4 p-6">
      <h2 className="font-display text-xl font-bold">Đổi mật khẩu</h2>
      <div><label className="label" htmlFor="cur">Mật khẩu hiện tại</label><input id="cur" name="current" type="password" required className="field" autoComplete="current-password" /></div>
      <div><label className="label" htmlFor="np">Mật khẩu mới</label><input id="np" name="password" type="password" minLength={8} required className="field" autoComplete="new-password" /></div>
      <div><label className="label" htmlFor="np2">Nhập lại</label><input id="np2" name="password2" type="password" minLength={8} required className="field" autoComplete="new-password" /></div>
      <Err s={s} />
      <Btn icon={<KeyRound className="h-4 w-4" />} label="Đổi mật khẩu" busy="Đang lưu…" />
    </KeepForm>
  );
}
