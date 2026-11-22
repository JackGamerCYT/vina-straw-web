# Vina-Straw — website bao bì từ rơm rạ

Next.js 15 (App Router) · Tailwind CSS 4 · GSAP · Three.js · Postgres (Neon) · Vercel Blob

## Trang
- `/` Giới thiệu dự án (video hero, quy trình cuộn ngang, sản phẩm, phim 30 giây, lộ trình R&D)
- `/san-pham`, `/san-pham/[slug]` Sản phẩm, giá, thông số, xem 3D
- `/bao-gia` Biểu mẫu nhận báo giá / đặt hàng / đặt mẫu thử (kèm ảnh)
- `/don-hang` Tra cứu đơn bằng mã + SĐT; khách sửa thông tin, số lượng, thêm/xoá ảnh khi đơn chưa xác nhận
- `/admin` Quản trị: đơn hàng (trạng thái, báo giá), sản phẩm (giá, mô tả, thông số, thêm/xoá/sắp xếp ảnh), nội dung trang chủ

## Biến môi trường (Vercel → Settings → Environment Variables)
| Biến | Ý nghĩa |
|---|---|
| `DATABASE_URL` | Postgres Neon — tự thêm khi nối Neon trong tab Storage |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob — tự thêm khi nối Blob store |
| `ADMIN_PASSWORD` | Mật khẩu vào `/admin` |

Bảng dữ liệu tự tạo và nạp 8 sản phẩm mẫu ở lần truy cập đầu tiên.

## Chạy máy
```bash
npm install
npm run dev
```
Không có `DATABASE_URL` thì web chạy với dữ liệu tạm trong bộ nhớ (mật khẩu admin mặc định `vinastraw2026`).

## Nguồn ảnh
Ảnh sản phẩm: dựng 3D theo bộ bản vẽ kỹ thuật Vina-Straw. Ảnh đồng ruộng: Wikimedia Commons, xem `/nguon-anh`.

## Đã cấu hình trên Vercel
- Project: `vina-straw-web` — Neon `neon-crimson-flower` (free), Blob `vina-straw-web-blob` (public)
- Cần tự thêm biến `ADMIN_PASSWORD` (Settings → Environment Variables) rồi Redeploy để đổi mật khẩu quản trị.
