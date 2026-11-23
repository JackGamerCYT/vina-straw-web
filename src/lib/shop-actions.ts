"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { del } from "@vercel/blob";
import * as db from "./db";
import { clearFails, hashPassword, recordFail, requireAdmin, requireOwner, tooManyAttempts, verifyPassword } from "./auth";
import { currentCustomer, endCustomerSession, requireCustomer, startCustomerSession } from "./customer-auth";
import { hasBlob, storeImage } from "./upload";
import { CHECKOUT_KIND, shippingFor, type OrderItem, type PaymentMethod } from "./types";

export type ShopState = { ok?: boolean; error?: string; message?: string } | undefined;

const str = (f: FormData, k: string, max = 200) => String(f.get(k) ?? "").trim().slice(0, max);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[0-9+().\s-]{8,20}$/;
const safeNext = (n: string) => (n.startsWith("/") && !n.startsWith("//") && !n.startsWith("/admin") ? n : "/tai-khoan");

/* ───────── Tài khoản khách hàng ───────── */
export async function customerRegister(_: ShopState, f: FormData): Promise<ShopState> {
  const name = str(f, "name", 80), email = str(f, "email", 160).toLowerCase(), phone = str(f, "phone", 30);
  const pw = String(f.get("password") ?? "");
  if (name.length < 2) return { error: "Nhập họ tên." };
  if (!EMAIL.test(email)) return { error: "Email chưa đúng định dạng." };
  if (!PHONE.test(phone)) return { error: "Số điện thoại chưa đúng định dạng." };
  if (pw.length < 8) return { error: "Mật khẩu cần ít nhất 8 ký tự." };
  if (pw !== String(f.get("password2") ?? "")) return { error: "Hai lần nhập mật khẩu không khớp." };
  if (await db.getCustomerByEmail(email)) return { error: "Email này đã có tài khoản. Hãy đăng nhập." };
  const c = await db.createCustomer({ name, email, phone, pass: await hashPassword(pw) });
  await startCustomerSession(c);
  redirect(safeNext(str(f, "next")));
}

export async function customerLogin(_: ShopState, f: FormData): Promise<ShopState> {
  const email = str(f, "email", 160).toLowerCase(), pw = String(f.get("password") ?? "");
  const key = "c:" + email;
  if (tooManyAttempts(key)) return { error: "Sai quá nhiều lần. Thử lại sau 15 phút." };
  const c = await db.getCustomerByEmail(email);
  if (!c || !(await verifyPassword(pw, c.pass))) {
    recordFail(key);
    await new Promise((r) => setTimeout(r, 400));
    return { error: "Email hoặc mật khẩu không đúng." };
  }
  if (c.status !== "ACTIVE") return { error: "Tài khoản đã bị khoá. Liên hệ cửa hàng để được hỗ trợ." };
  clearFails(key);
  await db.updateCustomer(c.id, { lastLogin: new Date().toISOString() });
  await startCustomerSession(c);
  redirect(safeNext(str(f, "next")));
}

export async function customerLogout() {
  await endCustomerSession();
  redirect("/");
}

export async function updateProfile(_: ShopState, f: FormData): Promise<ShopState> {
  const c = await requireCustomer();
  const name = str(f, "name", 80), phone = str(f, "phone", 30);
  if (name.length < 2) return { error: "Nhập họ tên." };
  if (!PHONE.test(phone)) return { error: "Số điện thoại chưa đúng định dạng." };
  await db.updateCustomer(c.id, { name, phone, address: str(f, "address", 300), company: str(f, "company", 160) });
  revalidatePath("/tai-khoan");
  return { ok: true, message: "Đã lưu thông tin." };
}

export async function changeCustomerPassword(_: ShopState, f: FormData): Promise<ShopState> {
  const c = await requireCustomer();
  const pw = String(f.get("password") ?? "");
  if (!(await verifyPassword(String(f.get("current") ?? ""), c.pass))) return { error: "Mật khẩu hiện tại không đúng." };
  if (pw.length < 8) return { error: "Mật khẩu mới cần ít nhất 8 ký tự." };
  if (pw !== String(f.get("password2") ?? "")) return { error: "Hai lần nhập mật khẩu mới không khớp." };
  const pass = await hashPassword(pw);
  await db.updateCustomer(c.id, { pass });
  await startCustomerSession({ ...c, pass });
  return { ok: true, message: "Đã đổi mật khẩu." };
}

