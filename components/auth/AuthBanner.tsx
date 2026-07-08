import Link from "next/link";

export function AuthBanner() {
  return (
    <div className="hidden lg:flex lg:w-[45%] rounded-[32px] bg-[#2782FF] relative overflow-hidden p-12 flex-col justify-between min-h-[600px] shadow-sm select-none">
      {/* Background pattern */}
      <img
        src="/Assets/Auth_pic.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
      
      {/* Logo at Top Left */}
      <div className="relative z-10">
        <Link href="/" className="text-3xl font-extrabold tracking-tight text-white">
          Rolr
        </Link>
      </div>

      {/* Center Illustration Slides */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-8">
        <img
          src="/Assets/Auth_Slides.png"
          alt="Rolr App Experience Preview"
          className="w-full max-w-[620px] h-auto object-contain pointer-events-none drop-shadow-[0_12px_36px_rgba(0,0,0,0.08)]"
        />
      </div>

      {/* Translucent bottom banner card */}
      <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-[24px] p-8 text-white w-full">
        <h3 className="text-lg font-extrabold tracking-wider uppercase text-white">
          SWIPE INTO YOUR NEXT ROLE
        </h3>
        <p className="mt-3 text-sm text-slate-100 font-semibold leading-relaxed opacity-95">
          A fast, visual discovery layer for jobs and talent. Voice screening and
          instant messaging activate the moment both sides swipe right.
        </p>
      </div>
    </div>
  );
}
