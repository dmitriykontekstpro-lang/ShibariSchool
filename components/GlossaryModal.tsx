
import React, { useMemo } from 'react';
import { X } from 'lucide-react';
import { DictionaryEntry } from '../types';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  dictionary: DictionaryEntry[];
  lang?: 'ru' | 'en';
  t?: any;
}

const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose, dictionary, lang = 'ru', t }) => {
  if (!isOpen) return null;

  // Группируем слова по первой букве
  const groupedDictionary = useMemo(() => {
    const groups: { [key: string]: DictionaryEntry[] } = {};
    
    // Sort based on current language
    const sortedDict = [...dictionary].sort((a, b) => {
        const termA = (lang === 'en' ? (a.term_en || a.term) : a.term);
        const termB = (lang === 'en' ? (b.term_en || b.term) : b.term);
        return termA.localeCompare(termB);
    });

    sortedDict.forEach(entry => {
      const term = (lang === 'en' ? (entry.term_en || entry.term) : entry.term);
      const firstLetter = term.charAt(0).toUpperCase();
      
      // Check if letter
      const key = firstLetter.match(/[a-zа-яё]/i) ? firstLetter : '#';
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(entry);
    });

    return groups;
  }, [dictionary, lang]);

  const sortedKeys = Object.keys(groupedDictionary).sort();

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden">
      {/* Header with Close Button */}
      <div className="flex justify-end p-4 md:p-8 shrink-0">
        <button 
          onClick={onClose}
          className="group flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-red-600 hover:bg-red-900/20 transition-all duration-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content Container */}
      <div className="flex-1 overflow-y-auto px-4 md:px-20 pb-20 scroll-smooth">
        <div className="max-w-5xl mx-auto">
          
          <h2 className="text-3xl md:text-5xl font-bold text-center text-white mb-10 md:mb-16 tracking-tight">
            {t ? t.dictionary : 'Словарь'}
          </h2>

          {dictionary.length === 0 ? (
            <p className="text-center text-neutral-500 text-lg">Empty.</p>
          ) : (
            sortedKeys.map((letter) => (
              <div key={letter} className="mb-12 md:mb-16">
                {/* Letter Header */}
                <div className="flex items-center justify-center mb-8 md:mb-10 relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-neutral-800"></div>
                    </div>
                    <div className="relative bg-black px-6 md:px-8">
                        <span className="text-3xl md:text-5xl font-light text-white">{letter}</span>
                    </div>
                </div>

                {/* Terms List */}
                <div className="space-y-8">
                  {groupedDictionary[letter].map((entry, index) => {
                      const displayTerm = lang === 'en' ? (entry.term_en || entry.term) : entry.term;
                      const displayDef = lang === 'en' ? (entry.definition_en || entry.definition) : entry.definition;
                      return (
                        <div key={index} className="flex flex-col md:flex-row md:gap-12 gap-2 group">
                        {/* Term Column */}
                        <div className="md:w-1/3 md:text-right shrink-0">
                            <h3 className="text-xl md:text-2xl font-medium text-red-600 transition-colors">
                            {displayTerm}
                            </h3>
                        </div>
                        
                        {/* Definition Column */}
                        <div className="md:w-2/3">
                            <p className="text-neutral-300 text-base md:text-lg leading-relaxed font-light">
                            {displayDef}
                            </p>
                        </div>
                        </div>
                      );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GlossaryModal;
