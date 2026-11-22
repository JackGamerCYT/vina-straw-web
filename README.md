# Vina-Straw — website bao bì từ rơm rạ

Next.js 15 (App Router) · Tailwind CSS 4 · GSAP · Three.js · Postgres (Neon) · Vercel Blob

## Trang
- `/` Giới thiệu dự án (video hero, quy trình cuộn ngang, sản phẩm, phim 30 giây, lộ trình R&D)
- `/san-pham`, `/san-pham/[slug]` Sản phẩm, giá, thông số, xem 3D
- `/bao-gia` Biểu mẫu nhận báo giá / đặt hàng / đặt mẫu thử (kèm ảnh)
- `/don-hang` Tra cứu đơn bằng mã + SĐT; khách sửa thông tin, số lượng, thêm/xoá ảnh khi đơn chưa xác nhận
- `/admin` Quản trị: đơn hàng (trạng thái, báo giá), sản phẩm (giá, mô tả, thông số, thêm/xoá/sắp xếp ảnh), nội dung trang chủ, tài khoản
- `/admin/dang-ky` Đăng ký tài khoản quản trị. Người đầu tiên là **chủ trang** (phải nhập mật khẩu `ADMIN_PASSWORD` cũ để xác nhận); người sau chờ chủ trang duyệt ở `/admin/tai-khoan`
- **Sửa trực tiếp**: đăng nhập rồi mở trang chủ, bấm "Sửa trực tiếp" ở thanh dưới cùng. Bấm vào chữ để sửa, "Đổi ảnh" để thay ảnh, rồi "Lưu". Xoá trắng một đoạn chữ thì trả về chữ mặc định

## Biến môi trường (Vercel → Settings → Environment Variables)
| Biến | Ý nghĩa |
|---|---|
| `DATABASE_URL` | Postgres Neon — tự thêm khi nối Neon trong tab Storage |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob — tự thêm khi nối Blob store |
| `ADMIN_PASSWORD` | Chỉ dùng để xác nhận khi tạo tài khoản chủ trang đầu tiên |
| `AUTH_SECRET` | (Không bắt buộc) khoá ký phiên đăng nhập; không đặt thì web tự tạo và lưu trong database |

Bảng dữ liệu tự tạo và nạp 8 sản phẩm mẫu ở lần truy cập đầu tiên.

## Chạy máy
```bash
npm install
npm run dev
```
Không có `DATABASE_URL` thì web chạy với dữ liệu tạm trong bộ nhớ (tạo tài khoản chủ trang bằng mật khẩu xác nhận mặc định `vinastraw2026`).

## Nguồn ảnh
Ảnh sản phẩm: dựng 3D theo bộ bản vẽ kỹ thuật Vina-Straw. Ảnh đồng ruộng: Wikimedia Commons, xem `/nguon-anh`.

## Đã cấu hình trên Vercel
- Project: `vina-straw-web` — Neon `neon-crimson-flower` (free), Blob `vina-straw-web-blob` (public)
- Sau khi deploy bản có tài khoản, vào `/admin/dang-ky` tạo tài khoản chủ trang ngay. Mật khẩu chung cũ sẽ không đăng nhập được nữa.
