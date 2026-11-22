import { Navbar } from "@/components/navbar";
import { CartView } from "@/components/checkout";
import { getShop, listProducts } from "@/lib/db";
import { toLite } from "@/lib/lite";

export const metadata = { title: "Giỏ hàng", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Cart() {
  const [products, shop] = await Promise.all([listProducts(), getShop()]);
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[1240px] px-5 pb-24 pt-32 lg:px-8">
        <h1 className="font-display text-5xl font-bold tracking-tight text-leaf-900">Giỏ hàng</h1>
        <CartView products={products.filter((p) => p.price > 0).map(toLite)} shop={shop} />
      </main>
    </>
  );
}