/* ───────── Đặt hàng từ giỏ ───────── */
export type CheckoutInput = {
  items: { id: number; qty: number }[];
  name: string; phone: string; email: string; address: string; company: string; note: string;
  method: PaymentMethod;
};
export type CheckoutResult = { error?: string; code?: string; token?: string };

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  try {
    const name = String(input.name ?? "").trim().slice(0, 120), phone = String(input.phone ?? "").trim().slice(0, 30);
    const email = String(input.email ?? "").trim().slice(0, 160), address = String(input.address ?? "").trim().slice(0, 300);
    if (name.length < 2) return { error: "Nhập họ tên người nhận." };
    if (!PHONE.test(phone)) return { error: "Số điện thoại chưa đúng định dạng." };
    if (email && !EMAIL.test(email)) return { error: "Email chưa đúng định dạng." };
    if (address.length < 8) return { error: "Nhập địa chỉ giao hàng đầy đủ." };
    const shop = await db.getShop();
    const bankReady = Boolean(shop.bankName && shop.bankAccount && shop.bankHolder);
    if (input.method !== "COD" && input.method !== "BANK") return { error: "Chọn cách thanh toán." };
    if (input.method === "COD" && !shop.cod) return { error: "Cửa hàng tạm ngưng nhận thanh toán khi nhận hàng." };
    if (input.method === "BANK" && !bankReady) return { error: "Cửa hàng chưa mở thanh toán chuyển khoản." };

    // Giá lấy lại từ database, không tin giá do trình duyệt gửi lên.
    const products = await db.listProducts();
    const items: OrderItem[] = [];
    for (const it of (input.items ?? []).slice(0, 50)) {
      const p = products.find((x) => x.id === Number(it.id));
      const qty = Math.floor(Number(it.qty));
      if (!p || !(qty > 0)) continue;
      if (p.price <= 0) return { error: `“${p.name}” chưa có giá bán lẻ. Hãy gửi yêu cầu báo giá cho sản phẩm này.` };
      if (qty < p.moq) return { error: `“${p.name}” cần đặt tối thiểu ${p.moq.toLocaleString("vi-VN")} ${p.unit}.` };
      items.push({ productId: p.id, name: p.name, qty: Math.min(qty, 10_000_000), unit: p.unit, price: p.price, straw: p.strawGrams });
    }
    if (items.length === 0) return { error: "Giỏ hàng đang trống." };
    const subtotal = items.reduce((t, i) => t + i.qty * i.price, 0);
    const me = await currentCustomer();
    const order = await db.createOrder(
      { kind: CHECKOUT_KIND, name, phone, email: email || me?.email || "", company: String(input.company ?? "").trim().slice(0, 160), address, note: String(input.note ?? "").trim().slice(0, 3000), items, images: [] },
      { customerId: me?.id ?? null, paymentMethod: input.method, shippingFee: shippingFor(shop, subtotal), subtotal },
    );
    if (me && (!me.address || !me.phone)) await db.updateCustomer(me.id, { address: me.address || address, phone: me.phone || phone });
    revalidatePath("/admin", "layout");
    return { code: order.code, token: order.token };
  } catch (e) {
    console.error(e);
    return { error: "Chưa đặt được hàng. Kiểm tra kết nối rồi thử lại." };
  }
}

/* ───────── Quản trị: cửa hàng, khách hàng, thư viện ảnh ───────── */
export async function saveShopAction(_: ShopState, f: FormData): Promise<ShopState> {
  await requireOwner();
  const n = (k: string) => Math.max(0, Math.min(1_000_000_000, Math.floor(Number(f.get(k) || 0))));
  await db.saveShop({
    shipFee: n("shipFee"), freeShipOver: n("freeShipOver"), cod: f.get("cod") === "on",
    bankName: str(f, "bankName", 120), bankAccount: str(f, "bankAccount", 40), bankHolder: str(f, "bankHolder", 120),
    shipNote: str(f, "shipNote", 400),
  });
  revalidatePath("/", "layout");
  return { ok: true, message: "Đã lưu cài đặt cửa hàng." };
}

export async function manageCustomerAction(f: FormData): Promise<ShopState> {
  await requireAdmin();
  const id = Number(f.get("id")), op = String(f.get("op"));
  const c = await db.getCustomer(id);
  if (!c) return { error: "Không tìm thấy khách hàng." };
  if (op === "lock") await db.updateCustomer(id, { status: "LOCKED" });
  else if (op === "unlock") await db.updateCustomer(id, { status: "ACTIVE" });
  else if (op === "reset") {
    const tmp = Array.from(crypto.getRandomValues(new Uint8Array(10)), (b) => "abcdefghjkmnpqrstuvwxyz23456789"[b % 31]).join("");
    await db.updateCustomer(id, { pass: await hashPassword(tmp) });
    return { ok: true, message: `Mật khẩu tạm của ${c.email}: ${tmp} (chỉ hiện một lần).` };
  } else return { error: "Thao tác không hợp lệ." };
  revalidatePath("/admin/khach-hang");
  return { ok: true, message: "Đã cập nhật." };
}

export async function uploadMediaAction(f: FormData): Promise<ShopState & { url?: string }> {
  await requireAdmin();
  const file = f.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Chưa chọn ảnh." };
  try {
    const url = await storeImage(file, "media");
    await db.addMedia({ url, name: file.name.slice(0, 160), size: file.size });
    revalidatePath("/admin/thu-vien");
    return { ok: true, url };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteMediaAction(f: FormData): Promise<ShopState> {
  await requireAdmin();
  const m = await db.deleteMedia(Number(f.get("id")));
  if (m && hasBlob && m.url.includes(".public.blob.vercel-storage.com/")) await del(m.url).catch(() => {});
  revalidatePath("/admin/thu-vien");
  return { ok: true, message: "Đã xoá ảnh khỏi thư viện." };
}
