import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { isRender, priceText } from "@/lib/format";

export function ProductCard({ p, priority = false }: { p: Product; priority?: boolean }) {
  const img = p.images[0];
  return (
    <Link href={`/san-pham/${p.slug}`} className="group flex flex-col rounded-[28px] transition duration-300 hover:-translate-y-0.5">
      <div className="zoom-frame relative aspect-square overflow-hidden rounded-[28px] bg-mist">
        {img ? (
          <Image src={img} alt={p.name} fill sizes="(min-width:1024px) 380px, (min-width:640px) 50vw, 100vw" priority={priority} className={isRender(img) ? "object-contain p-[9%]" : "object-cover"} unoptimized={img.startsWith("data:")} />
        ) : (
          <div className="weave absolute inset-0" />
        )}
        {!isRender(img ?? "/renders/") && <span className="absolute right-4 top-4 rounded-full bg-leaf-700/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur">Ảnh thật</span>}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-leaf-800 backdrop-blur">{p.line}</span>
      </div>
      <div className="mt-4 flex items-start justify-between gap-4 px-1">
        <div>
          <h3 className="font-display text-xl font-bold text-ink">{p.name}</h3>
          <p className="mt-1 line-clamp-2 text-[15px] text-ink-soft">{p.short}</p>
        </div>
        <p className="shrink-0 text-right">
          <span className="block font-display text-lg font-bold text-leaf-700">{priceText(p.price)}</span>
          {p.price > 0 && <span className="text-xs text-ink-soft">/ {p.unit}</span>}
        </p>
      </div>
    </Link>
  );
}
