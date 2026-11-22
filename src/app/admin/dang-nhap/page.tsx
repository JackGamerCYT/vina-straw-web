import Link from "next/link";
import { redirect } from "next/navigation";
import { countAdmins } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { AuthShell } from "../auth-shell";
import { LoginForm } from "./form";

export const dynamic = "force-dynamic";

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const [{ next }, n] = await Promise.all([searchParams, countAdmins()]);
  if (n === 0) redirect("/admin/dang-ky");
  return (
    <AuthShell title="Đăng nhập quản trị" lead="Quản lý đơn hàng, sản phẩm, ảnh và chữ trên trang."
      foot={<>Chưa có tài khoản? <Link href="/admin/dang-ky" className="font-semibold text-leaf-700 underline">Đăng ký</Link></>}>
      <LoginForm next={next ?? ""} />
    </AuthShell>
  );
}
