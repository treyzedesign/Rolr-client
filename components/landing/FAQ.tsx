"use client";

import { useState } from "react";
import toast from "react-hot-toast";

const faqs = [
  {
    q: "Who is Rolr for?",
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
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText("info@rolr.com");
    toast.success("Email copied to clipboard!");
  };

  return (
    <section
      id="faq"
      className="scroll-mt-24 bg-[#f5f6f8] dark:bg-slate-950 py-24 transition-colors duration-300"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">

          {/* Left Column - Headers and Still Have Questions */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <h2 className="font-sans text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl leading-tight">
                Frequently asked questions
              </h2>
              <p className="mt-6 text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                Straight answers about swipe matching, voice, and how the product maps to your API.
              </p>
            </div>

            {/* Still have questions helper card */}
            <div className="mt-10 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.015)]">
              <h3 className="font-sans text-lg font-bold text-slate-900 dark:text-slate-100">
                Still have Questions?
              </h3>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Can't find the answers you are looking for? Our team is happy to help. Reach out to us anytime and we'll get back to you shortly.
              </p>

              {/* Email Drop Box */}
              <div className="mt-6 flex items-center justify-between bg-[#f0f6ff] dark:bg-blue-950/20 border border-[#dce9fe] dark:border-blue-900/40 rounded-2xl p-4 transition-all hover:bg-[#e6f0fe] dark:hover:bg-blue-950/30">
                <div className="flex items-center gap-3.5">
                  <div className="text-[#2782FF]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
                    </svg>
                  </div>
                  <div className="flex flex-col text-left">
                    <a href="mailto:info@rolr.com" className="text-sm font-bold text-[#2782FF] hover:underline">
                      Drop an email
                    </a>
                    <span className="text-xs text-slate-400 font-medium">
                      info@rolr.com
                    </span>
                  </div>
                </div>

                {/* Copy Button */}
                <button
                  onClick={copyEmail}
                  className="text-[#2782FF] p-2 hover:bg-[#d5e6fe] dark:hover:bg-blue-900/40 rounded-lg transition-colors cursor-pointer"
                  title="Copy email"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002-2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - FAQ Accordion List */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {faqs.map((faq, index) => {
              const isOpen = activeIndex === index;
              return (
                <div
                  key={faq.q}
                  className={`bg-white dark:bg-slate-900 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] border transition-all duration-300 ${isOpen
                      ? "border-[#2782FF] ring-1 ring-[#2782FF]/10"
                      : "border-slate-100 dark:border-slate-800/80"
                    }`}
                >
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full flex items-center justify-between text-left p-6 font-sans text-base font-bold text-slate-900 dark:text-slate-100 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-full transition-colors ${isOpen ? "text-[#2782FF] bg-[#2782FF]/10" : "text-slate-400 bg-slate-50 dark:bg-slate-800"
                      }`}>
                      {isOpen ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 12H6" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v12M6 12h12" />
                        </svg>
                      )}
                    </span>
                  </button>

                  {/* Expanded Content with CSS transition heights */}
                  <div className={`transition-all duration-300 overflow-hidden ${isOpen ? "max-h-[200px] opacity-100 border-t border-slate-100 dark:border-slate-800/50" : "max-h-0 opacity-0 pointer-events-none"
                    }`}>
                    <p className="p-6 text-sm sm:text-base leading-relaxed text-slate-500 dark:text-slate-400">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
