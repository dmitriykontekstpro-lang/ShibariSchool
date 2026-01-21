
import React from 'react';
import { X, Award, MapPin, User, FileText, Anchor, Send, Mail, Instagram } from 'lucide-react';
import { NAVAZU_CONTENT } from '../constants';

interface NavazuModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ru' | 'en';
}

const NavazuModal: React.FC<NavazuModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black animate-in fade-in duration-200 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 md:p-6 border-b border-white/10 bg-black shrink-0 z-10">
         <div className="flex items-center gap-3">
             <div className="p-2 bg-red-900/20 rounded-lg">
                <Anchor className="w-6 h-6 text-red-600" />
             </div>
             <div>
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight uppercase">Навадзу</h2>
                <p className="text-[10px] md:text-xs text-neutral-400">Школа японского связывания</p>
             </div>
        </div>
        <button 
          onClick={onClose}
          className="group flex items-center justify-center w-10 h-10 rounded-full bg-black border border-white/20 text-white hover:border-red-600 hover:bg-red-600 transition-all duration-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scroll Content */}
      <div className="flex-1 overflow-y-auto bg-neutral-950 scroll-smooth">
          
          {/* Screen 1: Hero & Description */}
          <section className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
              {/* Background Accent */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-red-900/10 to-neutral-950 z-0"></div>
              
              <div className="relative z-10 max-w-5xl mx-auto w-full">
                  <div className="flex flex-col md:flex-row gap-12 items-center">
                      <div className="w-full md:w-1/2 space-y-6">
                          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter leading-none">
                              {NAVAZU_CONTENT.school_name}
                          </h1>
                          <div className="h-1 w-24 bg-red-600"></div>
                          <div className="prose prose-invert max-w-none text-neutral-300 text-lg leading-relaxed whitespace-pre-line">
                              {NAVAZU_CONTENT.school_description}
                          </div>
                      </div>
                      <div className="w-full md:w-1/2">
                          <div className="aspect-[3/4] md:aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group">
                              <img 
                                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800" 
                                alt="Shibari Art" 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                          </div>
                      </div>
                  </div>
              </div>
          </section>

          {/* Screen 2: Certification Levels */}
          <section className="min-h-screen bg-black py-20 px-6 md:px-12 flex flex-col items-center justify-center">
              <div className="max-w-6xl mx-auto w-full">
                  <div className="text-center mb-16">
                      <span className="text-red-500 font-bold tracking-widest uppercase text-sm">Путь мастера</span>
                      <h2 className="text-4xl md:text-5xl font-bold text-white mt-2">Уровни сертификации</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {NAVAZU_CONTENT.levels.map((lvl) => (
                          <div key={lvl.level} className="bg-neutral-900/50 border border-neutral-800 p-8 rounded-2xl hover:border-red-900/50 transition-all duration-300 group hover:-translate-y-2">
                              <div className="text-6xl font-black text-neutral-800 group-hover:text-red-900/30 mb-4 transition-colors">0{lvl.level}</div>
                              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-red-500 transition-colors">{lvl.title}</h3>
                              <p className="text-neutral-400 leading-relaxed">
                                  {lvl.desc}
                              </p>
                          </div>
                      ))}
                  </div>
              </div>
          </section>

          {/* Screen 3: Master */}
          <section className="min-h-screen py-20 px-6 md:px-12 flex items-center justify-center bg-neutral-900 relative">
              <div className="max-w-5xl mx-auto w-full flex flex-col-reverse md:flex-row gap-12 items-center relative z-10">
                  <div className="w-full md:w-1/2 relative">
                      <div className="absolute -top-10 -left-10 w-40 h-40 border-t-2 border-l-2 border-red-600 rounded-tl-3xl opacity-50"></div>
                      <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-2xl filter grayscale contrast-125 hover:grayscale-0 transition-all duration-500">
                          <img src={NAVAZU_CONTENT.master.image} alt="Master" className="w-full h-full object-cover" />
                      </div>
                  </div>
                  <div className="w-full md:w-1/2 space-y-8">
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-red-600 rounded-full text-white">
                              <User className="w-6 h-6" />
                          </div>
                          <h2 className="text-4xl font-bold text-white">Мастер сертификации</h2>
                      </div>
                      <h3 className="text-2xl text-red-500 font-medium">{NAVAZU_CONTENT.master.name}</h3>
                      <p className="text-xl text-neutral-300 leading-relaxed font-light">
                          {NAVAZU_CONTENT.master.bio}
                      </p>
                      <div className="flex gap-4 pt-4">
                          <div className="flex flex-col">
                              <span className="text-3xl font-bold text-white">25+</span>
                              <span className="text-xs text-neutral-500 uppercase tracking-wider">Лет опыта</span>
                          </div>
                          <div className="w-px bg-neutral-700 h-12"></div>
                          <div className="flex flex-col">
                              <span className="text-3xl font-bold text-white">500+</span>
                              <span className="text-xs text-neutral-500 uppercase tracking-wider">Учеников</span>
                          </div>
                      </div>
                  </div>
              </div>
          </section>

          {/* Screen 4: Locations */}
          <section className="min-h-[80vh] bg-black py-20 px-6 md:px-12 flex flex-col justify-center">
              <div className="max-w-4xl mx-auto w-full text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Центры сертификации</h2>
                  <p className="text-neutral-400 text-lg">Экзамены проводятся только в аккредитованных додзё.</p>
              </div>

              <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                  {NAVAZU_CONTENT.locations.map((loc, idx) => (
                      <div key={idx} className="flex items-center p-6 bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 transition-colors">
                          <div className="w-12 h-12 bg-red-900/20 rounded-full flex items-center justify-center text-red-500 mr-6 shrink-0">
                              <MapPin className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                              <h4 className="text-xl font-bold text-white">{loc.city}</h4>
                              <p className="text-neutral-400">{loc.address}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </section>

          {/* Screen 5: Process */}
          <section className="min-h-[70vh] bg-neutral-950 py-20 px-6 md:px-12 flex items-center justify-center border-t border-white/5">
              <div className="max-w-4xl mx-auto w-full text-center space-y-12">
                  <div className="inline-block p-4 bg-red-600 rounded-full mb-4 shadow-[0_0_30px_rgba(220,38,38,0.4)]">
                      <Award className="w-8 h-8 text-white" />
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl font-bold text-white">Процесс сертификации</h2>
                  
                  <div className="bg-neutral-900/50 p-8 md:p-12 rounded-2xl border border-neutral-800 text-lg md:text-xl text-neutral-300 leading-relaxed">
                      {NAVAZU_CONTENT.process}
                  </div>

                  <div className="flex justify-center gap-6 mt-4">
                      <a href="#" target="_blank" rel="noopener noreferrer" className="p-4 bg-neutral-900 border border-neutral-800 rounded-full text-neutral-400 hover:text-white hover:bg-[#229ED9] hover:border-[#229ED9] transition-all duration-300 transform hover:scale-110 shadow-lg group" title="Telegram">
                          <Send className="w-6 h-6 transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                      <a href="mailto:info@navazu.com" className="p-4 bg-neutral-900 border border-neutral-800 rounded-full text-neutral-400 hover:text-white hover:bg-red-600 hover:border-red-600 transition-all duration-300 transform hover:scale-110 shadow-lg group" title="Email">
                          <Mail className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      </a>
                      <a href="#" target="_blank" rel="noopener noreferrer" className="p-4 bg-neutral-900 border border-neutral-800 rounded-full text-neutral-400 hover:text-white hover:bg-[#E1306C] hover:border-[#E1306C] transition-all duration-300 transform hover:scale-110 shadow-lg group" title="Instagram">
                          <Instagram className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                      </a>
                  </div>
              </div>
          </section>

          <footer className="bg-black py-12 text-center text-neutral-600 text-sm border-t border-neutral-900">
              <p>&copy; 2023 Shibari School Navazu. Все права защищены.</p>
          </footer>
      </div>
    </div>
  );
};

export default NavazuModal;
