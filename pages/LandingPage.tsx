import React, { useState, useEffect } from 'react';
import { Logo, Button, Modal } from '../components/Components';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openModal, setOpenModal] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContact = () => {
    setIsMobileMenuOpen(false);
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      {/* Navigation Bar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white shadow-xl py-1 md:py-2 border-gray-100' : 'bg-spr-900/10 backdrop-blur-md py-4 md:py-6 border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo Area */}
            <div className="flex items-center">
              <Logo size="sm" inverse={!scrolled} />
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-10">
              <a href="#" className={`text-sm font-black uppercase tracking-widest transition-colors ${scrolled ? 'text-gray-700 hover:text-spr-600' : 'text-white hover:text-blue-300'}`}>Services</a>
              <a href="#" className={`text-sm font-black uppercase tracking-widest transition-colors ${scrolled ? 'text-gray-700 hover:text-spr-600' : 'text-white hover:text-blue-300'}`}>Industries</a>
              <a href="#" className={`text-sm font-black uppercase tracking-widest transition-colors ${scrolled ? 'text-gray-700 hover:text-spr-600' : 'text-white hover:text-blue-300'}`}>Insights</a>
              <button onClick={() => setOpenModal('careers')} className={`text-sm font-black uppercase tracking-widest transition-colors ${scrolled ? 'text-gray-700 hover:text-spr-600' : 'text-white hover:text-blue-300'}`}>Careers</button>
            </div>

            {/* Right Side Actions - Desktop */}
            <div className="hidden md:flex items-center gap-8">
              <button 
                onClick={scrollToContact}
                className={`text-sm font-black uppercase tracking-[0.2em] transition-colors ${scrolled ? 'text-gray-900 hover:text-spr-600' : 'text-white hover:text-blue-400'}`}
              >
                Contact Us
              </button>
              <div className={`h-8 w-px ${scrolled ? 'bg-gray-300' : 'bg-white/30'}`}></div>
              <Button 
                onClick={() => navigate('/login')}
                className={`px-10 rounded-full font-black shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all hover:scale-110 hover:shadow-[0_15px_35px_rgba(0,0,0,0.2)] active:scale-95 h-12 border-none ${!scrolled ? 'bg-white !text-spr-900 ring-2 ring-white/20' : 'bg-spr-900 text-white'}`}
              >
                LOGIN
              </Button>
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden flex items-center gap-4">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-xl transition-all ${scrolled ? 'bg-gray-100 text-gray-900' : 'bg-white/10 text-white backdrop-blur-md'}`}
                aria-label="Toggle Menu"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <div className={`md:hidden absolute w-full bg-white shadow-[0_30px_60px_rgba(0,0,0,0.2)] transition-all duration-300 border-b border-gray-200 overflow-hidden ${isMobileMenuOpen ? 'max-h-[600px] opacity-100 py-8' : 'max-h-0 opacity-0 py-0'}`}>
           <div className="px-8 space-y-6">
              <a href="#" className="block text-xl font-black text-gray-800 uppercase tracking-widest">Services</a>
              <a href="#" className="block text-xl font-black text-gray-800 uppercase tracking-widest">Industries</a>
              <a href="#" className="block text-xl font-black text-gray-800 uppercase tracking-widest">Insights</a>
              <button onClick={() => { setIsMobileMenuOpen(false); setOpenModal('careers'); }} className="block text-xl font-black text-gray-800 uppercase tracking-widest">Careers</button>
              <button onClick={scrollToContact} className="block text-xl font-black text-spr-600 uppercase tracking-[0.2em]">Contact Us</button>
              <div className="pt-6 border-t border-gray-100">
                <Button 
                    onClick={() => navigate('/login')}
                    className="w-full bg-spr-900 py-5 text-xl rounded-2xl shadow-xl text-white font-black"
                >
                    Login to Portal
                </Button>
              </div>
           </div>
        </div>
      </nav>

      {/* Hero Section - Fixed overlap with generous top padding */}
      <header className="relative min-h-[850px] flex items-center pt-48 md:pt-64 bg-spr-900 overflow-hidden">
        {/* Background Gradient/Pattern */}
        <div className="absolute inset-0 z-0">
           <div className="absolute inset-0 bg-gradient-to-br from-spr-900 via-[#0a1435] to-[#020617]"></div>
           {/* Grid Pattern Overlay */}
           <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:30px_30px] opacity-50"></div>
           <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-5xl animate-fade-in py-12 md:py-20">
            <div className="inline-flex items-center gap-3 bg-blue-500/10 border border-blue-400/20 px-5 py-2.5 rounded-full mb-10 backdrop-blur-md">
                <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse shadow-[0_0_10px_#60a5fa]"></span>
                <span className="text-blue-300 font-black tracking-[0.3em] uppercase text-[10px] md:text-xs">Engineering Digital Future</span>
            </div>
            <h1 className="text-4xl sm:text-7xl md:text-[90px] font-black text-white leading-[1.05] mb-10 tracking-tight">
              Accelerating Business Velocity with <br className="hidden lg:block"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-200">Quality Engineering</span>
            </h1>
            <p className="text-lg md:text-2xl text-blue-100/70 mb-14 leading-relaxed max-w-4xl border-l-4 border-blue-500/40 pl-8 font-medium">
              SPR Techforge empowers enterprises to deliver flawless digital experiences through advanced Software Testing, Cloud Transformation, and Strategic Consulting.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <button className="bg-white text-spr-900 font-black px-14 py-6 rounded-[2rem] hover:bg-blue-50 hover:scale-110 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-center text-xl">
                Explore Services
              </button>
              <button onClick={scrollToContact} className="border-2 border-white/30 backdrop-blur-md text-white font-black px-14 py-6 rounded-[2rem] hover:bg-white/10 hover:scale-110 transition-all text-center text-xl">
                Partner With Us
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section - Lifted up to overlap hero slightly */}
      <section className="bg-white py-14 relative z-10 -mt-24 md:-mt-32 mx-4 md:mx-8 lg:mx-auto max-w-6xl rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] border border-gray-100">
        <div className="px-6 sm:px-12">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8 text-center divide-gray-100 md:divide-x">
              <div className="px-4">
                 <p className="text-4xl md:text-6xl font-black text-spr-700 tracking-tighter">50+</p>
                 <p className="text-[10px] md:text-xs text-gray-400 font-black uppercase mt-3 tracking-[0.2em]">Enterprise Clients</p>
              </div>
              <div className="px-4">
                 <p className="text-4xl md:text-6xl font-black text-spr-700 tracking-tighter">100%</p>
                 <p className="text-[10px] md:text-xs text-gray-400 font-black uppercase mt-3 tracking-[0.2em]">Project Delivery</p>
              </div>
              <div className="px-4">
                 <p className="text-4xl md:text-6xl font-black text-spr-700 tracking-tighter">24/7</p>
                 <p className="text-[10px] md:text-xs text-gray-400 font-black uppercase mt-3 tracking-[0.2em]">Global Support</p>
              </div>
              <div className="px-4">
                 <p className="text-4xl md:text-6xl font-black text-spr-700 tracking-tighter">1M+</p>
                 <p className="text-[10px] md:text-xs text-gray-400 font-black uppercase mt-3 tracking-[0.2em]">Tests Executed</p>
              </div>
           </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-36 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-28">
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-10 tracking-tight">Our Core Capabilities</h2>
            <div className="w-40 h-2 bg-spr-600 mx-auto rounded-full"></div>
            <p className="mt-10 text-lg md:text-2xl text-gray-500 max-w-3xl mx-auto leading-relaxed font-medium">
              We combine deep domain expertise with cutting-edge technology to drive innovation and efficiency for modern enterprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14">
            {/* Service 1 */}
            <div className="group bg-gray-50 p-14 rounded-[3.5rem] border border-gray-100 hover:bg-white hover:shadow-[0_60px_100px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 hover:-translate-y-4">
              <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center mb-12 shadow-2xl shadow-blue-200 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-6">Quality Engineering</h3>
              <p className="text-gray-500 leading-relaxed text-lg mb-12">
                Comprehensive testing solutions including Automation, Performance, and Cloud-native testing to ensure robust software delivery.
              </p>
              <div className="flex items-center gap-4 text-spr-600 font-black cursor-pointer group-hover:gap-8 transition-all text-xl">
                Explore Solutions <span className="text-3xl">&rarr;</span>
              </div>
            </div>

            {/* Service 2 */}
            <div className="group bg-gray-50 p-14 rounded-[3.5rem] border border-gray-100 hover:bg-white hover:shadow-[0_60px_100px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 hover:-translate-y-4">
              <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center mb-12 shadow-2xl shadow-indigo-200 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                 <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                 </svg>
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-6">Cloud Consulting</h3>
              <p className="text-gray-500 leading-relaxed text-lg mb-12">
                Architecting scalable cloud infrastructures and implementing DevOps pipelines to accelerate your speed-to-market.
              </p>
              <div className="flex items-center gap-4 text-spr-600 font-black cursor-pointer group-hover:gap-8 transition-all text-xl">
                View Expertise <span className="text-3xl">&rarr;</span>
              </div>
            </div>

            {/* Service 3 */}
            <div className="group bg-gray-50 p-14 rounded-[3.5rem] border border-gray-100 hover:bg-white hover:shadow-[0_60px_100px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 hover:-translate-y-4 md:col-span-2 lg:col-span-1">
              <div className="w-24 h-24 bg-emerald-600 rounded-[2rem] flex items-center justify-center mb-12 shadow-2xl shadow-emerald-200 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                 <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                 </svg>
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-6">Staffing & Training</h3>
              <p className="text-gray-500 leading-relaxed text-lg mb-12">
                Bridging the talent gap with specialized technical resources and tailored corporate training programs for your workforce.
              </p>
              <div className="flex items-center gap-4 text-spr-600 font-black cursor-pointer group-hover:gap-8 transition-all text-xl">
                Join Network <span className="text-3xl">&rarr;</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#020617] py-40 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-blue-600 rounded-full mix-blend-screen filter blur-[180px] opacity-10 animate-pulse"></div>
         
         <div className="max-w-6xl mx-auto px-8 text-center relative z-10">
            <h2 className="text-5xl md:text-8xl font-black text-white mb-12 leading-[1] tracking-tight">Ready to Engineer Your <br/> Next Digital Success?</h2>
            <p className="text-xl md:text-3xl text-blue-100/60 mb-20 max-w-5xl mx-auto leading-relaxed">
               Collaborate with SPR Techforge and harness the power of world-class technical consulting to drive your business forward.
            </p>
            <button onClick={scrollToContact} className="bg-white hover:bg-blue-50 text-spr-900 font-black px-20 py-8 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.4)] transition-all transform hover:scale-110 active:scale-95 text-2xl uppercase tracking-widest">
               Get a Free Consultation
            </button>
         </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#010208] text-white pt-40 pb-20">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-24 mb-32">
               <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                  <div className="text-white mb-12 inline-block">
                    <Logo size="sm" inverse />
                  </div>
                  <p className="text-gray-500 leading-relaxed text-xl font-medium">
                     A premier technology firm dedicated to excellence in software quality engineering and cloud-native solutions.
                  </p>
                  <div className="flex gap-8 mt-12">
                     <a href="#" className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-all hover:-translate-y-2 border border-white/10">
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                     </a>
                  </div>
               </div>
               
               <div>
                  <h4 className="text-base font-black uppercase tracking-[0.4em] text-blue-400 mb-12">Expertise</h4>
                  <ul className="space-y-6 text-gray-500 font-bold text-lg">
                     <li><a href="#" className="hover:text-white transition-colors">Quality Assurance</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">Automation Ops</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">Performance Tuning</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">Cybersecurity</a></li>
                  </ul>
               </div>

               <div>
                  <h4 className="text-base font-black uppercase tracking-[0.4em] text-blue-400 mb-12">Company</h4>
                  <ul className="space-y-6 text-gray-500 font-bold text-lg">
                     <li><button onClick={() => setOpenModal('about')} className="hover:text-white transition-colors text-left">Our Identity</button></li>
                     <li><button onClick={() => setOpenModal('careers')} className="hover:text-white transition-colors text-left">Career Portal</button></li>
                     <li><button onClick={() => setOpenModal('leadership')} className="hover:text-white transition-colors text-left">Leadership Team</button></li>
                     <li><button onClick={scrollToContact} className="hover:text-white transition-colors text-left">Global Presence</button></li>
                  </ul>
               </div>

               <div>
                  <h4 className="text-base font-black uppercase tracking-[0.4em] text-blue-400 mb-12">Contact</h4>
                  <ul className="space-y-10 text-gray-500 font-bold text-lg">
                     <li className="flex items-start gap-6">
                        <svg className="w-8 h-8 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span className="text-lg leading-relaxed">SPR Techforge Pvt Ltd<br/>Sri Godha Nilayam, Kukatpally, Hyderabad 500085</span>
                     </li>
                     <li className="flex items-center gap-6">
                        <svg className="w-8 h-8 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        <a href="mailto:contact@sprtechforge.com" className="hover:text-white transition-colors">contact@sprtechforge.com</a>
                     </li>
                  </ul>
               </div>
            </div>
            
            <div className="border-t border-white/5 pt-20 flex flex-col md:flex-row justify-between items-center gap-10">
               <p className="text-lg text-gray-600 font-medium">&copy; 2025 SPR Techforge Pvt Ltd. All rights reserved.</p>
               <div className="flex gap-14 text-xs font-black uppercase tracking-[0.4em] text-gray-600">
                  <a href="#" className="hover:text-white transition-colors">Privacy</a>
                  <a href="#" className="hover:text-white transition-colors">Terms</a>
                  <a href="#" className="hover:text-white transition-colors">Security</a>
               </div>
            </div>
         </div>
      </footer>

      {/* Modals */}
      <Modal isOpen={openModal === 'about'} onClose={() => setOpenModal(null)} title="Our Identity">
        <div className="space-y-10 p-4">
            <p className="text-2xl text-gray-800 leading-relaxed font-bold">
                We are a specialized technology firm focused on the science of Software Quality.
            </p>
            <p className="text-gray-500 leading-relaxed text-xl">
                With a track record of successfully training and placing over 30+ professionals in high-impact roles, SPR Techforge stands as a beacon of excellence for both career aspirants and enterprises seeking top-tier QA talent.
            </p>
            <div className="bg-blue-600 p-10 rounded-[3rem] text-white shadow-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 blur-[60px] rounded-full"></div>
                <h4 className="font-black uppercase tracking-[0.4em] text-xs mb-8 text-blue-200">Our Mandate</h4>
                <p className="text-3xl font-black italic leading-[1.2]">
                    "To bridge the skill gap through precision training and strategic placement, empowering the next generation of quality engineers."
                </p>
            </div>
        </div>
      </Modal>

      <Modal isOpen={openModal === 'careers'} onClose={() => setOpenModal(null)} title="Career Portal">
        <div className="space-y-10 p-4">
            <p className="text-gray-500 text-xl font-medium">
                Are you looking to join a high-growth technical environment? Explore our open mandates.
            </p>
            <div className="grid grid-cols-1 gap-8">
                <div className="bg-gray-50 p-10 rounded-[3.5rem] border border-gray-100 hover:border-blue-300 hover:bg-white transition-all cursor-pointer shadow-sm hover:shadow-xl group">
                    <h4 className="font-black text-gray-900 text-3xl mb-4">Automation Test Engineer</h4>
                    <p className="text-xl text-gray-500 font-bold">Java, Selenium, Cucumber Experts</p>
                    <div className="mt-8 text-spr-600 font-black flex items-center gap-2 group-hover:gap-4 transition-all">Apply Now <span>&rarr;</span></div>
                </div>
                <div className="bg-gray-50 p-10 rounded-[3.5rem] border border-gray-100 hover:border-blue-300 hover:bg-white transition-all cursor-pointer shadow-sm hover:shadow-xl group">
                    <h4 className="font-black text-gray-900 text-3xl mb-4">Performance Architect</h4>
                    <p className="text-xl text-gray-500 font-bold">JMeter & LoadRunner Specialists</p>
                    <div className="mt-8 text-spr-600 font-black flex items-center gap-2 group-hover:gap-4 transition-all">Apply Now <span>&rarr;</span></div>
                </div>
            </div>
            <div className="pt-10 text-center border-t border-gray-100">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-4">Apply directly via</p>
                <a href="mailto:careers@sprtechforge.com" className="text-4xl font-black text-spr-600 hover:underline">careers@sprtechforge.com</a>
            </div>
        </div>
      </Modal>

    </div>
  );
};
