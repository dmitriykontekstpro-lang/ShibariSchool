
import React, { useMemo } from 'react';
import { X, Scroll, Calendar } from 'lucide-react';
import { HistoryEvent } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: HistoryEvent[];
  lang: 'ru' | 'en';
  t: any;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ 
    isOpen, onClose, events, lang, t 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black animate-in fade-in duration-200 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 md:p-6 border-b border-white/10 bg-black shrink-0">
         <div className="flex items-center gap-3">
             <div className="p-2 bg-red-900/20 rounded-lg">
                <Scroll className="w-6 h-6 text-red-600" />
             </div>
             <div>
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight uppercase">{t.history || "История"}</h2>
                <p className="text-[10px] md:text-xs text-neutral-400">{t.history_subtitle || "Путь искусства"}</p>
             </div>
        </div>
        <button 
          onClick={onClose}
          className="group flex items-center justify-center w-10 h-10 rounded-full bg-black border border-white/20 text-white hover:border-red-600 hover:bg-red-600 transition-all duration-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-neutral-950 p-4 md:p-12 relative">
          <div className="max-w-7xl mx-auto relative pb-20">
              
              {/* Vertical Line - Moved to 20% (First Quarter) on Desktop */}
              <div className="absolute left-[20px] md:left-[20%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-red-900/50 to-transparent md:-ml-px"></div>

              {events.length === 0 ? (
                  <div className="text-center text-neutral-500 py-20">
                      <p>История еще не написана.</p>
                  </div>
              ) : (
                  <div className="space-y-20">
                      {events.map((event, index) => {
                          const title = lang === 'en' ? event.title_en : event.title_ru;
                          const desc = lang === 'en' ? event.description_en : event.description_ru;
                          
                          return (
                              <div key={event.id} className="relative flex flex-col md:flex-row items-start w-full animate-in slide-in-from-bottom-4 duration-500 group" style={{ animationDelay: `${index * 100}ms` }}>
                                  
                                  {/* Dot - Aligned with Headline center (approx 9px from top) */}
                                  <div className="absolute left-[14px] md:left-[20%] top-2 md:top-[9px] md:-ml-1.5 w-3 h-3 bg-red-600 rounded-full border border-black shadow-[0_0_10px_rgba(220,38,38,0.5)] z-10 ring-4 ring-black/50"></div>

                                  {/* Date Section (Left 20%) */}
                                  <div className="pl-12 md:pl-0 md:w-[20%] md:pr-12 md:text-right mb-2 md:mb-0 md:pt-0.5">
                                      <span className="text-red-500 font-bold font-mono text-xl md:text-2xl tracking-tighter opacity-80 group-hover:opacity-100 transition-opacity block leading-none">
                                          {event.date_display}
                                      </span>
                                  </div>

                                  {/* Content Section (Right 80%) */}
                                  <div className="pl-12 md:pl-16 md:w-[80%]">
                                      <div>
                                          {/* Title First - Aligned with Dot */}
                                          <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-none tracking-tight">{title}</h3>
                                          
                                          {/* Image Below Title */}
                                          {event.image_url && (
                                              <div className="mb-6 rounded-lg overflow-hidden border border-white/5 max-w-lg shadow-2xl">
                                                  <img src={event.image_url} alt={title} className="w-full h-auto object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                                              </div>
                                          )}
                                          
                                          <p className="text-neutral-400 text-base md:text-lg leading-relaxed max-w-4xl font-light">
                                              {desc}
                                          </p>
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default HistoryModal;
