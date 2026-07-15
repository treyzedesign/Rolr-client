export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="scroll-mt-24 bg-white dark:bg-slate-950 py-24 transition-colors duration-300"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        {/* Centered Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="font-sans text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            Real Success Stories
          </h2>
          <p className="mt-6 text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            Listen to what our users are saying about Rolr
          </p>
        </div>

        {/* 3-Column Testimonial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* Left Column - 2 Text Testimonials */}
          <div className="lg:col-span-4 flex flex-col gap-6 h-full justify-between">
            {/* Testimonial 1 */}
            <div className="bg-[#f5f6f8] dark:bg-slate-900 rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.005)] border border-slate-100 dark:border-slate-800/40 flex flex-col justify-between flex-1">
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                "I swiped on a remote customer support specialist role, matched instantly, and completed my voice screening. Within a week, I was scheduled for interviews and landed my dream remote-ready job!"
              </p>
              <div className="border-t border-slate-200/80 dark:border-slate-800/80 mt-6 pt-6 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <img
                    src="/Assets/avatar_pic.png"
                    alt="Avatar"
                    className="w-11 h-11 rounded-xl object-cover bg-purple-100 dark:bg-purple-950/40 p-1"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-tight">
                      Amara Nwachukwu
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-400 font-medium">
                      Job Seeker
                    </p>
                  </div>
                </div>
                <img
                  src="/Assets/blue_quote.png"
                  alt="Quote"
                  className="w-5 h-4 opacity-90 select-none pointer-events-none"
                />
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-[#f5f6f8] dark:bg-slate-900 rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.005)] border border-slate-100 dark:border-slate-800/40 flex flex-col justify-between flex-1">
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                "DevFlow saved dozens of hours hiring remote-ready support representatives. We swiped through qualified candidates, listened to their audio responses, and built a global customer service team in record time."
              </p>
              <div className="border-t border-slate-200/80 dark:border-slate-800/80 mt-6 pt-6 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <img
                    src="/Assets/avatar_pic.png"
                    alt="Avatar"
                    className="w-11 h-11 rounded-xl object-cover bg-purple-100 dark:bg-purple-950/40 p-1"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-tight">
                      Marcus Chen
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-400 font-medium">
                      Employer (CEO, DevFlow)
                    </p>
                  </div>
                </div>
                <img
                  src="/Assets/blue_quote.png"
                  alt="Quote"
                  className="w-5 h-4 opacity-90 select-none pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Center Column - Featured Portrait Image Card */}
          <div className="lg:col-span-4 flex justify-center h-full">
            <div className="relative rounded-[28px] overflow-hidden group shadow-lg border border-slate-100 dark:border-slate-800/60 max-w-[380px] lg:max-w-none w-full h-[520px]">
              <img
                src="/Assets/Testimonial_pic2.png"
                alt="Featured Success Story"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />

              {/* Frosted Glass Overlay Card at bottom */}
              {/* <div className="absolute inset-x-4 bottom-4 bg-white/20 dark:bg-slate-900/40 backdrop-blur-lg border border-white/25 dark:border-slate-800/40 rounded-[20px] p-6 shadow-xl text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src="/Assets/avatar_pic.png"
                      alt="Avatar"
                      className="w-11 h-11 rounded-xl object-cover bg-white/30 p-1 backdrop-blur"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm sm:text-base leading-tight">
                        Tom Tom.
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-200 font-medium">
                        Employer
                      </p>
                    </div>
                  </div>
                  <img
                    src="/Assets/blue_quote.png"
                    alt="Quote"
                    className="w-5 h-4 invert brightness-200 opacity-90 select-none pointer-events-none"
                  />
                </div>
                <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-semibold">
                  "The platform makes candidate screening faster and reduces manual work."
                </p>
              </div> */}
            </div>
          </div>

          {/* Right Column - 2 Text Testimonials */}
          <div className="lg:col-span-4 flex flex-col gap-6 h-full justify-between">
            {/* Testimonial 3 */}
            <div className="bg-[#f5f6f8] dark:bg-slate-900 rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.005)] border border-slate-100 dark:border-slate-800/40 flex flex-col justify-between flex-1">
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                "Hiring for administrative assistants and executive roles used to take weeks. With Rolr's AI match, we found remote-ready admin professionals who fit our business needs immediately."
              </p>
              <div className="border-t border-slate-200/80 dark:border-slate-800/80 mt-6 pt-6 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <img
                    src="/Assets/avatar_pic.png"
                    alt="Avatar"
                    className="w-11 h-11 rounded-xl object-cover bg-purple-100 dark:bg-purple-950/40 p-1"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-tight">
                      Sophia Patel
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-400 font-medium">
                      Employer (HR Director)
                    </p>
                  </div>
                </div>
                <img
                  src="/Assets/blue_quote.png"
                  alt="Quote"
                  className="w-5 h-4 opacity-90 select-none pointer-events-none"
                />
              </div>
            </div>

            {/* Testimonial 4 */}
            <div className="bg-[#f5f6f8] dark:bg-slate-900 rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.005)] border border-slate-100 dark:border-slate-800/40 flex flex-col justify-between flex-1">
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                "Finding a remote office coordinator or executive admin assistant role was so smooth here. Vetting companies via swipe and voice screen made me stand out as a remote-ready candidate."
              </p>
              <div className="border-t border-slate-200/80 dark:border-slate-800/80 mt-6 pt-6 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <img
                    src="/Assets/avatar_pic.png"
                    alt="Avatar"
                    className="w-11 h-11 rounded-xl object-cover bg-purple-100 dark:bg-purple-950/40 p-1"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-tight">
                      David Aina
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-400 font-medium">
                      Job Seeker
                    </p>
                  </div>
                </div>
                <img
                  src="/Assets/blue_quote.png"
                  alt="Quote"
                  className="w-5 h-4 opacity-90 select-none pointer-events-none"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
