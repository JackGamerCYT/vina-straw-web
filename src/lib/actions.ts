"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as db from "./db";
import { endSession, isAdmin, requireAdmin } from "./auth";
import { storeImages } from "./upload";
import { slugify } from "./format";
import { CHECKOUT_KIND, EDITABLE, ORDER_KINDS, type OrderItem, type OrderStatus, type PaymentStatus, type Settings, type Spec } from "./types";

export type FormState = { ok?: boolean; error?: string; code?: string; token?: string } | undefined;

const str = (f: FormData, k: string, max = 2000) => String(f.get(k) ?? "").trim().slice(0, max);
const files = (f: FormData, k: string) => f.getAll(k).filter((v): v is File => v instanceof File && v.size > 0);

/* ───────── Khách hàng: gửi yêu cầu báo giá / đặt hàng ───────── */
async function readOrderForm(f: FormData) {
  const kind = str(f, "kind", 60);
  const name = str(f, "name", 120);
  const phone = str(f, "phone", 30);
  const email = str(f, "email", 160);
  if (!ORDER_KINDS.includes(kind as (typeof ORDER_KINDS)[number])) return { error: "Chọn loại yêu cầu." } as const;
  if (name.length < 2) return { error: "Nhập họ và tên người liên hệ." } as const;
  if (!/^[0-9+().\s-]{8,20}$/.test(phone)) return { error: "Số điện thoại chưa đúng định dạng." } as const;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Email chưa đúng định dạng." } as const;

  const sample = kind === "Đặt mẫu thử", partner = kind === "Hợp tác phân phối";
  const products = await db.listProducts();
  const items: OrderItem[] = [];
  for (const p of products) {
    let qty = Math.max(0, Math.min(10_000_000, Math.floor(Number(f.get(`qty_${p.id}`) || 0))));
    if (sample) qty = f.get(`sample_${p.id}`) ? 1 : 0;
    if (qty > 0) items.push({ productId: p.id, name: p.name, qty, unit: sample ? "bộ mẫu" : p.unit, price: sample ? 0 : p.price, straw: sample ? 0 : p.strawGrams });
  }
  if (sample && items.length === 0) return { error: "Chọn ít nhất một sản phẩm muốn nhận mẫu." } as const;
  if (!sample && !partner && items.length === 0) return { error: "Chọn ít nhất một sản phẩm và số lượng." } as const;
  if (sample && items.length > 6) return { error: "Mỗi lần nhận tối đa 6 mẫu." } as const;

  const address = str(f, "address", 300);
  if ((sample || kind === "Đặt hàng") && address.length < 6) return { error: "Nhập địa chỉ giao hàng." } as const;

  let note = str(f, "note", 3000);
  if (partner) {
    const region = str(f, "region", 160), channel = str(f, "channel", 160), volume = str(f, "volume", 160);
    if (region.length < 2) return { error: "Nhập khu vực bạn muốn phân phối." } as const;
    const head = [`Khu vực phân phối: ${region}`, channel && `Kênh bán: ${channel}`, volume && `Sản lượng dự kiến / tháng: ${volume}`].filter(Boolean).join("\n");
    note = note.replace(/^Khu vực phân phối:[\s\S]*?(\n\n|$)/, "");
    note = head + (note ? "\n\n" + note : "");
  }

  return {
    data: {
      kind, name, phone, email,
      company: str(f, "company", 160),
      address,
      note,
      items,
    },
  } as const;
}

export async function submitOrder(_: FormState, f: FormData): Promise<FormState> {
  try {
    const r = await readOrderForm(f);
    if ("error" in r) return { error: r.error };
    const images = await storeImages(files(f, "images"), "orders", 6);
    const order = await db.createOrder({ ...r.data, images });
    revalidatePath("/admin");
    return { ok: true, code: order.code, token: order.token };
  } catch (e) {
    console.error(e);
    return { error: "Chưa gửi được yêu cầu. Kiểm tra kết nối rồi thử lại." };
  }
}

export async function updateMyOrder(_: FormState, f: FormData): Promise<FormState> {
  const code = str(f, "code", 20), token = str(f, "token", 64);
  const order = await db.getOrderByCode(code);
  if (!order || order.token !== token) return { error: "Liên kết chỉnh sửa không hợp lệ." };
  if (order.kind === CHECKOUT_KIND) return { error: "Đơn mua hàng không sửa trực tuyến được. Hãy liên hệ cửa hàng để điều chỉnh." };
  if (!EDITABLE.includes(order.status)) return { error: "Đơn đã được xác nhận nên không sửa được nữa. Hãy liên hệ để điều chỉnh." };
  const r = await readOrderForm(f);
  if ("error" in r) return { error: r.error };
  const keep = f.getAll("keep").map(String).filter((u) => order.images.includes(u));
  const added = await storeImages(files(f, "images"), "orders", Math.max(0, 6 - keep.length));
  await db.updateOrderCustomer(code, { ...r.data, images: [...keep, ...added] });
  revalidatePath(`/don-hang/${code}`);
  revalidatePath("/admin");
  return { ok: true };
}

