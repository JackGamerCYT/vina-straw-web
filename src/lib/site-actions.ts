"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import * as db from "./db";
import { recordFail, requireAdmin, tooManyAttempts } from "./auth";
import { storeImage } from "./upload";
import { CONTACT_SUBJECTS } from "./types";

export type SiteState = { ok?: boolean; error?: string; message?: string } | undefined;
const str = (f: FormData, k: string, max = 200) => String(f.get(k) ?? "").trim().slice(0, max);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function ipKey(prefix: string) {
  const h = await headers();
  return prefix + ":" + (h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "?");
}

export async function sendContact(_: SiteState, f: FormData): Promise<SiteState> {
  if (str(f, "website")) return { ok: true, message: "Đã gửi." }; // ô bẫy chống spam, người thật không thấy
  const key = await ipKey("contact");
  if (tooManyAttempts(key)) return { error: "Bạn gửi hơi nhiều. Thử lại sau ít phút hoặc gọi hotline." };
  const name = str(f, "name", 120), email = str(f, "email", 160), phone = str(f, "phone", 30), message = str(f, "message", 4000);
  let subject = str(f, "subject", 80);
  if (!CONTACT_SUBJECTS.includes(subject)) subject = "Khác";
  if (name.length < 2) return { error: "Nhập họ tên." };
  if (!email && !phone) return { error: "Để lại email hoặc số điện thoại để chúng tôi liên hệ lại." };
  if (email && !EMAIL.test(email)) return { error: "Email chưa đúng định dạng." };
  if (message.length < 5) return { error: "Nhập nội dung tin nhắn." };
  recordFail(key);
  await db.addMessage({ name, email, phone, subject, message });
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Cảm ơn bạn! Chúng tôi sẽ phản hồi trong 1–2 ngày làm việc." };
}

export async function subscribe(_: SiteState, f: FormData): Promise<SiteState> {
  const email = str(f, "email", 160).toLowerCase();
  if (!EMAIL.test(email)) return { error: "Email chưa đúng định dạng." };
  await db.addSubscriber(email);
  return { ok: true, message: "Đã đăng ký nhận tin. Cảm ơn bạn!" };
}

/* ───────── Quản trị ───────── */
const slugify = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

export async function savePostAction(_: SiteState, f: FormData): Promise<SiteState> {
  await requireAdmin();
  const id = Number(f.get("id")) || undefined;
  const title = str(f, "title", 200);
  if (title.length < 3) return { error: "Nhập tiêu đề." };
  const slug = slugify(str(f, "slug", 100) || title) || `bai-${Date.now()}`;
  const other = await db.getPost(slug);
  if (other && other.id !== id) return { error: "Đường dẫn này đã có bài khác dùng. Đổi đường dẫn." };
  let cover = str(f, "coverKeep", 3_000_000);
  const file = f.get("cover");
  if (file instanceof File && file.size > 0) {
    try { cover = await storeImage(file, "posts"); } catch (e) { return { error: (e as Error).message }; }
  }
  const p = await db.savePost({ id, slug, title, excerpt: str(f, "excerpt", 400), body: String(f.get("body") ?? "").slice(0, 40000), cover, published: f.get("published") === "on" });
  revalidatePath("/", "layout");
  if (!id) redirect(`/admin/tin-tuc/${p.id}`);
  return { ok: true, message: "Đã lưu bài viết." };
}

export async function deletePostAction(f: FormData) {
  await requireAdmin();
  await db.deletePost(Number(f.get("id")));
  revalidatePath("/", "layout");
  redirect("/admin/tin-tuc");
}

export async function messageAction(f: FormData) {
  await requireAdmin();
  const id = Number(f.get("id")), op = String(f.get("op"));
  if (op === "done") await db.setMessageHandled(id, true);
  else if (op === "undo") await db.setMessageHandled(id, false);
  else if (op === "delete") await db.deleteMessage(id);
  else if (op === "unsub") await db.deleteSubscriber(id);
  revalidatePath("/admin", "layout");
}
