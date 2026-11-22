import Link from "next/link";
import { countAdmins } from "@/lib/db";
import { AuthShell } from "../auth-shell";
import { RegisterForm } from "./form";

export const dynamic = "force-dynamic";

export default async function Register() {
  const first = (await countAdmins()) === 0;
  return (
    <AuthShell
      title={first ? "Tạo tài khoản chủ trang" : "Đăng ký tài khoản quản trị"}
      lead={first
        ? "Trang chưa có tài khoản nào. Người tạo đầu tiên là chủ trang, cần nhập mật khẩu quản trị cũ để xác nhận."
        : "Sau khi đăng ký, chủ trang duyệt thì bạn mới đăng nhập được."}
      foot={first ? undefined : <>Đã có tài khoản? <Link href="/admin/dang-nhap" className="font-semibold text-leaf-700 underline">Đăng nhập</Link></>}>
      <RegisterForm first={first} />
    </AuthShell>
  );
}
