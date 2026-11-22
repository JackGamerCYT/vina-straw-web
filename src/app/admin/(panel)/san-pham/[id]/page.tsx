import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getProduct } from "@/lib/db";
import { ProductEditor } from "./editor";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = id === "moi" ? null : await getProduct(Number(id));
  if (id !== "moi" && !p) notFound();
  return (
    <>
      <Link href="/admin/san-pham" className="inline-flex items-center gap-1.5 text-sm font-semibold text-leaf-700"><ArrowLeft className="h-4 w-4" /> Danh sách sản phẩm</Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl font-bold text-leaf-900">{p ? p.name : "Sản phẩm mới"}</h1>
        {p && <Link href={`/san-pham/${p.slug}`} target="_blank" className="btn-ghost !py-2 text-sm"><ExternalLink className="h-4 w-4" /> Xem trên web</Link>}
      </div>
      <ProductEditor p={p} />
    </>
  );
}
