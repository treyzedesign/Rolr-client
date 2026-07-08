import type { ReactNode } from "react";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full flex flex-col">
      <main className="flex-1">{children}</main>
    </div>
  );
}
