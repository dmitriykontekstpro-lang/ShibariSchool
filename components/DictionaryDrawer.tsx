
import React, { useEffect, useState } from 'react';
import { X, BookOpen } from 'lucide-react';
import { DictionaryEntry } from '../types';

interface DictionaryDrawerProps {
  term: string | null;
  dictionary: DictionaryEntry[];
  onClose: () => void;
  lang?: 'ru' | 'en';
  t?: any;
}

const DictionaryDrawer: React.FC<DictionaryDrawerProps> = ({ term, dictionary, onClose, lang = 'ru', t }) => {
  const [definition, setDefinition] = useState<string | null>(null);
  const [displayTerm, setDisplayTerm] = useState<string | null>(null);

  useEffect(() => {
    if (term) {
      // Try to find by english term OR russian term
      const entry = dictionary.find(d => 
        (d.term && d.term.toLowerCase() === term.toLowerCase()) || 
        (d.term_en && d.term_en.toLowerCase() === term.toLowerCase())
      );

      if (entry) {
          if (lang === 'en') {
              setDefinition(entry.definition_en || entry.definition);
              setDisplayTerm(entry.term_en || entry.term);
          } else {
              setDefinition(entry.definition);
              setDisplayTerm(entry.term);
          }
      } else {
          setDefinition(lang === 'en' ? 'Definition not found.' : 'Определение не найдено.');
          setDisplayTerm(term);
      }
    }
  }, [term, dictionary, lang]);

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
            <BookOpen className="w-5 h-5" /> {t ? t.dictionary : 'Глоссарий'}
        </h3>
      </div>

      {/* Content */}
      <div className="p-6 sm:p-8 overflow-y-auto h-[calc(100%-6rem)]">
        {term ? (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <span className="inline-block px-3 py-1 bg-red-900/30 text-red-400 text-xs font-bold tracking-wide uppercase rounded-full mb-3">
              Term
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-6 break-words">{displayTerm || term}</h2>
            
            <span className="inline-block px-3 py-1 bg-neutral-800 text-neutral-400 text-xs font-bold tracking-wide uppercase rounded-full mb-3">
              Definition
            </span>
            <p className="text-lg text-gray-300 leading-relaxed font-serif italic border-l-4 border-red-900 pl-4 py-1">
              {definition}
            </p>
          </div>
        ) : (
            <div className="text-center mt-20 text-neutral-500">
                <p>Select a highlighted word to see its definition.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default DictionaryDrawer;
