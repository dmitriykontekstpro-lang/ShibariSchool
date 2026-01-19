import React, { useState } from 'react';
import { X, Video, ChevronDown, ChevronUp, ShoppingCart, User, CheckCircle, Play, Image as ImageIcon } from 'lucide-react';
import { Course, CartItem, Product } from '../types';
import VideoPlayer from './VideoPlayer';

interface CoursesModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  addToCart: (product: Product) => void;
  openCart: () => void;
  cart: CartItem[];
  lang: 'ru' | 'en';
  t: any;
  getData: (item: any, field: string) => string;
}

const CoursesModal: React.FC<CoursesModalProps> = ({ 
    isOpen, onClose, courses, addToCart, openCart, cart, lang, t, getData
}) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  if (!isOpen) return null;

  const handleBuy = (course: Course) => {
      // Map Course to Product to fit into existing Cart Logic
      let thumb = course.image_url;
      
      // Fallback to youtube thumbnail if no image uploaded
      if (!thumb && course.video_url) {
        try {
            const videoId = course.video_url.split('v=')[1]?.split('&')[0];
            if (videoId) thumb = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        } catch (e) {}
      }

      const productFromCourse: Product = {
          id: 90000 + course.id, // Ensure unique ID range
          title: course.title,
          title_en: course.title_en,
          price: course.price,
          description_short: "Online Video Course",
          description_long: course.description_long,
          color: "Video Course", // Specific identifier for Cart Logic
          images: [thumb || "https://images.unsplash.com/photo-1533561052600-4b68e9255416?auto=format&fit=crop&q=80&w=800"], 
          video_url: course.video_url,
          is_course: true // Helper flag
      };
      
      addToCart(productFromCourse);
      openCart();
      setSelectedCourse(null);
      onClose();
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black animate-in fade-in duration-200 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 md:p-6 border-b border-white/10 bg-black shrink-0">
         <div className="flex items-center gap-3">
             <button 
                onClick={openCart}
                className="p-2 bg-black rounded-lg border border-red-600 relative hover:bg-red-900/40 transition-colors group"
             >
                <ShoppingCart className="w-6 h-6 text-red-600 group-hover:text-white transition-colors" />
                {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-black">
                        {cartCount}
                    </span>
                )}
             </button>
             <div>
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight uppercase">{t.courses}</h2>
                <p className="text-[10px] md:text-xs text-neutral-400">{t.courses_subtitle}</p>
             </div>
        </div>
        <button 
          onClick={onClose}
          className="group flex items-center justify-center w-10 h-10 rounded-full bg-black border border-white/20 text-white hover:border-red-600 hover:bg-red-600 transition-all duration-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content Grid */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-black">
         <div className="max-w-7xl mx-auto pb-20">
             {courses.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-64 text-neutral-500">
                     <Video className="w-12 h-12 mb-4 opacity-20" />
                     <p>No courses available.</p>
                 </div>
             ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {courses.map(course => (
                         <div 
                            key={course.id} 
                            onClick={() => setSelectedCourse(course)}
                            className="group flex flex-col bg-neutral-900/50 border border-white/10 rounded-2xl overflow-hidden hover:border-red-600 transition-all duration-300 cursor-pointer hover:shadow-[0_0_20px_rgba(220,38,38,0.1)]"
                         >
                             {/* Preview: Show Image if available, else Video Thumbnail */}
                             <div className="aspect-video w-full bg-black relative">
                                {course.image_url ? (
                                    <img 
                                        src={course.image_url} 
                                        alt={course.title} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full pointer-events-none">
                                        <VideoPlayer url={course.video_url} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                             </div>
                             
                             <div className="p-6 flex flex-col flex-1">
                                 <div className="flex justify-between items-start mb-2">
                                     <h3 className="text-xl font-bold text-white group-hover:text-red-500 transition-colors leading-tight">
                                        {getData(course, 'title')}
                                     </h3>
                                     <span className="bg-white/10 text-white text-xs font-bold px-2 py-1 rounded">
                                        ${course.price}
                                     </span>
                                 </div>
                                 
                                 <div className="flex items-center gap-2 text-xs text-neutral-500 mb-4 font-bold uppercase tracking-wider">
                                     <User className="w-3 h-3" /> {course.author}
                                 </div>

                                 <p className="text-neutral-400 text-sm leading-relaxed mb-6 line-clamp-3">
                                     {getData(course, 'description_short')}
                                 </p>

                                 <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-xs text-neutral-500">
                                     <span>{(course.modules || []).length} modules</span>
                                     <span className="group-hover:translate-x-1 transition-transform text-white font-bold flex items-center gap-1">
                                         {t.details} <Play className="w-3 h-3 fill-white" />
                                     </span>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
             )}
         </div>
      </div>

      {/* Landing Page Modal */}
      {selectedCourse && (
          <CourseLandingOverlay 
            course={selectedCourse} 
            onClose={() => setSelectedCourse(null)} 
            onBuy={() => handleBuy(selectedCourse)} 
            t={t} 
            getData={getData} 
          />
      )}
    </div>
  );
};

const CourseLandingOverlay: React.FC<{ course: Course, onClose: () => void, onBuy: () => void, t: any, getData: any }> = ({ course, onClose, onBuy, t, getData }) => {
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-0 md:p-8 animate-in slide-in-from-bottom-10 duration-300">
            <div className="bg-black w-full h-full md:h-auto md:max-h-[95vh] md:max-w-5xl md:rounded-2xl shadow-2xl overflow-y-auto border border-white/10 relative">
                
                <button onClick={onClose} className="fixed md:absolute top-4 right-4 z-20 p-2 bg-black/50 text-white rounded-full hover:bg-red-600 border border-white/20 transition-colors backdrop-blur">
                    <X className="w-5 h-5" />
                </button>

                {/* Hero Section */}
                <div className="relative">
                    <div className="aspect-video w-full bg-neutral-900 border-b border-white/10">
                         <VideoPlayer url={course.video_url} />
                    </div>
                </div>

                <div className="p-6 md:p-10 space-y-10">
                    {/* Header Info */}
                    <div className="flex flex-col md:flex-row gap-8 justify-between items-start border-b border-white/10 pb-8">
                        <div className="space-y-4 max-w-2xl">
                             <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">{getData(course, 'title')}</h1>
                             <div className="flex items-center gap-4">
                                <span className="flex items-center gap-2 text-sm text-neutral-400 font-bold uppercase tracking-wider bg-neutral-900 px-3 py-1 rounded-full">
                                    <User className="w-4 h-4" /> {course.author}
                                </span>
                             </div>
                             <p className="text-lg text-neutral-300 leading-relaxed font-light">
                                {getData(course, 'description_short')}
                             </p>
                        </div>
                        <div className="w-full md:w-auto shrink-0 flex flex-col gap-4 bg-neutral-900/30 p-6 rounded-xl border border-white/10">
                             <div className="text-4xl font-mono font-bold text-red-600">${course.price}</div>
                             <button 
                                onClick={onBuy}
                                className="w-full bg-white hover:bg-neutral-200 text-black px-8 py-4 rounded-xl font-bold text-sm tracking-widest uppercase shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                             >
                                <ShoppingCart className="w-4 h-4" /> {t.buy_course}
                             </button>
                        </div>
                    </div>

                    {/* Long Description */}
                    <div className="prose prose-invert max-w-none">
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-[0.2em] mb-4">{t.description}</h3>
                        <p className="text-neutral-300 leading-8 whitespace-pre-line text-lg">
                            {getData(course, 'description_long')}
                        </p>
                    </div>

                    {/* Modules */}
                    <div className="bg-neutral-900/30 rounded-2xl p-6 md:p-8 border border-white/5">
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-[0.2em] mb-8">{t.modules} ({course.modules.length})</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(course.modules || []).map((mod, idx) => (
                                <div key={idx} className="flex items-start gap-4 p-4 bg-black/40 rounded-xl border border-white/5">
                                    <div className="w-8 h-8 rounded-full bg-red-900/20 text-red-500 flex items-center justify-center text-sm font-bold border border-red-900/30 shrink-0">
                                        {idx + 1}
                                    </div>
                                    <span className="text-neutral-300 font-medium pt-1">{mod}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FAQ */}
                    {course.faq && course.faq.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-[0.2em] mb-6">{t.faq}</h3>
                            <div className="space-y-3">
                                {course.faq.map((item, idx) => (
                                    <div key={idx} className="bg-neutral-900/50 rounded-lg border border-white/10 overflow-hidden">
                                        <button 
                                            onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                                            className="w-full flex items-center justify-between p-5 text-left group"
                                        >
                                            <span className="font-bold text-white group-hover:text-red-500 transition-colors">{item.question}</span>
                                            {openFaqIndex === idx ? <ChevronUp className="w-4 h-4 text-red-600"/> : <ChevronDown className="w-4 h-4 text-neutral-500"/>}
                                        </button>
                                        {openFaqIndex === idx && (
                                            <div className="p-5 pt-0 text-neutral-400 leading-relaxed border-t border-white/5">
                                                {item.answer}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CoursesModal;