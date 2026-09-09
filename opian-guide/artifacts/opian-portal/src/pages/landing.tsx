import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronRight, Menu, X, Check, Phone, Mail, ArrowRight } from "lucide-react";

// ─── Animation helpers ────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
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
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between py-4">
        <button onClick={() => scrollTo("home")} className="flex items-center">
          <span
            className="font-serif font-bold tracking-widest text-white text-xl select-none"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif", letterSpacing: "0.18em" }}
          >
            MY<span style={{ color: "#f97316" }}>IFA</span>
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className={`text-sm font-medium transition-colors ${scrolled ? "text-gray-600 hover:text-gray-900" : "text-white/80 hover:text-white"}`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/auth">
            <button className={`text-sm font-medium px-5 py-2 rounded-lg transition-all border ${scrolled ? "border-gray-200 text-gray-700 hover:bg-gray-50" : "border-white/30 text-white hover:bg-white/10"}`}>
              Sign In
            </button>
          </Link>
          <Link href="/auth?role=client">
            <button className="bg-[#E07820] hover:bg-[#c96a18] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors shadow-md shadow-[#E07820]/25">
              Book Consultation
            </button>
          </Link>
        </div>

        <button
          className={`md:hidden p-2 ${scrolled ? "text-gray-800" : "text-white"}`}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3 shadow-lg">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => { scrollTo(link.id); setMenuOpen(false); }}
              className="block w-full text-left text-gray-700 hover:text-gray-900 text-sm font-medium py-2"
            >
              {link.label}
            </button>
          ))}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <Link href="/auth" className="flex-1">
              <button className="w-full text-gray-700 border border-gray-200 text-sm font-medium px-4 py-2 rounded-lg">Sign In</button>
            </Link>
            <Link href="/auth?role=client" className="flex-1">
              <button className="w-full bg-[#E07820] text-white text-sm font-semibold px-4 py-2 rounded-lg">Book Consultation</button>
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
    icon: "🏛️",
    title: "Estate Planning",
    description: "Comprehensive strategies to protect, grow, and transfer your wealth to future generations with precision and care.",
    img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&auto=format&fit=crop&q=80",
  },
  {
    icon: "🛡️",
    title: "Life & Risk Insurance",
    description: "Tailored life, disability, and dread disease cover that ensures your family's financial security no matter what.",
    img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=80",
  },
  {
    icon: "💼",
    title: "Business Financial Planning",
    description: "Structured financial planning for business owners — from buy-and-sell agreements to key-person cover.",
    img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&auto=format&fit=crop&q=80",
  },
  {
    icon: "🌅",
    title: "Retirement Planning",
    description: "Strategic retirement solutions to ensure you live comfortably and confidently in your golden years.",
    img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
  },
  {
    icon: "💚",
    title: "General Financial Wellness",
    description: "Holistic financial coaching and planning to put you in control of your money and your future.",
    img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80",
  },
];

