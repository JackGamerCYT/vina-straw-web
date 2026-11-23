import Link from "next/link";
import { Check, Download, RotateCcw, Trash2 } from "lucide-react";
import { listMessages, listSubscribers } from "@/lib/db";
import { messageAction } from "@/lib/site-actions";
import { fmtDate } from "@/lib/format";

export default async function Inbox({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const [msgs, subs] = await Promise.all([listMessages(), listSubscribers()]);
  const open = msgs.filter((m) => !m.handled).length;
  const Act = ({ id, op, children, title }: { id: number; op: string; children: React.ReactNode; title: string }) => (
    <form action={messageAction}><input type="hidden" name="id" value={id} /><input type="hidden" name="op" value={op} />
      <button title={title} aria-label={title} className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 hover:bg-mist">{children}</button></form>
  );
  return (
    <>
      <h1 className="font-display text-4xl font-bold text-leaf-900">Hộp thư</h1>
      <div className="mt-6 flex gap-2">
        <Link href="/admin/hop-thu" className={`rounded-full px-4 py-2 text-sm font-semibold ${tab !== "nhan-tin" ? "bg-ink text-white" : "bg-white"}`}>Tin nhắn liên hệ ({open} chưa xử lý)</Link>
        <Link href="/admin/hop-thu?tab=nhan-tin" className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === "nhan-tin" ? "bg-ink text-white" : "bg-white"}`}>Đăng ký nhận tin ({subs.length})</Link>
      </div>
      {tab !== "nhan-tin" ? (
        <div className="mt-6 space-y-4">
          {msgs.map((m) => (
            <article key={m.id} className={`panel p-5 ${m.handled ? "opacity-60" : ""}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{m.name} <span className="ml-2 rounded-full bg-mist px-2.5 py-0.5 text-xs">{m.subject}</span>{!m.handled && <span className="ml-2 rounded-full bg-sprout px-2.5 py-0.5 text-xs font-bold text-white">Mới</span>}</p>
                  <p className="text-sm text-ink-soft">{[m.phone && <a key="p" className="underline" href={`tel:${m.phone}`}>{m.phone}</a>, m.email && <a key="e" className="underline" href={`mailto:${m.email}`}>{m.email}</a>].filter(Boolean).reduce<React.ReactNode[]>((a, x, i) => (i ? [...a, " · ", x] : [x]), [])} · {fmtDate(m.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  {m.handled ? <Act id={m.id} op="undo" title="Đánh dấu chưa xử lý"><RotateCcw className="h-4 w-4" /></Act> : <Act id={m.id} op="done" title="Đánh dấu đã xử lý"><Check className="h-4 w-4" /></Act>}
                  <Act id={m.id} op="delete" title="Xoá tin nhắn"><Trash2 className="h-4 w-4 text-red-600" /></Act>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line text-[15px]">{m.message}</p>
            </article>
          ))}
          {msgs.length === 0 && <p className="panel p-10 text-center text-ink-soft">Chưa có tin nhắn nào.</p>}
        </div>
      ) : (
        <div className="mt-6">
          <a href="/admin/xuat-nhan-tin" className="btn-ghost !py-2 text-sm"><Download className="h-4 w-4" /> Tải danh sách (CSV)</a>
          <div className="panel mt-4 divide-y divide-ink/10">
            {subs.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <span>{s.email}</span>
                <span className="flex items-center gap-3 text-sm text-ink-soft">{fmtDate(s.createdAt)} <Act id={s.id} op="unsub" title="Xoá khỏi danh sách"><Trash2 className="h-4 w-4 text-red-600" /></Act></span>
              </div>
            ))}
            {subs.length === 0 && <p className="p-10 text-center text-ink-soft">Chưa có ai đăng ký.</p>}
          </div>
        </div>
      )}
    </>
  );
}
