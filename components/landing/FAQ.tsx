const faqs = [
  {
    q: "Who is WorkSwipe for?",
    a: "Teams hiring at volume and candidates who want a faster, more visual way to discover fit — without sacrificing voice and context.",
  },
  {
    q: "How does matching work?",
    a: "Swipes are stored per user, job, or candidate. When both sides swipe right, a match is created and messaging becomes available.",
  },
  {
    q: "Why voice samples?",
    a: "Short recordings help employers assess clarity and tone early. Files are handled like other media — stored securely with access tied to your roles.",
  },
  {
    q: "Is my data secure?",
    a: "The platform is designed around hashed passwords, JWT sessions, rate limiting, and role-based access — aligned with the security model in your backend.",
  },
  {
    q: "Can employers schedule interviews in-app?",
    a: "Yes. Once matched, parties can move from chat to scheduled interviews linked to that match.",
  },
];

export function FAQ() {
  return (
    <section
      id="faq"
      className="scroll-mt-24 border-t border-blue-100 bg-white px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="font-display text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Frequently asked questions
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-center text-slate-600">
          Straight answers about swipe matching, voice, and how the product
          maps to your API.
        </p>
        <div className="mt-12 space-y-3">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-blue-100 bg-blue-50/35 backdrop-blur-sm open:border-sky-500/25 open:bg-blue-50/65"
            >
              <summary className="cursor-pointer list-none px-6 py-5 font-display text-base font-semibold text-slate-900 transition group-open:text-blue-700 [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <span className="shrink-0 text-sky-400 transition group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="border-t border-blue-100 px-6 pb-5 pt-0 text-sm leading-relaxed text-slate-600">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
