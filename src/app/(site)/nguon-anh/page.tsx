import { Navbar } from "@/components/navbar";

export const metadata = { title: "Nguồn ảnh" };

const SRC = [
  ["Cánh đồng sau khi đốt rơm", "Straws after harvesting.jpg", "Ajshafeer96", "CC BY-SA 4.0", "Straws_after_harvesting.jpg"],
  ["Bó rơm trên ruộng", "Straw of the rice.08Oct9.jpg", "Masaki Ikeda", "Public domain", "Straw_of_the_rice.08Oct9.jpg"],
  ["Xe chở rơm", "Collecting Straws at paddy field.jpg", "Ajshafeer96", "CC BY-SA 4.0", "Collecting_Straws_at_paddy_field.jpg"],
  ["Cận cảnh sợi rơm", "Hay roll close up.jpg", "Titus Tscharntke", "Public domain", "Hay_roll_close_up.jpg"],
  ["Hộp và túi mang đi", "Eco-friendly cardboard packaging for takeaways.jpg", "Meanwell Packaging", "CC BY 2.0", "Eco-friendly_cardboard_packaging_for_takeaways.jpg"],
];

export default function Sources() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[900px] px-5 pb-24 pt-32 lg:px-8">
        <h1 className="font-display text-5xl font-bold tracking-tight text-leaf-900">Nguồn ảnh</h1>
        <p className="mt-4 text-lg text-ink-soft">Ảnh sản phẩm là ảnh dựng 3D theo bản vẽ kỹ thuật của dự án. Ảnh đồng ruộng và bao bì minh hoạ lấy từ Wikimedia Commons theo giấy phép dưới đây; một số ảnh đã được cắt và nén.</p>
        <ul className="mt-10 divide-y divide-ink/10 rounded-3xl border border-ink/10">
          {SRC.map(([what, title, author, lic, file]) => (
            <li key={file} className="p-5">
              <p className="font-semibold text-ink">{what}</p>
              <p className="mt-1 text-sm text-ink-soft">
                <a className="underline hover:text-leaf-700" href={`https://commons.wikimedia.org/wiki/File:${file}`} target="_blank" rel="noreferrer">{title}</a> — {author}, {lic}
              </p>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
