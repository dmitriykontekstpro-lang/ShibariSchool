
import React from 'react';
import { X, Youtube, Instagram, Facebook, Twitter, Music, Send, Bot, Globe, Clapperboard, Smartphone, Play, MonitorPlay, Share2 } from 'lucide-react';
import { SocialResource } from '../types';

interface ResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  resources: SocialResource[];
  lang: 'ru' | 'en';
  t: any;
}

// Helper to map ID to Lucide Icon
const getIcon = (id: string) => {
    switch(id) {
        case 'youtube': return Youtube;
        case 'instagram': return Instagram;
        case 'facebook': return Facebook;
        case 'twitter': return Twitter;
        case 'spotify': return Music; // Best approximation for Spotify
        case 'telegram_channel': return Send;
        case 'telegram_bot': return Bot;
        case 'vk': return Globe; // VK doesn't have a specific Lucide icon
        case 'tiktok': return Clapperboard; // Clapperboard for video/tiktok
        case 'appstore': return Smartphone; // Generic phone/app store
        case 'googleplay': return Play; // Play icon
        case 'vimeo': return MonitorPlay;
        default: return Share2;
    }
};

const ResourcesModal: React.FC<ResourcesModalProps> = ({ isOpen, onClose, resources, lang, t }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black animate-in fade-in duration-200 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 md:p-6 border-b border-white/10 bg-black shrink-0 z-10">
         <div className="flex items-center gap-3">
             <div className="p-2 bg-red-900/20 rounded-lg">
                <Share2 className="w-6 h-6 text-red-600" />
             </div>
             <div>
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight uppercase">{t.resources || "Наши ресурсы"}</h2>
                <p className="text-[10px] md:text-xs text-neutral-400">{t.resources_subtitle || "Соцсети и партнеры"}</p>
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
      <div className="flex-1 overflow-y-auto bg-neutral-950 p-4 md:p-8 flex items-center justify-center">
          <div className="max-w-5xl w-full">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
                  {resources.map((res) => {
                      const Icon = getIcon(res.id);
                      return (
                          <a 
                            key={res.id} 
                            href={res.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex flex-col items-center justify-center group"
                          >
                              <div className="mb-4 p-4 rounded-full bg-black/50 group-hover:bg-red-900/10 transition-colors duration-500">
                                  <Icon className="w-16 h-16 text-red-600 group-hover:text-red-500 transition-all duration-300 group-hover:scale-110 filter drop-shadow-[0_0_10px_rgba(220,38,38,0.3)]" />
                              </div>
                              <span className="text-xs md:text-sm font-bold text-neutral-500 group-hover:text-white uppercase tracking-widest text-center transition-colors duration-300">
                                  {res.label}
                              </span>
                          </a>
                      );
                  })}
              </div>
          </div>
      </div>
    </div>
  );
};

export default ResourcesModal;
