import { Footer } from "@/components/footer";
import { EditProvider } from "@/components/editable";
import { SiteProvider } from "@/components/site-context";
import { ContactDock } from "@/components/contact-dock";
import { getSettings, listPosts, listProducts } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { getContent } from "@/lib/content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [s, admin, c, posts, products] = await Promise.all([getSettings(), isAdmin(), getContent(), listPosts({ limit: 3 }), listProducts()]);
  const lines = [...new Set(products.map((p) => p.line))];
  return (
    <SiteProvider value={{ email: s.contactEmail, phone: s.contactPhone, address: s.contactAddress, lines }}>
      <EditProvider admin={admin} texts={c.texts} media={c.media}>
        {children}
        <Footer s={s} posts={posts} lines={lines} />
        <ContactDock />
      </EditProvider>
    </SiteProvider>
  );
}
