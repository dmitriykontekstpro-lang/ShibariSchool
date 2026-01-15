import React, { useState } from 'react';
import { X, Plus, Trash2, Save, FileText, Video, Type, RefreshCw } from 'lucide-react';
import { DictionaryEntry, Lesson } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessons: Lesson[];
  dictionary: DictionaryEntry[];
  onUpdateLesson: (id: number, data: { title: string; videoUrl: string; content: string[] }) => void;
  onAddLesson: () => void;
  onRemoveLesson: (id: number) => void;
  onAddWord: (entry: DictionaryEntry) => void;
  onRemoveWord: (term: string) => void;
  onResetToDefaults: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, lessons, dictionary, onUpdateLesson, onAddLesson, onRemoveLesson, onAddWord, onRemoveWord, onResetToDefaults
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'dict'>('video');
  const [newTerm, setNewTerm] = useState('');
  const [newDef, setNewDef] = useState('');

  if (!isOpen) return null;

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTerm && newDef) {
      onAddWord({ term: newTerm.trim(), definition: newDef.trim() });
      setNewTerm('');
      setNewDef('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-neutral-900 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-neutral-800">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-neutral-800 shrink-0">
          <h2 className="text-2xl font-bold text-white">Настройки приложения</h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-full transition-colors">
            <X className="w-6 h-6 text-neutral-400 hover:text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-800 px-6 shrink-0">
            <button 
                onClick={() => setActiveTab('video')}
                className={`py-4 px-6 font-medium text-sm transition-colors border-b-2 ${activeTab === 'video' ? 'border-red-600 text-red-500' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
            >
                Настройка уроков
            </button>
            <button 
                onClick={() => setActiveTab('dict')}
                className={`py-4 px-6 font-medium text-sm transition-colors border-b-2 ${activeTab === 'dict' ? 'border-red-600 text-red-500' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
            >
                Общий словарь
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8 bg-black/20">
            {activeTab === 'video' ? (
                <div className="space-y-8">
                    <div className="flex justify-between items-center">
                        <p className="text-neutral-400">Управляйте списком модулей и их содержанием.</p>
                        <div className="flex gap-2">
                            <button 
                                onClick={onResetToDefaults}
                                className="bg-neutral-900 hover:bg-red-950 text-neutral-400 hover:text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-neutral-800"
                                title="Сбросить список уроков к значениям из кода"
                            >
                                <RefreshCw className="w-4 h-4" /> Сбросить к стандартным
                            </button>
                            <button 
                                onClick={onAddLesson}
                                className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-neutral-700"
                            >
                                <Plus className="w-4 h-4" /> Добавить модуль
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {lessons.map(lesson => (
                            <div key={lesson.id} className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 shadow-sm flex flex-col gap-5 hover:border-neutral-700 transition-colors group">
                                <div className="flex items-center justify-between pb-3 border-b border-neutral-800/50">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-6 h-6 rounded bg-red-900/30 text-red-500 text-xs font-bold">
                                            {lesson.id}
                                        </div>
                                        <span className="font-bold text-neutral-300 text-sm uppercase tracking-wide">Редактирование модуля</span>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if(window.confirm('Вы уверены, что хотите удалить этот модуль?')) {
                                                onRemoveLesson(lesson.id);
                                            }
                                        }}
                                        className="p-2 text-neutral-600 hover:text-red-500 hover:bg-red-950/30 rounded transition-colors"
                                        title="Удалить модуль"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                <div className="grid lg:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-neutral-500 uppercase flex items-center gap-2">
                                            <Type className="w-3 h-3" /> Название модуля
                                        </label>
                                        <input 
                                            type="text" 
                                            value={lesson.title}
                                            onChange={(e) => onUpdateLesson(lesson.id, { ...lesson, title: e.target.value })}
                                            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none text-white placeholder-neutral-500 transition-all"
                                            placeholder="Введите название..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-neutral-500 uppercase flex items-center gap-2">
                                            <Video className="w-3 h-3" /> Ссылка на YouTube
                                        </label>
                                        <input 
                                            type="text" 
                                            value={lesson.videoUrl}
                                            onChange={(e) => onUpdateLesson(lesson.id, { ...lesson, videoUrl: e.target.value })}
                                            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none text-white font-mono text-sm placeholder-neutral-500 transition-all"
                                            placeholder="https://www.youtube.com/..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-neutral-500 uppercase flex items-center gap-2">
                                        <FileText className="w-3 h-3" /> Текстовое описание
                                    </label>
                                    <textarea 
                                        rows={6}
                                        value={lesson.content.join('\n\n')}
                                        onChange={(e) => {
                                            // Split by double newline to preserve paragraph structure
                                            const newContent = e.target.value.split(/\n\s*\n/).filter(p => p.trim() !== '');
                                            onUpdateLesson(lesson.id, { ...lesson, content: newContent.length > 0 ? newContent : [''] });
                                        }}
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none text-neutral-300 leading-relaxed placeholder-neutral-500 transition-all scrollbar-thin"
                                        placeholder="Введите текст описания. Используйте пустую строку для разделения абзацев."
                                    />
                                    <p className="text-[10px] text-neutral-600 pl-1">Совет: Оставляйте пустую строку между абзацами для правильного форматирования.</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                     <p className="text-neutral-400 mb-4">Добавьте слова в общий словарь. Они станут кликабельными во всех уроках.</p>
                    
                    {/* Add New Word Form */}
                    <form onSubmit={handleAddWord} className="bg-neutral-900 p-6 rounded-xl border border-red-900/30 mb-8 sticky top-0 z-10 shadow-lg">
                        <h3 className="text-sm uppercase tracking-wider font-bold text-red-500 mb-4 flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Добавить запись
                        </h3>
                        <div className="flex flex-col md:flex-row gap-4">
                            <input 
                                value={newTerm}
                                onChange={e => setNewTerm(e.target.value)}
                                placeholder="Слово/Термин (например, React)"
                                className="md:w-1/3 px-4 py-3 bg-neutral-800 rounded-lg border border-neutral-700 focus:ring-2 focus:ring-red-600 outline-none text-white placeholder-neutral-500"
                                required
                            />
                            <input 
                                value={newDef}
                                onChange={e => setNewDef(e.target.value)}
                                placeholder="Определение..."
                                className="flex-1 px-4 py-3 bg-neutral-800 rounded-lg border border-neutral-700 focus:ring-2 focus:ring-red-600 outline-none text-white placeholder-neutral-500"
                                required
                            />
                            <button type="submit" className="bg-red-700 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border border-red-600 shadow-lg shadow-red-900/20">
                                <Save className="w-4 h-4" /> Сохранить
                            </button>
                        </div>
                    </form>

                    {/* Dictionary List */}
                    <div className="bg-neutral-900 rounded-xl border border-neutral-800 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-neutral-800 text-neutral-400 font-semibold text-sm">
                                <tr>
                                    <th className="p-4 w-1/4">Термин</th>
                                    <th className="p-4 flex-1">Определение</th>
                                    <th className="p-4 w-16 text-center">Действие</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                                {dictionary.map((entry, idx) => (
                                    <tr key={idx} className="hover:bg-neutral-800/50 group">
                                        <td className="p-4 font-medium text-white">{entry.term}</td>
                                        <td className="p-4 text-neutral-400">{entry.definition}</td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => onRemoveWord(entry.term)}
                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {dictionary.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="p-8 text-center text-neutral-600 italic">В словаре пока нет слов.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900 flex justify-end shrink-0">
            <button onClick={onClose} className="px-6 py-2 bg-white text-neutral-900 rounded-lg hover:bg-gray-200 transition-colors font-medium shadow-lg">
                Готово
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;