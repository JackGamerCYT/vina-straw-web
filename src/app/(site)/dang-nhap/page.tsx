import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { CustomerLoginForm } from "@/components/customer-forms";
import { currentCustomer } from "@/lib/customer-auth";
import { getSettings } from "@/lib/db";

export const metadata = { title: "Đăng nhập" };
export const dynamic = "force-dynamic";

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [{ next }, me, s] = await Promise.all([searchParams, currentCustomer(), getSettings()]);
  if (me) redirect(next || "/tai-khoan");
  return (
    <>
      <Navbar />
      <main className="weave grid min-h-screen place-items-center px-5 pb-16 pt-28">
        <div className="w-full max-w-md">
          <div className="panel space-y-6 p-9 shadow-xl">
            <div>
              <h1 className="font-display text-3xl font-bold text-leaf-900">Đăng nhập</h1>
              <p className="mt-1 text-sm text-ink-soft">Xem lịch sử đơn, lưu địa chỉ giao hàng và đặt hàng nhanh hơn.</p>
            </div>
            <CustomerLoginForm next={next ?? ""} />
            <p className="text-sm text-ink-soft">Quên mật khẩu? Liên hệ {s.contactPhone} hoặc {s.contactEmail} để được cấp mật khẩu tạm.</p>
          </div>
          <p className="mt-5 text-center text-sm text-ink-soft">Chưa có tài khoản? <Link href={`/dang-ky${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-leaf-700 underline">Đăng ký</Link></p>
          <p className="mt-2 text-center text-xs text-ink-soft/80"><Link href="/admin/dang-nhap" className="underline">Đăng nhập quản trị</Link></p>
        </div>
      </main>
    </>
  );
}
