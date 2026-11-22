"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { manageCustomerAction } from "@/lib/shop-actions";

export function CustomerActions({ id, email, locked }: { id: number; email: string; locked: boolean }) {
  const [pending, start] = useTransition();
  const [secret, setSecret] = useState("");
  const run = (op: string, ask?: string) => {
    if (ask && !window.confirm(ask)) return;
    const f = new FormData(); f.set("id", String(id)); f.set("op", op);
    start(async () => {
      const r = await manageCustomerAction(f);
      if (r?.error) toast.error(r.error);
      else if (op === "reset") setSecret(r?.message ?? "");
      else toast.success(r?.message ?? "Đã cập nhật");
    });
  };
  const cls = "rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold hover:bg-mist disabled:opacity-50";
  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <button disabled={pending} onClick={() => run(locked ? "unlock" : "lock", locked ? undefined : `Khoá tài khoản ${email}?`)} className={cls}>{locked ? "Mở khoá" : "Khoá"}</button>
        <button disabled={pending} onClick={() => run("reset", `Cấp mật khẩu tạm cho ${email}?`)} className={cls}>Mật khẩu tạm</button>
      </div>
      {secret && <p className="max-w-xs rounded-xl bg-straw-100 px-3 py-2 text-xs text-soil-900">{secret}</p>}
    </div>
  );
}
