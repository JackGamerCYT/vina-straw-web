import { listMedia } from "@/lib/db";
import { MediaGrid } from "./client";

export default async function Library() {
  const media = await listMedia();
  return (
    <>
      <h1 className="font-display text-4xl font-bold text-leaf-900">Thư viện ảnh</h1>
      <p className="mt-2 text-ink-soft">Tải ảnh lên một lần rồi chép đường dẫn để dùng ở bất kỳ đâu. Ảnh được nén tự động trước khi gửi. Muốn thay ảnh ngay trên trang chủ, bật “Sửa trực tiếp” rồi bấm “Đổi ảnh”.</p>
      <MediaGrid items={media.map((m) => ({ id: m.id, url: m.url, name: m.name, size: m.size }))} />
    </>
  );
}
