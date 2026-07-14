import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

// ─── Animation helpers ────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ─── Nav ─────────────────────────────────────────────────────────────────────

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Home", id: "home" },
    { label: "Services", id: "services" },
    { label: "About Us", id: "about" },
    { label: "Contact", id: "contact" },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#0d1b35]/95 backdrop-blur-md shadow-lg shadow-black/20" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between py-4">
        {/* Logo */}
        <button onClick={() => scrollTo("home")} className="flex items-center">
          <Logo />
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="text-white/70 hover:text-white text-sm font-medium transition-colors"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/auth">
            <button className="text-white border border-white/30 hover:border-white/60 hover:bg-white/5 text-sm font-medium px-5 py-2 rounded-md transition-all">
              Sign In
            </button>
          </Link>
          <Link href="/auth?role=client">
            <button className="bg-[#C9A52A] hover:bg-[#b8941f] text-white text-sm font-semibold px-5 py-2 rounded-md transition-colors shadow-lg shadow-[#C9A52A]/25">
              Book Consultation
            </button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0d1b35]/98 border-t border-white/10 px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => { scrollTo(link.id); setMenuOpen(false); }}
              className="block w-full text-left text-white/70 hover:text-white text-sm font-medium py-2"
            >
              {link.label}
            </button>
          ))}
          <div className="flex gap-3 pt-2">
            <Link href="/auth" className="flex-1">
              <button className="w-full text-white border border-white/30 text-sm font-medium px-4 py-2 rounded-md">
                Sign In
              </button>
            </Link>
            <Link href="/auth?role=client" className="flex-1">
              <button className="w-full bg-[#C9A52A] text-white text-sm font-semibold px-4 py-2 rounded-md">
                Book Consultation
              </button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const stats = [
  { value: "15+", label: "Years Experience" },
  { value: "2,400+", label: "Families Protected" },
  { value: "R1.2B+", label: "Assets Managed" },
  { value: "98%", label: "Client Satisfaction" },
];

const services = [
  {
    emoji: "🏛️",
    title: "Estate Planning",
    description:
      "Comprehensive strategies to protect, grow, and transfer your wealth to future generations with precision and care.",
  },
  {
    emoji: "🛡️",
    title: "Life & Risk Insurance",
    description:
      "Tailored life, disability, and dread disease cover that ensures your family's financial security no matter what.",
  },
  {
    emoji: "💼",
    title: "Business Financial Planning",
    description:
      "Structured financial planning for business owners — from buy-and-sell agreements to key-person cover.",
  },
  {
    emoji: "🌅",
    title: "Retirement Planning",
    description:
      "Strategic retirement solutions to ensure you live comfortably and confidently in your golden years.",
  },
  {
    emoji: "💚",
    title: "General Financial Wellness",
    description:
      "Holistic financial coaching and planning to put you in control of your money and your future.",
  },
];

const whyChoose = [
  {
    emoji: "🎯",
    title: "Personalised Advice",
    description:
      "No one-size-fits-all solutions. Every strategy is crafted around your unique goals, risk profile, and life stage.",
  },
  {
    emoji: "🔐",
    title: "Licensed & Regulated",
    description:
      "Fully authorised by the FSCA. Your assets and interests are protected by South Africa's financial regulations.",
  },
  {
    emoji: "🤝",
    title: "Long-Term Partnership",
    description:
      "We're not just advisers — we're partners in your financial journey, reviewing and adapting your plan as life evolves.",
  },
];

