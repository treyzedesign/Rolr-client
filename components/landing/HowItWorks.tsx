const steps = [
  {
    step: "01",
    title: "Create your space",
    desc: "Sign up as seeker or employer, complete your profile, and publish roles or polish your story.",
  },
  {
    step: "02",
    title: "Swipe with intent",
    desc: "Browse cards tuned to your market. Every swipe is recorded — left passes, right expresses real interest.",
  },
  {
    step: "03",
    title: "Match → voice → message",
    desc: "On a double right swipe, the match channel opens. Share voice samples and coordinate without leaving the app.",
  },
  {
    step: "04",
    title: "Schedule interviews",
    desc: "Lock in next steps from the same thread. Your interview records stay tied to the originating match.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              How WorkSwipe flows
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Mirrors your PRD: swipes create matches; matches unlock messaging
              and scheduling.
            </p>
          </div>
          <div className="hidden h-px flex-1 bg-gradient-to-r from-transparent via-sky-500/40 to-transparent md:block md:mx-12 md:mb-4" />
        </div>
        <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <li
              key={s.step}
              className="relative rounded-2xl border border-blue-100 bg-white p-6"
            >
              <span className="font-mono text-xs font-medium tracking-widest text-sky-400">
                {s.step}
              </span>
              <h3 className="font-display mt-3 text-lg font-semibold text-slate-900">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {s.desc}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
