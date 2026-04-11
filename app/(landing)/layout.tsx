import type { ReactNode } from "react";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteNavbar } from "@/components/shared/SiteNavbar";

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full flex flex-col">
      <SiteNavbar />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
