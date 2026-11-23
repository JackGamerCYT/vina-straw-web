import Image from "next/image";

/** Biểu tượng tròn của logo Vina-Straw (người nông dân, bó rơm, hộp từ rơm). */
export function LogoMark({ className = "h-12 w-12" }: { className?: string }) {
  return <Image src="/brand/emblem.webp" alt="" width={256} height={201} className={`${className} object-contain`} aria-hidden priority />;
}

/** Logo ngang: biểu tượng + chữ VINA-STRAW. Bản `light` đặt trên ô nền kem để nổi trên nền tối. */
export function Logo({ light = false }: { light?: boolean }) {
  const inner = (
    <span className="flex items-center gap-2">
      <LogoMark className="h-11 w-14 sm:h-12 sm:w-[60px]" />
      <Image src="/brand/wordmark.webp" alt="Vina-Straw" width={700} height={114} className="h-[22px] w-auto sm:h-[26px]" priority />
    </span>
  );
  return light ? <span className="inline-flex rounded-2xl bg-[#f1ede2] px-3 py-2">{inner}</span> : inner;
}