const team = [
  { initials: "LH", name: "Lance Heynes", title: "Director of Operations" },
  { initials: "KM", name: "Kyle McBryne", title: "Systems Developer" },
  { initials: "WK", name: "Wessel Krige", title: "Social Media Manager" },
  { initials: "MB", name: "Mic-Shane Brown", title: "Head of Admin" },
  { initials: "JR", name: "Jodie Rensburg", title: "Client Services" },
  { initials: "LL", name: "Lionel Lottering", title: "Head of Investor Matters" },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0f1e35] font-sans text-white antialiased">
      <Nav />

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section
        id="home"
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, #1a3260 0%, #0d1b35 55%, #08111f 100%)",
        }}
      >
        {/* Subtle particle dots */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/10"
              style={{
                width: Math.random() * 3 + 1 + "px",
                height: Math.random() * 3 + 1 + "px",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
                opacity: Math.random() * 0.4 + 0.1,
              }}
            />
          ))}
        </div>

        {/* Gold glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C9A52A]/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#C9A52A]/6 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Badge */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center border border-white/25 rounded-full px-5 py-2 text-xs font-semibold tracking-[0.18em] text-white/70 uppercase mb-10"
          >
            Authorised Financial Services Provider
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6"
          >
            <span className="text-white">Your Financial Future,</span>
            <br />
            <em className="text-[#C9A52A] not-italic">Secured &amp; Prosperous</em>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="text-white/55 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10"
          >
            MyIFAPortal provides expert long-term assurance, estate planning,
            and wealth protection strategies tailored for discerning South Africans.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link href="/auth?role=client">
              <button className="bg-[#C9A52A] hover:bg-[#b8941f] text-white font-semibold px-8 py-3.5 rounded-lg text-base transition-colors shadow-xl shadow-[#C9A52A]/20">
                Book a Free Consultation
              </button>
            </Link>
            <button
              onClick={() => scrollTo("services")}
              className="border border-white/30 hover:border-white/60 hover:bg-white/5 text-white font-semibold px-8 py-3.5 rounded-lg text-base transition-all"
            >
              Explore Our Services
            </button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => scrollTo("stats")}
        >
          <span className="text-white/30 text-[10px] font-semibold tracking-[0.25em] uppercase">Scroll</span>
          <div className="w-6 h-10 border border-white/25 rounded-full flex items-start justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-1 bg-white/50 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────────── */}
      <section id="stats" className="bg-[#0a1628] border-y border-white/8 py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i * 0.5}
              className="text-center"
            >
              <div className="font-serif text-3xl md:text-4xl font-bold text-[#C9A52A] mb-1">
                {s.value}
              </div>
              <div className="text-white/45 text-sm font-medium">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Services ───────────────────────────────────────────────── */}
      <section id="services" className="py-24 px-6 bg-[#0d1b35]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
              Our Services
            </h2>
            <p className="text-white/45 max-w-xl mx-auto text-base">
              Comprehensive financial services designed to protect what matters most and grow
              what's possible.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i * 0.3}
                className="group bg-white/4 hover:bg-white/7 border border-white/8 hover:border-[#C9A52A]/30 rounded-2xl p-7 cursor-pointer transition-all duration-300"
              >
                <div className="text-3xl mb-4">{s.emoji}</div>
                <h3 className="font-semibold text-white text-lg mb-2">{s.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed mb-5">{s.description}</p>
                <span className="text-[#C9A52A] text-sm font-medium group-hover:gap-2 flex items-center gap-1.5 transition-all">
                  Learn more <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </motion.div>
            ))}

            {/* View All card */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={services.length * 0.3}
              className="border border-dashed border-white/15 rounded-2xl p-7 flex flex-col items-center justify-center text-center gap-4"
            >
              <p className="text-white/40 text-sm">Ready to explore everything we offer?</p>
              <Link href="/auth?role=client">
                <button className="bg-[#C9A52A] hover:bg-[#b8941f] text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors">
                  View All Services
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Why Choose ─────────────────────────────────────────────── */}
      <section id="about" className="py-24 px-6 bg-[#0a1628]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose MyIFAPortal?
            </h2>
            <p className="text-white/45 max-w-xl mx-auto text-base">
              We combine deep expertise with genuine care to deliver financial solutions that stand
              the test of time.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {whyChoose.map((item, i) => (
              <motion.div
                key={item.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i * 0.4}
                className="text-center"
              >
                <div className="text-4xl mb-5">{item.emoji}</div>
                <h3 className="font-semibold text-white text-lg mb-3">{item.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ───────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#0d1b35]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
              Meet Our Team
            </h2>
            <p className="text-white/45 max-w-xl mx-auto text-base">
              Experienced professionals dedicated to your financial success.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i * 0.2}
                className="flex flex-col items-center text-center gap-3"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C9A52A]/30 to-[#C9A52A]/10 border border-[#C9A52A]/30 flex items-center justify-center">
                  <span className="font-serif font-bold text-[#C9A52A] text-lg">
                    {member.initials}
                  </span>
                </div>
                <div>
                  <p className="text-white text-sm font-semibold leading-tight">{member.name}</p>
                  <p className="text-white/40 text-xs mt-0.5 leading-snug">{member.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial ────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#0a1628]">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-12">
              Client Stories
            </h2>

            <div className="bg-white/4 border border-white/10 rounded-2xl p-10 relative">
              {/* Big quote mark */}
              <div className="font-serif text-8xl text-[#C9A52A]/20 leading-none absolute top-4 left-8 select-none">
                "
              </div>
              <blockquote className="relative z-10">
                <p className="text-white/75 text-lg leading-relaxed italic mb-8">
                  Lance and the MyIFAPortal team transformed my financial outlook. Their estate planning
                  advice gave me complete peace of mind about my family's future.
                </p>
                <footer className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#C9A52A]/20 border border-[#C9A52A]/30 flex items-center justify-center">
                    <span className="font-semibold text-[#C9A52A] text-sm">SV</span>
                  </div>
                  <div className="text-left">
                    <p className="text-white font-semibold text-sm">Sarah van der Merwe</p>
                    <p className="text-white/40 text-xs">Business Owner, Cape Town</p>
                  </div>
                </footer>
              </blockquote>
            </div>

            <p className="text-white/25 text-sm mt-6">Real results for real South Africans.</p>
          </motion.div>
        </div>
      </section>

      {/* ── CTA / Contact ──────────────────────────────────────────── */}
      <section
        id="contact"
        className="py-28 px-6 text-center relative overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 50% 100%, #1a3260 0%, #0d1b35 60%, #08111f 100%)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#C9A52A]/6 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-5">
              Ready to Prosper?
            </h2>
            <p className="text-white/50 text-lg mb-10 leading-relaxed">
              Take the first step toward financial security. Book a free, no-obligation consultation
              with one of our expert advisers.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/auth?role=client">
                <button className="bg-[#C9A52A] hover:bg-[#b8941f] text-white font-semibold px-8 py-3.5 rounded-lg text-base transition-colors shadow-xl shadow-[#C9A52A]/20">
                  Book Free Consultation
                </button>
              </Link>
              <a
                href="tel:+27861263346"
                className="border border-white/30 hover:border-white/60 hover:bg-white/5 text-white font-semibold px-8 py-3.5 rounded-lg text-base transition-all"
              >
                Call +27 86 126 3346
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="bg-[#070e1c] border-t border-white/8 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <Logo className="scale-90" />
          </div>
          <p className="text-white/25 text-xs text-center">
            © {new Date().getFullYear()} MyIFAPortal. Authorised Financial Services Provider (FSP No. XXXXX).
            All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/auth">
              <span className="text-white/40 hover:text-white/70 text-xs transition-colors cursor-pointer">
                Sign In
              </span>
            </Link>
            <Link href="/auth?role=advisor">
              <span className="text-white/40 hover:text-white/70 text-xs transition-colors cursor-pointer">
                Advisor Portal
              </span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
