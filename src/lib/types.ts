export type Spec = { k: string; v: string };

export type Product = {
  id: number;
  slug: string;
  name: string;
  line: string;
  short: string;
  description: string;
  price: number;
  unit: string;
  moq: number;
  specs: Spec[];
  images: string[];
  featured: boolean;
  active: boolean;
  sort: number;
};

export type OrderItem = { productId: number; name: string; qty: number; unit: string; price: number };

export type OrderStatus = "NEW" | "QUOTING" | "QUOTED" | "CONFIRMED" | "SHIPPING" | "DONE" | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";
export type PaymentMethod = "" | "COD" | "BANK";

export type Order = {
  id: number;
  code: string;
  token: string;
  kind: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  address: string;
  items: OrderItem[];
  note: string;
  images: string[];
  status: OrderStatus;
  quote: string;
  adminNote: string;
  createdAt: string;
  updatedAt: string;
  customerId: number | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingFee: number;
  subtotal: number;
};

export type Settings = {
  heroTitle: string;
  heroLead: string;
  heroVideo: string;
  heroPoster: string;
  aboutTitle: string;
  aboutBody: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  team: string;
};

export const ORDER_KINDS = ["Nhận báo giá", "Đặt hàng", "Đặt mẫu thử", "Hợp tác phân phối"] as const;

export const STATUS_LABEL: Record<OrderStatus, string> = {
  NEW: "Mới gửi",
  QUOTING: "Đang báo giá",
  QUOTED: "Đã báo giá",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  DONE: "Hoàn tất",
  CANCELLED: "Đã huỷ",
};

/** Khách còn sửa được đơn khi đơn chưa được xác nhận. */
export const EDITABLE: OrderStatus[] = ["NEW", "QUOTING", "QUOTED"];

export type AdminRole = "OWNER" | "EDITOR";
export type AdminStatus = "PENDING" | "ACTIVE" | "LOCKED";
export type AdminUser = {
  id: number;
  email: string;
  name: string;
  pass: string;
  role: AdminRole;
  status: AdminStatus;
  createdAt: string;
  lastLogin: string | null;
};
export const ROLE_LABEL: Record<AdminRole, string> = { OWNER: "Chủ trang", EDITOR: "Biên tập" };
export const ADMIN_STATUS_LABEL: Record<AdminStatus, string> = { PENDING: "Chờ duyệt", ACTIVE: "Đang hoạt động", LOCKED: "Đã khoá" };

/** Đơn tạo từ giỏ hàng (khác với yêu cầu báo giá). */
export const CHECKOUT_KIND = "Mua hàng";
export const PAYMENT_LABEL: Record<PaymentStatus, string> = { UNPAID: "Chưa thanh toán", PAID: "Đã thanh toán", REFUNDED: "Đã hoàn tiền" };
export const METHOD_LABEL: Record<Exclude<PaymentMethod, "">, string> = { COD: "Thanh toán khi nhận hàng (COD)", BANK: "Chuyển khoản ngân hàng" };

export type Customer = {
  id: number;
  email: string;
  name: string;
  phone: string;
  address: string;
  company: string;
  pass: string;
  status: "ACTIVE" | "LOCKED";
  createdAt: string;
  lastLogin: string | null;
};

export type Media = { id: number; url: string; name: string; size: number; createdAt: string };

/** Cấu hình bán hàng, chủ trang sửa ở /admin/cai-dat. */
export type Shop = {
  shipFee: number;
  freeShipOver: number;
  cod: boolean;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  shipNote: string;
};
export const DEFAULT_SHOP: Shop = {
  shipFee: 0,
  freeShipOver: 0,
  cod: true,
  bankName: "",
  bankAccount: "",
  bankHolder: "",
  shipNote: "Phí giao hàng được xác nhận khi chúng tôi gọi lại chốt đơn.",
};

export function shippingFor(shop: Shop, subtotal: number) {
  return shop.freeShipOver > 0 && subtotal >= shop.freeShipOver ? 0 : shop.shipFee;
}
