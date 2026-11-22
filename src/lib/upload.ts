import "server-only";
import { put } from "@vercel/blob";

export const hasBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const MAX = 4 * 1024 * 1024;

/** Lưu ảnh: ưu tiên Vercel Blob; chưa nối Blob thì giữ dạng data URL (ảnh đã nén ở trình duyệt). */
export async function storeImage(file: File, folder: string): Promise<string> {
  if (!file || file.size === 0) throw new Error("Tệp trống");
  if (!file.type.startsWith("image/")) throw new Error("Chỉ nhận tệp ảnh");
  if (file.size > MAX) throw new Error("Ảnh lớn hơn 4 MB");
  if (hasBlob) {
    const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
    const blob = await put(`${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`, file, {
      access: "public", contentType: file.type,
    });
    return blob.url;
  }
  const buf = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buf.toString("base64")}`;
}

export async function storeImages(files: File[], folder: string, limit = 8) {
  const out: string[] = [];
  for (const f of files.filter((f) => f && f.size > 0).slice(0, limit)) out.push(await storeImage(f, folder));
  return out;
}
