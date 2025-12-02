
import React, { useState, useEffect } from 'react';
import { Logo, Button, Modal } from '../components/Components';
import { Link, useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [openModal, setOpenModal] = useState<string | null>(null);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Navigation Bar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo Area */}
            <div className="flex items-center">
              <Logo size="sm" />
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-sm font-medium text-gray-700 hover:text-spr-600 transition-colors">Services</a>
              <a href="#" className="text-sm font-medium text-gray-700 hover:text-spr-600 transition-colors">Industries</a>
              <a href="#" className="text-sm font-medium text-gray-700 hover:text-spr-600 transition-colors">Insights</a>
              <button onClick={() => setOpenModal('careers')} className="text-sm font-medium text-gray-700 hover:text-spr-600 transition-colors">Careers</button>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-6">
              <button 
                onClick={scrollToContact}
                className="text-sm font-bold text-gray-900 hover:text-spr-600 transition-colors uppercase tracking-wide"
              >
                Contact Us
              </button>
              <div className="h-6 w-px bg-gray-300 mx-2"></div>
              <Button 
                onClick={() => navigate('/login')}
                className="bg-spr-900 hover:bg-spr-800 text-white px-6 rounded-full shadow-lg transform hover:scale-105 transition-all"
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative bg-spr-900 h-[600px] flex items-center overflow-hidden">
        {/* Background Gradient/Pattern */}
        <div className="absolute inset-0 z-0">
           <div className="absolute inset-0 bg-gradient-to-r from-spr-900 via-blue-900 to-indigo-900 opacity-90"></div>
           {/* Abstract Tech Overlay */}
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
           <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-blue-500/20 to-transparent transform skew-x-12 translate-x-20"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-16">
          <div className="max-w-3xl animate-fade-in">
            <h2 className="text-spr-300 font-bold tracking-widest uppercase mb-4 text-sm">Engineering Digital Future</h2>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
              Accelerating Business Velocity with <span className="text-blue-400">Quality Engineering</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl">
              SPR Techforge empowers enterprises to deliver flawless digital experiences through advanced Software Testing, Cloud Transformation, and Strategic Consulting.
            </p>
            <div className="flex gap-4">
              <button className="bg-white text-spr-900 font-bold px-8 py-3 rounded-md hover:bg-gray-100 transition-colors shadow-lg">
                Explore Services
              </button>
              <button onClick={scrollToContact} className="border-2 border-white text-white font-bold px-8 py-3 rounded-md hover:bg-white/10 transition-colors">
                Partner With Us
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="bg-spr-50 py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                 <p className="text-4xl font-bold text-spr-700">50+</p>
                 <p className="text-sm text-gray-600 font-medium uppercase mt-1">Enterprise Clients</p>
              </div>
              <div>
                 <p className="text-4xl font-bold text-spr-700">100%</p>
                 <p className="text-sm text-gray-600 font-medium uppercase mt-1">Project Delivery</p>
              </div>
              <div>
                 <p className="text-4xl font-bold text-spr-700">24/7</p>
                 <p className="text-sm text-gray-600 font-medium uppercase mt-1">Global Support</p>
              </div>
              <div>
                 <p className="text-4xl font-bold text-spr-700">1M+</p>
                 <p className="text-sm text-gray-600 font-medium uppercase mt-1">Test Cases Executed</p>
              </div>
           </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Capabilities</h2>
            <div className="w-20 h-1 bg-spr-600 mx-auto rounded"></div>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              We combine deep domain expertise with cutting-edge technology to drive innovation and efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="group bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                <svg className="w-8 h-8 text-blue-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Quality Engineering</h3>
              <p className="text-gray-600 leading-relaxed">
                End-to-end testing services including Automation, Performance, and Security testing to ensure zero-defect delivery.
              </p>
              <a href="#" className="inline-block mt-4 text-spr-600 font-bold hover:underline">Learn More &rarr;</a>
            </div>

            {/* Service 2 */}
            <div className="group bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-indigo-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                 <svg className="w-8 h-8 text-indigo-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                 </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Cloud Consulting</h3>
              <p className="text-gray-600 leading-relaxed">
                Strategic cloud migration, architecture design, and DevOps implementation to accelerate your digital transformation.
              </p>
              <a href="#" className="inline-block mt-4 text-spr-600 font-bold hover:underline">Learn More &rarr;</a>
            </div>

            {/* Service 3 */}
            <div className="group bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-emerald-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
                 <svg className="w-8 h-8 text-emerald-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                 </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Staffing & Training</h3>
              <p className="text-gray-600 leading-relaxed">
                Providing top-tier technical talent and corporate training programs to bridge the skills gap in your organization.
              </p>
              <a href="#" className="inline-block mt-4 text-spr-600 font-bold hover:underline">Learn More &rarr;</a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 py-20 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-spr-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
         
         <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Business?</h2>
            <p className="text-xl text-gray-300 mb-8">
               Join hands with SPR Techforge to leverage the power of next-gen technology and expert consulting.
            </p>
            <button onClick={scrollToContact} className="bg-spr-600 hover:bg-spr-500 text-white font-bold px-10 py-4 rounded-md shadow-lg transition-all">
               Get a Free Consultation
            </button>
         </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
               <div className="col-span-1 md:col-span-1">
                  <Logo size="sm" />
                  <p className="mt-6 text-sm text-gray-500 leading-relaxed">
                     SPR Techforge is a premier software testing and consulting firm dedicated to delivering excellence in digital engineering.
                  </p>
               </div>
               
               <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Services</h4>
                  <ul className="space-y-3 text-sm text-gray-600">
                     <li><a href="#" className="hover:text-spr-600">Quality Assurance</a></li>
                     <li><a href="#" className="hover:text-spr-600">Test Automation</a></li>
                     <li><a href="#" className="hover:text-spr-600">Performance Engineering</a></li>
                     <li><a href="#" className="hover:text-spr-600">DevOps Solutions</a></li>
                  </ul>
               </div>

               <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Company</h4>
                  <ul className="space-y-3 text-sm text-gray-600">
                     <li><button onClick={() => setOpenModal('about')} className="hover:text-spr-600 text-left">About Us</button></li>
                     <li><button onClick={() => setOpenModal('careers')} className="hover:text-spr-600 text-left">Careers</button></li>
                     <li><button onClick={() => setOpenModal('leadership')} className="hover:text-spr-600 text-left">Leadership</button></li>
                     <li><button onClick={scrollToContact} className="hover:text-spr-600 text-left">Contact</button></li>
                  </ul>
               </div>

               <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Contact Us</h4>
                  <ul className="space-y-3 text-sm text-gray-600">
                     <li className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-spr-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span>SPR Techforge Pvt Ltd<br/>Sri Godha Nilayam, 9th Phase Rd, KPHB phase 6, Kukatpally, Hyderabad, Telangana 500085</span>
                     </li>
                     <li className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-spr-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        <a href="mailto:contact@sprtechforge.com" className="hover:text-spr-600">contact@sprtechforge.com</a>
                     </li>
                  </ul>
               </div>
            </div>
            
            <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
               <p className="text-xs text-gray-500">&copy; 2025 SPR Techforge Pvt Ltd. All rights reserved.</p>
               <div className="flex gap-6">
                  <a href="#" className="text-gray-400 hover:text-gray-600"><span className="sr-only">LinkedIn</span><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg></a>
                  <a href="#" className="text-gray-400 hover:text-gray-600"><span className="sr-only">Twitter</span><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg></a>
               </div>
            </div>
         </div>
      </footer>

      {/* Modals */}
      <Modal isOpen={openModal === 'about'} onClose={() => setOpenModal(null)} title="About SPR Techforge">
        <div className="space-y-4">
            <p className="text-lg text-gray-800 leading-relaxed">
                We are a dedicated consultancy and training organization specializing in Automation Testing and Manual Testing.
            </p>
            <p className="text-gray-600 leading-relaxed">
                Over the past three years, we’ve successfully trained and placed 30+ skilled professionals across leading companies. Our focus is to provide training, expert guidance and support after joining one month.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
                <h4 className="font-bold text-blue-900 mb-2">Our Mission</h4>
                <p className="text-sm text-blue-800">
                    To empower individuals with industry-ready skills and connect enterprises with top-tier engineering talent, fostering innovation and excellence in the tech ecosystem.
                </p>
            </div>
        </div>
      </Modal>

      <Modal isOpen={openModal === 'careers'} onClose={() => setOpenModal(null)} title="Careers at SPR Techforge">
        <div className="space-y-4">
            <p className="text-gray-600">
                Join our dynamic team! We are always looking for skilled professionals passionate about Quality Engineering and Digital Transformation.
            </p>
            <div className="space-y-3 mt-4">
                <div className="border border-gray-200 p-3 rounded hover:bg-gray-50">
                    <h4 className="font-bold text-gray-900">Automation Test Engineer</h4>
                    <p className="text-sm text-gray-500">Experience: 2-5 Years • Skills: Java, Selenium, Cucumber</p>
                </div>
                <div className="border border-gray-200 p-3 rounded hover:bg-gray-50">
                    <h4 className="font-bold text-gray-900">Performance Tester</h4>
                    <p className="text-sm text-gray-500">Experience: 3+ Years • Skills: JMeter, LoadRunner</p>
                </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
                Send your resume to <a href="mailto:careers@sprtechforge.com" className="text-spr-600 font-bold hover:underline">careers@sprtechforge.com</a>
            </p>
        </div>
      </Modal>

      <Modal isOpen={openModal === 'leadership'} onClose={() => setOpenModal(null)} title="Our Leadership">
        <div className="space-y-6">
            <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-spr-900 text-white flex items-center justify-center text-xl font-bold">
                    TR
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Thirumal Reddy</h3>
                    <p className="text-spr-600 font-medium text-sm mb-2">Founder & Principal Consultant</p>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        An industry veteran with extensive experience in Software Quality Assurance and Corporate Training. Thirumal Reddy leads SPR Techforge with a vision to bridge the gap between academic knowledge and industry requirements, ensuring every professional we train is ready to make an immediate impact.
                    </p>
                </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 italic border-l-4 border-spr-500">
                "We don't just teach technology; we engineer careers."
            </div>
        </div>
      </Modal>

    </div>
  );
};
