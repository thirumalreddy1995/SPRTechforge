import React, { useState, useEffect, useRef } from 'react';
import { Logo, Modal } from '../components/Components';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

/* ─── Intersection observer hook ─── */
const useInView = (threshold = 0.15) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
};

/* ─── Animated counter ─── */
const CountUp: React.FC<{ value: number; suffix?: string; active: boolean }> = ({ value, suffix = '', active }) => {
  const [cur, setCur] = useState(0);
  useEffect(() => {
    if (!active) return;
    let v = 0;
    const step = Math.max(1, Math.ceil(value / 60));
    const t = setInterval(() => { v += step; if (v >= value) { setCur(value); clearInterval(t); } else setCur(v); }, 20);
    return () => clearInterval(t);
  }, [active, value]);
  return <>{cur}{suffix}</>;
};

/* ─── Service card ─── */
const ServiceCard: React.FC<{
  icon: React.ReactNode; title: string; desc: string; tags: string[]; accent: string;
}> = ({ icon, title, desc, tags, accent }) => (
  <div className={`group relative bg-white rounded-3xl border border-gray-100 p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden`}>
    <div className={`absolute top-0 left-0 w-1 h-full ${accent} rounded-l-3xl`} />
    <div className={`w-14 h-14 ${accent} rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
      {icon}
    </div>
    <h3 className="text-xl font-black text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed mb-5">{desc}</p>
    <div className="flex flex-wrap gap-2">
      {tags.map(t => <span key={t} className="px-2.5 py-1 bg-gray-50 border border-gray-100 text-gray-500 text-xs font-semibold rounded-lg">{t}</span>)}
    </div>
  </div>
);

/* ─── Input component ─── */
const FI: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">{label}</label>
    <input {...props} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-spr-500 focus:ring-2 focus:ring-spr-100 outline-none transition-all" />
  </div>
);

/* ──────────────────────────────────────── MAIN ──────────────────────────────────────── */
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { addWebLead } = useApp();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openModal, setOpenModal] = useState<string | null>(null);

  /* Contact form state */
  const [form, setForm] = useState({ name: '', phone: '', email: '', company: '', service: '', message: '' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const statsSection = useInView(0.3);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) return setFormError('Please enter your name.');
    if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) return setFormError('Enter a valid 10-digit phone number.');
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setFormError('Enter a valid email address.');
    setSubmitting(true);
    addWebLead({ name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() || undefined, company: form.company.trim() || undefined, service: form.service || undefined, message: form.message.trim() || undefined });
    setSubmitting(false);
    setFormSuccess(true);
    setForm({ name: '', phone: '', email: '', company: '', service: '', message: '' });
  };

  const navLinks = [
    { label: 'Services', id: 'services' },
    { label: 'Why Us', id: 'why-us' },
    { label: 'About', id: 'about' },
    { label: 'Contact', id: 'contact' },
  ];

  const services = [
    {
      title: 'QA Automation',
      desc: 'End-to-end test automation frameworks using industry-leading tools — from functional regression to CI/CD pipeline integration.',
      tags: ['Selenium', 'Playwright', 'Cypress', 'TestNG', 'Cucumber'],
      accent: 'bg-blue-600',
      icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
    },
    {
      title: 'Performance Testing',
      desc: 'Validate scalability and stability under load. We simulate real-world traffic to identify bottlenecks before your users do.',
      tags: ['JMeter', 'k6', 'Gatling', 'BlazeMeter', 'LoadRunner'],
      accent: 'bg-amber-500',
      icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    },
    {
      title: 'API & Integration Testing',
      desc: 'Comprehensive validation of REST, SOAP, and GraphQL APIs. Catch contract mismatches and edge cases at the integration layer.',
      tags: ['Postman', 'REST Assured', 'Swagger', 'Karate', 'SoapUI'],
      accent: 'bg-emerald-600',
      icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    },
    {
      title: 'Cloud & DevOps QA',
      desc: 'Embed quality into your DevOps pipeline. Continuous testing on cloud infrastructure with automated gate checks on every commit.',
      tags: ['AWS', 'Azure', 'Docker', 'Jenkins', 'GitHub Actions'],
      accent: 'bg-purple-600',
      icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>,
    },
    {
      title: 'Security Testing',
      desc: 'Proactively uncover vulnerabilities. OWASP-driven assessments, penetration testing, and compliance validation for your web and mobile applications.',
      tags: ['OWASP', 'VAPT', 'Burp Suite', 'ZAP', 'Nessus'],
      accent: 'bg-rose-600',
      icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    },
    {
      title: 'Managed QA & Consulting',
      desc: 'Augment your team with our QA engineers on a project or retainer basis. Strategy, tooling setup, and execution — all under one roof.',
      tags: ['QA Strategy', 'Team Augmentation', 'Test CoE', 'Agile QA', 'ISTQB'],
      accent: 'bg-spr-700',
      icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">

      {/* ══════════ NAV ══════════ */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-2 border-b border-gray-100' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Logo size="sm" inverse={!scrolled} />
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(l => (
              <button key={l.id} onClick={() => scrollTo(l.id)}
                className={`text-sm font-bold tracking-wide transition-colors ${scrolled ? 'text-gray-600 hover:text-spr-700' : 'text-white/80 hover:text-white'}`}>
                {l.label}
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => scrollTo('contact')}
              className={`text-sm font-bold transition-colors ${scrolled ? 'text-gray-600 hover:text-spr-700' : 'text-white/70 hover:text-white'}`}>
              Get a Quote
            </button>
            <button onClick={() => navigate('/login')}
              className={`text-sm font-bold px-5 py-2.5 rounded-full border-2 transition-all ${scrolled ? 'border-spr-700 text-spr-700 hover:bg-spr-700 hover:text-white' : 'border-white text-white hover:bg-white hover:text-spr-900'}`}>
              Portal Login
            </button>
          </div>
          <button onClick={() => setMobileOpen(v => !v)}
            className={`md:hidden p-2 rounded-xl transition-all ${scrolled ? 'text-gray-700 bg-gray-100' : 'text-white bg-white/10'}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
        <div className={`md:hidden overflow-hidden transition-all duration-300 bg-white border-b border-gray-100 ${mobileOpen ? 'max-h-80 shadow-xl' : 'max-h-0'}`}>
          <div className="px-6 py-5 space-y-4">
            {navLinks.map(l => <button key={l.id} onClick={() => scrollTo(l.id)} className="block w-full text-left text-base font-bold text-gray-800">{l.label}</button>)}
            <button onClick={() => navigate('/login')} className="w-full bg-spr-700 text-white font-black py-3.5 rounded-2xl text-sm mt-2">Portal Login</button>
          </div>
        </div>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <header className="relative min-h-screen flex items-center bg-spr-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a3478] via-[#0b1c54] to-[#020617]" />
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          <div className="absolute -top-32 right-[-10%] w-[700px] h-[700px] bg-blue-500/15 blur-[160px] rounded-full" />
          <div className="absolute bottom-[-15%] left-[-5%] w-[600px] h-[600px] bg-indigo-700/10 blur-[140px] rounded-full" />
          <div className="absolute top-[40%] left-[45%] w-[350px] h-[350px] bg-amber-500/8 blur-[100px] rounded-full" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-36 pb-20">
          <div className="grid lg:grid-cols-[1fr_420px] gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-emerald-300 font-bold tracking-[0.25em] uppercase text-[11px]">Software Quality Engineering</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-[70px] font-black text-white leading-[1.04] mb-7 tracking-tight">
                Ship Software<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-300">
                  You Can Trust
                </span>
              </h1>
              <p className="text-lg md:text-xl text-blue-100/65 mb-10 leading-relaxed max-w-xl font-medium">
                SPR Techforge delivers end-to-end software testing and quality engineering services — helping enterprises release faster with fewer bugs and more confidence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => scrollTo('services')}
                  className="bg-white text-spr-900 font-black px-10 py-4 rounded-2xl hover:bg-blue-50 hover:scale-105 transition-all shadow-[0_15px_40px_rgba(0,0,0,0.3)] text-base">
                  Our Services
                </button>
                <button onClick={() => scrollTo('contact')}
                  className="border-2 border-white/25 text-white font-black px-10 py-4 rounded-2xl hover:bg-white/10 hover:scale-105 transition-all text-base backdrop-blur-sm">
                  Get a Free Quote
                </button>
              </div>
            </div>

            {/* Right — floating metrics card */}
            <div className="hidden lg:block">
              <div className="bg-white/8 backdrop-blur-xl border border-white/15 rounded-3xl p-7 shadow-[0_40px_80px_rgba(0,0,0,0.4)] relative">
                <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-5">Quality Metrics</p>
                <div className="space-y-4">
                  {[
                    { label: 'Defect Detection Rate', val: 98, color: 'bg-blue-500' },
                    { label: 'Test Coverage', val: 95, color: 'bg-emerald-500' },
                    { label: 'On-Time Delivery', val: 100, color: 'bg-amber-400' },
                    { label: 'Client Satisfaction', val: 97, color: 'bg-purple-500' },
                  ].map(m => (
                    <div key={m.label}>
                      <div className="flex justify-between text-xs font-semibold text-white/60 mb-1.5">
                        <span>{m.label}</span><span>{m.val}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className={`${m.color} h-2 rounded-full`} style={{ width: `${m.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
                  {[['50+', 'Clients'], ['200+', 'Projects'], ['10+', 'Years Exp']].map(([n, l]) => (
                    <div key={l}>
                      <p className="text-white font-black text-xl">{n}</p>
                      <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider mt-0.5">{l}</p>
                    </div>
                  ))}
                </div>
                {/* Floating badge */}
                <div className="absolute -top-5 -right-5 bg-emerald-400 text-emerald-900 text-xs font-black px-4 py-2.5 rounded-2xl shadow-xl">
                  ISO-Aligned<br />Processes
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 70" className="w-full" fill="white" preserveAspectRatio="none">
            <path d="M0,35 C480,70 960,0 1440,35 L1440,70 L0,70 Z" />
          </svg>
        </div>
      </header>

      {/* ══════════ STATS BAR ══════════ */}
      <section className="bg-white py-14">
        <div ref={statsSection.ref} className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y-2 md:divide-y-0 md:divide-x divide-gray-100">
            {[
              { value: 50, suffix: '+', label: 'Enterprise Clients' },
              { value: 200, suffix: '+', label: 'Projects Delivered' },
              { value: 10, suffix: '+', label: 'Years Experience' },
              { value: 100, suffix: '%', label: 'On-Time Delivery' },
            ].map(s => (
              <div key={s.label} className="px-6 py-4 md:py-0">
                <p className="text-4xl md:text-5xl font-black text-spr-700 tabular-nums">
                  <CountUp value={s.value} suffix={s.suffix} active={statsSection.inView} />
                </p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mt-2">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ SERVICES ══════════ */}
      <section id="services" className="py-28 bg-gray-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-block text-spr-600 font-black uppercase tracking-[0.3em] text-xs mb-3">What We Do</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-5">Our Core Services</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
              From automation frameworks to security audits — we cover the full spectrum of quality engineering to keep your releases flawless.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(s => <ServiceCard key={s.title} {...s} />)}
          </div>
        </div>
      </section>

      {/* ══════════ WHY US ══════════ */}
      <section id="why-us" className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="inline-block text-spr-600 font-black uppercase tracking-[0.3em] text-xs mb-4">Why SPR Techforge</span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-7 leading-[1.1]">
                Quality is Our<br />Core Product
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed mb-10 font-medium">
                We don't just run test cases. We partner with your engineering teams to build a culture of quality from design to deployment — reducing the cost of defects exponentially.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  'Certified QA Engineers (ISTQB)',
                  'Agile & Scrum-Native Processes',
                  'Tool-Agnostic Approach',
                  'Shift-Left Testing Strategy',
                  'Dedicated Account Manager',
                  'Transparent Reporting & Metrics',
                ].map(f => (
                  <div key={f} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              {[
                { num: '3×', label: 'Faster Release Cycles', color: 'bg-blue-600', textColor: 'text-white' },
                { num: '60%', label: 'Reduction in Defect Leakage', color: 'bg-amber-500', textColor: 'text-white' },
                { num: '40%', label: 'Lower QA Overhead Cost', color: 'bg-gray-900', textColor: 'text-white' },
                { num: '99.9%', label: 'Critical Bug Detection Rate', color: 'bg-emerald-600', textColor: 'text-white' },
              ].map(c => (
                <div key={c.label} className={`${c.color} rounded-3xl p-8 flex flex-col justify-between min-h-[160px]`}>
                  <p className={`text-4xl font-black ${c.textColor} tracking-tight`}>{c.num}</p>
                  <p className={`text-sm font-bold ${c.textColor} opacity-80 leading-snug mt-3`}>{c.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ ABOUT / CTA DARK ══════════ */}
      <section id="about" className="py-24 bg-gradient-to-br from-spr-900 to-[#020617] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <span className="inline-block text-amber-400 font-black uppercase tracking-[0.3em] text-xs mb-5">About SPR Techforge</span>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-7 leading-tight tracking-tight">
            Engineering Digital<br /><span className="text-blue-300">Confidence Since Day One</span>
          </h2>
          <p className="text-xl text-blue-100/60 mb-8 max-w-3xl mx-auto leading-relaxed">
            Based in Hyderabad, SPR Techforge Pvt Ltd is a specialized software testing and quality engineering firm. We serve product companies and enterprises across BFSI, Healthcare, Retail, and SaaS domains with a singular focus: <strong className="text-white/80">zero critical defects in production</strong>.
          </p>
          <p className="text-lg text-blue-100/50 mb-12 max-w-2xl mx-auto leading-relaxed">
            Our team of ISTQB-certified engineers, automation architects, and performance specialists bring deep domain expertise to every engagement — big or small.
          </p>
          <button onClick={() => scrollTo('contact')}
            className="bg-amber-400 hover:bg-amber-300 text-amber-900 font-black px-12 py-5 rounded-2xl text-lg shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:scale-105 transition-all">
            Start a Conversation
          </button>
        </div>
      </section>

      {/* ══════════ CONTACT + FORM ══════════ */}
      <section id="contact" className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left — info */}
            <div>
              <span className="inline-block text-spr-600 font-black uppercase tracking-[0.3em] text-xs mb-4">Get In Touch</span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-6 leading-[1.1]">
                Let's Build Quality<br />Together
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed mb-10 font-medium">
                Tell us about your project and a senior QA consultant will reach out within one business day with a tailored proposal.
              </p>
              <div className="space-y-6">
                {[
                  {
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />,
                    title: 'Office', body: 'Sri Godha Nilayam, Kukatpally,\nHyderabad — 500085'
                  },
                  {
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
                    title: 'Email', body: 'contact@sprtechforge.com', href: 'mailto:contact@sprtechforge.com'
                  },
                  {
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
                    title: 'Response Time', body: 'Within 1 business day'
                  },
                ].map(({ icon, title, body, href }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-spr-50 border border-spr-100 rounded-xl flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-spr-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">{icon}</svg>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm mb-0.5">{title}</p>
                      {href
                        ? <a href={href} className="text-spr-600 text-sm font-semibold hover:underline">{body}</a>
                        : <p className="text-gray-500 text-sm whitespace-pre-line">{body}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — form */}
            <div className="bg-gray-50 border border-gray-100 rounded-3xl p-10 shadow-sm">
              {formSuccess ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Message Received!</h3>
                  <p className="text-gray-500 text-sm mb-6">Our team will get back to you within one business day.</p>
                  <button onClick={() => setFormSuccess(false)}
                    className="text-spr-600 font-bold text-sm hover:underline">
                    Submit another enquiry →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 mb-1">Send Us an Enquiry</h3>
                    <p className="text-gray-400 text-sm mb-6">All fields marked * are required.</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FI label="Full Name *" type="text" placeholder="Your Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    <FI label="Phone *" type="tel" placeholder="10-digit number" maxLength={10} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FI label="Email" type="email" placeholder="you@company.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                    <FI label="Company" type="text" placeholder="Your Company" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Service Required</label>
                    <select
                      value={form.service}
                      onChange={e => setForm(f => ({ ...f, service: e.target.value }))}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-spr-500 focus:ring-2 focus:ring-spr-100 outline-none transition-all"
                    >
                      <option value="">Select a service...</option>
                      <option>QA Automation</option>
                      <option>Performance Testing</option>
                      <option>API & Integration Testing</option>
                      <option>Cloud & DevOps QA</option>
                      <option>Security Testing</option>
                      <option>Managed QA & Consulting</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Message</label>
                    <textarea
                      rows={4}
                      placeholder="Describe your project, timeline, tech stack..."
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-spr-500 focus:ring-2 focus:ring-spr-100 outline-none transition-all resize-none"
                    />
                  </div>
                  {formError && (
                    <p className="text-red-500 text-xs font-semibold flex items-center gap-1.5">
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {formError}
                    </p>
                  )}
                  <button type="submit" disabled={submitting}
                    className="w-full bg-spr-700 hover:bg-spr-800 text-white font-black py-4 rounded-2xl text-base transition-all hover:scale-[1.02] shadow-lg shadow-blue-100 disabled:opacity-50">
                    {submitting ? 'Sending...' : 'Send Enquiry →'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="bg-[#010208] text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <Logo size="sm" inverse />
              <p className="text-gray-500 text-sm leading-relaxed mt-5 font-medium max-w-xs">
                Software Testing & Quality Engineering specialists serving enterprises globally from Hyderabad, India.
              </p>
              <a href="#" className="mt-6 inline-flex w-9 h-9 rounded-xl bg-white/5 border border-white/10 items-center justify-center hover:bg-blue-600 hover:-translate-y-1 transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.35em] text-blue-400 mb-5">Services</h4>
              <ul className="space-y-3 text-gray-500 text-sm font-semibold">
                {['QA Automation', 'Performance Testing', 'API Testing', 'Cloud & DevOps QA', 'Security Testing', 'QA Consulting'].map(s => (
                  <li key={s}><button onClick={() => scrollTo('services')} className="hover:text-white transition-colors text-left">{s}</button></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.35em] text-blue-400 mb-5">Company</h4>
              <ul className="space-y-3 text-gray-500 text-sm font-semibold">
                <li><button onClick={() => scrollTo('about')} className="hover:text-white transition-colors text-left">About Us</button></li>
                <li><button onClick={() => setOpenModal('careers')} className="hover:text-white transition-colors text-left">Careers</button></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-white transition-colors text-left">Client Portal</button></li>
                <li><button onClick={() => scrollTo('contact')} className="hover:text-white transition-colors text-left">Contact</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.35em] text-blue-400 mb-5">Contact</h4>
              <ul className="space-y-4 text-gray-500 text-sm font-semibold">
                <li className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="leading-relaxed">Kukatpally, Hyderabad<br />500085, India</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <a href="mailto:contact@sprtechforge.com" className="hover:text-white transition-colors break-all">contact@sprtechforge.com</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-xs font-medium">&copy; {new Date().getFullYear()} SPR Techforge Pvt Ltd. All rights reserved.</p>
            <div className="flex gap-6 text-xs font-black uppercase tracking-[0.35em] text-gray-600">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ══════════ MODALS ══════════ */}
      <Modal isOpen={openModal === 'careers'} onClose={() => setOpenModal(null)} title="Join SPR Techforge">
        <div className="space-y-5 p-1">
          <p className="text-gray-500 leading-relaxed">We're always looking for passionate QA engineers, automation architects, and performance specialists to join our growing team.</p>
          <div className="space-y-3">
            {['Senior Automation Engineer (Selenium/Java)', 'Performance Testing Specialist (JMeter/k6)', 'API Testing Engineer (Postman/REST Assured)', 'DevOps QA Engineer (CI/CD focus)'].map(r => (
              <div key={r} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-white transition-all group">
                <h4 className="font-black text-gray-900 text-base">{r}</h4>
                <div className="mt-2 text-spr-600 font-bold text-xs flex items-center gap-1 group-hover:gap-3 transition-all">Apply Now <span>→</span></div>
              </div>
            ))}
          </div>
          <div className="pt-4 text-center border-t border-gray-100">
            <p className="text-gray-400 font-semibold text-xs uppercase tracking-widest mb-2">Send your CV to</p>
            <a href="mailto:careers@sprtechforge.com" className="text-xl font-black text-spr-600 hover:underline">careers@sprtechforge.com</a>
          </div>
        </div>
      </Modal>
    </div>
  );
};
