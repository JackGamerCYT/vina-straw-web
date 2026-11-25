import "server-only";
import { neon } from "@neondatabase/serverless";
import { DEFAULT_SETTINGS, REAL_SLUGS, SEED_POSTS, SEED_PRODUCTS } from "./seed";
import { DEFAULT_SHOP } from "./types";
import type { AdminRole, AdminStatus, AdminUser, Customer, Media, Message, Post, Subscriber, Order, OrderItem, OrderStatus, PaymentMethod, PaymentStatus, Product, Settings, Shop, Spec } from "./types";

const URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
// Chỉ dùng khi kiểm thử trên máy: Postgres thật chạy trong tiến trình (PGlite).
const PGLITE = !URL && process.env.PGLITE_DIR ? process.env.PGLITE_DIR : "";
export const hasDatabase = Boolean(URL || PGLITE);

type Row = Record<string, unknown>;
const sqlClient = URL ? neon(URL) : null;
let lite: Promise<{ query: (t: string, p: unknown[]) => Promise<{ rows: unknown[] }> }> | null = null;
async function q<T = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  if (sqlClient) return (await sqlClient.query(text, params)) as T[];
  const gl = globalThis as unknown as { __vsLite?: typeof lite };
  if (!gl.__vsLite) gl.__vsLite = import(/* webpackIgnore: true */ "@electric-sql/pglite").then(({ PGlite }) => new PGlite(PGLITE));
  lite = gl.__vsLite;
  return (await (await lite!).query(text, params)).rows as T[];
}

/* ───────── Bộ nhớ tạm khi chưa nối Postgres (chỉ để xem thử) ───────── */
type Mem = { products: Product[]; orders: Order[]; settings: Settings; seq: number; admins: AdminUser[]; kv: Record<string, unknown>; customers: Customer[]; media: Media[]; posts: Post[]; messages: Message[]; subs: Subscriber[] };
const g = globalThis as unknown as { __vsMem?: Mem; __vsReady?: Promise<void> };
function mem(): Mem {
  if (!g.__vsMem) {
    g.__vsMem = {
      products: SEED_PRODUCTS.map((p, i) => ({ ...p, id: i + 1 })),
      orders: [],
      settings: { ...DEFAULT_SETTINGS },
      seq: 100,
      admins: [],
      kv: {},
      customers: [],
      media: [],
      posts: SEED_POSTS.map((p, i) => ({ ...p, id: i + 1, createdAt: new Date(Date.now() - i * 86400_000).toISOString(), updatedAt: new Date().toISOString() })),
      messages: [],
      subs: [],
    };
  }
  return g.__vsMem;
}

