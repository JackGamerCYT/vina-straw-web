import Link from "next/link";
import { LogoMark } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="weave grid min-h-screen place-items-center px-5">
      <div className="panel max-w-md p-10 text-center">
        <LogoMark className="mx-auto h-14 w-14" />
        <h1 className="font-display mt-6 text-3xl font-bold text-leaf-900">Không tìm thấy trang</h1>
        <p className="mt-3 text-ink-soft">Liên kết có thể đã đổi hoặc mã đơn chưa đúng.</p>
        <Link href="/" className="btn-primary mt-8">Về trang chủ</Link>
      </div>
    </main>
  );
}
