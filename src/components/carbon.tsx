import Link from "next/link";
import { Leaf } from "lucide-react";
import { carbonOf, fmtCredits, fmtMass, type Carbon } from "@/lib/carbon";

/** Ô tóm tắt tác động: rơm giữ lại, CO2e tránh được, số tín chỉ ước tính. */
export function CarbonCard({ c, title = "Tác động môi trường ước tính", note, compact = false }: { c: Carbon; title?: string; note?: string; compact?: boolean }) {
  if (c.strawG <= 0) return null;
  return (
    <div className={`rounded-2xl border border-leaf-200 bg-leaf-100/50 ${compact ? "p-4" : "p-5"}`}>
      <p className="flex items-center gap-2 text-sm font-semibold text-leaf-800"><Leaf className="h-4 w-4 text-sprout" /> {title}</p>
      <dl className={`mt-3 grid grid-cols-3 gap-2 text-center ${compact ? "text-xs" : "text-sm"}`}>
        <div className="rounded-xl bg-white p-2.5"><dt className="text-ink-soft">Rơm giữ lại</dt><dd className="font-display mt-0.5 text-base font-bold text-ink sm:text-lg">{fmtMass(c.strawG)}</dd></div>
        <div className="rounded-xl bg-white p-2.5"><dt className="text-ink-soft">CO2e tránh được</dt><dd className="font-display mt-0.5 text-base font-bold text-leaf-700 sm:text-lg">{fmtMass(c.co2eG)}</dd></div>
        <div className="rounded-xl bg-white p-2.5"><dt className="text-ink-soft">Tín chỉ carbon</dt><dd className="font-display mt-0.5 text-base font-bold text-soil-700 sm:text-lg">{fmtCredits(c.credits)}</dd></div>
      </dl>
      <p className="mt-2.5 text-xs leading-relaxed text-ink-soft">{note ?? "So với việc đốt lượng rơm này ngoài đồng. 1 tín chỉ = 1 tấn CO2e. Số ước tính, không phải tín chỉ đã chứng nhận."} <Link href="/tin-chi-carbon" className="font-semibold text-leaf-700 underline">Cách tính</Link></p>
    </div>
  );
}
export const carbonFor = (strawG: number) => carbonOf(strawG);
