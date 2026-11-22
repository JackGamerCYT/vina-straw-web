import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { createHmac, randomBytes, scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { redirect } from "next/navigation";
import * as db from "./db";
import type { AdminUser } from "./types";

const scrypt = promisify(_scrypt) as (pw: string, salt: string, len: number) => Promise<Buffer>;
const COOKIE = "vs_admin";
const DAYS = 14;

/**
 * Mật khẩu chung cũ. Chỉ còn một việc: xác nhận người tạo tài khoản chủ đầu tiên.
 * Khi đã có tài khoản, mật khẩu này không đăng nhập được nữa.
 */
export const DEFAULT_PASSWORD = "vinastraw2026";
export const setupPassword = () => process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
export const usingDefaultPassword = () => !process.env.ADMIN_PASSWORD;

export function checkSetupPassword(input: string) {
  const a = createHmac("sha256", "setup").update(input).digest();
  const b = createHmac("sha256", "setup").update(setupPassword()).digest();
  return timingSafeEqual(a, b);
}

/* Khoá ký phiên: AUTH_SECRET nếu có, không thì tạo ngẫu nhiên một lần và lưu trong database. */
let secretCache: string | null = null;
async function secret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (!secretCache) secretCache = await db.initKv("_auth_secret", randomBytes(32).toString("hex"));
  return secretCache;
}

export async function hashPassword(pw: string) {
  const salt = randomBytes(16).toString("hex");
  return `s1$${salt}$${(await scrypt(pw, salt, 32)).toString("hex")}`;
}
export async function verifyPassword(pw: string, stored: string) {
  const [v, salt, hash] = stored.split("$");
  if (v !== "s1" || !salt || !hash) return false;
  const a = await scrypt(pw, salt, 32), b = Buffer.from(hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** HMAC bằng khoá phiên; dùng chung cho phiên quản trị và phiên khách hàng. */
export const hmac = async (text: string) => createHmac("sha256", await secret()).update(text).digest("hex");
// Đổi mật khẩu thì phiên cũ hết hạn: chữ ký gắn với đuôi mã băm mật khẩu.
const sign = (uid: number, exp: number, pass: string) => hmac(`${uid}.${exp}.${pass.slice(-16)}`);

export async function startSession(u: AdminUser) {
  const exp = Date.now() + DAYS * 86400_000;
  (await cookies()).set(COOKIE, `${u.id}.${exp}.${await sign(u.id, exp, u.pass)}`, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: DAYS * 86400,
  });
}
export async function endSession() {
  (await cookies()).delete(COOKIE);
}

/** Người đang đăng nhập (chỉ tài khoản đang hoạt động). Gọi nhiều lần trong một request chỉ truy vấn một lần. */
export const currentAdmin = cache(async (): Promise<AdminUser | null> => {
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return null;
  const [id, exp, sig] = v.split(".");
  if (!sig || Number(exp) < Date.now()) return null;
  const u = await db.getAdmin(Number(id)).catch(() => null);
  if (!u || u.status !== "ACTIVE") return null;
  const good = Buffer.from(await sign(u.id, Number(exp), u.pass));
  const got = Buffer.from(sig);
  return good.length === got.length && timingSafeEqual(good, got) ? u : null;
});

export async function isAdmin() {
  return Boolean(await currentAdmin());
}
export async function requireAdmin() {
  const u = await currentAdmin();
  if (!u) redirect("/admin/dang-nhap");
  return u;
}
export async function requireOwner() {
  const u = await requireAdmin();
  if (u.role !== "OWNER") redirect("/admin");
  return u;
}

/* Chặn dò mật khẩu đơn giản: tối đa 8 lần sai / 15 phút cho mỗi email (theo từng máy chủ). */
const fails = new Map<string, { n: number; t: number }>();
export function tooManyAttempts(key: string) {
  const f = fails.get(key);
  return Boolean(f && f.n >= 8 && Date.now() - f.t < 15 * 60_000);
}
export function recordFail(key: string) {
  const f = fails.get(key);
  if (!f || Date.now() - f.t > 15 * 60_000) fails.set(key, { n: 1, t: Date.now() });
  else f.n++;
}
export function clearFails(key: string) {
  fails.delete(key);
}
