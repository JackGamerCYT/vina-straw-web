import Image from "next/image";
import Link from "next/link";
import { Plus, Pencil, EyeOff, Star } from "lucide-react";
import { listProducts } from "@/lib/db";
import { vnd } from "@/lib/format";

export default async function AdminProducts() {
  const list = await listProducts({ all: true });
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl font-bold text-leaf-900">Sản phẩm</h1>
        <Link href="/admin/san-pham/moi" className="btn-primary"><Plus className="h-4 w-4" /> Thêm sản phẩm</Link>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((p) => (
          <Link key={p.id} href={`/admin/san-pham/${p.id}`} className="panel group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="relative aspect-square bg-mist">
              {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="300px" className="object-contain p-6" unoptimized={p.images[0].startsWith("data:")} />}
              <div className="absolute left-3 top-3 flex gap-1.5">
                {!p.active && <span className="flex items-center gap-1 rounded-full bg-ink px-2 py-1 text-xs font-semibold text-white"><EyeOff className="h-3 w-3" /> Ẩn</span>}
                {p.featured && <span className="flex items-center gap-1 rounded-full bg-straw-500 px-2 py-1 text-xs font-semibold text-soil-900"><Star className="h-3 w-3" /> Nổi bật</span>}
              </div>
              <span className="absolute right-3 top-3 rounded-full bg-white px-2 py-1 text-xs font-semibold">{p.images.length} ảnh</span>
            </div>
            <div className="flex items-start justify-between gap-2 p-4">
              <div><p className="font-semibold text-ink">{p.name}</p><p className="text-sm text-ink-soft">{vnd(p.price)} / {p.unit}</p></div>
              <Pencil className="h-4 w-4 text-ink-soft group-hover:text-leaf-700" />
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
