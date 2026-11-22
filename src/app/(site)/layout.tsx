import { Footer } from "@/components/footer";
import { EditProvider } from "@/components/editable";
import { getSettings } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { getContent } from "@/lib/content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [s, admin, c] = await Promise.all([getSettings(), isAdmin(), getContent()]);
  return (
    <EditProvider admin={admin} texts={c.texts} media={c.media}>
      {children}
      <Footer s={s} />
    </EditProvider>
  );
}
