import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { PageBanner } from "@/components/page-banner";
import { CarbonCalc } from "@/components/carbon-calc";
import { T } from "@/components/editable";
import { listProducts, strawTotals } from "@/lib/db";
import { CO2E_PER_G, EF_CH4, EF_N2O, GWP_CH4, GWP_N2O, carbonOf, fmtCredits, fmtMass } from "@/lib/carbon";

export const metadata = { title: "Tín chỉ carbon", description: "Ước tính lượng khí nhà kính tránh được khi dùng bao bì từ rơm thay vì đốt rơm." };
export const revalidate = 60;

export default async function CarbonPage() {
  const [products, totals] = await Promise.all([listProducts(), strawTotals()]);
  const list = products.filter((p) => p.strawGrams > 0).map((p) => ({ id: p.id, name: p.name, unit: p.unit, moq: p.moq, straw: p.strawGrams, image: p.images[0] ?? "", price: p.price }));
  const all = carbonOf(totals.all);
  return (
    <>
      <Navbar />
      <PageBanner title="Tín chỉ carbon" crumbs={[["Tín chỉ carbon"]]} img="/img/field-burnt.webp" />
      <main className="mx-auto max-w-[1320px] px-5 py-16 lg:px-8">
        <section className="grid gap-6 rounded-[32px] bg-mist p-8 sm:grid-cols-3 sm:p-10">
          <div className="sm:col-span-3"><T k="carbon.total.title" as="h2" className="font-display block text-3xl font-bold text-leaf-900">Khách hàng Vina-Straw đã cùng giúp</T></div>
          <div><p className="text-ink-soft">Rơm được giữ lại</p><p className="font-display text-4xl font-bold">{fmtMass(all.strawG)}</p></div>
          <div><p className="text-ink-soft">CO2e không thải ra</p><p className="font-display text-4xl font-bold text-leaf-700">{fmtMass(all.co2eG)}</p></div>
          <div><p className="text-ink-soft">Tín chỉ carbon ước tính</p><p className="font-display text-4xl font-bold text-soil-700">{fmtCredits(all.credits)}</p><p className="text-sm text-ink-soft">từ {totals.orders} đơn hàng</p></div>
        </section>

        <section className="mt-16">
          <T k="carbon.calc.title" as="h2" className="font-display block text-4xl font-bold tracking-tight text-leaf-900">Tính thử cho đơn hàng của bạn</T>
          <T k="carbon.calc.lead" as="p" className="mb-8 mt-3 block max-w-2xl text-lg text-ink-soft">Nhập số lượng từng sản phẩm. Khi bạn đặt hàng, phần này được cộng dồn vào tài khoản của bạn.</T>
          <CarbonCalc products={list} />
        </section>

        <section className="mt-20 grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold text-leaf-900">Cách tính</h2>
            <ol className="mt-5 list-decimal space-y-3 pl-5 text-[17px] leading-relaxed text-ink/90">
              <li>Mỗi sản phẩm có lượng rơm ước tính trong một đơn vị (ví dụ túi giấy rơm khoảng 30 g).</li>
              <li>Nếu lượng rơm đó bị đốt ngoài đồng, mỗi kg rơm thải ra khoảng {EF_CH4.toLocaleString("vi-VN")} g CH4 và {EF_N2O.toLocaleString("vi-VN")} g N2O.</li>
              <li>Quy đổi sang CO2 tương đương theo hệ số làm nóng toàn cầu 100 năm: CH4 × {GWP_CH4}, N2O × {GWP_N2O}. Kết quả: khoảng {(CO2E_PER_G).toLocaleString("vi-VN", { maximumFractionDigits: 3 })} kg CO2e cho mỗi kg rơm.</li>
              <li>1 tín chỉ carbon tương ứng 1 tấn CO2e.</li>
            </ol>
          </div>
          <div className="rounded-[28px] bg-straw-100 p-8 text-soil-900">
            <h2 className="font-display text-2xl font-bold">Lưu ý</h2>
            <ul className="mt-4 list-disc space-y-2.5 pl-5 leading-relaxed">
              <li>Đây là con số ước tính để bạn hình dung, không phải tín chỉ carbon đã được kiểm định hay có thể mua bán.</li>
              <li>CO2 từ đốt rơm không được tính vì theo hướng dẫn IPCC 2006, lượng này được cây hấp thụ lại qua quang hợp.</li>
              <li>Hệ số đốt lấy cận trên của dải đo trong các nghiên cứu (0,7–4,51 g CH4 và 0,019–0,069 g N2O mỗi kg rơm). Kết quả thực tế có thể thấp hơn.</li>
              <li>Lượng rơm trong mỗi sản phẩm là số ước tính ban đầu, sẽ được cập nhật khi cân mẫu thật.</li>
            </ul>
            <Link href="/san-pham" className="btn-primary mt-6">Chọn sản phẩm</Link>
          </div>
        </section>
      </main>
    </>
  );
}
