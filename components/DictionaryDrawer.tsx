import React, { useEffect, useState } from 'react';
import { X, BookOpen } from 'lucide-react';
import { DictionaryEntry } from '../types';

interface DictionaryDrawerProps {
  term: string | null;
  dictionary: DictionaryEntry[];
  onClose: () => void;
}

const DictionaryDrawer: React.FC<DictionaryDrawerProps> = ({ term, dictionary, onClose }) => {
  const [definition, setDefinition] = useState<string | null>(null);

  useEffect(() => {
    if (term) {
      const entry = dictionary.find(d => d.term.toLowerCase() === term.toLowerCase());
      setDefinition(entry ? entry.definition : 'Определение не найдено.');
    }
  }, [term, dictionary]);

  return (
    <div 
      className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-neutral-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-neutral-800 ${
        term ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Decorative header */}
      <div className="bg-red-800 h-24 p-6 flex flex-col justify-end relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors bg-black/20 p-2 rounded-full backdrop-blur-sm">
                <X className="w-6 h-6" />
            </button>
        </div>
        <BookOpen className="text-white/10 w-32 h-32 absolute -top-8 -left-8 transform rotate-12" />
        <h3 className="text-white font-bold text-xl relative z-10 flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> Глоссарий
        </h3>
      </div>

      {/* Content */}
      <div className="p-6 sm:p-8 overflow-y-auto h-[calc(100%-6rem)]">
        {term ? (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <span className="inline-block px-3 py-1 bg-red-900/30 text-red-400 text-xs font-bold tracking-wide uppercase rounded-full mb-3">
              Термин
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-6 break-words">{term}</h2>
            
            <span className="inline-block px-3 py-1 bg-neutral-800 text-neutral-400 text-xs font-bold tracking-wide uppercase rounded-full mb-3">
              Определение
            </span>
            <p className="text-lg text-gray-300 leading-relaxed font-serif italic border-l-4 border-red-900 pl-4 py-1">
              {definition}
            </p>
          </div>
        ) : (
            <div className="text-center mt-20 text-neutral-500">
                <p>Выберите выделенное слово, чтобы увидеть его пояснение.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default DictionaryDrawer;