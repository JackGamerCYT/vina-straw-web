import Link from "next/link";
import { Logo } from "@/components/logo";

export function AuthShell({ title, lead, children, foot }: { title: string; lead: string; children: React.ReactNode; foot?: React.ReactNode }) {
  return (
    <main className="weave grid min-h-screen place-items-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="panel space-y-6 p-9 shadow-xl">
          <Link href="/" aria-label="Về trang chủ"><Logo /></Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-leaf-900">{title}</h1>
            <p className="mt-1 text-sm text-ink-soft">{lead}</p>
          </div>
          {children}
        </div>
        {foot && <p className="mt-5 text-center text-sm text-ink-soft">{foot}</p>}
      </div>
    </main>
  );
}
