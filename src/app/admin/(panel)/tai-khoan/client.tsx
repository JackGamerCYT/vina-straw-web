"use client";
import { KeepForm, usePending } from "@/components/keep-form";
import { useActionState, useState, useTransition } from "react";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { changePasswordAction, manageAdminAction, type AccState } from "@/lib/account-actions";
import type { AdminRole, AdminStatus } from "@/lib/types";

type A = { id: number; email: string; role: AdminRole; status: AdminStatus };

export function ManageRow({ a, self }: { a: A; self: boolean }) {
  const [pending, start] = useTransition();
  const [secret, setSecret] = useState("");
  const run = (op: string, extra: Record<string, string> = {}, ask?: string) => {
    if (ask && !window.confirm(ask)) return;
    const f = new FormData();
    f.set("id", String(a.id)); f.set("op", op);
    for (const [k, v] of Object.entries(extra)) f.set(k, v);
    start(async () => {
      const r = await manageAdminAction(f);
      if (r?.error) toast.error(r.error);
      else if (op === "reset" && r?.message) setSecret(r.message);
      else toast.success(r?.message ?? "Đã cập nhật");
    });
  };
  const B = ({ children, onClick, tone = "" }: { children: React.ReactNode; onClick: () => void; tone?: string }) => (
    <button type="button" disabled={pending} onClick={onClick} className={`rounded-full border border-ink/15 px-3 py-1.5 text-sm font-semibold hover:bg-mist disabled:opacity-50 ${tone}`}>{children}</button>
  );
  return (
    <div className="flex max-w-full flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        {a.status === "PENDING" && <B onClick={() => run("approve")} tone="!border-leaf-700 bg-leaf-700 text-white hover:!bg-leaf-800">Duyệt</B>}
        {a.status === "LOCKED" && <B onClick={() => run("unlock")}>Mở khoá</B>}
        {a.status === "ACTIVE" && !self && <B onClick={() => run("lock")}>Khoá</B>}
        {a.status !== "PENDING" && (
          <select aria-label="Vai trò" disabled={pending} value={a.role} onChange={(e) => run("role", { role: e.target.value })} className="rounded-full border border-ink/15 bg-white px-3 py-1.5 text-sm font-semibold">
            <option value="EDITOR">Biên tập</option><option value="OWNER">Chủ trang</option>
          </select>
        )}
        {!self && a.status !== "PENDING" && <B onClick={() => run("reset", {}, `Đặt mật khẩu tạm cho ${a.email}?`)}>Mật khẩu tạm</B>}
        {!self && <B onClick={() => run("delete", {}, `Xoá tài khoản ${a.email}?`)} tone="text-red-600">{a.status === "PENDING" ? "Từ chối" : "Xoá"}</B>}
      </div>
      {secret && <p className="max-w-sm rounded-xl bg-straw-100 px-3 py-2 text-sm text-soil-900">{secret}</p>}
    </div>
  );
}

function Btn() {
  const pending = usePending();
  return <button disabled={pending} className="btn-primary w-full"><KeyRound className="h-4 w-4" />{pending ? "Đang lưu…" : "Đổi mật khẩu"}</button>;
}
export function PasswordForm() {
  const [s, action] = useActionState<AccState, FormData>(async (st, f) => {
    const r = await changePasswordAction(st, f);
    if (r?.ok) toast.success(r.message ?? "Đã đổi mật khẩu");
    return r;
  }, undefined);
  return (
    <KeepForm action={action} key={s?.ok ? Date.now() : "f"} className="panel space-y-4 self-start p-6">
      <h2 className="font-display text-xl font-bold">Đổi mật khẩu của bạn</h2>
      <div><label className="label" htmlFor="cur">Mật khẩu hiện tại</label><input id="cur" name="current" type="password" required className="field" autoComplete="current-password" /></div>
      <div><label className="label" htmlFor="np">Mật khẩu mới</label><input id="np" name="password" type="password" minLength={8} required className="field" autoComplete="new-password" /></div>
      <div><label className="label" htmlFor="np2">Nhập lại</label><input id="np2" name="password2" type="password" minLength={8} required className="field" autoComplete="new-password" /></div>
      {s?.error && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{s.error}</p>}
      <Btn />
    </KeepForm>
  );
}
