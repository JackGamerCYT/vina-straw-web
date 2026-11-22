import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";

const COOKIE = "vs_admin";
/** Mật khẩu mặc định chỉ dùng khi chưa đặt ADMIN_PASSWORD trên Vercel. */
export const DEFAULT_PASSWORD = "vinastraw2026";
export const adminPassword = () => process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
export const usingDefaultPassword = () => !process.env.ADMIN_PASSWORD;

const sign = (v: string) => createHmac("sha256", "vs:" + adminPassword()).update(v).digest("hex");

export function checkPassword(input: string) {
  const a = Buffer.from(sign(input)), b = Buffer.from(sign(adminPassword()));
  return a.length === b.length && timingSafeEqual(a, b);
}
export async function setAdminCookie() {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 14;
  (await cookies()).set(COOKIE, `${exp}.${sign(String(exp))}`, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 14,
  });
}
export async function clearAdminCookie() {
  (await cookies()).delete(COOKIE);
}
export async function isAdmin() {
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return false;
  const [exp, sig] = v.split(".");
  return Number(exp) > Date.now() && sig === sign(exp);
}
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/dang-nhap");
}
