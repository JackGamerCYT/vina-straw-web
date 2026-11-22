import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import * as db from "./db";
import { hmac } from "./auth";
import type { Customer } from "./types";

const COOKIE = "vs_user";
const DAYS = 30;
const sign = (uid: number, exp: number, pass: string) => hmac(`user.${uid}.${exp}.${pass.slice(-16)}`);

export async function startCustomerSession(c: Customer) {
  const exp = Date.now() + DAYS * 86400_000;
  (await cookies()).set(COOKIE, `${c.id}.${exp}.${await sign(c.id, exp, c.pass)}`, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: DAYS * 86400,
  });
}
export async function endCustomerSession() {
  (await cookies()).delete(COOKIE);
}

export const currentCustomer = cache(async (): Promise<Customer | null> => {
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return null;
  const [id, exp, sig] = v.split(".");
  if (!sig || Number(exp) < Date.now()) return null;
  const c = await db.getCustomer(Number(id)).catch(() => null);
  if (!c || c.status !== "ACTIVE") return null;
  const good = Buffer.from(await sign(c.id, Number(exp), c.pass)), got = Buffer.from(sig);
  return good.length === got.length && timingSafeEqual(good, got) ? c : null;
});

export async function requireCustomer(next = "/tai-khoan") {
  const c = await currentCustomer();
  if (!c) redirect(`/dang-nhap?next=${encodeURIComponent(next)}`);
  return c;
}
