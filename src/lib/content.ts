import "server-only";
import { cache } from "react";
import { getKv } from "./db";

export type Content = { texts: Record<string, string>; media: Record<string, string> };

/** Chữ và ảnh đã sửa trực tiếp trên trang (khoá -> giá trị). Khoá chưa có thì dùng nội dung mặc định trong code. */
export const getContent = cache(async (): Promise<Content> => {
  const [texts, media] = await Promise.all([getKv<Record<string, string>>("texts"), getKv<Record<string, string>>("media")]);
  return { texts: texts ?? {}, media: media ?? {} };
});
