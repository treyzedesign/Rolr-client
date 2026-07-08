const items = [
  {
    title: "Swipe Matching",
    body: "See fit at a glance and connect with the right people in seconds",
    image: "/Assets/feat_swipe_match.png",
  },
  {
    title: "Voice Screening",
    body: "Candidates share short voice samples so hiring teams hear communication style before scheduling calls.",
    image: "/Assets/feat_voice_screening.png",
  },
  {
    title: "AI-Based Assessment",
    body: "Evaluate candidates with AI-Powered assessments tailored to your job requirements",
    image: "/Assets/feat_Ai_assessment.png",
  },
  {
    title: "Structured Profile",
    body: "Skills, experience, and roles live in rich profiles backed by your user and job APIs.",
    image: "/Assets/feat_Structure_prof.png",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="scroll-mt-24 bg-[#f5f6f8] dark:bg-slate-950 pb-24 pt-6 transition-colors duration-300"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 md:gap-12">
          <div className="max-w-md">
            <h2 className="font-sans text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl leading-tight">
              Built for Speed and Signal
            </h2>
          </div>
          <div className="max-w-2xl">
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              Core modules from your stack — auth, profiles, jobs, swipes, matches, voice, and
              messaging surfaced in one fluid experience.
            </p>
          </div>
        </div>

        {/* Grid Block */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.title}
              className="bg-white dark:bg-slate-900 rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 dark:border-slate-800/50 flex flex-col hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all duration-300 group"
            >
              {/* Image Visual Area */}
              <div className="w-full h-[240px] rounded-[20px] bg-[#f8f9fa] dark:bg-slate-950/40 flex items-center justify-center overflow-hidden mb-6 p-6 transition-transform duration-300 group-hover:scale-[1.01]">
                <img
                  src={item.image}
                  alt={item.title}
                  className="max-h-full max-w-full object-contain select-none pointer-events-none drop-shadow-sm"
                />
              </div>

              {/* Text Area */}
              <div className="px-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
