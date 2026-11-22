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

export type OrderStatus = "NEW" | "QUOTING" | "QUOTED" | "CONFIRMED" | "DONE" | "CANCELLED";

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