const whyChoose = [
  { title: "Personalised advice tailored to your unique goals and life stage" },
  { title: "Fully licensed and regulated by the FSCA" },
  { title: "Independent advisors — no obligation to any single product provider" },
  { title: "Annual reviews that evolve with your changing circumstances" },
  { title: "Free, no-obligation initial consultation" },
  { title: "Transparent fee structure with no hidden costs" },
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
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
      <Nav />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section
        id="home"
        className="relative min-h-screen flex items-center overflow-hidden"
      >
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1800&auto=format&fit=crop&q=85')",
          }}
        />
        {/* Overlay — lighter on right, heavier on left for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1e35]/90 via-[#0f1e35]/70 to-[#0f1e35]/20" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 w-full">
          <div className="max-w-2xl">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center border border-white/30 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest text-white/80 uppercase mb-8"
            >
              Authorised Financial Services Provider
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={1}
              className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 text-white"
            >
              Your Financial Future,{" "}
              <em className="text-[#E07820] not-italic">Secured &amp; Prosperous</em>
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={2}
              className="text-white/65 text-lg md:text-xl leading-relaxed mb-10 max-w-xl"
            >
              MyIFA Financial Services provides expert long-term assurance, estate planning,
              and wealth protection strategies tailored for South Africans.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={3}
              className="flex flex-wrap gap-4"
            >
              <Link href="/auth?role=client">
                <button className="bg-[#E07820] hover:bg-[#c96a18] text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors shadow-2xl shadow-[#E07820]/30 flex items-center gap-2">
                  Book a Free Consultation <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <button
                onClick={() => scrollTo("services")}
                className="border border-white/40 hover:border-white/70 hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all backdrop-blur-sm"
              >
                Explore Our Services
              </button>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => scrollTo("stats")}
        >
          <div className="w-6 h-10 border border-white/30 rounded-full flex items-start justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-1 bg-white/60 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────────────── */}
      <section id="stats" className="bg-[#1B2A4A] py-14">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i * 0.3}
              className="text-center"
            >
              <div className="font-serif text-3xl md:text-4xl font-bold text-[#E07820] mb-1">{s.value}</div>
              <div className="text-white/50 text-sm font-medium">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Services ──────────────────────────────────────────────────── */}
      <section id="services" className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <p className="text-[#E07820] text-sm font-semibold uppercase tracking-widest mb-3">What We Offer</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-base">
              Comprehensive financial services designed to protect what matters most and grow what's possible.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i * 0.15}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 cursor-pointer"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={s.img}
                    alt={s.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <span className="absolute bottom-3 left-4 text-2xl">{s.icon}</span>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{s.description}</p>
                  <span className="text-[#E07820] text-sm font-semibold flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                    Learn more <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </motion.div>
            ))}

            {/* CTA card */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={services.length * 0.15}
              className="rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-5 bg-gradient-to-br from-[#1B2A4A] to-[#0f1e35] border border-[#1B2A4A]"
            >
              <p className="text-white/60 text-sm leading-relaxed">Ready to take control of your financial future?</p>
              <Link href="/auth?role=client">
                <button className="bg-[#E07820] hover:bg-[#c96a18] text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg">
                  View All Services
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Why Choose ────────────────────────────────────────────────── */}
      <section id="about" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&auto=format&fit=crop&q=85"
                  alt="Financial advisors meeting"
                  className="w-full h-[480px] object-cover"
                />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-6 -right-6 bg-[#E07820] rounded-2xl p-6 shadow-xl text-white">
                <div className="font-serif text-4xl font-bold">15+</div>
                <div className="text-white/80 text-sm mt-1">Years of Excellence</div>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0.2}
            >
              <p className="text-[#E07820] text-sm font-semibold uppercase tracking-widest mb-3">Why Choose Us</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-5">
                We combine deep expertise with genuine care
              </h2>
              <p className="text-gray-500 text-base leading-relaxed mb-8">
                At MyIFA Financial Services, we believe every South African deserves access to
                expert, personalised financial guidance. Our independent advisors have no allegiance
                to any single product provider — only to you.
              </p>

              <ul className="space-y-3.5">
                {whyChoose.map((item, i) => (
                  <motion.li
                    key={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    custom={i * 0.1}
                    className="flex items-start gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#E07820]/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-[#E07820]" />
                    </div>
                    <span className="text-gray-600 text-sm leading-relaxed">{item.title}</span>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-10">
                <Link href="/auth?role=client">
                  <button className="bg-[#1B2A4A] hover:bg-[#253d6b] text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-colors flex items-center gap-2">
                    Book Your Free Consultation <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Team ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <p className="text-[#E07820] text-sm font-semibold uppercase tracking-widest mb-3">The People Behind the Plan</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-base">
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
                custom={i * 0.1}
                className="flex flex-col items-center text-center gap-3"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1B2A4A] to-[#253d6b] flex items-center justify-center shadow-md">
                  <span className="font-serif font-bold text-white text-lg">{member.initials}</span>
                </div>
                <div>
                  <p className="text-gray-900 text-sm font-semibold leading-tight">{member.name}</p>
                  <p className="text-gray-400 text-xs mt-0.5 leading-snug">{member.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial ───────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <p className="text-[#E07820] text-sm font-semibold uppercase tracking-widest mb-3">Client Stories</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900">Real results for real South Africans</h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0.2}
            className="bg-gradient-to-br from-[#1B2A4A] to-[#0f1e35] rounded-3xl p-10 md:p-14 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#E07820]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="font-serif text-7xl text-[#E07820]/30 leading-none absolute top-6 left-8 select-none">"</div>
            <blockquote className="relative z-10">
              <p className="text-white/80 text-lg md:text-xl leading-relaxed italic mb-8 max-w-2xl">
                Lance and the MyIFA team transformed my financial outlook. Their estate planning
                advice gave me complete peace of mind about my family's future.
              </p>
              <footer className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#E07820]/20 border-2 border-[#E07820]/40 flex items-center justify-center shrink-0">
                  <span className="font-semibold text-[#E07820]">SV</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Sarah van der Merwe</p>
                  <p className="text-white/40 text-sm">Business Owner, Cape Town</p>
                </div>
              </footer>
            </blockquote>
          </motion.div>
        </div>
      </section>

      {/* ── CTA / Contact ─────────────────────────────────────────────── */}
      <section
        id="contact"
        className="relative py-28 px-6 overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&auto=format&fit=crop&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-[#1B2A4A]/88" />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <p className="text-[#E07820] text-sm font-semibold uppercase tracking-widest mb-4">Take the First Step</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-5">Ready to Prosper?</h2>
            <p className="text-white/55 text-lg mb-10 leading-relaxed">
              Book a free, no-obligation consultation with one of our expert advisers.
              One conversation can change your financial future.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/auth?role=client">
                <button className="bg-[#E07820] hover:bg-[#c96a18] text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors shadow-2xl shadow-[#E07820]/30 flex items-center gap-2">
                  Book Free Consultation <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <a
                href="tel:+27861263346"
                className="border border-white/30 hover:border-white/60 hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all flex items-center gap-2"
              >
                <Phone className="h-4 w-4" /> +27 86 126 3346
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="bg-[#070e1c] border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <span
            className="font-serif font-bold tracking-widest text-white/80 text-lg select-none"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif", letterSpacing: "0.18em" }}
          >
            MY<span style={{ color: "#f97316" }}>IFA</span>
          </span>

          <p className="text-white/25 text-xs text-center">
            © {new Date().getFullYear()} MyIFA Financial Services. Authorised Financial Services Provider (FSP No. XXXXX). All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <Link href="/auth">
              <span className="text-white/40 hover:text-white/70 text-xs transition-colors cursor-pointer">Sign In</span>
            </Link>
            <Link href="/auth?role=advisor">
              <span className="text-white/40 hover:text-white/70 text-xs transition-colors cursor-pointer">Advisor Portal</span>
            </Link>
            <a href="mailto:info@myifa.co.za" className="text-white/40 hover:text-white/70 text-xs transition-colors flex items-center gap-1">
              <Mail className="h-3 w-3" /> info@myifa.co.za
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
