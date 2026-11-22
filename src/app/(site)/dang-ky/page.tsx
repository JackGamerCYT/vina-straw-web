import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { CustomerRegisterForm } from "@/components/customer-forms";
import { currentCustomer } from "@/lib/customer-auth";

export const metadata = { title: "Đăng ký" };
export const dynamic = "force-dynamic";

export default async function Register({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [{ next }, me] = await Promise.all([searchParams, currentCustomer()]);
  if (me) redirect(next || "/tai-khoan");
  return (
    <>
      <Navbar />
      <main className="weave grid min-h-screen place-items-center px-5 pb-16 pt-28">
        <div className="w-full max-w-lg">
          <div className="panel space-y-6 p-9 shadow-xl">
            <div>
              <h1 className="font-display text-3xl font-bold text-leaf-900">Tạo tài khoản</h1>
              <p className="mt-1 text-sm text-ink-soft">Miễn phí. Dùng để theo dõi đơn hàng và lưu thông tin giao hàng.</p>
            </div>
            <CustomerRegisterForm next={next ?? ""} />
          </div>
          <p className="mt-5 text-center text-sm text-ink-soft">Đã có tài khoản? <Link href={`/dang-nhap${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-leaf-700 underline">Đăng nhập</Link></p>
        </div>
      </main>
    </>
  );
}
