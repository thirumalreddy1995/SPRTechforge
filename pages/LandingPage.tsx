// Public website (route "/"). SPR TechForge as a software IT company:
// software testing & QA services, application development, and the complete
// software-testing training program with live projects and placement support.
// Dynamic pieces (hero banners, photos, testimonials, numbers, social links)
// come from Admin → Website Content; everything else is authored here.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo, Modal } from '../components/Components';
import { useApp } from '../context/AppContext';
import { UpcomingEventsWidget } from '../events/components/UpcomingEventsWidget';
import { HeroCarousel, HeroSlide, bannerToSlide } from '../site/components/HeroCarousel';
import { SiteGallery } from '../site/components/SiteGallery';
import { Testimonials } from '../site/components/Testimonials';
import { fetchSiteContent } from '../site/services/siteDb';
import { CONTACT_DEFAULTS, SiteContent, defaultSettings, defaultStats } from '../site/types';

/* ─── small helpers ─── */
const useInView = (threshold = 0.2) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
};

const CountUp: React.FC<{ value: number; suffix?: string; active: boolean }> = ({ value, suffix = '', active }) => {
  const [cur, setCur] = useState(0);
  useEffect(() => {
    if (!active) return;
    let v = 0; const step = Math.max(1, Math.ceil(value / 50));
    const t = setInterval(() => { v += step; if (v >= value) { setCur(value); clearInterval(t); } else setCur(v); }, 24);
    return () => clearInterval(t);
  }, [active, value]);
  return <>{cur}{suffix}</>;
};

const Eyebrow: React.FC<{ children: React.ReactNode; light?: boolean }> = ({ children, light }) => (
  <span className={`inline-block font-black uppercase tracking-[0.3em] text-xs mb-3 ${light ? 'text-amber-300' : 'text-blue-600'}`}>{children}</span>
);

