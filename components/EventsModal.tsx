
import React from 'react';
import { X, Calendar, MapPin, ExternalLink, Ticket, Clock } from 'lucide-react';
import { AppEvent } from '../types';

interface EventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: AppEvent[];
  lang: 'ru' | 'en';
  t: any;
}

const EventsModal: React.FC<EventsModalProps> = ({ 
    isOpen, onClose, events, lang, t 
}) => {
  if (!isOpen) return null;

  // Helper to format date nicely
  const formatDate = (dateString: string) => {
      try {
          const date = new Date(dateString);
          return date.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
          });
      } catch (e) { return dateString; }
  };

  const getDay = (dateString: string) => {
      try { return new Date(dateString).getDate(); } catch (e) { return ''; }
  };
  
  const getMonth = (dateString: string) => {
      try { return new Date(dateString).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { month: 'short' }).toUpperCase(); } catch (e) { return ''; }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black animate-in fade-in duration-200 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 md:p-6 border-b border-white/10 bg-black shrink-0">
         <div className="flex items-center gap-3">
             <div className="p-2 bg-red-900/20 rounded-lg">
                <Calendar className="w-6 h-6 text-red-600" />
             </div>
             <div>
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight uppercase">{t.events || "Афиша"}</h2>
                <p className="text-[10px] md:text-xs text-neutral-400">{t.events_subtitle || "Мероприятия и Воркшопы"}</p>
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
      <div className="flex-1 overflow-y-auto bg-neutral-950 p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto pb-20">
              {events.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                      <Calendar className="w-12 h-12 mb-4 opacity-20" />
                      <p>Нет предстоящих мероприятий.</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {events.map((event, idx) => (
                          <div key={event.id} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden group hover:border-red-900/50 transition-colors flex flex-col h-full shadow-lg">
                              {/* Image Section */}
                              <div className="h-48 bg-black relative overflow-hidden">
                                  {event.image_url ? (
                                      <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                  ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-neutral-950 text-neutral-700">
                                          <Calendar className="w-10 h-10" />
                                      </div>
                                  )}
                                  
                                  {/* Date Badge */}
                                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-black rounded-lg p-2 text-center min-w-[60px] shadow-lg">
                                      <div className="text-2xl font-bold leading-none">{getDay(event.date)}</div>
                                      <div className="text-[10px] font-bold uppercase tracking-wider text-red-600">{getMonth(event.date)}</div>
                                  </div>
                              </div>

                              {/* Content Section */}
                              <div className="p-5 flex flex-col flex-1">
                                  <div className="mb-4">
                                      <h3 className="text-xl font-bold text-white leading-tight mb-2 group-hover:text-red-500 transition-colors">{event.title}</h3>
                                      <div className="flex flex-col gap-1.5 text-sm text-neutral-400">
                                          <div className="flex items-center gap-2">
                                              <Clock className="w-4 h-4 text-neutral-600" />
                                              <span>{formatDate(event.date)} {event.time ? `• ${event.time}` : ''}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                              <MapPin className="w-4 h-4 text-neutral-600" />
                                              <span className="truncate">{event.location}</span>
                                          </div>
                                      </div>
                                  </div>

                                  <p className="text-neutral-500 text-sm line-clamp-3 mb-6 flex-1">
                                      {event.description}
                                  </p>

                                  <div className="mt-auto flex items-center justify-between border-t border-neutral-800 pt-4">
                                      <div className="flex flex-col">
                                          <span className="text-[10px] uppercase font-bold text-neutral-500">{t.event_price || "Стоимость"}</span>
                                          <span className="text-lg font-mono font-bold text-white">{event.price || "Free"}</span>
                                      </div>
                                      
                                      {event.registration_url && (
                                          <a 
                                              href={event.registration_url} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-lg shadow-red-900/20"
                                          >
                                              {t.register_event || "Записаться"} <Ticket className="w-4 h-4" />
                                          </a>
                                      )}
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default EventsModal;
