
import React, { useState, useEffect, useMemo } from 'react';
import { Play, Loader2 } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  showPlayButton?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, showPlayButton = true }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Сбрасываем состояние проигрывания при смене URL (переключении урока)
  useEffect(() => {
    setIsPlaying(false);
  }, [url]);

  const videoId = useMemo(() => {
    if (!url) return null;
    try {
      if (url.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
      const urlObj = new URL(url);
      if (urlObj.pathname.startsWith('/embed/')) return urlObj.pathname.split('/')[2];
      if (urlObj.pathname === '/watch') return urlObj.searchParams.get('v');
      if (urlObj.hostname.includes('youtu.be')) return urlObj.pathname.slice(1);
      return null;
    } catch (e) {
      return null;
    }
  }, [url]);

  const cleanId = videoId ? videoId.split('&')[0].split('?')[0] : null;

  // Формируем ссылку на превью высокого качества
  const thumbnailUrl = cleanId 
    ? `https://img.youtube.com/vi/${cleanId}/maxresdefault.jpg` 
    : null;

  // Формируем ссылку для iframe
  // ВАЖНО: origin должен совпадать с текущим доменом.
  // autoplay=1 нужен, чтобы видео пошло сразу после клика по обложке
  const getIframeUrl = () => {
    if (!cleanId) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `https://www.youtube.com/embed/${cleanId}?autoplay=1&rel=0&showinfo=0&origin=${origin}`;
  };

  if (!cleanId) {
    return (
      <div className="w-full aspect-video bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-center flex-col gap-2 text-neutral-500 shadow-2xl">
        <div className="w-12 h-12 rounded-full border-2 border-neutral-700 flex items-center justify-center">!</div>
        <p className="text-sm">Видео не доступно</p>
      </div>
    );
  }

  return (
    <div 
      className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl shadow-red-900/10 border border-neutral-800 relative z-0 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isPlaying ? (
        // РЕЖИМ ОБЛОЖКИ (FACADE)
        <button 
          onClick={() => setIsPlaying(true)}
          className="relative w-full h-full cursor-pointer flex items-center justify-center bg-black"
          aria-label="Запустить видео"
        >
          {/* Фоновая картинка */}
          <img 
            src={thumbnailUrl || ''} 
            alt="Video Thumbnail" 
            className={`w-full h-full object-cover transition-opacity duration-700 ${isHovered ? 'opacity-80' : 'opacity-100'}`}
          />
          
          {/* Темный градиент поверх картинки */}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />

          {/* Кнопка Play */}
          {showPlayButton && (
            <div className="absolute z-10 w-16 h-16 sm:w-20 sm:h-20 bg-red-600/90 rounded-full flex items-center justify-center backdrop-blur-sm shadow-[0_0_30px_rgba(220,38,38,0.5)] group-hover:scale-110 group-hover:bg-red-600 transition-all duration-300">
               <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white ml-1" />
            </div>
          )}
          
          {showPlayButton && (
            <div className="absolute bottom-6 text-white font-medium text-sm tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
               Нажмите для просмотра
            </div>
          )}
        </button>
      ) : (
        // РЕЖИМ IFRAME (Загружается только после клика)
        <div className="w-full h-full relative bg-black">
             {/* Лоадер пока грузится iframe */}
            <div className="absolute inset-0 flex items-center justify-center z-0">
                <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
            </div>
            
            <iframe
                key={getIframeUrl()}
                className="w-full h-full relative z-10"
                src={getIframeUrl()}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            ></iframe>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
