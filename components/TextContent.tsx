
import React, { useMemo } from 'react';
import { DictionaryEntry } from '../types';

interface TextContentProps {
  paragraphs: string[];
  dictionary: DictionaryEntry[];
  onWordClick: (term: string) => void;
  lang?: 'ru' | 'en';
}

const TextContent: React.FC<TextContentProps> = ({ paragraphs, dictionary, onWordClick, lang='ru' }) => {
  
  // Create a regex to find dictionary terms (case insensitive)
  const regex = useMemo(() => {
    if (dictionary.length === 0) return null;
    
    // Collect all terms (main and english)
    let terms: string[] = [];
    dictionary.forEach(d => {
        if (d.term) terms.push(d.term);
        if (d.term_en) terms.push(d.term_en);
    });

    // Sort by length descending to match longest phrases first
    terms = terms.sort((a, b) => b.length - a.length);
    
    if (terms.length === 0) return null;

    // Escape special regex characters in terms
    const escapedTerms = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    
    return new RegExp(`(^|[^\\p{L}\\p{N}_])(${escapedTerms.join('|')})(?=[^\\p{L}\\p{N}_]|$)`, 'gui');
  }, [dictionary]);

  const renderParagraph = (text: string, index: number) => {
    if (!regex) return <p key={index} className="mb-4 text-base md:text-lg leading-relaxed text-gray-300">{text}</p>;

    const parts = text.split(regex);
    
    return (
      <p key={index} className="mb-4 text-base md:text-lg leading-relaxed text-gray-300">
        {parts.map((part, i) => {
            if (part === undefined) return null;

            // Check if this part is a dictionary term (case insensitive check against any version)
            const match = dictionary.find(d => 
                (d.term && d.term.toLowerCase() === part.toLowerCase()) || 
                (d.term_en && d.term_en.toLowerCase() === part.toLowerCase())
            );
            
            if (match) {
                // Pass the term that was actually matched (or just the main term, 
                // but passing match.term ensures the drawer opens the correct entry)
                return (
                    <span
                        key={i}
                        onClick={() => onWordClick(part)} // Pass the clicked word to find it in drawer
                        className="text-red-500 cursor-pointer font-bold hover:text-red-400 transition-colors"
                        title="Info"
                    >
                        {part}
                    </span>
                );
            }
            return <span key={i}>{part}</span>;
        })}
      </p>
    );
  };

  return (
    <div className="prose max-w-none p-4 md:p-6 bg-neutral-900 rounded-xl shadow-sm border border-neutral-800 mt-6 md:mt-8">
      {paragraphs.map((p, i) => renderParagraph(p, i))}
    </div>
  );
};

export default TextContent;
