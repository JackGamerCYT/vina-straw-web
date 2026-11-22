"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Search } from "lucide-react";
import { lookupOrder, type FormState } from "@/lib/actions";

function Btn() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="btn-primary w-full !py-4"><Search className="h-4 w-4" />{pending ? "Đang tìm…" : "Tìm đơn"}</button>;
}
export function LookupForm() {
  const [s, action] = useActionState<FormState, FormData>(lookupOrder, undefined);
  return (
    <form action={action} className="space-y-5">
      <div><label className="label" htmlFor="code">Mã đơn</label><input id="code" name="code" required className="field font-semibold uppercase tracking-wider" placeholder="VS-ABC123" /></div>
      <div><label className="label" htmlFor="phone">Số điện thoại đã dùng khi gửi</label><input id="phone" name="phone" required inputMode="tel" className="field" placeholder="09xx xxx xxx" /></div>
      {s?.error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{s.error}</p>}
      <Btn />
    </form>
  );
}
