const steps = [
  {
    step: "01",
    title: "Create Your Space",
    desc: "Sign up as seeker or employer, complete your profile, and publish roles or polish your story.",
    rotation: "rotate-[2deg]",
  },
  {
    step: "02",
    title: "Swipe with Intent",
    desc: "Browse cards tuned to your market. Every swipe is recorded — left passes, right expresses real interest.",
    rotation: "rotate-[-2deg]",
  },
  {
    step: "03",
    title: "Match, Audio, Assessment",
    desc: "On a double right swipe, the match channel opens. Share voice samples and coordinate without leaving the app.",
    rotation: "rotate-[1.5deg]",
  },
  {
    step: "04",
    title: "Schedule Interview",
    desc: "Lock in next steps from the same thread. Your interview records stay tied to the originating match",
    rotation: "rotate-[-2deg]",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 bg-[#f5f6f8] dark:bg-slate-950 py-24 transition-colors duration-300"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        {/* Centered Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="font-sans text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            How Rolr flows
          </h2>
          <p className="mt-6 text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            Mirrors your PRD: swipes create matches; matches unlock messaging and scheduling.
          </p>
        </div>

        {/* Slanted Cards Grid */}
        <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 px-2">
          {steps.map((s) => (
            <li
              key={s.step}
              className={`relative rounded-[20px] bg-white dark:bg-slate-900 p-8 shadow-[0_10px_25px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-800/60 transition-all duration-300 hover:rotate-0 hover:scale-[1.03] hover:shadow-[0_15px_35px_rgba(0,0,0,0.06)] ${s.rotation}`}
            >
              {/* Red Pin Asset at Top-Left */}
              <img
                src="/Assets/flow_Pin.png"
                alt="Pin"
                className="absolute -top-3.5 -left-3.5 w-9 h-9 select-none pointer-events-none z-10"
              />

              <span className="font-sans text-lg font-bold text-slate-900 dark:text-slate-100">
                {s.step}
              </span>

              <h3 className="font-sans mt-3 text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {s.title}
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {s.desc}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
