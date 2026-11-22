"use client";
import Image from "next/image";
import { useState } from "react";
import { isRender } from "@/lib/format";

export function Gallery({ images, name }: { images: string[]; name: string }) {
  const [i, setI] = useState(0);
  if (images.length === 0) return <div className="weave aspect-square rounded-[28px]" />;
  const cur = images[Math.min(i, images.length - 1)];
  return (
    <div>
      <div className="zoom-frame relative aspect-square overflow-hidden rounded-[28px] bg-mist">
        <Image key={cur} src={cur} alt={name} fill priority sizes="(min-width:1024px) 600px, 100vw" className={`toast-pop ${isRender(cur) ? "object-contain p-[7%]" : "object-cover"}`} unoptimized={cur.startsWith("data:")} />
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-3">
          {images.map((src, k) => (
            <button key={src + k} onClick={() => setI(k)} aria-label={`Ảnh ${k + 1}`} className={`relative aspect-square overflow-hidden rounded-2xl bg-mist ring-2 transition ${k === i ? "ring-leaf-600" : "ring-transparent hover:ring-leaf-200"}`}>
              <Image src={src} alt="" fill sizes="120px" className={isRender(src) ? "object-contain p-1.5" : "object-cover"} unoptimized={src.startsWith("data:")} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
