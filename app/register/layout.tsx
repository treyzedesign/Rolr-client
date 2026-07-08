"use client";

import type { ReactNode } from "react";
import { AccountNavbar } from "@/components/shared/AccountNavbar";
import { usePathname } from "next/navigation";

export default function RegisterLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isRegisterEntry = pathname === "/register";

  return (
    <div className="min-h-full flex flex-col">
      {/* {!isRegisterEntry && <AccountNavbar />} */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
