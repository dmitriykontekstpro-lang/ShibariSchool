import React, { useMemo } from 'react';
import { X } from 'lucide-react';
import { DictionaryEntry } from '../types';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  dictionary: DictionaryEntry[];
}

const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose, dictionary }) => {
  if (!isOpen) return null;

  // Группируем слова по первой букве
  const groupedDictionary = useMemo(() => {
    const groups: { [key: string]: DictionaryEntry[] } = {};
    
    // Сортируем словарь по алфавиту
    const sortedDict = [...dictionary].sort((a, b) => a.term.localeCompare(b.term));

    sortedDict.forEach(entry => {
      const firstLetter = entry.term.charAt(0).toUpperCase();
      // Проверка: если символ не буква (например, цифра), можно сгруппировать в '#' или отдельную категорию
      const key = firstLetter.match(/[a-zа-яё]/i) ? firstLetter : '#';
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(entry);
    });

    return groups;
  }, [dictionary]);

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
            Словарь терминов
          </h2>

          {dictionary.length === 0 ? (
            <p className="text-center text-neutral-500 text-lg">Словарь пуст.</p>
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
                  {groupedDictionary[letter].map((entry, index) => (
                    <div key={index} className="flex flex-col md:flex-row md:gap-12 gap-2 group">
                      {/* Term Column */}
                      <div className="md:w-1/3 md:text-right shrink-0">
                        <h3 className="text-xl md:text-2xl font-medium text-red-600 transition-colors">
                          {entry.term}
                        </h3>
                      </div>
                      
                      {/* Definition Column */}
                      <div className="md:w-2/3">
                        <p className="text-neutral-300 text-base md:text-lg leading-relaxed font-light">
                          {entry.definition}
                        </p>
                      </div>
                    </div>
                  ))}
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