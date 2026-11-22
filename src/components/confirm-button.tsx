"use client";
export function ConfirmButton({ children, message, className = "btn-danger !py-2 text-sm" }: { children: React.ReactNode; message: string; className?: string }) {
  return <button className={className} onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}>{children}</button>;
}
