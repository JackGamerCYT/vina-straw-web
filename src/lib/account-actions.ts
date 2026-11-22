"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as db from "./db";
import {
  checkSetupPassword, clearFails, hashPassword, recordFail, requireAdmin, requireOwner,
  startSession, tooManyAttempts, verifyPassword,
} from "./auth";
import type { AdminRole, AdminStatus } from "./types";

export type AccState = { ok?: boolean; error?: string; message?: string } | undefined;

const str = (f: FormData, k: string, max = 200) => String(f.get(k) ?? "").trim().slice(0, max);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const safeNext = (n: string) => (n.startsWith("/admin") && !n.startsWith("//") ? n : "/admin");

export async function loginAction(_: AccState, f: FormData): Promise<AccState> {
  const email = str(f, "email").toLowerCase();
  const pw = String(f.get("password") ?? "");
  if (tooManyAttempts(email)) return { error: "Sai quá nhiều lần. Thử lại sau 15 phút." };
  const u = await db.getAdminByEmail(email);
  if (!u || !(await verifyPassword(pw, u.pass))) {
    recordFail(email);
    await new Promise((r) => setTimeout(r, 400));
    return { error: "Email hoặc mật khẩu không đúng." };
  }
  if (u.status === "PENDING") return { error: "Tài khoản đang chờ chủ trang duyệt." };
  if (u.status === "LOCKED") return { error: "Tài khoản đã bị khoá. Liên hệ chủ trang." };
  clearFails(email);
  await db.updateAdmin(u.id, { lastLogin: new Date().toISOString() });
  await startSession(u);
  redirect(safeNext(str(f, "next")));
}

export async function registerAction(_: AccState, f: FormData): Promise<AccState> {
  const name = str(f, "name", 80);
  const email = str(f, "email", 160).toLowerCase();
  const pw = String(f.get("password") ?? "");
  if (name.length < 2) return { error: "Nhập họ tên." };
  if (!EMAIL.test(email)) return { error: "Email chưa đúng định dạng." };
  if (pw.length < 8) return { error: "Mật khẩu cần ít nhất 8 ký tự." };
  if (pw !== String(f.get("password2") ?? "")) return { error: "Hai lần nhập mật khẩu không khớp." };
  if (await db.getAdminByEmail(email)) return { error: "Email này đã được đăng ký." };

  const first = (await db.countAdmins()) === 0;
  if (first) {
    if (tooManyAttempts("setup")) return { error: "Sai quá nhiều lần. Thử lại sau 15 phút." };
    if (!checkSetupPassword(String(f.get("setup") ?? ""))) {
      recordFail("setup");
      return { error: "Mật khẩu quản trị hiện tại không đúng." };
    }
  }
  const u = await db.createAdmin({
    name, email, pass: await hashPassword(pw),
    role: first ? "OWNER" : "EDITOR", status: first ? "ACTIVE" : "PENDING",
  });
  if (first) {
    await startSession(u);
    redirect("/admin/tai-khoan?moi=1");
  }
  return { ok: true, message: "Đã gửi đăng ký. Chủ trang duyệt xong thì bạn đăng nhập được." };
}

export async function changePasswordAction(_: AccState, f: FormData): Promise<AccState> {
  const me = await requireAdmin();
  const pw = String(f.get("password") ?? "");
  if (!(await verifyPassword(String(f.get("current") ?? ""), me.pass))) return { error: "Mật khẩu hiện tại không đúng." };
  if (pw.length < 8) return { error: "Mật khẩu mới cần ít nhất 8 ký tự." };
  if (pw !== String(f.get("password2") ?? "")) return { error: "Hai lần nhập mật khẩu mới không khớp." };
  const pass = await hashPassword(pw);
  await db.updateAdmin(me.id, { pass });
  await startSession({ ...me, pass });
  return { ok: true, message: "Đã đổi mật khẩu." };
}

async function ownersLeft(exceptId: number) {
  return (await db.listAdmins()).filter((a) => a.id !== exceptId && a.role === "OWNER" && a.status === "ACTIVE").length;
}

/** Chủ trang: duyệt, khoá, đổi vai trò, xoá, đặt mật khẩu tạm. */
export async function manageAdminAction(f: FormData): Promise<AccState> {
  const me = await requireOwner();
  const id = Number(f.get("id"));
  const op = String(f.get("op"));
  const u = await db.getAdmin(id);
  if (!u) return { error: "Không tìm thấy tài khoản." };
  const demoting = op === "lock" || op === "delete" || (op === "role" && f.get("role") !== "OWNER");
  if (u.role === "OWNER" && demoting && (await ownersLeft(id)) === 0) return { error: "Cần giữ ít nhất một chủ trang đang hoạt động." };
  let message = "Đã cập nhật.";
  switch (op) {
    case "approve": case "unlock": await db.updateAdmin(id, { status: "ACTIVE" as AdminStatus }); break;
    case "lock": await db.updateAdmin(id, { status: "LOCKED" as AdminStatus }); break;
    case "role": {
      const role = String(f.get("role")) as AdminRole;
      if (role !== "OWNER" && role !== "EDITOR") return { error: "Vai trò không hợp lệ." };
      await db.updateAdmin(id, { role }); break;
    }
    case "delete":
      if (id === me.id) return { error: "Không tự xoá tài khoản đang dùng." };
      await db.deleteAdmin(id); message = "Đã xoá tài khoản."; break;
    case "reset": {
      const tmp = Array.from(crypto.getRandomValues(new Uint8Array(10)), (b) => "abcdefghjkmnpqrstuvwxyz23456789"[b % 31]).join("");
      await db.updateAdmin(id, { pass: await hashPassword(tmp) });
      message = `Mật khẩu tạm của ${u.email}: ${tmp} (chỉ hiện một lần, gửi riêng cho người đó).`; break;
    }
    default: return { error: "Thao tác không hợp lệ." };
  }
  revalidatePath("/admin/tai-khoan");
  return { ok: true, message };
}
