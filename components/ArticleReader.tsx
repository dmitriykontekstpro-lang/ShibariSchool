import React from 'react';
import { X, ArrowRight, ExternalLink } from 'lucide-react';
import { Article, ArticleBlock } from '../types';

interface ArticleReaderProps {
  article: Article | null;
  onClose: () => void;
}

const ArticleReader: React.FC<ArticleReaderProps> = ({ article, onClose }) => {
  if (!article) return null;

  const hasContent = article.content && article.content.length > 0;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-neutral-950 animate-in slide-in-from-bottom-10 duration-300">
      {/* ProgressBar (optional visual flair) */}
      <div className="h-1 w-full bg-neutral-900">
        <div className="h-full bg-red-600 w-full animate-pulse" />
      </div>

      {/* Header */}
      <div className="flex justify-between items-start p-4 md:p-6 border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl">
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-950/30 px-2 py-1 rounded border border-red-900/20 mb-2 inline-block">
                Статья
            </span>
            <h1 className="text-xl md:text-3xl font-bold text-white leading-tight">
                {article.title}
            </h1>
        </div>
        <button 
          onClick={onClose}
          className="group flex items-center justify-center w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white hover:border-red-600 hover:bg-red-900/20 transition-all ml-4 shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content Scroll Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-0 scroll-smooth">
        <div className="max-w-3xl mx-auto py-8 md:py-12 space-y-8 md:space-y-10">
            
            {/* Lead / Description */}
            {article.description && (
                <p className="text-xl md:text-2xl text-neutral-300 font-light leading-relaxed border-l-4 border-red-800 pl-6 italic">
                    {article.description}
                </p>
            )}

            {/* Blocks Rendering */}
            {hasContent ? (
                article.content!.map((block) => (
                    <BlockRenderer key={block.id} block={block} />
                ))
            ) : (
                <div className="text-center py-12 text-neutral-500 bg-neutral-900/30 rounded-xl border border-dashed border-neutral-800">
                    <p className="mb-4">Для этой статьи пока нет внутреннего контента.</p>
                    {article.url && article.url !== '#' && (
                        <a 
                            href={article.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 font-medium transition-colors"
                        >
                            Читать во внешнем источнике <ExternalLink className="w-4 h-4" />
                        </a>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="pt-12 mt-12 border-t border-neutral-800 text-center">
                <button 
                    onClick={onClose}
                    className="text-neutral-500 hover:text-white transition-colors text-sm flex items-center justify-center gap-2 mx-auto"
                >
                    Закрыть статью
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

const BlockRenderer: React.FC<{ block: ArticleBlock }> = ({ block }) => {
    switch (block.type) {
        case 'header':
            return (
                <h2 className="text-2xl md:text-3xl font-bold text-red-600 mt-8 mb-4">
                    {block.content}
                </h2>
            );
        
        case 'text_long':
        case 'text_short':
            return (
                <div className="space-y-2">
                    {block.title && (
                        <h3 className="text-lg md:text-xl font-bold text-neutral-200">
                            {block.title}
                        </h3>
                    )}
                    <p className="text-neutral-300 text-base md:text-lg leading-relaxed whitespace-pre-line">
                        {block.content}
                    </p>
                </div>
            );

        case 'image_1':
        case 'image_2':
        case 'image_3':
        case 'image_4':
            if (!block.images || block.images.length === 0) return null;
            
            // Grid configuration based on type
            let gridClass = 'grid-cols-1';
            if (block.type === 'image_2') gridClass = 'grid-cols-1 md:grid-cols-2';
            if (block.type === 'image_3') gridClass = 'grid-cols-1 md:grid-cols-3'; // 3 in a row
            if (block.type === 'image_4') gridClass = 'grid-cols-2 md:grid-cols-2'; // 2x2 grid

            // Container width configuration
            let containerClass = 'grid gap-4 w-full';
            if (block.type === 'image_1') containerClass += ' md:w-3/4 mx-auto';
            // image_2, image_3, image_4 usually look best full width (or matching text width) to accommodate multiple columns
            
            return (
                <div className={containerClass + ' ' + gridClass}>
                    {block.images.map((img, idx) => (
                        <div key={idx} className="space-y-2 group">
                            <div className="rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900">
                                {img.url ? (
                                    <img 
                                        src={img.url} 
                                        alt={img.caption || 'Article image'} 
                                        className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="aspect-video flex items-center justify-center text-neutral-700 bg-neutral-950">
                                        Нет изображения
                                    </div>
                                )}
                            </div>
                            {img.caption && (
                                <p className="text-center text-sm text-neutral-500 italic">
                                    {img.caption}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            );
            
        default:
            return null;
    }
};

export default ArticleReader;