import { getShop } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ShopForm } from "./form";

export default async function ShopSettings() {
  const [shop, me] = await Promise.all([getShop(), requireAdmin()]);
  return (
    <>
      <h1 className="font-display text-4xl font-bold text-leaf-900">Cài đặt bán hàng</h1>
      <p className="mt-2 text-ink-soft">Phí giao hàng và cách thanh toán khách thấy khi đặt hàng. Thông tin ngân hàng chỉ hiện cho khách sau khi đặt đơn chuyển khoản.</p>
      {me.role !== "OWNER" && <p className="mt-4 rounded-2xl bg-straw-100 p-4 text-sm text-soil-900">Chỉ chủ trang mới lưu được phần này.</p>}
      <ShopForm shop={shop} />
    </>
  );
}
