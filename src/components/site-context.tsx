"use client";
import { createContext, useContext } from "react";

export type SiteInfo = { email: string; phone: string; address: string; lines: string[] };
const Ctx = createContext<SiteInfo>({ email: "", phone: "", address: "", lines: [] });
export const SiteProvider = ({ value, children }: { value: SiteInfo; children: React.ReactNode }) => <Ctx.Provider value={value}>{children}</Ctx.Provider>;
export const useSite = () => useContext(Ctx);
export const telHref = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;
export const zaloHref = (p: string) => `https://zalo.me/${p.replace(/\D/g, "")}`;
