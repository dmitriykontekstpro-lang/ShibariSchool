import React from 'react';
import { X, FileText, ExternalLink, ArrowRight } from 'lucide-react';
import { Article, Lesson } from '../types';

interface ArticlesModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  lessons: Lesson[];
  onSelectArticle?: (article: Article) => void;
}

const ArticlesModal: React.FC<ArticlesModalProps> = ({ isOpen, onClose, articles, lessons, onSelectArticle }) => {
  if (!isOpen) return null;

  // Если уроков нет или они не загрузились, показываем плоский список (fallback)
  const showGrouped = lessons && lessons.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden">
      {/* Header with Close Button */}
      <div className="flex justify-between items-center p-4 md:p-8 shrink-0 border-b border-neutral-900">
        <div className="flex items-center gap-3">
             <div className="p-2 bg-red-900/20 rounded-lg">
                <FileText className="w-6 h-6 text-red-600" />
             </div>
             <h2 className="text-xl md:text-3xl font-bold text-white tracking-tight">
                Рубрикатор статей
             </h2>
        </div>
        <button 
          onClick={onClose}
          className="group flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-red-600 hover:bg-red-900/20 transition-all duration-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content Container */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 scroll-smooth">
        <div className="max-w-6xl mx-auto">
          {articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-neutral-500">
                <FileText className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-lg">Список статей пока пуст.</p>
            </div>
          ) : (
            <div className="space-y-12 pb-20">
                {showGrouped ? (
                    lessons.map((lesson, index) => {
                        // Рассчитываем диапазон ID статей для этого модуля.
                        // Предполагаем, что структура 8 статей на модуль жестко задана в CSV/Constants.
                        const startId = (index * 8) + 1;
                        const endId = startId + 7;
                        
                        // Фильтруем статьи, которые попадают в этот диапазон
                        const lessonArticles = articles.filter(a => a.id >= startId && a.id <= endId);

                        if (lessonArticles.length === 0) return null;

                        return (
                            <div key={lesson.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex items-center justify-center w-8 h-8 rounded bg-red-900/20 text-red-500 font-bold text-sm border border-red-900/30">
                                        {index + 1}
                                    </div>
                                    <h3 className="text-2xl font-bold text-white tracking-tight">{lesson.title}</h3>
                                    <div className="h-px flex-1 bg-gradient-to-r from-neutral-800 to-transparent"></div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {lessonArticles.map(article => (
                                        <ArticleCard key={article.id} article={article} onClick={onSelectArticle} />
                                    ))}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    // Fallback Grid if no lessons provided
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {articles.map((article) => (
                             <ArticleCard key={article.id} article={article} onClick={onSelectArticle} />
                        ))}
                    </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ArticleCard: React.FC<{ article: Article, onClick?: (a: Article) => void }> = ({ article, onClick }) => (
    <button 
        onClick={() => onClick && onClick(article)}
        className="group relative flex flex-col p-5 bg-neutral-900/50 rounded-xl border border-neutral-800 hover:border-red-600/50 hover:bg-neutral-900 transition-all duration-300 shadow-sm hover:shadow-red-900/10 text-left w-full h-full"
    >
        <div className="flex justify-between items-start mb-3 w-full">
            <span className="text-[10px] font-bold text-neutral-600 group-hover:text-red-500 uppercase tracking-widest bg-black/30 px-2 py-1 rounded transition-colors">
                Статья #{article.id}
            </span>
            <ExternalLink className="w-3 h-3 text-neutral-700 group-hover:text-neutral-400 transition-colors" />
        </div>
        
        <h4 className="text-base font-bold text-neutral-300 group-hover:text-white mb-2 leading-snug line-clamp-2">
            {article.title}
        </h4>
        
        <p className="text-neutral-500 text-xs leading-relaxed mb-4 flex-1 line-clamp-3">
            {article.description || 'Описание отсутствует.'}
        </p>
        
        <div className="flex items-center text-xs font-medium text-neutral-600 group-hover:text-red-500 transition-colors mt-auto pt-3 border-t border-neutral-800/50 group-hover:border-neutral-800 w-full">
            Читать <ArrowRight className="w-3 h-3 ml-2 transform group-hover:translate-x-1 transition-transform" />
        </div>
    </button>
);

export default ArticlesModal;