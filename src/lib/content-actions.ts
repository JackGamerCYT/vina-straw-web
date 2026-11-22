"use server";

import { revalidatePath } from "next/cache";
import * as db from "./db";
import { requireAdmin } from "./auth";
import { storeImage } from "./upload";
import { DEFAULT_SETTINGS } from "./seed";
import type { Settings } from "./types";

const KEY = /^[a-zA-Z0-9._-]{1,80}$/;
const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS).filter((k) => typeof DEFAULT_SETTINGS[k as keyof Settings] === "string");

/**
 * Lưu các chỗ đã sửa trên trang. Chuỗi rỗng = trả về nội dung mặc định.
 * Khoá trùng tên mục trong "Nội dung trang" (heroTitle, aboutBody…) được ghi thẳng vào đó.
 */
export async function saveContentAction(input: { texts: Record<string, string>; media: Record<string, string> }) {
  await requireAdmin();
  const texts = { ...((await db.getKv<Record<string, string>>("texts")) ?? {}) };
  const media = { ...((await db.getKv<Record<string, string>>("media")) ?? {}) };
  const settings: Partial<Settings> = {};
  let n = 0;
  for (const [k, raw] of Object.entries(input.texts ?? {}).slice(0, 300)) {
    if (!KEY.test(k) || typeof raw !== "string") continue;
    const v = raw.replace(/\r/g, "").trim().slice(0, 4000);
    if (SETTING_KEYS.includes(k)) { (settings as Record<string, string>)[k] = v || String(DEFAULT_SETTINGS[k as keyof Settings]); n++; continue; }
    if (v) texts[k] = v; else delete texts[k];
    n++;
  }
  for (const [k, v] of Object.entries(input.media ?? {}).slice(0, 100)) {
    if (!KEY.test(k) || typeof v !== "string") continue;
    if (!v) delete media[k];
    else if (/^(https:\/\/[\w.-]+\.public\.blob\.vercel-storage\.com\/|\/|data:image\/)/.test(v) && v.length < 3_000_000) media[k] = v;
    else continue;
    n++;
  }
  await db.setKv("texts", texts);
  await db.setKv("media", media);
  if (Object.keys(settings).length) await db.saveSettings(settings);
  revalidatePath("/", "layout");
  return { ok: true, n };
}

export async function uploadSiteImageAction(f: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const file = f.get("file");
  if (!(file instanceof File)) return { error: "Chưa chọn ảnh" };
  try {
    return { url: await storeImage(file, "site") };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
