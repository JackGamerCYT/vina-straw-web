import { getSettings } from "@/lib/db";
import { SettingsForm } from "./form";

export default async function Content() {
  const s = await getSettings();
  return (
    <>
      <h1 className="font-display text-4xl font-bold text-leaf-900">Nội dung trang</h1>
      <p className="mt-2 text-ink-soft">Sửa chữ ở trang chủ, ảnh nền hero và thông tin liên hệ ở chân trang.</p>
      <SettingsForm s={s} />
    </>
  );
}
