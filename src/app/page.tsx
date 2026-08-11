import Image from "next/image";
import { GoogleIcon, LeafIcon, SparkleIcon } from "@/components/icons";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "For Readers", href: "#for-readers" },
  { label: "Community", href: "#community" },
];

const features = [
  {
    title: "Track & Reflect",
    description: "Log your books, rate, review, and look back on your reading journey.",
    icon: "/feature-icon-1.png",
  },
  {
    title: "Smart TBR",
    description: "Organize your TBR your way and never lose a good book again.",
    icon: "/feature-icon-2.png",
  },
  {
    title: "Reading Parties",
    description: "Join cozy reading sessions with friends and meet new book lovers.",
    icon: "/feature-icon-3.png",
  },
  {
    title: "Reading Goals",
    description: "Set goals, build streaks, and stay motivated all year long.",
    icon: "/feature-icon-4.png",
  },
  {
    title: "Your Reading Room",
    description: "Personalize your space and make it truly your own.",
    icon: "/feature-icon-5.png",
  },
];

const avatars = [
  "/avatars/1.png",
  "/avatars/2.png",
  "/avatars/3.png",
  "/avatars/4.png",
  "/avatars/5.png",
  "/avatars/6.png",
];

export default function Home() {
  return (
    <div className="page-shell relative min-h-screen overflow-hidden">
      <header className="relative z-30 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <a href="/" className="flex items-center gap-2 text-forest">
          <LeafIcon className="h-5 w-5" />
          <span className="font-serif text-[1.55rem] font-semibold tracking-[-0.02em]">
            ReadLife
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[0.95rem] font-medium text-forest-soft/90 transition hover:text-forest"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <a
            href="/home"
            className="rounded-full border border-forest/70 px-4 py-1.5 text-sm font-semibold text-forest transition hover:bg-forest/5"
          >
            Log in
          </a>
          <a
            href="/home"
            className="inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-1.5 text-sm font-semibold text-paper shadow-sm transition hover:bg-forest-deep"
          >
            Sign up
            <LeafIcon className="h-3.5 w-3.5 text-paper/90" />
          </a>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="hero-glow relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-10 pt-4 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:px-10 lg:pb-14 lg:pt-6">
          <div className="max-w-xl">
            <div className="animate-fade-up inline-flex items-center gap-1.5 rounded-full bg-peach/80 px-3.5 py-1 text-[0.8rem] font-semibold text-peach-text">
              <SparkleIcon className="h-3 w-3 text-gold" />
              For readers, by readers
            </div>

            <h1 className="animate-fade-up-delay-1 mt-5 font-serif text-[2.55rem] leading-[1.12] font-semibold tracking-[-0.025em] text-forest sm:text-[3.15rem] lg:text-[3.4rem]">
              Your reading life,{" "}
              <span className="relative inline-block">
                beautifully organized
                <SparkleIcon className="animate-twinkle absolute -right-5 top-2 h-4 w-4 text-gold sm:-right-6 sm:top-3 sm:h-5 sm:w-5" />
              </span>
              .
            </h1>

            <p className="animate-fade-up-delay-2 mt-5 max-w-md text-[1.05rem] leading-relaxed text-muted">
              Track your reads, curate your TBR, join reading parties, and discover
              books that feel like you. All in one cozy place.
            </p>

            <div className="animate-fade-up-delay-3 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="/home"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 text-[0.98rem] font-semibold text-paper shadow-[0_10px_24px_rgba(47,74,54,0.22)] transition hover:-translate-y-0.5 hover:bg-forest-deep"
              >
                <LeafIcon className="h-4 w-4" />
                Create your free account
              </a>
              <a
                href="/home"
                className="inline-flex items-center justify-center gap-2.5 rounded-full border border-forest/35 bg-paper px-6 py-3.5 text-[0.98rem] font-semibold text-forest transition hover:-translate-y-0.5 hover:bg-white"
              >
                <GoogleIcon />
                Continue with Google
              </a>
            </div>

            <p className="mt-5 text-sm text-muted">
              Already have an account?{" "}
              <a href="/home" className="font-semibold text-forest underline underline-offset-2">
                Log in
              </a>
            </p>
          </div>

          <div className="animate-float relative mx-auto w-full max-w-[520px] lg:justify-self-end lg:max-w-[560px]">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-[radial-gradient(circle_at_60%_40%,rgba(201,161,91,0.18),transparent_55%)] blur-2xl" />
            <Image
              src="/hero-nook.png"
              alt="Cozy reading nook with a green armchair, sleeping tabby cat, bookshelf, and TO BE READ cart"
              width={1024}
              height={768}
              className="relative z-10 aspect-[4/3] h-auto w-full rounded-[1.75rem] object-cover shadow-[0_24px_60px_rgba(60,45,30,0.18)]"
              priority
            />
          </div>
        </section>

        {/* Features */}
        <section id="features" className="relative mx-auto max-w-6xl px-5 pb-12 sm:px-8 lg:px-10">
          <h2 className="text-center font-serif text-[1.65rem] font-semibold tracking-[-0.02em] text-forest sm:text-[1.9rem]">
            Everything you need for your reading journey{" "}
            <span className="inline-block text-gold" aria-hidden>
              ✦
            </span>
          </h2>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-3.5">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="flex flex-col items-center rounded-[1.35rem] bg-cream-card px-3.5 pb-5 pt-4 text-center shadow-[0_1px_0_rgba(255,255,255,0.5)_inset] transition hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(60,45,30,0.08)]"
              >
                <div className="mb-3 flex h-[5.5rem] w-full items-center justify-center overflow-hidden">
                  <Image
                    src={feature.icon}
                    alt=""
                    width={160}
                    height={160}
                    className="h-[5.25rem] w-auto object-contain"
                  />
                </div>
                <h3 className="font-serif text-[1.05rem] font-semibold text-forest">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-[0.82rem] leading-snug text-muted">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Social proof */}
        <section
          id="community"
          className="relative z-10 mx-auto max-w-6xl px-5 pb-24 sm:px-8 lg:px-10"
        >
          <div className="flex flex-col gap-5 rounded-[1.5rem] border border-line/60 bg-paper/75 px-5 py-5 backdrop-blur-sm lg:flex-row lg:items-center lg:gap-0 lg:px-6 lg:py-4">
            <div className="relative z-10 flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 lg:pr-8">
              <div className="flex items-start gap-2">
                <div className="mt-1 flex flex-col gap-0.5 text-gold">
                  <SparkleIcon className="h-3 w-3" />
                  <SparkleIcon className="ml-2 h-2.5 w-2.5 opacity-70" />
                </div>
                <p className="max-w-[9.5rem] font-serif text-[0.95rem] leading-snug font-medium text-forest">
                  Loved by readers around the world
                </p>
              </div>
              <div className="relative z-10 flex shrink-0 items-center pl-1">
                {avatars.map((src, i) => (
                  <Image
                    key={src}
                    src={src}
                    alt=""
                    width={40}
                    height={40}
                    className="relative z-10 h-9 w-9 rounded-full border-2 border-paper object-cover"
                    style={{ marginLeft: i === 0 ? 0 : -10 }}
                  />
                ))}
                <div
                  className="relative z-10 ml-[-10px] flex h-9 min-w-9 items-center justify-center rounded-full border-2 border-paper bg-forest px-1 text-[0.62rem] font-bold tracking-tight text-gold"
                  aria-label="12 thousand more readers"
                >
                  +12K
                </div>
              </div>
            </div>

            <blockquote className="flex-1 border-t border-line/70 pt-4 text-center lg:border-t-0 lg:border-l lg:px-6 lg:pt-0">
              <p className="font-serif text-[0.92rem] leading-snug text-forest italic">
                &ldquo;ReadLife keeps me organized and makes reading even more fun.&rdquo;
              </p>
              <footer className="mt-1.5 text-xs text-muted-soft">— Sarah, avid reader</footer>
            </blockquote>

            <p className="flex flex-1 items-center justify-center gap-2 border-t border-line/70 pt-4 text-center font-serif text-[0.92rem] leading-snug text-forest lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
              <LeafIcon className="h-4 w-4 shrink-0 text-forest-soft" />
              <span>Join thousands of readers building a life filled with stories</span>
              <LeafIcon className="h-4 w-4 shrink-0 text-forest-soft" />
            </p>
          </div>
        </section>

        <div id="how-it-works" className="sr-only" />
        <div id="for-readers" className="sr-only" />
      </main>
    </div>
  );
}
