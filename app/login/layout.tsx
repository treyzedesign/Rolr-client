import type { ReactNode } from "react";
import { AccountNavbar } from "@/components/shared/AccountNavbar";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full flex flex-col">
      <AccountNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