const Icon: React.FC<{ d: string; className?: string }> = ({ d, className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d={d} /></svg>
);
const I = {
  check: 'M5 13l4 4L19 7',
  code: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
  bolt: 'M13 10V3L4 14h7v7l9-11h-7z',
  api: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  shield: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  mobile: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
  desktop: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  doc: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  briefcase: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  build: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z',
  mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  phone: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
  pin: 'M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
  star: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
  play: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  chat: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
};

/* ─── content ─── */
const TRACKS = [
  { title: 'Manual Testing', icon: I.doc, accent: 'bg-blue-600', desc: 'The foundation every tester needs: SDLC & STLC, Agile/Scrum, test design techniques, writing test cases, defect life cycle and clear bug reports.', tools: ['Jira', 'TestRail', 'Agile', 'SQL basics'] },
  { title: 'Automation Testing', icon: I.code, accent: 'bg-indigo-600', desc: 'Build real automation frameworks for web applications: programming basics, Selenium WebDriver, Page Object Model, TestNG, BDD with Cucumber, Git and CI.', tools: ['Java / Python', 'Selenium', 'TestNG', 'Cucumber', 'Git', 'Jenkins', 'Playwright'] },
  { title: 'API Testing', icon: I.api, accent: 'bg-emerald-600', desc: 'Test what the UI hides: REST fundamentals, requests and assertions in Postman, automation with REST Assured, authentication, schema validation and API test suites in CI.', tools: ['Postman', 'REST Assured', 'Newman', 'JSON / Swagger'] },
  { title: 'Performance Testing', icon: I.bolt, accent: 'bg-amber-500', desc: 'Find out how an application behaves under load: test planning, JMeter scripting, correlation, load/stress/soak runs, reading results and reporting bottlenecks.', tools: ['JMeter', 'k6', 'BlazeMeter'] },
  { title: 'Desktop Automation', icon: I.desktop, accent: 'bg-slate-700', desc: 'Automate Windows desktop applications, still common in banking and enterprise: element inspection, WinAppDriver and Appium for Windows, PyWinAuto, hybrid flows.', tools: ['WinAppDriver', 'Appium (Windows)', 'PyWinAuto', 'AutoIt'] },
  { title: 'Mobile API Testing', icon: I.api, accent: 'bg-teal-600', desc: 'Test the back-end behind mobile apps: capturing traffic with proxies, validating the APIs an app depends on, auth tokens, edge cases and offline/network scenarios.', tools: ['Postman', 'Charles / mitmproxy', 'REST Assured'] },
  { title: 'Mobile Automation', icon: I.mobile, accent: 'bg-purple-600', desc: 'Automate Android and iOS apps: emulators and real devices, Appium Inspector, locators, gestures, Page Objects for mobile and cloud device farms.', tools: ['Appium', 'Android Studio', 'Appium Inspector', 'BrowserStack'] },
  { title: 'Security Testing', icon: I.shield, accent: 'bg-rose-600', desc: 'Think like an attacker: OWASP Top 10, authentication and session testing, injection and XSS checks, scanning with ZAP and Burp, and writing a professional findings report.', tools: ['OWASP Top 10', 'Burp Suite', 'OWASP ZAP', 'VAPT basics'] },
];

const SERVICES = [
  { title: 'Software Testing & QA Services', icon: I.check, accent: 'bg-blue-600', desc: 'Independent testing for web, mobile, API and desktop applications — from a one-time release check to an embedded QA team.', points: ['Functional & regression testing', 'Test automation frameworks (Selenium, Playwright, Appium)', 'API, performance and security testing', 'Test strategy, plans and release sign-off'] },
  { title: 'Application Development', icon: I.build, accent: 'bg-emerald-600', desc: 'We design and build web and mobile applications, internal tools and portals — and test them the way we teach.', points: ['Web applications and admin portals', 'Mobile-first responsive products', 'Cloud hosting, Firebase / REST back-ends', 'Ongoing maintenance and QA'] },
  { title: 'QA Consulting & Team Augmentation', icon: I.users, accent: 'bg-amber-500', desc: 'Need testers or a QA lead for a project? Our trained engineers join your team on a project or retainer basis.', points: ['Dedicated QA engineers and automation testers', 'Framework set-up and CI/CD integration', 'Process audits and quality metrics', 'Trained fresh talent ready to deploy'] },
];

const PLACEMENT_POINTS = [
  { title: 'Resume & LinkedIn', desc: 'A QA resume written with your trainer, plus a LinkedIn profile that recruiters actually find.', icon: I.doc },
  { title: 'Mock interviews', desc: 'Technical and HR rounds with working engineers, with written feedback after each one.', icon: I.chat },
  { title: 'Interview scheduling & tracking', desc: 'We line up interviews with hiring companies and track every round with you until the offer.', icon: I.briefcase },
  { title: 'Interview question bank', desc: 'Curated, regularly updated questions for manual, automation, API and performance roles.', icon: I.star },
  { title: 'Referrals & hiring partners', desc: 'Openings shared directly with our batches from partner companies and our own alumni network.', icon: I.users },
  { title: 'Support after you join', desc: 'Work support in your first weeks on the job so you settle into your first QA role with confidence.', icon: I.shield },
];

const FAQS = [
  { q: 'Do I need a coding background?', a: 'No. Manual testing, API testing and performance testing start from zero. For automation we teach the programming basics you need (Java or Python) before touching Selenium or Appium.' },
  { q: 'Who is this training for?', a: 'Fresh graduates from any stream (B.Tech, B.Sc, MCA, BCA, B.Com, MBA…), professionals switching into IT, and working testers who want to add automation, API, performance, mobile or security skills.' },
  { q: 'Classroom or online?', a: 'Both. Classroom batches run at our Kukatpally, Hyderabad centre; live online batches cover the same syllabus with recordings for revision. Weekday and weekend options are available.' },
  { q: 'What are live projects?', a: 'You practise on real applications that SPR TechForge builds and runs, plus client-style projects. You write test cases, automate flows, raise real bugs and build a portfolio you can show in interviews.' },
  { q: 'How does placement support work?', a: 'Resume and LinkedIn preparation, mock interviews, interview scheduling and tracking, referrals to hiring partners, and support in your first weeks on the job. We work with you until you are placed; we do not make guarantees we cannot keep.' },
  { q: 'What are the fees and how do I start?', a: 'Attend a free demo class or one of our free live seminars first. Fees depend on the track you pick and are discussed after the demo. Use the enquiry form or WhatsApp us and we will call you back.' },
];

const INTERESTS = ['Software Testing Training (complete program)', 'Manual Testing', 'Automation Testing', 'API Testing', 'Performance Testing', 'Mobile / Desktop Automation', 'Security Testing', 'Testing services for my company', 'Application development', 'Placement support', 'Other'];

/* ─── page ─── */
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { addWebLead } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openModal, setOpenModal] = useState<'careers' | 'privacy' | 'terms' | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [content, setContent] = useState<SiteContent>({ banners: [], photos: [], testimonials: [], stats: defaultStats(), settings: defaultSettings() });

  const [form, setForm] = useState({ name: '', phone: '', email: '', interest: '', mode: '', message: '' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const statsRef = useInView(0.3);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    fetchSiteContent().then(setContent).catch(() => {});
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const enquire = (interest?: string) => { if (interest) setForm(f => ({ ...f, interest })); scrollTo('contact'); };
  const goUrl = (url: string) => {
    if (!url) return;
    if (url.startsWith('#/')) navigate(url.slice(1));
    else if (url.startsWith('#')) scrollTo(url.slice(1));
    else window.open(url, '_blank', 'noopener,noreferrer');
  };

  const glass = 'bg-white/[0.07] backdrop-blur-md border border-white/15 rounded-3xl';
  const tracksPanel = (
    <div className={`${glass} p-6 shadow-[0_40px_80px_rgba(0,0,0,0.35)]`}>
      <p className="text-amber-300 text-[11px] font-black uppercase tracking-[0.25em] mb-4">What you will master</p>
      <div className="grid grid-cols-2 gap-2.5">
        {TRACKS.map(t => (
          <button key={t.title} type="button" onClick={() => scrollTo('training')} aria-label={`${t.title} — see the training track`} className="flex items-center gap-2.5 bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl px-3 py-2.5 text-left transition-colors">
            <span className={`w-8 h-8 ${t.accent} rounded-lg flex items-center justify-center shrink-0`}><Icon d={t.icon} className="w-4 h-4" /></span>
            <span className="text-sm font-bold text-white/90 leading-tight">{t.title}</span>
          </button>
        ))}
      </div>
      <p className="text-blue-100/70 text-xs mt-4">Live projects · Working-engineer trainers · Placement support</p>
    </div>
  );
  const servicesPanel = (
    <div className="grid grid-cols-2 gap-4">
      {[['Testing & QA services', 'Web · Mobile · API · Desktop', I.check, 'bg-blue-600'], ['Application development', 'Web apps · Mobile · Portals', I.build, 'bg-emerald-600'], ['Automation frameworks', 'Selenium · Playwright · Appium', I.code, 'bg-indigo-600'], ['Performance & security', 'JMeter · Burp · OWASP', I.shield, 'bg-amber-500']].map(([t, d, icon, color]) => (
        <button key={t as string} type="button" onClick={() => scrollTo('services')} aria-label={`${t} — see our services`} className={`${glass} p-5 text-left hover:bg-white/[0.14] transition-colors`}>
          <span className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}><Icon d={icon as string} className="w-5 h-5" /></span>
          <p className="font-black text-white">{t}</p>
          <p className="text-blue-100/70 text-xs mt-1">{d}</p>
        </button>
      ))}
    </div>
  );
  const eventsPanel = (
    <div className={`${glass} p-7`}>
      <p className="text-emerald-300 text-[11px] font-black uppercase tracking-[0.25em] mb-4">In every free seminar</p>
      <ul className="space-y-3">
        {['The QA job market right now and the roles open to freshers', 'The exact skills that get interview calls', 'A live testing demo on a real application', 'Manual → Automation → SDET career path', 'Open Q&A about your background'].map(t => (
          <li key={t} className="flex items-start gap-3 text-white/90"><Icon d={I.check} className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" /><span className="text-sm font-semibold">{t}</span></li>
        ))}
      </ul>
    </div>
  );

  const slides: HeroSlide[] = useMemo(() => {
    if (content.banners.length > 0) return content.banners.map(b => bannerToSlide(b, goUrl));
    return [
      { id: 'train', eyebrow: 'Software testing training · Offline & online', title: <>Become a job-ready<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">Software Tester</span></>, subtitle: 'Manual, Automation, API, Performance, Mobile, Desktop and Security testing — taught on live projects by working QA engineers, with placement support until you are hired.', primary: { label: 'Book a free demo class', onClick: () => enquire(INTERESTS[0]) }, secondary: { label: 'See training tracks', onClick: () => scrollTo('training') }, gradient: 'from-[#1a3478] via-[#0b1c54] to-[#020617]', aside: tracksPanel },
      { id: 'services', eyebrow: 'Software IT company', title: <>We test and build<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-blue-200 to-indigo-300">software for businesses</span></>, subtitle: 'Independent QA, test automation, performance and security testing, and custom web and mobile application development for startups and enterprises.', primary: { label: 'Talk to our team', onClick: () => enquire('Testing services for my company') }, secondary: { label: 'Our services', onClick: () => scrollTo('services') }, gradient: 'from-[#0f3d3e] via-[#0b2a4a] to-[#020617]', aside: servicesPanel },
      { id: 'events', eyebrow: 'Free live seminars', title: <>Start with a<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300">free career seminar</span></>, subtitle: 'Live sessions on how to enter IT through software testing — what the job looks like, a real testing demo, and honest answers to your questions.', primary: { label: 'See upcoming events', onClick: () => navigate('/events') }, secondary: { label: 'Enquire now', onClick: () => enquire() }, gradient: 'from-[#3b1d6e] via-[#1e1b4b] to-[#020617]', aside: eventsPanel },
    ];
  }, [content.banners]);

  const statItems = [
    ['studentsTrained', 'Students trained', '+'], ['placements', 'Placements', '+'], ['batchesCompleted', 'Batches completed', '+'],
    ['yearsExperience', 'Years of experience', '+'], ['liveProjects', 'Live projects', ''], ['hiringPartners', 'Hiring partners', '+'],
  ].filter(([k]) => (content.stats as any)[k] > 0) as [keyof typeof content.stats, string, string][];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) return setFormError('Please enter your name.');
    if (!/^[6-9]\d{9}$/.test(form.phone)) return setFormError('Enter a valid 10-digit mobile number.');
    if (!form.email.trim()) return setFormError('Please enter your email address so we can reach you if your mobile is unreachable.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setFormError('Enter a valid email address.');
    addWebLead({ name: form.name.trim(), phone: form.phone, email: form.email.trim(), service: [form.interest, form.mode].filter(Boolean).join(' · ') || undefined, message: form.message.trim() || undefined });
    setFormSuccess(true);
    setForm({ name: '', phone: '', email: '', interest: '', mode: '', message: '' });
  };

  const nav = [['services', 'Services'], ['training', 'Training'], ['live-projects', 'Live Projects'], ['placements', 'Placements'], ['events', 'Events'], ['about', 'About'], ['contact', 'Contact']];
  const s = content.settings;
  const socials = [
    { key: 'youtube', url: s.youtubeUrl, label: 'YouTube', svg: 'M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 00.5 6.2 31 31 0 000 12a31 31 0 00.5 5.8 3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1A31 31 0 0024 12a31 31 0 00-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z' },
    { key: 'instagram', url: s.instagramUrl, label: 'Instagram', svg: 'M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 4 2.4 7.2 2.3c1.2-.1 1.6-.1 4.8-.1zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.2 4.4 2.6 6.8 7 7 1.2.1 1.6.1 4.9.1s3.7 0 4.9-.1c4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.2-4.4-2.6-6.8-7-7C15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 100 12.4 6.2 6.2 0 000-12.4zM12 16a4 4 0 110-8 4 4 0 010 8zm6.4-11.8a1.4 1.4 0 100 2.9 1.4 1.4 0 000-2.9z' },
    { key: 'linkedin', url: s.linkedinUrl, label: 'LinkedIn', svg: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' },
    { key: 'twitter', url: s.twitterUrl, label: 'X', svg: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
  ].filter(x => x.url);
  const waNumber = (s.whatsappNumber || CONTACT_DEFAULTS.phones[0].wa).replace(/\D/g, '');
  const mapUrl = s.mapUrl || CONTACT_DEFAULTS.mapUrl;
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent('Hi SPR TechForge, I would like to know more about your software testing training.')}`;

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      {/* ══════════ NAV ══════════ */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled || mobileOpen ? 'bg-white lg:bg-white/95 lg:backdrop-blur-md shadow-lg py-2 border-b border-gray-100' : 'bg-transparent py-4'}`} aria-label="Main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="SPR TechForge home"><Logo size="sm" inverse={!(scrolled || mobileOpen)} /></button>
          <div className="hidden lg:flex items-center gap-7">
            {nav.map(([id, label]) => (
              <button key={id} data-target={id} onClick={() => scrollTo(id)} className={`text-sm font-bold tracking-wide transition-colors ${scrolled ? 'text-gray-600 hover:text-blue-700' : 'text-white/85 hover:text-white'}`}>{label}</button>
            ))}
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <button data-target="contact" onClick={() => enquire(INTERESTS[0])} className={`text-sm font-black px-5 py-2.5 rounded-full transition-all ${scrolled ? 'bg-amber-400 text-amber-950 hover:bg-amber-300' : 'bg-amber-400 text-amber-950 hover:bg-amber-300'}`}>Free demo class</button>
            <button onClick={() => navigate('/login')} className={`text-sm font-bold px-5 py-2.5 rounded-full border-2 transition-all ${scrolled ? 'border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white' : 'border-white/70 text-white hover:bg-white hover:text-blue-900'}`}>Portal Login</button>
          </div>
          <button onClick={() => setMobileOpen(v => !v)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} className={`lg:hidden p-2 rounded-xl transition-all ${scrolled || mobileOpen ? 'text-gray-700 bg-gray-100' : 'text-white bg-white/10'}`}>
            <Icon d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </button>
        </div>
        <div data-mobile-menu data-open={mobileOpen ? 'true' : 'false'} className={`lg:hidden overflow-hidden transition-all duration-300 bg-white border-b border-gray-100 ${mobileOpen ? 'max-h-[520px] shadow-xl' : 'max-h-0'}`}>
          <div className="px-6 py-5 space-y-3">
            {nav.map(([id, label]) => <button key={id} data-target={id} onClick={() => scrollTo(id)} className="block w-full text-left text-base font-bold text-gray-800 py-1">{label}</button>)}
            <button onClick={() => enquire(INTERESTS[0])} className="w-full bg-amber-400 text-amber-950 font-black py-3.5 rounded-2xl text-sm mt-2">Book a free demo class</button>
            <button onClick={() => navigate('/login')} className="w-full border-2 border-blue-700 text-blue-700 font-black py-3 rounded-2xl text-sm">Portal Login</button>
          </div>
        </div>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <HeroCarousel slides={slides} />

      {/* ══════════ TRUST STRIP ══════════ */}
      <section className="bg-white pt-4 pb-10">
        <div ref={statsRef.ref} className="max-w-6xl mx-auto px-4">
          {statItems.length > 0 ? (
            <div className={`grid gap-6 text-center grid-cols-2 ${statItems.length >= 5 ? 'md:grid-cols-3 lg:grid-cols-6' : statItems.length === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
              {statItems.map(([k, label, suffix]) => (
                <div key={k} className="px-4 py-3">
                  <p className="text-4xl md:text-5xl font-black text-blue-700 tabular-nums"><CountUp value={content.stats[k]} suffix={suffix} active={statsRef.inView} /></p>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mt-2">{label}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-bold text-gray-500">
              {['Live projects, not slides', 'Working QA engineers as trainers', 'Classroom in Hyderabad + live online', 'Placement support till you are hired', 'Free demo class & seminars'].map(t => (
                <span key={t} className="inline-flex items-center gap-2"><Icon d={I.check} className="w-4 h-4 text-emerald-600" />{t}</span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════ SERVICES ══════════ */}
      <section id="services" className="py-24 bg-gray-50/70 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Eyebrow>What we do</Eyebrow>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">A software company built around quality</h2>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto font-medium">SPR TechForge tests software for businesses, builds applications, and trains the next generation of QA engineers on those very projects.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {SERVICES.map(sv => (
              <div key={sv.title} className="group bg-white rounded-3xl border border-gray-100 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className={`w-14 h-14 ${sv.accent} rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg`}><Icon d={sv.icon} className="w-7 h-7" /></div>
                <h3 className="text-xl font-black text-gray-900 mb-2">{sv.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{sv.desc}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {sv.points.map(p => <li key={p} className="flex items-start gap-2 text-sm text-gray-700"><Icon d={I.check} className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />{p}</li>)}
                </ul>
                <button onClick={() => enquire(sv.title.includes('Development') ? 'Application development' : 'Testing services for my company')} className="text-sm font-black text-blue-700 hover:text-blue-900 text-left">Discuss a project →</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ TRAINING ══════════ */}
      <section id="training" className="py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start mb-12">
            <div>
              <Eyebrow>Training</Eyebrow>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">Complete Software Testing Program</h2>
              <p className="text-lg text-gray-500 font-medium leading-relaxed">Eight tracks that cover everything a modern QA engineer is asked for — from manual fundamentals to automation, API, performance, mobile, desktop and security testing. Take the complete program or the tracks you need.</p>
              <div className="flex flex-wrap gap-2 mt-6">
                {['No coding background needed to start', 'Weekday & weekend batches', 'Classroom (Kukatpally) or live online', 'Recordings for revision', 'Certificate of completion'].map(t => (
                  <span key={t} className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-800 text-xs font-bold px-3 py-1.5 rounded-full"><Icon d={I.check} className="w-3.5 h-3.5" />{t}</span>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-3xl p-7 shadow-xl">
              <p className="text-amber-300 text-xs font-black uppercase tracking-widest mb-3">How every batch runs</p>
              <ol className="space-y-3 text-sm">
                {[['Learn', 'Concepts explained by a working QA engineer, with the tools real teams use.'], ['Practise on live projects', 'Apply it the same day on applications we build and run.'], ['Get reviewed', 'Assignments, code reviews and weekly progress tracking.'], ['Get placed', 'Resume, mock interviews and interview scheduling until you are hired.']].map(([t, d], i) => (
                  <li key={t} className="flex gap-3"><span className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black flex items-center justify-center shrink-0 text-xs">{i + 1}</span><div><p className="font-bold">{t}</p><p className="text-blue-100/80 text-xs leading-relaxed">{d}</p></div></li>
                ))}
              </ol>
              <button onClick={() => enquire(INTERESTS[0])} className="mt-6 w-full bg-amber-400 hover:bg-amber-300 text-amber-950 font-black py-3.5 rounded-2xl text-sm">Book a free demo class</button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TRACKS.map(t => (
              <div key={t.title} className="bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className={`w-12 h-12 ${t.accent} rounded-2xl flex items-center justify-center mb-4 text-white`}><Icon d={t.icon} className="w-6 h-6" /></div>
                <h3 className="text-lg font-black text-gray-900 mb-2">{t.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1">{t.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {t.tools.map(x => <span key={x} className="px-2 py-1 bg-gray-50 border border-gray-100 text-gray-600 text-[11px] font-semibold rounded-lg">{x}</span>)}
                </div>
                <button onClick={() => enquire(t.title.includes('Mobile') || t.title.includes('Desktop') ? 'Mobile / Desktop Automation' : t.title)} className="mt-4 text-sm font-black text-blue-700 hover:text-blue-900 text-left">Enquire about this track →</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ LIVE PROJECTS ══════════ */}
      <section id="live-projects" className="py-24 bg-gradient-to-br from-[#0b1c54] to-[#020617] text-white relative overflow-hidden scroll-mt-20">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute -right-32 top-0 w-[500px] h-[500px] bg-blue-500/15 blur-[120px] rounded-full" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <Eyebrow light>Live projects</Eyebrow>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-5 leading-tight">You practise on real applications, not demo sites</h2>
            <p className="text-blue-100/80 text-lg leading-relaxed mb-6">SPR TechForge builds and runs its own software — including the event-registration platform and management system behind this website — and takes on client projects. Our students test those applications as part of the course.</p>
            <ul className="space-y-3">
              {['Write and execute test cases on features as they are released', 'Raise real bugs that developers fix, and verify the fixes', 'Automate real user flows with Selenium, Appium and REST Assured', 'Run API and performance checks against live back-ends', 'Leave with a portfolio and project stories for your interviews'].map(t => (
                <li key={t} className="flex items-start gap-3 text-blue-50/90"><Icon d={I.check} className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />{t}</li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[['Web apps', 'Portals, dashboards and public sites', I.code, 'bg-blue-600'], ['Mobile apps', 'Android & iOS flows and their APIs', I.mobile, 'bg-purple-600'], ['APIs', 'REST back-ends with auth and data', I.api, 'bg-emerald-600'], ['Desktop', 'Windows applications and hybrids', I.desktop, 'bg-amber-500']].map(([t, d, icon, color]) => (
              <div key={t as string} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
                <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center mb-4`}><Icon d={icon as string} className="w-5 h-5" /></div>
                <p className="font-black text-lg">{t}</p>
                <p className="text-blue-100/70 text-sm mt-1">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ PLACEMENTS ══════════ */}
      <section id="placements" className="py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Eyebrow>Placement support</Eyebrow>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">We work with you until you are placed</h2>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto font-medium">Training gets you the skills; this is how we turn them into your first QA job.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLACEMENT_POINTS.map(p => (
              <div key={p.title} className="flex gap-4 bg-gray-50 border border-gray-100 rounded-3xl p-6">
                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 text-blue-700 flex items-center justify-center shrink-0 shadow-sm"><Icon d={p.icon} className="w-6 h-6" /></div>
                <div><p className="font-black text-gray-900 mb-1">{p.title}</p><p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p></div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <button onClick={() => enquire('Placement support')} className="bg-blue-700 hover:bg-blue-800 text-white font-black px-9 py-4 rounded-2xl shadow-lg shadow-blue-200 hover:scale-[1.02] transition-all">Ask about placements</button>
          </div>
        </div>
      </section>

      {/* ══════════ EVENTS ══════════ */}
      <section id="events" className="scroll-mt-20 bg-gradient-to-b from-blue-50/60 to-white">
        <UpcomingEventsWidget />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="bg-white border border-blue-100 rounded-3xl p-8 md:p-10 grid md:grid-cols-[1fr_auto] gap-6 items-center shadow-sm">
            <div>
              <Eyebrow>Free events</Eyebrow>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mb-2">Free live seminars and demo classes</h2>
              <p className="text-gray-500 font-medium">Career seminars, live testing demos and Q&A — online and in person. Registration is free and the joining link is emailed to you.</p>
            </div>
            <div className="flex flex-col sm:flex-row md:flex-col gap-3">
              <Link to="/events" className="bg-blue-700 hover:bg-blue-800 text-white font-black px-7 py-3.5 rounded-2xl text-center text-sm">See all events</Link>
              <button onClick={() => enquire(INTERESTS[0])} className="border-2 border-blue-700 text-blue-700 hover:bg-blue-50 font-black px-7 py-3 rounded-2xl text-sm">Invite me to the next one</button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ GALLERY + TESTIMONIALS (dynamic, hide when empty) ══════════ */}
      <SiteGallery photos={content.photos} />
      <Testimonials items={content.testimonials} />

      {/* ══════════ ABOUT ══════════ */}
      <section id="about" className="py-24 bg-gray-50/70 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <Eyebrow>About SPR TechForge</Eyebrow>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-5 leading-tight">Software testing is our craft, and we teach it the way we practise it</h2>
            <p className="text-lg text-gray-500 font-medium leading-relaxed mb-5">SPR TechForge Pvt Ltd is a Hyderabad-based software company specialising in software testing and quality engineering. We deliver QA and development services to businesses, and we run a training academy where working engineers teach the complete testing stack on live projects.</p>
            <p className="text-gray-500 font-medium leading-relaxed">Small batches, real applications, honest guidance about the job market, and support that continues after you are placed — that is the SPR TechForge way.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[['Practitioners as trainers', 'Every trainer works on real QA projects today.', I.users, 'bg-blue-600'], ['Small batches', 'Personal attention, weekly progress tracking.', I.star, 'bg-amber-500'], ['Industry tool stack', 'Selenium, Playwright, Appium, Postman, JMeter, Burp.', I.code, 'bg-emerald-600'], ['Honest career guidance', 'Clear picture of roles, salaries and what recruiters ask.', I.chat, 'bg-slate-700']].map(([t, d, icon, color]) => (
              <div key={t as string} className="bg-white rounded-3xl border border-gray-100 p-6">
                <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center mb-4 text-white`}><Icon d={icon as string} className="w-5 h-5" /></div>
                <p className="font-black text-gray-900">{t}</p>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FAQ ══════════ */}
      <section id="faq" className="py-20 bg-white scroll-mt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10"><Eyebrow>FAQ</Eyebrow><h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Questions we hear most</h2></div>
          <div className="divide-y divide-gray-100 border border-gray-100 rounded-3xl overflow-hidden">
            {FAQS.map((f, i) => (
              <div key={f.q}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i} className="w-full flex items-center justify-between gap-4 text-left px-6 py-5 hover:bg-gray-50">
                  <span className="font-bold text-gray-900">{f.q}</span>
                  <span className={`text-blue-700 text-2xl font-black transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && <p className="px-6 pb-6 text-gray-600 leading-relaxed text-sm">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CONTACT ══════════ */}
      <section id="contact" className="py-24 bg-gray-50/70 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-start">
          <div>
            <Eyebrow>Contact</Eyebrow>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-5 leading-tight">Talk to us</h2>
            <p className="text-lg text-gray-500 font-medium leading-relaxed mb-8">Call or WhatsApp for a quick answer, email us, or send the enquiry form and we will get back to you within one business day.</p>
            <div className="space-y-5">
              {CONTACT_DEFAULTS.phones.map(p => (
                <div key={p.tel} className="flex items-center gap-4">
                  <a href={`tel:${p.tel}`} aria-label={`Call ${p.display}`} className="w-11 h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-blue-700 shrink-0 hover:bg-blue-700 hover:text-white transition-colors"><Icon d={I.phone} className="w-5 h-5" /></a>
                  <div className="flex items-center gap-3 flex-wrap">
                    <a href={`tel:${p.tel}`} className="font-black text-gray-900 hover:text-blue-700">{p.display}</a>
                    <a href={`https://wa.me/${p.wa}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">WhatsApp</a>
                  </div>
                </div>
              ))}
              {[[CONTACT_DEFAULTS.emails[0], 'General & admissions'], [CONTACT_DEFAULTS.emails[1], 'HR, careers & training']].map(([email, label]) => (
                <div key={email} className="flex items-center gap-4">
                  <a href={`mailto:${email}`} aria-label={`Email ${email}`} className="w-11 h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-blue-700 shrink-0 hover:bg-blue-700 hover:text-white transition-colors"><Icon d={I.mail} className="w-5 h-5" /></a>
                  <div><a href={`mailto:${email}`} className="font-black text-gray-900 hover:text-blue-700 break-all">{email}</a><p className="text-xs text-gray-500">{label}</p></div>
                </div>
              ))}
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" aria-label="Open our office location in Google Maps" className="flex items-start gap-4 group">
                <div className="w-11 h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-blue-700 shrink-0 group-hover:bg-blue-700 group-hover:text-white transition-colors"><Icon d={I.pin} className="w-5 h-5" /></div>
                <div>
                  <p className="font-black text-gray-900 group-hover:text-blue-700">{s.addressLine1}</p>
                  <p className="text-sm text-gray-500">{s.addressLine2}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 underline mt-1">Open in Google Maps <Icon d={I.pin} className="w-3.5 h-3.5" /></span>
                </div>
              </a>
              {socials.length > 0 && (
                <div className="flex items-center gap-3 pt-2">
                  {socials.map(so => (
                    <a key={so.key} href={so.url} target="_blank" rel="noopener noreferrer" aria-label={so.label} title={so.label} className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-white hover:bg-blue-700 hover:border-blue-700 flex items-center justify-center transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d={so.svg} /></svg>
                    </a>
                  ))}
                  <span className="text-sm text-gray-500 font-semibold">Follow us for free sessions and tips</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-7 sm:p-9 shadow-sm">
            {formSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-5"><Icon d={I.check} className="w-8 h-8" /></div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Thanks! We have your enquiry.</h3>
                <p className="text-gray-500 text-sm mb-6">We will call or WhatsApp you within one business day. In a hurry? <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold underline">Message us on WhatsApp</a>.</p>
                <button onClick={() => setFormSuccess(false)} className="text-blue-700 font-bold text-sm hover:underline">Send another enquiry →</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-1">Enquire now</h3>
                  <p className="text-gray-400 text-sm">Training, a free demo class, or a project for your company.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block"><span className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Name *</span><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" /></label>
                  <label className="block"><span className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Mobile *</span><input type="tel" inputMode="numeric" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} placeholder="10-digit mobile" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" /></label>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block"><span className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Email *</span><input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" /></label>
                  <label className="block"><span className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Preferred mode</span>
                    <select value={form.mode} onChange={e => setForm(f => ({ ...f, mode: e.target.value }))} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none">
                      <option value="">Select…</option><option>Classroom (Kukatpally, Hyderabad)</option><option>Live online</option><option>Weekend batch</option><option>Not sure yet</option>
                    </select></label>
                </div>
                <label className="block"><span className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">I'm interested in</span>
                  <select value={form.interest} onChange={e => setForm(f => ({ ...f, interest: e.target.value }))} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none">
                    <option value="">Select…</option>{INTERESTS.map(x => <option key={x}>{x}</option>)}
                  </select></label>
                <label className="block"><span className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Message</span><textarea rows={3} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Your background, what you want to learn, or your project" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none" /></label>
                {formError && <p className="text-red-600 text-xs font-bold">{formError}</p>}
                <button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-4 rounded-2xl text-base shadow-lg shadow-blue-200 hover:scale-[1.01] transition-all">Send enquiry</button>
                <p className="text-center text-xs text-gray-400">We use your details only to respond to this enquiry.</p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="bg-[#010208] text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <Logo size="sm" inverse />
              <p className="text-gray-500 text-sm leading-relaxed mt-5 font-medium max-w-xs">Software testing & quality engineering company in Hyderabad — QA services, application development and job-oriented software testing training.</p>
              {socials.length > 0 && (
                <div className="flex gap-2 mt-6">
                  {socials.map(so => (
                    <a key={so.key} href={so.url} target="_blank" rel="noopener noreferrer" aria-label={so.label} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 hover:-translate-y-1 transition-all"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d={so.svg} /></svg></a>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.35em] text-blue-400 mb-5">Training</h4>
              <ul className="space-y-2.5 text-gray-500 text-sm font-semibold">
                {TRACKS.map(t => <li key={t.title}><button onClick={() => scrollTo('training')} className="hover:text-white transition-colors text-left">{t.title}</button></li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.35em] text-blue-400 mb-5">Company</h4>
              <ul className="space-y-2.5 text-gray-500 text-sm font-semibold">
                <li><button onClick={() => scrollTo('services')} className="hover:text-white text-left">Services</button></li>
                <li><button onClick={() => scrollTo('live-projects')} className="hover:text-white text-left">Live projects</button></li>
                <li><button onClick={() => scrollTo('placements')} className="hover:text-white text-left">Placement support</button></li>
                <li><Link to="/events" className="hover:text-white">Free events</Link></li>
                <li><button onClick={() => scrollTo('about')} className="hover:text-white text-left">About us</button></li>
                <li><button onClick={() => setOpenModal('careers')} className="hover:text-white text-left">Careers</button></li>
                <li><Link to="/login" className="hover:text-white">Staff & student portal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.35em] text-blue-400 mb-5">Contact</h4>
              <ul className="space-y-3 text-gray-500 text-sm font-semibold">
                {CONTACT_DEFAULTS.phones.map(p => <li key={p.tel}><a href={`tel:${p.tel}`} className="hover:text-white">{p.display}</a></li>)}
                {CONTACT_DEFAULTS.emails.map(e => <li key={e}><a href={`mailto:${e}`} className="hover:text-white break-all">{e}</a></li>)}
                <li className="leading-relaxed"><a href={mapUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white">{s.addressLine1}<br />{s.addressLine2}<span className="block text-xs text-blue-400 mt-1">Open in Google Maps</span></a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 pb-16 md:pb-0 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-xs font-medium">&copy; {new Date().getFullYear()} SPR TechForge Pvt Ltd. All rights reserved.</p>
            <div className="flex gap-6 text-xs font-black uppercase tracking-[0.3em] text-gray-600">
              <button onClick={() => setOpenModal('privacy')} className="hover:text-white">Privacy</button>
              <button onClick={() => setOpenModal('terms')} className="hover:text-white">Terms</button>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp */}
      <a href={waLink} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform">
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.2-.2.2-.4.3-.6.1-.2 0-.4 0-.6l-.9-2.1c-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.1-1.3c1.5.8 3.1 1.3 4.9 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3C4 15.1 3.8 13.6 3.8 12c0-4.5 3.7-8.2 8.2-8.2s8.2 3.7 8.2 8.2-3.7 8.2-8.2 8.2z" /></svg>
      </a>

      {/* Modals */}
      <Modal isOpen={openModal === 'careers'} onClose={() => setOpenModal(null)} title="Careers at SPR TechForge" size="md">
        <div className="space-y-3 text-sm text-gray-700">
          <p>We hire QA engineers, automation testers, trainers and developers as our projects grow. If you love finding bugs and teaching others, we would like to hear from you.</p>
          <p>Email your resume to <a href={`mailto:${CONTACT_DEFAULTS.emails[1]}`} className="text-blue-700 font-bold underline">{CONTACT_DEFAULTS.emails[1]}</a> with the role you are interested in.</p>
        </div>
      </Modal>
      <Modal isOpen={openModal === 'privacy'} onClose={() => setOpenModal(null)} title="Privacy" size="md">
        <div className="space-y-3 text-sm text-gray-700">
          <p>We collect the details you give us (name, phone, email, message) only to respond to your enquiry, manage your training or event registration, and tell you about our programs. We never sell your data.</p>
          <p>You can ask us to delete your details at any time by emailing <a href={`mailto:${CONTACT_DEFAULTS.emails[0]}`} className="text-blue-700 font-bold underline">{CONTACT_DEFAULTS.emails[0]}</a>.</p>
        </div>
      </Modal>
      <Modal isOpen={openModal === 'terms'} onClose={() => setOpenModal(null)} title="Terms" size="md">
        <div className="space-y-3 text-sm text-gray-700">
          <p>Seminars and demo classes are free. Training fees, batch schedules and refund terms are shared in writing before enrolment. Placement support means active assistance — resume help, mock interviews, interview scheduling and referrals — not a guaranteed job.</p>
          <p>Content on this site is owned by SPR TechForge Pvt Ltd. Contact <a href={`mailto:${CONTACT_DEFAULTS.emails[0]}`} className="text-blue-700 font-bold underline">{CONTACT_DEFAULTS.emails[0]}</a> for anything else.</p>
        </div>
      </Modal>
    </div>
  );
};
