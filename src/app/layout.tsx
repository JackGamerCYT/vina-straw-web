import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Bricolage_Grotesque } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const body = Be_Vietnam_Pro({ subsets: ["latin", "vietnamese"], weight: ["400", "500", "600", "700"], variable: "--font-body", display: "swap" });
const display = Bricolage_Grotesque({ subsets: ["latin", "vietnamese"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  title: { default: "Vina-Straw — Bao bì từ rơm rạ Việt Nam", template: "%s · Vina-Straw" },
  description: "Tô, ly, dĩa, túi và đệm bảo vệ làm từ xơ rơm rạ. Nhận báo giá, đặt mẫu thử và đặt hàng trực tuyến.",
  openGraph: { images: ["/og.jpg"], locale: "vi_VN", type: "website" },
};
export const viewport: Viewport = { themeColor: "#1e5a3c" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${body.variable} ${display.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
