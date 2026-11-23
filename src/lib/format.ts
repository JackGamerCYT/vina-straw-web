export const vnd = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + " ₫";
/** Giá 0 nghĩa là chưa công bố giá. */
export const priceText = (n: number) => (n > 0 ? vnd(n) : "Liên hệ");
/** Ảnh dựng 3D nền trong suốt thì đặt gọn trong khung; ảnh chụp thì phủ kín khung. */
export const isRender = (url: string) => url.includes("/renders/");
export const fmtDate = (s: string) =>
  new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(s));
export const slugify = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
export const fmtDay = (s: string) =>
  new Date(s).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" });
export const dayParts = (s: string) => {
  const d = new Date(new Date(s).toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  return { d: String(d.getDate()).padStart(2, "0"), m: `Th${d.getMonth() + 1}` };
};