export async function lookupOrder(_: FormState, f: FormData): Promise<FormState> {
  const code = str(f, "code", 20).toUpperCase();
  const phone = str(f, "phone", 30).replace(/\D/g, "");
  const order = await db.getOrderByCode(code.startsWith("VS-") ? code : `VS-${code}`);
  if (!order || order.phone.replace(/\D/g, "") !== phone) return { error: "Không tìm thấy đơn khớp mã và số điện thoại." };
  redirect(`/don-hang/${order.code}?k=${order.token}`);
}

/* ───────── Quản trị ───────── */
export async function logout() {
  await endSession();
  redirect("/");
}

function readSpecs(f: FormData): Spec[] {
  const ks = f.getAll("spec_k").map(String), vs = f.getAll("spec_v").map(String);
  return ks.map((k, i) => ({ k: k.trim(), v: (vs[i] ?? "").trim() })).filter((s) => s.k && s.v).slice(0, 20);
}

export async function saveProductAction(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const id = Number(f.get("id") || 0) || undefined;
  const name = str(f, "name", 160);
  if (!name) return { error: "Nhập tên sản phẩm." };
  const keep = f.getAll("keep").map(String);
  let added: string[] = [];
  try {
    added = await storeImages(files(f, "images"), "products", 10);
  } catch (e) {
    return { error: (e as Error).message };
  }
  const order = String(f.get("order") || "");
  let images = [...keep, ...added];
  if (order) {
    // thứ tự người dùng sắp; "new:i" là ảnh mới thứ i trong lần gửi này
    const ord = order.split("|").map((t) => (t.startsWith("new:") ? added[Number(t.slice(4))] : t)).filter((u): u is string => Boolean(u) && images.includes(u));
    images = [...new Set([...ord, ...images])];
  }
  const p = await db.saveProduct({
    id,
    name,
    slug: slugify(str(f, "slug", 80) || name) || `sp-${Date.now()}`,
    line: str(f, "line", 80),
    short: str(f, "short", 300),
    description: str(f, "description", 6000),
    price: Math.max(0, Math.floor(Number(f.get("price") || 0))),
    unit: str(f, "unit", 20) || "cái",
    moq: Math.max(1, Math.floor(Number(f.get("moq") || 1))),
    specs: readSpecs(f),
    images,
    featured: f.get("featured") === "on",
    active: f.get("active") === "on",
    sort: Math.floor(Number(f.get("sort") || 0)),
    strawGrams: Math.max(0, Math.min(10_000_000, Math.round(Number(f.get("strawGrams") || 0)))),
  });
  revalidatePath("/", "layout");
  if (!id) redirect(`/admin/san-pham/${p.id}?saved=1`);
  return { ok: true };
}

export async function deleteProductAction(f: FormData) {
  await requireAdmin();
  await db.deleteProduct(Number(f.get("id")));
  revalidatePath("/", "layout");
  redirect("/admin/san-pham");
}

export async function saveSettingsAction(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const keys: (keyof Settings)[] = ["heroTitle", "heroLead", "aboutTitle", "aboutBody", "contactEmail", "contactPhone", "contactAddress", "team"];
  const s: Partial<Settings> = {};
  for (const k of keys) s[k] = str(f, k, 4000);
  try {
    const [poster] = await storeImages(files(f, "heroPoster"), "site", 1);
    if (poster) s.heroPoster = poster;
  } catch (e) {
    return { error: (e as Error).message };
  }
  if (f.get("resetPoster") === "on") s.heroPoster = "/video/hero-poster.jpg";
  await db.saveSettings(s);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateOrderAdminAction(f: FormData) {
  await requireAdmin();
  const ps = String(f.get("paymentStatus") || "UNPAID");
  await db.updateOrderAdmin(Number(f.get("id")), {
    status: String(f.get("status")) as OrderStatus,
    quote: str(f, "quote", 2000),
    adminNote: str(f, "adminNote", 2000),
    paymentStatus: (["UNPAID", "PAID", "REFUNDED"].includes(ps) ? ps : "UNPAID") as PaymentStatus,
    shippingFee: Math.max(0, Math.floor(Number(f.get("shippingFee") || 0))),
  });
  revalidatePath("/admin", "layout");
}

export async function deleteOrderAction(f: FormData) {
  await requireAdmin();
  await db.deleteOrder(Number(f.get("id")));
  revalidatePath("/admin", "layout");
}

export async function adminCheck() {
  return isAdmin();
}
