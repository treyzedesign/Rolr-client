import type { ReactNode } from "react";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  badge: string;
}

export function AuthShell({ title, subtitle, children, badge }: AuthShellProps) {
  return (
    <div className="bg-grid-futuristic flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-10 sm:px-6">
      <div className=" w-full" style={{ maxWidth: "580px", minWidth: "320px" }}>
        <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm md:p-10">
          <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs tracking-wider text-blue-700">
            {badge}
          </p>
          <h1 className="font-display mt-4 text-3xl font-bold text-slate-900 md:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-slate-600">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </section>
        {/* <section className="hidden rounded-3xl border border-blue-100 bg-gradient-to-b from-blue-100 to-white p-10 lg:block">
          <h2 className="font-display text-3xl font-semibold text-slate-900">
            Employer workflow
          </h2>
          <ol className="mt-8 space-y-6 text-slate-700">
            <li>1. Sign in as employer</li>
            <li>2. Complete profile and preference settings</li>
            <li>3. Swipe up to accept, down to decline</li>
            <li>4. Open any card for full candidate details</li>
          </ol>
        </section> */}
      </div>
    </div>
  );
}
