import "server-only";
import { neon } from "@neondatabase/serverless";
import { DEFAULT_SETTINGS, REAL_SLUGS, SEED_PRODUCTS } from "./seed";
import type { AdminRole, AdminStatus, AdminUser, Order, OrderItem, OrderStatus, Product, Settings, Spec } from "./types";

const URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
export const hasDatabase = Boolean(URL);

type Row = Record<string, unknown>;
const sqlClient = URL ? neon(URL) : null;
async function q<T = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  return (await sqlClient!.query(text, params)) as T[];
}

/* ───────── Bộ nhớ tạm khi chưa nối Postgres (chỉ để xem thử) ───────── */
type Mem = { products: Product[]; orders: Order[]; settings: Settings; seq: number; admins: AdminUser[]; kv: Record<string, unknown> };
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
  active: Boolean(r.active), sort: Number(r.sort),
});
const toOrder = (r: Row): Order => ({
  id: Number(r.id), code: String(r.code), token: String(r.token), kind: String(r.kind), name: String(r.name),
  phone: String(r.phone), email: String(r.email), company: String(r.company), address: String(r.address),
  items: (r.items as OrderItem[]) ?? [], note: String(r.note), images: (r.images as string[]) ?? [],
  status: r.status as OrderStatus, quote: String(r.quote), adminNote: String(r.admin_note),
  createdAt: new Date(r.created_at as string).toISOString(), updatedAt: new Date(r.updated_at as string).toISOString(),
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
  const vals = [p.slug, p.name, p.line, p.short, p.description, p.price, p.unit, p.moq, JSON.stringify(p.specs), JSON.stringify(p.images), p.featured, p.active, p.sort];
  if (p.id) {
    const [r] = await q(`UPDATE products SET slug=$1,name=$2,line=$3,short=$4,description=$5,price=$6,unit=$7,moq=$8,specs=$9,images=$10,featured=$11,active=$12,sort=$13 WHERE id=$14 RETURNING *`, [...vals, p.id]);
    return toProduct(r);
  }
  const [r] = await q(`INSERT INTO products (slug,name,line,short,description,price,unit,moq,specs,images,featured,active,sort) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`, vals);
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
function makeCode() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += a[Math.floor(Math.random() * a.length)];
  return `VS-${s}`;
}
function makeToken() {
  return crypto.randomUUID().replace(/-/g, "");
}
export async function createOrder(o: NewOrder): Promise<Order> {
  await ready();
  const code = makeCode(), token = makeToken();
  if (!hasDatabase) {
    const m = mem(); const now = new Date().toISOString();
    const order: Order = { ...o, id: ++m.seq, code, token, status: "NEW", quote: "", adminNote: "", createdAt: now, updatedAt: now };
    m.orders.unshift(order); return order;
  }
  const [r] = await q(
    `INSERT INTO orders (code,token,kind,name,phone,email,company,address,items,note,images) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [code, token, o.kind, o.name, o.phone, o.email, o.company, o.address, JSON.stringify(o.items), o.note, JSON.stringify(o.images)],
  );
  return toOrder(r);
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
    `UPDATE orders SET kind=$2,name=$3,phone=$4,email=$5,company=$6,address=$7,items=$8,note=$9,images=$10,updated_at=now() WHERE code=$1`,
    [code, o.kind, o.name, o.phone, o.email, o.company, o.address, JSON.stringify(o.items), o.note, JSON.stringify(o.images)],
  );
}
export async function listOrders(): Promise<Order[]> {
  await ready();
  if (!hasDatabase) return mem().orders;
  return (await q(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 500`)).map(toOrder);
}
export async function updateOrderAdmin(id: number, d: { status: OrderStatus; quote: string; adminNote: string }) {
  await ready();
  if (!hasDatabase) { const x = mem().orders.find((v) => v.id === id); if (x) Object.assign(x, d, { updatedAt: new Date().toISOString() }); return; }
  await q(`UPDATE orders SET status=$2, quote=$3, admin_note=$4, updated_at=now() WHERE id=$1`, [id, d.status, d.quote, d.adminNote]);
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
