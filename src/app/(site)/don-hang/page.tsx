import { Navbar } from "@/components/navbar";
import { LookupForm } from "./lookup-form";

export const metadata = { title: "Tra cứu đơn" };

export default function Lookup() {
  return (
    <>
      <Navbar />
      <main className="mx-auto grid max-w-[1240px] gap-12 px-5 pb-24 pt-32 lg:grid-cols-2 lg:px-8">
        <div>
          <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight text-leaf-900">Tra cứu và sửa đơn</h1>
          <p className="mt-5 max-w-md text-lg text-ink-soft">Nhập mã đơn và số điện thoại để xem trạng thái, báo giá, và chỉnh sửa thông tin hoặc ảnh đính kèm.</p>
        </div>
        <div className="panel p-8 sm:p-10"><LookupForm /></div>
      </main>
    </>
  );
}