/* ───────── Khởi tạo bảng + dữ liệu mẫu ───────── */
async function init() {
  await q(`CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL, line TEXT NOT NULL DEFAULT '',
    short TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '', price INTEGER NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'cái', moq INTEGER NOT NULL DEFAULT 1, specs JSONB NOT NULL DEFAULT '[]',
    images JSONB NOT NULL DEFAULT '[]', featured BOOLEAN NOT NULL DEFAULT false, active BOOLEAN NOT NULL DEFAULT true,
    sort INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
  await q(`CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY, code TEXT UNIQUE NOT NULL, token TEXT NOT NULL, kind TEXT NOT NULL,
    name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT NOT NULL DEFAULT '', company TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '', items JSONB NOT NULL DEFAULT '[]', note TEXT NOT NULL DEFAULT '',
    images JSONB NOT NULL DEFAULT '[]', status TEXT NOT NULL DEFAULT 'NEW', quote TEXT NOT NULL DEFAULT '',
    admin_note TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
  await q(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value JSONB NOT NULL)`);
  await q(`CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, pass TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'EDITOR', status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(), last_login TIMESTAMPTZ)`);
  await q(`CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '', company TEXT NOT NULL DEFAULT '', pass TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE', created_at TIMESTAMPTZ NOT NULL DEFAULT now(), last_login TIMESTAMPTZ)`);
  await q(`CREATE TABLE IF NOT EXISTS media (
    id SERIAL PRIMARY KEY, url TEXT NOT NULL, name TEXT NOT NULL DEFAULT '', size INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
  await q(`CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, excerpt TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL DEFAULT '', cover TEXT NOT NULL DEFAULT '', published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
  await q(`CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '',
    subject TEXT NOT NULL DEFAULT '', message TEXT NOT NULL, handled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
  await q(`CREATE TABLE IF NOT EXISTS subscribers (id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
  for (const col of [
    "customer_id INTEGER", "payment_method TEXT NOT NULL DEFAULT ''", "payment_status TEXT NOT NULL DEFAULT 'UNPAID'",
    "shipping_fee INTEGER NOT NULL DEFAULT 0", "subtotal INTEGER NOT NULL DEFAULT 0",
  ]) await q(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS ${col}`);
  await q(`ALTER TABLE products ADD COLUMN IF NOT EXISTS straw_g INTEGER NOT NULL DEFAULT 0`);
  const [{ n }] = await q<{ n: number }>(`SELECT count(*)::int AS n FROM products`);
  if (n === 0) {
    for (const p of SEED_PRODUCTS) {
      await q(
        `INSERT INTO products (slug,name,line,short,description,price,unit,moq,specs,images,featured,active,sort)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT (slug) DO NOTHING`,
        [p.slug, p.name, p.line, p.short, p.description, p.price, p.unit, p.moq, JSON.stringify(p.specs), JSON.stringify(p.images), p.featured, p.active, p.sort],
      );
    }
  }
  await migrate();
}

/* Thay đổi dữ liệu một lần cho database đã chạy (seed chỉ nạp khi bảng trống). */
const MIGRATIONS: { id: string; run: () => Promise<void> }[] = [
  {
    id: "2026-11-real-products",
    run: async () => {
      for (const p of SEED_PRODUCTS.filter((x) => REAL_SLUGS.includes(x.slug))) {
        await q(
          `INSERT INTO products (slug,name,line,short,description,price,unit,moq,specs,images,featured,active,sort)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT (slug) DO NOTHING`,
          [p.slug, p.name, p.line, p.short, p.description, p.price, p.unit, p.moq, JSON.stringify(p.specs), JSON.stringify(p.images), p.featured, p.active, p.sort],
        );
      }
    },
  },
];
MIGRATIONS.push({
  id: "2026-11-contact",
  run: async () => {
    for (const k of ["contactEmail", "contactPhone"] as const) {
      await q(`INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value`, [k, JSON.stringify(DEFAULT_SETTINGS[k])]);
    }
  },
});
MIGRATIONS.push({
  id: "2026-11-seed-posts",
  run: async () => {
    for (const p of SEED_POSTS) {
      await q(`INSERT INTO posts (slug,title,excerpt,body,cover,published) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (slug) DO NOTHING`, [p.slug, p.title, p.excerpt, p.body, p.cover, p.published]);
    }
  },
});
MIGRATIONS.push({
  id: "2026-11-straw-grams",
  run: async () => {
    // Lượng rơm ước tính cho các sản phẩm mẫu; chỉ ghi vào sản phẩm chưa có số liệu.
    for (const p of SEED_PRODUCTS) await q(`UPDATE products SET straw_g=$2 WHERE slug=$1 AND straw_g=0`, [p.slug, p.strawGrams]);
  },
});
MIGRATIONS.push({
  id: "2026-11-moq-10",
  // Bán lẻ từ 10 cái cho mọi sản phẩm.
  run: async () => { await q(`UPDATE products SET moq=10`); },
});
async function migrate() {
  const [row] = await q<{ value: string[] }>(`SELECT value FROM settings WHERE key='_migrations'`);
  const done = new Set(row?.value ?? []);
  for (const m of MIGRATIONS) {
    if (done.has(m.id)) continue;
    await m.run();
    done.add(m.id);
    await q(`INSERT INTO settings (key,value) VALUES ('_migrations',$1) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value`, [JSON.stringify([...done])]);
  }
}
async function ready() {
  if (!hasDatabase) return;
  if (!g.__vsReady) g.__vsReady = init().catch((e) => { g.__vsReady = undefined; throw e; });
  await g.__vsReady;
}

const toProduct = (r: Row): Product => ({
  id: Number(r.id), slug: String(r.slug), name: String(r.name), line: String(r.line), short: String(r.short),
  description: String(r.description), price: Number(r.price), unit: String(r.unit), moq: Number(r.moq),
  specs: (r.specs as Spec[]) ?? [], images: (r.images as string[]) ?? [], featured: Boolean(r.featured),
  active: Boolean(r.active), sort: Number(r.sort), strawGrams: Number(r.straw_g ?? 0),
});
const toOrder = (r: Row): Order => ({
  id: Number(r.id), code: String(r.code), token: String(r.token), kind: String(r.kind), name: String(r.name),
  phone: String(r.phone), email: String(r.email), company: String(r.company), address: String(r.address),
  items: (r.items as OrderItem[]) ?? [], note: String(r.note), images: (r.images as string[]) ?? [],
  status: r.status as OrderStatus, quote: String(r.quote), adminNote: String(r.admin_note),
  createdAt: new Date(r.created_at as string).toISOString(), updatedAt: new Date(r.updated_at as string).toISOString(),
  customerId: r.customer_id == null ? null : Number(r.customer_id),
  paymentMethod: (r.payment_method ?? "") as PaymentMethod, paymentStatus: (r.payment_status ?? "UNPAID") as PaymentStatus,
  shippingFee: Number(r.shipping_fee ?? 0), subtotal: Number(r.subtotal ?? 0),
});

/* ───────── Sản phẩm ───────── */
export async function listProducts(opts: { all?: boolean } = {}): Promise<Product[]> {
  await ready();
  if (!hasDatabase) return mem().products.filter((p) => opts.all || p.active).sort((a, b) => a.sort - b.sort);
  const rows = await q(`SELECT * FROM products ${opts.all ? "" : "WHERE active"} ORDER BY sort, id`);
  return rows.map(toProduct);
}
export async function getProductBySlug(slug: string) {
  await ready();
  if (!hasDatabase) return mem().products.find((p) => p.slug === slug) ?? null;
  const [r] = await q(`SELECT * FROM products WHERE slug=$1`, [slug]);
  return r ? toProduct(r) : null;
}
export async function getProduct(id: number) {
  await ready();
  if (!hasDatabase) return mem().products.find((p) => p.id === id) ?? null;
  const [r] = await q(`SELECT * FROM products WHERE id=$1`, [id]);
  return r ? toProduct(r) : null;
}
export async function saveProduct(p: Omit<Product, "id"> & { id?: number }): Promise<Product> {
  await ready();
  if (!hasDatabase) {
    const m = mem();
    if (p.id) { const i = m.products.findIndex((x) => x.id === p.id); m.products[i] = { ...(p as Product) }; return m.products[i]; }
    const np = { ...p, id: Math.max(0, ...m.products.map((x) => x.id)) + 1 } as Product; m.products.push(np); return np;
  }
  const vals = [p.slug, p.name, p.line, p.short, p.description, p.price, p.unit, p.moq, JSON.stringify(p.specs), JSON.stringify(p.images), p.featured, p.active, p.sort, p.strawGrams ?? 0];
  if (p.id) {
    const [r] = await q(`UPDATE products SET slug=$1,name=$2,line=$3,short=$4,description=$5,price=$6,unit=$7,moq=$8,specs=$9,images=$10,featured=$11,active=$12,sort=$13,straw_g=$14 WHERE id=$15 RETURNING *`, [...vals, p.id]);
    return toProduct(r);
  }
  const [r] = await q(`INSERT INTO products (slug,name,line,short,description,price,unit,moq,specs,images,featured,active,sort,straw_g) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`, vals);
  return toProduct(r);
}
export async function deleteProduct(id: number) {
  await ready();
  if (!hasDatabase) { const m = mem(); m.products = m.products.filter((p) => p.id !== id); return; }
  await q(`DELETE FROM products WHERE id=$1`, [id]);
}

/* ───────── Nội dung trang ───────── */
export async function getSettings(): Promise<Settings> {
  await ready();
  if (!hasDatabase) return mem().settings;
  const rows = await q<{ key: string; value: unknown }>(`SELECT key, value FROM settings`);
  const s = { ...DEFAULT_SETTINGS } as Record<string, unknown>;
  for (const r of rows) if (r.key in s) s[r.key] = r.value;
  return s as Settings;
}
export async function saveSettings(s: Partial<Settings>) {
  await ready();
  if (!hasDatabase) { Object.assign(mem().settings, s); return; }
  for (const [k, v] of Object.entries(s)) {
    await q(`INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value`, [k, JSON.stringify(v)]);
  }
}

/* ───────── Đơn hàng / yêu cầu báo giá ───────── */
type NewOrder = Pick<Order, "kind" | "name" | "phone" | "email" | "company" | "address" | "items" | "note" | "images">;
type Pay = Partial<Pick<Order, "customerId" | "paymentMethod" | "shippingFee" | "subtotal">>;
function makeCode() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += a[Math.floor(Math.random() * a.length)];
  return `VS-${s}`;
}
function makeToken() {
  return crypto.randomUUID().replace(/-/g, "");
}
export async function createOrder(o: NewOrder, pay: Pay = {}): Promise<Order> {
  await ready();
  const code = makeCode(), token = makeToken();
  const p = { customerId: pay.customerId ?? null, paymentMethod: pay.paymentMethod ?? "", shippingFee: pay.shippingFee ?? 0, subtotal: pay.subtotal ?? o.items.reduce((t, i) => t + i.qty * i.price, 0) };
  if (!hasDatabase) {
    const m = mem(); const now = new Date().toISOString();
    const order: Order = { ...o, ...p, paymentStatus: "UNPAID", id: ++m.seq, code, token, status: "NEW", quote: "", adminNote: "", createdAt: now, updatedAt: now };
    m.orders.unshift(order); return order;
  }
  const [r] = await q(
    `INSERT INTO orders (code,token,kind,name,phone,email,company,address,items,note,images,customer_id,payment_method,shipping_fee,subtotal)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
    [code, token, o.kind, o.name, o.phone, o.email, o.company, o.address, JSON.stringify(o.items), o.note, JSON.stringify(o.images), p.customerId, p.paymentMethod, p.shippingFee, p.subtotal],
  );
  return toOrder(r);
}
export async function listOrdersByCustomer(customerId: number): Promise<Order[]> {
  await ready();
  if (!hasDatabase) return mem().orders.filter((o) => o.customerId === customerId);
  return (await q(`SELECT * FROM orders WHERE customer_id=$1 ORDER BY created_at DESC LIMIT 200`, [customerId])).map(toOrder);
}
export async function getOrderByCode(code: string) {
  await ready();
  if (!hasDatabase) return mem().orders.find((o) => o.code === code) ?? null;
  const [r] = await q(`SELECT * FROM orders WHERE code=$1`, [code]);
  return r ? toOrder(r) : null;
}
export async function updateOrderCustomer(code: string, o: NewOrder) {
  await ready();
  if (!hasDatabase) { const x = mem().orders.find((v) => v.code === code); if (x) Object.assign(x, o, { updatedAt: new Date().toISOString() }); return; }
  await q(
    `UPDATE orders SET kind=$2,name=$3,phone=$4,email=$5,company=$6,address=$7,items=$8,note=$9,images=$10,subtotal=$11,updated_at=now() WHERE code=$1`,
    [code, o.kind, o.name, o.phone, o.email, o.company, o.address, JSON.stringify(o.items), o.note, JSON.stringify(o.images), o.items.reduce((t, i) => t + i.qty * i.price, 0)],
  );
}
export async function listOrders(): Promise<Order[]> {
  await ready();
  if (!hasDatabase) return mem().orders;
  return (await q(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 500`)).map(toOrder);
}
export async function updateOrderAdmin(id: number, d: { status: OrderStatus; quote: string; adminNote: string; paymentStatus: PaymentStatus; shippingFee: number }) {
  await ready();
  if (!hasDatabase) { const x = mem().orders.find((v) => v.id === id); if (x) Object.assign(x, d, { updatedAt: new Date().toISOString() }); return; }
  await q(`UPDATE orders SET status=$2, quote=$3, admin_note=$4, payment_status=$5, shipping_fee=$6, updated_at=now() WHERE id=$1`, [id, d.status, d.quote, d.adminNote, d.paymentStatus, d.shippingFee]);
}
export async function deleteOrder(id: number) {
  await ready();
  if (!hasDatabase) { const m = mem(); m.orders = m.orders.filter((o) => o.id !== id); return; }
  await q(`DELETE FROM orders WHERE id=$1`, [id]);
}

/* ───────── Giá trị nội bộ (khoá bí mật, chữ/ảnh sửa trực tiếp) ───────── */
export async function getKv<T>(key: string): Promise<T | undefined> {
  await ready();
  if (!hasDatabase) return mem().kv[key] as T | undefined;
  const [r] = await q<{ value: T }>(`SELECT value FROM settings WHERE key=$1`, [key]);
  return r?.value;
}
export async function setKv(key: string, value: unknown) {
  await ready();
  if (!hasDatabase) { mem().kv[key] = value; return; }
  await q(`INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value`, [key, JSON.stringify(value)]);
}
/** Chỉ ghi khi khoá chưa có; trả về giá trị đang được dùng. */
export async function initKv<T>(key: string, value: T): Promise<T> {
  await ready();
  if (!hasDatabase) { const m = mem(); if (!(key in m.kv)) m.kv[key] = value; return m.kv[key] as T; }
  await q(`INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING`, [key, JSON.stringify(value)]);
  return (await getKv<T>(key)) as T;
}

/* ───────── Tài khoản quản trị ───────── */
const toAdmin = (r: Row): AdminUser => ({
  id: Number(r.id), email: String(r.email), name: String(r.name), pass: String(r.pass),
  role: r.role as AdminRole, status: r.status as AdminStatus,
  createdAt: new Date(r.created_at as string).toISOString(),
  lastLogin: r.last_login ? new Date(r.last_login as string).toISOString() : null,
});
export async function listAdmins(): Promise<AdminUser[]> {
  await ready();
  if (!hasDatabase) return [...mem().admins];
  return (await q(`SELECT * FROM admins ORDER BY created_at`)).map(toAdmin);
}
export async function countAdmins() {
  await ready();
  if (!hasDatabase) return mem().admins.length;
  const [{ n }] = await q<{ n: number }>(`SELECT count(*)::int AS n FROM admins`);
  return n;
}
export async function getAdmin(id: number) {
  await ready();
  if (!hasDatabase) return mem().admins.find((a) => a.id === id) ?? null;
  const [r] = await q(`SELECT * FROM admins WHERE id=$1`, [id]);
  return r ? toAdmin(r) : null;
}
export async function getAdminByEmail(email: string) {
  await ready();
  if (!hasDatabase) return mem().admins.find((a) => a.email === email) ?? null;
  const [r] = await q(`SELECT * FROM admins WHERE email=$1`, [email]);
  return r ? toAdmin(r) : null;
}
export async function createAdmin(a: { email: string; name: string; pass: string; role: AdminRole; status: AdminStatus }) {
  await ready();
  if (!hasDatabase) {
    const m = mem();
    const u: AdminUser = { ...a, id: Math.max(0, ...m.admins.map((x) => x.id)) + 1, createdAt: new Date().toISOString(), lastLogin: null };
    m.admins.push(u); return u;
  }
  const [r] = await q(`INSERT INTO admins (email,name,pass,role,status) VALUES ($1,$2,$3,$4,$5) RETURNING *`, [a.email, a.name, a.pass, a.role, a.status]);
  return toAdmin(r);
}
export async function updateAdmin(id: number, d: Partial<Pick<AdminUser, "name" | "pass" | "role" | "status" | "lastLogin">>) {
  await ready();
  if (!hasDatabase) { const x = mem().admins.find((a) => a.id === id); if (x) Object.assign(x, d); return; }
  const cols: Record<string, string> = { name: "name", pass: "pass", role: "role", status: "status", lastLogin: "last_login" };
  const keys = Object.keys(d).filter((k) => k in cols) as (keyof typeof d)[];
  if (!keys.length) return;
  await q(`UPDATE admins SET ${keys.map((k, i) => `${cols[k]}=$${i + 2}`).join(",")} WHERE id=$1`, [id, ...keys.map((k) => d[k])]);
}
export async function deleteAdmin(id: number) {
  await ready();
  if (!hasDatabase) { const m = mem(); m.admins = m.admins.filter((a) => a.id !== id); return; }
  await q(`DELETE FROM admins WHERE id=$1`, [id]);
}

/* ───────── Khách hàng ───────── */
const toCustomer = (r: Row): Customer => ({
  id: Number(r.id), email: String(r.email), name: String(r.name), phone: String(r.phone), address: String(r.address),
  company: String(r.company), pass: String(r.pass), status: r.status as Customer["status"],
  createdAt: new Date(r.created_at as string).toISOString(),
  lastLogin: r.last_login ? new Date(r.last_login as string).toISOString() : null,
});
export async function getCustomer(id: number) {
  await ready();
  if (!hasDatabase) return mem().customers.find((c) => c.id === id) ?? null;
  const [r] = await q(`SELECT * FROM customers WHERE id=$1`, [id]);
  return r ? toCustomer(r) : null;
}
export async function getCustomerByEmail(email: string) {
  await ready();
  if (!hasDatabase) return mem().customers.find((c) => c.email === email) ?? null;
  const [r] = await q(`SELECT * FROM customers WHERE email=$1`, [email]);
  return r ? toCustomer(r) : null;
}
export async function createCustomer(c: Pick<Customer, "email" | "name" | "phone" | "pass">) {
  await ready();
  if (!hasDatabase) {
    const m = mem();
    const u: Customer = { ...c, address: "", company: "", status: "ACTIVE", id: Math.max(0, ...m.customers.map((x) => x.id)) + 1, createdAt: new Date().toISOString(), lastLogin: null };
    m.customers.push(u); return u;
  }
  const [r] = await q(`INSERT INTO customers (email,name,phone,pass) VALUES ($1,$2,$3,$4) RETURNING *`, [c.email, c.name, c.phone, c.pass]);
  return toCustomer(r);
}
export async function updateCustomer(id: number, d: Partial<Pick<Customer, "name" | "phone" | "address" | "company" | "pass" | "status" | "lastLogin">>) {
  await ready();
  if (!hasDatabase) { const x = mem().customers.find((c) => c.id === id); if (x) Object.assign(x, d); return; }
  const cols: Record<string, string> = { name: "name", phone: "phone", address: "address", company: "company", pass: "pass", status: "status", lastLogin: "last_login" };
  const keys = Object.keys(d).filter((k) => k in cols) as (keyof typeof d)[];
  if (!keys.length) return;
  await q(`UPDATE customers SET ${keys.map((k, i) => `${cols[k]}=$${i + 2}`).join(",")} WHERE id=$1`, [id, ...keys.map((k) => d[k])]);
}
export type CustomerRow = Customer & { orders: number; spent: number };
export async function listCustomers(): Promise<CustomerRow[]> {
  await ready();
  if (!hasDatabase) {
    const m = mem();
    return m.customers.map((c) => {
      const os = m.orders.filter((o) => o.customerId === c.id);
      return { ...c, orders: os.length, spent: os.filter((o) => o.paymentStatus === "PAID").reduce((t, o) => t + o.subtotal + o.shippingFee, 0) };
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  const rows = await q(`SELECT c.*, count(o.id)::int AS n,
      coalesce(sum(CASE WHEN o.payment_status='PAID' THEN o.subtotal + o.shipping_fee ELSE 0 END),0)::bigint AS spent
    FROM customers c LEFT JOIN orders o ON o.customer_id=c.id GROUP BY c.id ORDER BY c.created_at DESC LIMIT 1000`);
  return rows.map((r) => ({ ...toCustomer(r), orders: Number(r.n), spent: Number(r.spent) }));
}

/* ───────── Thư viện ảnh ───────── */
const toMedia = (r: Row): Media => ({ id: Number(r.id), url: String(r.url), name: String(r.name), size: Number(r.size), createdAt: new Date(r.created_at as string).toISOString() });
export async function listMedia(): Promise<Media[]> {
  await ready();
  if (!hasDatabase) return [...mem().media].reverse();
  return (await q(`SELECT * FROM media ORDER BY created_at DESC LIMIT 500`)).map(toMedia);
}
export async function addMedia(m: Pick<Media, "url" | "name" | "size">) {
  await ready();
  if (!hasDatabase) { const x = mem(); const r = { ...m, id: x.media.length + 1, createdAt: new Date().toISOString() }; x.media.push(r); return r; }
  const [r] = await q(`INSERT INTO media (url,name,size) VALUES ($1,$2,$3) RETURNING *`, [m.url, m.name, m.size]);
  return toMedia(r);
}
export async function deleteMedia(id: number) {
  await ready();
  if (!hasDatabase) { const x = mem(); const r = x.media.find((v) => v.id === id); x.media = x.media.filter((v) => v.id !== id); return r ?? null; }
  const [r] = await q(`DELETE FROM media WHERE id=$1 RETURNING *`, [id]);
  return r ? toMedia(r) : null;
}

/* ───────── Cấu hình bán hàng ───────── */
export async function getShop(): Promise<Shop> {
  return { ...DEFAULT_SHOP, ...((await getKv<Partial<Shop>>("shop")) ?? {}) };
}
export async function saveShop(s: Shop) {
  await setKv("shop", s);
}

/* ───────── Số liệu cho trang tổng quan ───────── */
export async function stats() {
  const [orders, customers, products] = await Promise.all([listOrders(), listCustomers(), listProducts({ all: true })]);
  const since = Date.now() - 30 * 86400_000;
  const live = orders.filter((o) => o.status !== "CANCELLED");
  const paid = live.filter((o) => o.paymentStatus === "PAID");
  return {
    newOrders: orders.filter((o) => o.status === "NEW").length,
    orders30: live.filter((o) => Date.parse(o.createdAt) >= since).length,
    revenue30: paid.filter((o) => Date.parse(o.createdAt) >= since).reduce((t, o) => t + o.subtotal + o.shippingFee, 0),
    revenueAll: paid.reduce((t, o) => t + o.subtotal + o.shippingFee, 0),
    unpaid: live.filter((o) => o.kind === "Mua hàng" && o.paymentStatus === "UNPAID").length,
    customers: customers.length,
    products: products.filter((p) => p.active).length,
    recent: orders.slice(0, 6),
  };
}

/* ───────── Tin tức ───────── */
const toPost = (r: Row): Post => ({
  id: Number(r.id), slug: String(r.slug), title: String(r.title), excerpt: String(r.excerpt), body: String(r.body), cover: String(r.cover),
  published: Boolean(r.published), createdAt: new Date(r.created_at as string).toISOString(), updatedAt: new Date(r.updated_at as string).toISOString(),
});
export async function listPosts({ all = false, limit = 100 } = {}): Promise<Post[]> {
  await ready();
  if (!hasDatabase) return mem().posts.filter((p) => all || p.published).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  return (await q(`SELECT * FROM posts ${all ? "" : "WHERE published"} ORDER BY created_at DESC LIMIT $1`, [limit])).map(toPost);
}
export async function getPost(slugOrId: string | number) {
  await ready();
  const byId = typeof slugOrId === "number";
  if (!hasDatabase) return mem().posts.find((p) => (byId ? p.id === slugOrId : p.slug === slugOrId)) ?? null;
  const [r] = await q(`SELECT * FROM posts WHERE ${byId ? "id" : "slug"}=$1`, [slugOrId]);
  return r ? toPost(r) : null;
}
export async function savePost(p: Omit<Post, "id" | "createdAt" | "updatedAt"> & { id?: number }) {
  await ready();
  if (!hasDatabase) {
    const m = mem(); const now = new Date().toISOString();
    if (p.id) { const x = m.posts.find((v) => v.id === p.id); if (x) Object.assign(x, p, { updatedAt: now }); return x!; }
    const n: Post = { ...p, id: Math.max(0, ...m.posts.map((v) => v.id)) + 1, createdAt: now, updatedAt: now }; m.posts.push(n); return n;
  }
  if (p.id) {
    const [r] = await q(`UPDATE posts SET slug=$2,title=$3,excerpt=$4,body=$5,cover=$6,published=$7,updated_at=now() WHERE id=$1 RETURNING *`, [p.id, p.slug, p.title, p.excerpt, p.body, p.cover, p.published]);
    return toPost(r);
  }
  const [r] = await q(`INSERT INTO posts (slug,title,excerpt,body,cover,published) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`, [p.slug, p.title, p.excerpt, p.body, p.cover, p.published]);
  return toPost(r);
}
export async function deletePost(id: number) {
  await ready();
  if (!hasDatabase) { const m = mem(); m.posts = m.posts.filter((p) => p.id !== id); return; }
  await q(`DELETE FROM posts WHERE id=$1`, [id]);
}

/* ───────── Liên hệ & nhận tin ───────── */
const toMsg = (r: Row): Message => ({ id: Number(r.id), name: String(r.name), email: String(r.email), phone: String(r.phone), subject: String(r.subject), message: String(r.message), handled: Boolean(r.handled), createdAt: new Date(r.created_at as string).toISOString() });
export async function addMessage(m: Omit<Message, "id" | "handled" | "createdAt">) {
  await ready();
  if (!hasDatabase) { const x = mem(); x.messages.unshift({ ...m, id: x.messages.length + 1, handled: false, createdAt: new Date().toISOString() }); return; }
  await q(`INSERT INTO messages (name,email,phone,subject,message) VALUES ($1,$2,$3,$4,$5)`, [m.name, m.email, m.phone, m.subject, m.message]);
}
export async function listMessages(): Promise<Message[]> {
  await ready();
  if (!hasDatabase) return [...mem().messages];
  return (await q(`SELECT * FROM messages ORDER BY created_at DESC LIMIT 500`)).map(toMsg);
}
export async function setMessageHandled(id: number, handled: boolean) {
  await ready();
  if (!hasDatabase) { const x = mem().messages.find((v) => v.id === id); if (x) x.handled = handled; return; }
  await q(`UPDATE messages SET handled=$2 WHERE id=$1`, [id, handled]);
}
export async function deleteMessage(id: number) {
  await ready();
  if (!hasDatabase) { const m = mem(); m.messages = m.messages.filter((v) => v.id !== id); return; }
  await q(`DELETE FROM messages WHERE id=$1`, [id]);
}
export async function addSubscriber(email: string) {
  await ready();
  if (!hasDatabase) { const m = mem(); if (!m.subs.some((s) => s.email === email)) m.subs.unshift({ id: m.subs.length + 1, email, createdAt: new Date().toISOString() }); return; }
  await q(`INSERT INTO subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING`, [email]);
}
export async function listSubscribers(): Promise<Subscriber[]> {
  await ready();
  if (!hasDatabase) return [...mem().subs];
  return (await q(`SELECT * FROM subscribers ORDER BY created_at DESC`)).map((r) => ({ id: Number(r.id), email: String(r.email), createdAt: new Date(r.created_at as string).toISOString() }));
}
export async function deleteSubscriber(id: number) {
  await ready();
  if (!hasDatabase) { const m = mem(); m.subs = m.subs.filter((v) => v.id !== id); return; }
  await q(`DELETE FROM subscribers WHERE id=$1`, [id]);
}

/** Tổng rơm (gam) của các đơn chưa huỷ: toàn web hoặc của một khách. */
export async function strawTotals(customerId?: number) {
  const orders = customerId ? await listOrdersByCustomer(customerId) : await listOrders();
  const live = orders.filter((o) => o.status !== "CANCELLED");
  const grams = (os: Order[]) => os.reduce((t, o) => t + o.items.reduce((s, i) => s + i.qty * (i.straw ?? 0), 0), 0);
  return { all: grams(live), done: grams(live.filter((o) => o.status === "DONE" || o.paymentStatus === "PAID")), orders: live.length };
}
