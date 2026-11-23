import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { isRender, priceText } from "@/lib/format";
import { QuickAdd } from "./cart";

export function ProductCard({ p, priority = false }: { p: Product; priority?: boolean }) {
  const img = p.images[0];
  const real = img && !isRender(img);
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-ink/8 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(22,36,27,.45)]">
      <Link href={`/san-pham/${p.slug}`} className="zoom-frame relative block aspect-square overflow-hidden bg-mist" tabIndex={-1} aria-hidden>
        {img ? (
          <Image src={img} alt="" fill sizes="(min-width:1280px) 320px, (min-width:640px) 50vw, 100vw" priority={priority} className={real ? "object-cover" : "object-contain p-[10%]"} unoptimized={img.startsWith("data:")} />
        ) : <div className="weave absolute inset-0" />}
        <span className="absolute left-2 top-2 rounded-md bg-straw-500 px-2 py-0.5 text-[10px] font-bold text-soil-900 sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-xs">{p.line}</span>
        {real && <span className="absolute right-2 top-2 hidden rounded-md bg-leaf-700 px-2.5 py-1 text-xs font-bold text-white sm:block">Ảnh thật</span>}
      </Link>
      <div className="flex flex-1 flex-col p-3.5 sm:p-5">
        <h3 className="font-display text-[15px] font-bold leading-snug text-ink sm:text-lg"><Link href={`/san-pham/${p.slug}`} className="hover:text-leaf-700">{p.name}</Link></h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-xs text-ink-soft sm:text-sm">{p.short}</p>
        <div className="mt-3 flex items-center justify-between gap-2 sm:mt-4">
          <p>
            <span className="font-display text-base font-bold text-leaf-700 sm:text-xl">{priceText(p.price)}</span>
            {p.price > 0 && <span className="hidden text-xs text-ink-soft sm:inline"> / {p.unit}</span>}
          </p>
          {p.price > 0
            ? <QuickAdd id={p.id} moq={p.moq} name={p.name} />
            : <Link href={`/bao-gia?sp=${p.id}`} aria-label={`Nhận báo giá ${p.name}`} className="grid h-11 w-11 place-items-center rounded-full bg-straw-100 text-soil-700 transition hover:bg-straw-500"><ArrowUpRight className="h-5 w-5" /></Link>}
        </div>
      </div>
    </article>
  );
}
