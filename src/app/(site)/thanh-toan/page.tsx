import { Navbar } from "@/components/navbar";
import { CheckoutForm } from "@/components/checkout";
import { getShop, listProducts } from "@/lib/db";
import { currentCustomer } from "@/lib/customer-auth";
import { toLite } from "@/lib/lite";

export const metadata = { title: "Đặt hàng", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Checkout() {
  const [products, shop, me] = await Promise.all([listProducts(), getShop(), currentCustomer()]);
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[1240px] px-5 pb-24 pt-32 lg:px-8">
        <h1 className="font-display text-5xl font-bold tracking-tight text-leaf-900">Đặt hàng</h1>
        <CheckoutForm products={products.filter((p) => p.price > 0).map(toLite)} shop={shop}
          me={me && { name: me.name, phone: me.phone, email: me.email, address: me.address, company: me.company }} />
      </main>
    </>
  );
}
