import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { OrderForm } from "@/components/order-form";
import { listProducts } from "@/lib/db";

export const metadata = { title: "Nhận báo giá, đặt hàng" };
export const dynamic = "force-dynamic";

export default async function Quote({ searchParams }: { searchParams: Promise<{ sp?: string; loai?: string }> }) {
  const { sp, loai } = await searchParams;
  const products = await listProducts();
  return (
    <>
      <Navbar />
      <main className="mx-auto grid max-w-[1240px] gap-14 px-5 pb-24 pt-32 lg:grid-cols-[1fr_minmax(0,760px)] lg:px-8">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight text-leaf-900">Nhận báo giá, đặt hàng</h1>
          <p className="mt-5 text-lg text-ink-soft">Điền một lần, chúng tôi phản hồi trong 1–2 ngày làm việc. Sau khi gửi, bạn nhận mã đơn để xem lại và chỉnh sửa.</p>
          <div className="zoom-frame relative mt-10 hidden aspect-[4/5] overflow-hidden rounded-[28px] lg:block">
            <Image src="/img/straw-cart.webp" alt="Xe bò chở rơm trên cánh đồng sau thu hoạch" fill sizes="400px" className="object-cover" />
          </div>
        </aside>
        <OrderForm products={products} preselect={sp ? Number(sp) : undefined} kind={loai} />
      </main>
    </>
  );
}
