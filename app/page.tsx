import { CTABanner } from "@/components/landing/CTABanner";
import { FAQ } from "@/components/landing/FAQ";
import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteNavbar } from "@/components/shared/SiteNavbar";

export default function Home() {
  return (
    <div className="bg-[#f5f6f8] dark:bg-slate-950 flex min-h-screen flex-col text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <SiteNavbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <FAQ />
        <CTABanner />
      </main>
      <SiteFooter />
    </div>
  );
}
