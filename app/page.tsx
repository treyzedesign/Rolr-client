import { CTABanner } from "@/components/landing/CTABanner";
import { FAQ } from "@/components/landing/FAQ";
import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteNavbar } from "@/components/shared/SiteNavbar";

export default function Home() {
  return (
    <div className="bg-grid-futuristic flex min-h-full flex-col text-slate-900">
      <SiteNavbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <CTABanner />
        <FAQ />
      </main>
      <SiteFooter />
    </div>
  );
}
