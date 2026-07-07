import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  TrendingUp,
  FileText,
  CalendarDays,
  ChevronRight,
  Users,
  Award,
  Globe,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: "easeOut" },
  }),
};

const services = [
  {
    icon: TrendingUp,
    title: "Wealth Management",
    description:
      "Personalised investment strategies tailored to your financial goals, risk appetite, and time horizon.",
  },
  {
    icon: ShieldCheck,
    title: "Policy Administration",
    description:
      "Comprehensive management of your life, disability, and health insurance policies in one secure place.",
  },
  {
    icon: FileText,
    title: "Financial Needs Analysis",
    description:
      "In-depth analysis of your financial position to identify gaps and build a robust protection plan.",
  },
  {
    icon: CalendarDays,
    title: "Advisor Appointments",
    description:
      "Schedule one-on-one sessions with your dedicated financial advisor at a time that suits you.",
  },
];

const stats = [
  { value: "20+", label: "Years of Excellence" },
  { value: "5 000+", label: "Clients Protected" },
  { value: "R2B+", label: "Assets Under Advice" },
  { value: "98%", label: "Client Retention Rate" },
];

const advisorFeatures = [
  "Manage your full client portfolio from one dashboard",
  "Submit and track FNA forms digitally",
  "Coordinate appointments and follow-ups",
  "Access client documents securely",
];

const clientFeatures = [
  "View your active policies at a glance",
  "Book appointments with your adviser",
  "Upload and access important documents",
  "Track the status of your FNA submission",
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-sidebar/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <div className="leading-none">
              <span className="font-serif text-lg font-bold text-white tracking-wider">OPIAN</span>
              <span className="block text-[10px] text-primary font-semibold tracking-[0.2em]">NFS GROUP</span>
            </div>
          </div>
          <Link href="/auth">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-semibold px-5">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative bg-sidebar overflow-hidden pt-16">
        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Gold glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-28 lg:py-40 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 text-primary text-xs font-semibold tracking-wider uppercase px-3 py-1.5 rounded-full mb-6"
            >
              <Award className="h-3.5 w-3.5" />
              Trusted Financial Advisory
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={1}
              className="font-serif text-4xl lg:text-6xl font-bold text-white leading-[1.1] mb-6"
            >
              Your Financial Future,{" "}
              <span className="text-primary">Protected.</span>
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={2}
              className="text-white/60 text-lg leading-relaxed mb-10 max-w-lg"
            >
              OPIAN NFS Group delivers expert financial planning, policy
              administration, and wealth management — all in one secure advisor
              portal.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={3}
              className="flex flex-wrap gap-4"
            >
              <Link href="/auth?role=client">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 h-12 text-base shadow-lg shadow-primary/20"
                >
                  Client Portal
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link href="/auth?role=advisor">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 font-semibold px-8 h-12 text-base"
                >
                  Advisor Login
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Stats card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
            className="hidden lg:grid grid-cols-2 gap-4"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
              >
                <div className="font-serif text-3xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-white/50 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="relative h-16 overflow-hidden">
          <svg
            viewBox="0 0 1440 64"
            className="absolute bottom-0 w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0,64 L1440,64 L1440,32 Q1080,0 720,32 Q360,64 0,32 Z"
              fill="hsl(37 32% 94%)"
            />
          </svg>
        </div>
      </section>

      {/* ── Services ────────────────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          custom={0}
          className="text-center mb-16"
        >
          <p className="text-primary font-semibold text-sm tracking-widest uppercase mb-3">
            What We Offer
          </p>
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground">
            Comprehensive Financial Services
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              custom={i * 0.5}
              className="group bg-white rounded-2xl border border-border p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                <service.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{service.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Portal split ────────────────────────────────────────────── */}
      <section className="py-20 bg-sidebar">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-white mb-4">
              One Platform, Two Portals
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Purpose-built experiences for both advisors and their clients.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Advisor card */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
              className="bg-white/5 border border-white/10 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Advisor Portal</h3>
                  <p className="text-white/40 text-xs">For OPIAN financial advisors</p>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {advisorFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-white/70 text-sm">
                    <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth?role=advisor">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold">
                  Advisor Sign In
                </Button>
              </Link>
            </motion.div>

            {/* Client card */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={1}
              className="bg-white/5 border border-white/10 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Client Portal</h3>
                  <p className="text-white/40 text-xs">For OPIAN policy holders</p>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {clientFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-white/70 text-sm">
                    <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth?role=client">
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10 hover:border-white/40 font-semibold"
                >
                  Client Sign In
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="bg-sidebar border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div>
                <span className="font-serif font-bold text-white tracking-wider">OPIAN</span>
                <span className="text-primary text-[10px] font-semibold tracking-[0.2em] block">
                  NFS GROUP
                </span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-white/40 text-sm">
              <a
                href="tel:+27861283346"
                className="flex items-center gap-1.5 hover:text-white/70 transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
                +27 86 128 3346
              </a>
              <a
                href="mailto:info@opian.co.za"
                className="flex items-center gap-1.5 hover:text-white/70 transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                info@opian.co.za
              </a>
              <span className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                Sandton, South Africa
              </span>
            </div>
            <p className="text-white/30 text-xs">
              © {new Date().getFullYear()} OPIAN NFS Group. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
