import { Mail, MapPin, Phone } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { PageBanner } from "@/components/page-banner";
import { ContactForm } from "@/components/site-forms";
import { T } from "@/components/editable";
import { getSettings } from "@/lib/db";

export const metadata = { title: "Liên hệ" };
export const revalidate = 60;

export default async function Contact() {
  const s = await getSettings();
  const cards = [
    { Icon: Phone, t: "Điện thoại", v: s.contactPhone, href: `tel:${s.contactPhone.replace(/[^\d+]/g, "")}` },
    { Icon: Mail, t: "Email", v: s.contactEmail, href: `mailto:${s.contactEmail}` },
    { Icon: MapPin, t: "Địa chỉ", v: s.contactAddress, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.contactAddress)}` },
  ];
  return (
    <>
      <Navbar />
      <PageBanner title="Liên hệ" crumbs={[["Liên hệ"]]} img="/img/real/gallery/g4.webp" />
      <main className="mx-auto max-w-[1320px] px-5 py-16 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {cards.map(({ Icon, t, v, href }) => (
            <a key={t} href={href} target={t === "Địa chỉ" ? "_blank" : undefined} rel="noreferrer" className="group flex items-center gap-4 rounded-[24px] border border-ink/10 p-6 transition hover:border-leaf-600 hover:shadow-lg">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-straw-500 text-soil-900 transition group-hover:bg-leaf-700 group-hover:text-white"><Icon className="h-6 w-6" /></span>
              <span><span className="block text-sm text-ink-soft">{t}</span><span className="font-display text-lg font-bold text-ink [overflow-wrap:anywhere]">{v}</span></span>
            </a>
          ))}
        </div>
        <div className="mt-14 grid gap-12 lg:grid-cols-2">
          <div>
            <T k="contact.kicker" as="p" className="block text-sm font-semibold uppercase tracking-[0.18em] text-sprout">Gửi tin nhắn</T>
            <T k="contact.title" as="h2" className="font-display mt-3 block text-4xl font-bold leading-tight tracking-tight text-leaf-900">Chúng tôi luôn sẵn sàng lắng nghe</T>
            <T k="contact.lead" as="p" className="mb-8 mt-4 block text-lg text-ink-soft">Hỏi về sản phẩm, đặt mẫu thử, hợp tác hay góp ý, bạn cứ để lại lời nhắn.</T>
            <ContactForm />
          </div>
          <div className="min-h-[420px] overflow-hidden rounded-[28px] bg-mist">
            <iframe title="Bản đồ" src={`https://maps.google.com/maps?q=${encodeURIComponent(s.contactAddress)}&z=13&output=embed`} className="h-full min-h-[420px] w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
      </main>
    </>
  );
}
