import { Navbar } from "@/components/navbar";

export const metadata = { title: "Nguồn ảnh" };

const SRC = [
  ["Cánh đồng sau khi đốt rơm", "Straws after harvesting.jpg", "Ajshafeer96", "CC BY-SA 4.0", "Straws_after_harvesting.jpg"],
  ["Bó rơm trên ruộng", "Straw of the rice.08Oct9.jpg", "Masaki Ikeda", "Public domain", "Straw_of_the_rice.08Oct9.jpg"],
  ["Xe chở rơm", "Collecting Straws at paddy field.jpg", "Ajshafeer96", "CC BY-SA 4.0", "Collecting_Straws_at_paddy_field.jpg"],
];

export default function Sources() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[900px] px-5 pb-24 pt-32 lg:px-8">
        <h1 className="font-display text-5xl font-bold tracking-tight text-leaf-900">Nguồn ảnh</h1>
        <h2 className="font-display mt-10 text-2xl font-bold text-leaf-900">Ảnh và video của nhóm Vina-Straw</h2>
        <p className="mt-3 text-lg text-ink-soft">Ảnh túi giấy rơm, tấm lót rơm, cận cảnh sợi rơm, video nền đầu trang và các cảnh quay sản phẩm trong phim giới thiệu do nhóm Vina-Straw tự chụp, tự quay. Các sản phẩm còn lại (tô, ly, chén, dĩa, đệm, màng, tấm cách nhiệt) là ảnh dựng 3D theo bản vẽ kỹ thuật của dự án.</p>
        <h2 className="font-display mt-12 text-2xl font-bold text-leaf-900">Ảnh từ Wikimedia Commons</h2>
        <p className="mt-3 text-lg text-ink-soft">Một số ảnh đồng ruộng lấy từ Wikimedia Commons theo giấy phép dưới đây; ảnh đã được cắt và nén.</p>
        <ul className="mt-6 divide-y divide-ink/10 rounded-3xl border border-ink/10">
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
