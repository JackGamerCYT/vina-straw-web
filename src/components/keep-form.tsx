"use client";
import { createContext, useContext, useTransition, type FormHTMLAttributes } from "react";

const Pending = createContext(false);
export const usePending = () => useContext(Pending);

/**
 * Form gửi server action mà KHÔNG xoá dữ liệu đã nhập.
 * (React 19 tự reset <form action={...}> sau mỗi lần gửi, kể cả khi server báo lỗi.)
 */
export function KeepForm({ action, children, ...rest }: Omit<FormHTMLAttributes<HTMLFormElement>, "action" | "onSubmit"> & { action: (f: FormData) => void }) {
  const [pending, start] = useTransition();
  return (
    <Pending.Provider value={pending}>
      <form
        {...rest}
        onSubmit={(e) => {
          e.preventDefault();
          if (pending) return;
          const f = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
          start(() => action(f));
        }}
      >
        {children}
      </form>
    </Pending.Provider>
  );
}
