import { currentAdmin } from "@/lib/auth";
import { listSubscribers } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await currentAdmin())) return new Response("Cần đăng nhập quản trị", { status: 401 });
  const rows = await listSubscribers();
  const csv = "﻿email,ngay_dang_ky\n" + rows.map((r) => `${r.email.replace(/[",\n]/g, "")},${r.createdAt}`).join("\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="dang-ky-nhan-tin.csv"' } });
}
