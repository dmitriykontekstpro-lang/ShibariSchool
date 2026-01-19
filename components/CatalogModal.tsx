import React, { useState, useMemo, useEffect } from 'react';
import { X, Play, FolderOpen, ChevronDown, Check, Filter } from 'lucide-react';
import { CatalogCategory, CatalogVideo } from '../types';
import VideoPlayer from './VideoPlayer';

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CatalogCategory[];
  videos: CatalogVideo[];
  lang: 'ru' | 'en';
  t: any;
  subcategories?: any; 
}

const CatalogModal: React.FC<CatalogModalProps> = ({ 
    isOpen, onClose, categories, videos, lang, t 
}) => {
  // Store selected filters as: { categoryId: [subcategoryId1, subcategoryId2] }
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [activeVideo, setActiveVideo] = useState<CatalogVideo | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Toggle a specific subcategory filter
  const toggleFilter = (categoryId: string, subcategoryId: string) => {
      setFilters(prev => {
          const currentSubs = prev[categoryId] || [];
          const isSelected = currentSubs.includes(subcategoryId);
          
          let newSubs;
          if (isSelected) {
              newSubs = currentSubs.filter(id => id !== subcategoryId);
          } else {
              newSubs = [...currentSubs, subcategoryId];
          }

          const newFilters = { ...prev };
          if (newSubs.length === 0) {
              delete newFilters[categoryId];
          } else {
              newFilters[categoryId] = newSubs;
          }
          return newFilters;
      });
  };

  // Clear all filters for a specific category
  const clearCategoryFilters = (categoryId: string) => {
      setFilters(prev => {
          const newFilters = { ...prev };
          delete newFilters[categoryId];
          return newFilters;
      });
  };

  const clearAllFilters = () => {
      setFilters({});
      setOpenDropdownId(null);
  };

  // Filtering Logic (AND between categories, OR within category)
  const filteredVideos = useMemo(() => {
      // If no filters, return all
      if (Object.keys(filters).length === 0) return videos;

      return videos.filter(v => {
          if (!v.category_refs || v.category_refs.length === 0) return false;

          // Iterate over every active category filter (AND logic)
          return (Object.entries(filters) as [string, string[]][]).every(([catId, selectedSubIds]) => {
              if (selectedSubIds.length === 0) return true;

              // Check if the video has ANY of the selected subcategories for this category (OR logic)
              return v.category_refs.some(ref => 
                  ref.categoryId === catId && 
                  ref.subcategoryId && 
                  selectedSubIds.includes(ref.subcategoryId)
              );
          });
      });
  }, [videos, filters]);

  // Categories to hide
  const hiddenCategories = ['cat_cert', 'cat_course'];
  const visibleCategories = categories.filter(c => !hiddenCategories.includes(c.id));

  if (!isOpen) return null;

  const totalActiveFilters = (Object.values(filters) as string[][]).reduce((acc, curr) => acc + curr.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black animate-in fade-in duration-200 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 md:p-6 border-b border-white/10 bg-black shrink-0">
         <div className="flex items-center gap-3">
             <div className="p-2 bg-red-900/20 rounded-lg relative">
                <FolderOpen className="w-6 h-6 text-red-600" />
                {totalActiveFilters > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-black border border-black">
                        {totalActiveFilters}
                    </span>
                )}
             </div>
             <div>
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight uppercase">{t.catalog || "Каталог"}</h2>
                <p className="text-[10px] md:text-xs text-neutral-400 flex items-center gap-2">
                    {t.catalog_subtitle || "Библиотека видео"}
                    {filteredVideos.length !== videos.length && (
                        <span className="text-neutral-500">• Найдено: {filteredVideos.length}</span>
                    )}
                </p>
             </div>
        </div>
        <button 
          onClick={onClose}
          className="group flex items-center justify-center w-10 h-10 rounded-full bg-black border border-white/20 text-white hover:border-red-600 hover:bg-red-600 transition-all duration-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Unified Filter Card Area */}
      <div className="bg-neutral-950/50 backdrop-blur-sm sticky top-0 z-10 flex flex-col border-b border-white/5 py-2">
          <div className="max-w-7xl mx-auto w-full px-4">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-2 shadow-2xl relative">
                   
                   {/* Backdrop for closing dropdowns */}
                   {openDropdownId && (
                       <div className="fixed inset-0 z-30 cursor-default" onClick={() => setOpenDropdownId(null)} />
                   )}

                   {/* Compact Container (Wrapped) */}
                   <div className="flex flex-wrap items-center justify-center gap-1 relative z-40">
                        {/* Global All Button */}
                        <button
                            onClick={clearAllFilters}
                             className={`shrink-0 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border whitespace-nowrap leading-tight ${
                              Object.keys(filters).length === 0
                              ? 'bg-white text-black border-white shadow-sm' 
                              : 'bg-transparent text-neutral-400 border-transparent hover:bg-neutral-800 hover:text-white'
                          }`}
                        >
                            {lang === 'ru' ? 'Сброс' : 'Reset'}
                        </button>
                        
                        <div className="w-px h-4 bg-neutral-800 mx-1 shrink-0" />

                        {visibleCategories.map(cat => {
                            const hasSubs = cat.subcategories && cat.subcategories.length > 0;
                            const activeSubs = (filters[cat.id] as string[] | undefined) || [];
                            const isSelected = activeSubs.length > 0;
                            const isOpen = openDropdownId === cat.id;
                            
                            // Label Logic
                            let label = cat.label;
                            
                            return (
                                <div key={cat.id} className={`relative shrink-0 ${isOpen ? 'z-50' : 'z-auto'}`}>
                                    <button 
                                        onClick={() => {
                                            if (hasSubs) {
                                                setOpenDropdownId(isOpen ? null : cat.id);
                                            }
                                        }}
                                        className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border flex items-center justify-center gap-1 leading-tight text-center h-full min-h-[26px] ${
                                            // Allow word wrap inside button to save width
                                            'whitespace-normal max-w-[120px]' 
                                        } ${
                                            isSelected
                                            ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-900/20' 
                                            : 'bg-transparent text-neutral-400 border-transparent hover:bg-neutral-800 hover:text-white'
                                        }`}
                                    >
                                        <span>{label}</span>
                                        {isSelected && (
                                            <span className="bg-white text-red-600 rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8px] leading-none shrink-0">
                                                {activeSubs.length}
                                            </span>
                                        )}
                                        {hasSubs && <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
                                    </button>

                                    {/* Dropdown */}
                                    {isOpen && (
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-56 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150 z-[60]">
                                            {/* Header of Dropdown: Reset this category */}
                                            <button
                                                onClick={() => clearCategoryFilters(cat.id)}
                                                className={`w-full text-left px-3 py-2 text-[10px] font-bold uppercase hover:bg-neutral-800 transition-colors flex items-center justify-between group ${activeSubs.length === 0 ? 'bg-neutral-800/50 text-white' : 'text-neutral-500'}`}
                                            >
                                                <span>{lang === 'ru' ? 'Любой' : 'Any'} <span className="opacity-50 ml-1">({cat.label})</span></span>
                                                {activeSubs.length === 0 && <Check className="w-3 h-3 text-neutral-500"/>}
                                            </button>
                                            
                                            <div className="h-px bg-neutral-800 mx-2 my-1" />
                                            
                                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                {cat.subcategories?.map(sub => {
                                                    const isActive = activeSubs.includes(sub.id);
                                                    return (
                                                        <button
                                                            key={sub.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Prevent closing
                                                                toggleFilter(cat.id, sub.id);
                                                            }}
                                                            className={`w-full text-left px-3 py-2 text-[10px] font-bold uppercase hover:bg-neutral-800 transition-colors flex items-center justify-between group ${isActive ? 'text-red-400 bg-red-900/10' : 'text-neutral-400'}`}
                                                        >
                                                            {sub.label}
                                                            {isActive && <Check className="w-3 h-3 text-red-500"/>}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                   </div>
                </div>
            </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-black">
         <div className="max-w-7xl mx-auto pb-20">
             {filteredVideos.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-64 text-neutral-500">
                     <Filter className="w-12 h-12 mb-4 opacity-20" />
                     <p>Нет видео, соответствующих выбранным фильтрам.</p>
                     <button onClick={clearAllFilters} className="mt-4 text-red-500 text-sm hover:underline">Сбросить фильтры</button>
                 </div>
             ) : (
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                     {filteredVideos.map(video => (
                         <div 
                            key={video.id} 
                            onClick={() => setActiveVideo(video)}
                            className="group flex flex-col cursor-pointer transition-transform hover:-translate-y-1 duration-300"
                         >
                             {/* Video Thumbnail (Frameless) */}
                             <div className="aspect-video w-full bg-neutral-900 relative overflow-hidden rounded-lg border border-white/5 group-hover:border-red-600/50 transition-colors">
                                 {/* Use VideoPlayer strictly for thumbnail facade generation */}
                                 <div className="w-full h-full pointer-events-none group-hover:scale-105 transition-transform duration-500">
                                     <VideoPlayer url={video.video_url} /> 
                                 </div>
                                 {/* Hover Overlay */}
                                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                     <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                                         <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                                     </div>
                                 </div>
                             </div>
                             
                             {/* Content Below */}
                             <div className="pt-3">
                                 <h3 className="text-sm font-bold text-white leading-tight mb-1 group-hover:text-red-500 transition-colors line-clamp-2">
                                     {video.title}
                                 </h3>
                                 <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                                     {video.description}
                                 </p>
                             </div>
                         </div>
                     ))}
                 </div>
             )}
         </div>
      </div>

      {/* Active Video Overlay */}
      {activeVideo && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="relative w-[95%] md:w-[80%] max-w-6xl aspect-video bg-black rounded-xl shadow-2xl overflow-hidden border border-white/10 flex flex-col">
                  <button 
                      onClick={() => setActiveVideo(null)}
                      className="absolute top-4 right-4 z-20 p-2 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors backdrop-blur-md border border-white/10"
                  >
                      <X className="w-6 h-6" />
                  </button>
                  
                  <div className="flex-1 w-full h-full">
                      {/* Assuming VideoPlayer handles iframe auto-play logic inside */}
                      <VideoPlayer url={activeVideo.video_url} />
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default CatalogModal;