import React, { useMemo } from 'react';
import { DictionaryEntry } from '../types';

interface TextContentProps {
  paragraphs: string[];
  dictionary: DictionaryEntry[];
  onWordClick: (term: string) => void;
}

const TextContent: React.FC<TextContentProps> = ({ paragraphs, dictionary, onWordClick }) => {
  
  // Create a regex to find dictionary terms (case insensitive)
  const regex = useMemo(() => {
    if (dictionary.length === 0) return null;
    // Sort by length descending to match longest phrases first (e.g. "Machine Learning" before "Machine")
    const terms = dictionary.map(d => d.term).sort((a, b) => b.length - a.length);
    // Escape special regex characters in terms
    const escapedTerms = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    
    // Используем Unicode property escapes (\p{L}) для корректной работы с кириллицей.
    // Стандартная граница слова \b не работает для русских букв в JS RegExp по умолчанию.
    // Паттерн: 
    // 1. (^|[^...]) - захватываем начало строки или не-буквенный символ перед словом (разделитель)
    // 2. (term) - само слово
    // 3. (?=...) - lookahead (проверка без захвата) на конец строки или не-буквенный символ после
    return new RegExp(`(^|[^\\p{L}\\p{N}_])(${escapedTerms.join('|')})(?=[^\\p{L}\\p{N}_]|$)`, 'gui');
  }, [dictionary]);

  const renderParagraph = (text: string, index: number) => {
    if (!regex) return <p key={index} className="mb-4 text-lg leading-relaxed text-gray-300">{text}</p>;

    // Split text using the regex. 
    // Поскольку мы используем захватывающие группы в RegExp (prefix и term), split вернет их в массиве.
    const parts = text.split(regex);
    
    return (
      <p key={index} className="mb-4 text-lg leading-relaxed text-gray-300">
        {parts.map((part, i) => {
            // Защита от undefined, которые могут возникать при split с группами
            if (part === undefined) return null;

            // Check if this part is a dictionary term (case insensitive check)
            const match = dictionary.find(d => d.term.toLowerCase() === part.toLowerCase());
            
            if (match) {
                return (
                    <span
                        key={i}
                        onClick={() => onWordClick(match.term)}
                        className="text-red-500 cursor-pointer font-bold hover:text-red-400 transition-colors border-b border-red-500/30 hover:border-red-500"
                        title="Нажмите для пояснения"
                    >
                        {part}
                    </span>
                );
            }
            // Рендер обычного текста (включая разделители, попавшие в split)
            return <span key={i}>{part}</span>;
        })}
      </p>
    );
  };

  return (
    <div className="prose max-w-none p-6 bg-neutral-900 rounded-xl shadow-sm border border-neutral-800 mt-6">
      {paragraphs.map((p, i) => renderParagraph(p, i))}
    </div>
  );
};

export default TextContent;