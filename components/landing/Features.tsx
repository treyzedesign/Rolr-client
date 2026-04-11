const items = [
  {
    title: "Swipe matching",
    body: "Job seekers swipe jobs; employers swipe profiles. Mutual right swipes unlock the conversation.",
    icon: "◇",
  },
  {
    title: "Voice screening",
    body: "Candidates share short voice samples so hiring teams hear communication style before scheduling calls.",
    icon: "◎",
  },
  {
    title: "Real-time chat",
    body: "Socket-powered messaging keeps matched parties in sync — no inbox lag between interest and interview.",
    icon: "→",
  },
  {
    title: "Structured profiles",
    body: "Skills, experience, and roles live in rich profiles backed by your user and job APIs.",
    icon: "▣",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="scroll-mt-24 border-t border-blue-100 bg-gradient-to-b from-white to-blue-50/40 px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Built for speed <span className="text-sky-400">and signal</span>
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Core modules from your stack — auth, profiles, jobs, swipes, matches,
            voice, and messaging — surfaced in one fluid experience.
          </p>
        </div>
        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:gap-8">
          {items.map((item) => (
            <li
              key={item.title}
              className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-8 backdrop-blur-sm transition hover:border-sky-500/30 hover:shadow-[0_0_40px_-12px_rgba(56,189,248,0.25)]"
            >
              <span
                className="font-mono text-2xl text-sky-400/90 transition group-hover:text-sky-300"
                aria-hidden
              >
                {item.icon}
              </span>
              <h3 className="font-display mt-4 text-xl font-semibold text-slate-900">
                {item.title}
              </h3>
              <p className="mt-2 leading-relaxed text-slate-600">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
