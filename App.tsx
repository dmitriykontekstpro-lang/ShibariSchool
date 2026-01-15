import React, { useState, useEffect } from 'react';
import { Settings, HelpCircle, Loader2 } from 'lucide-react';
import { INITIAL_LESSONS, INITIAL_DICTIONARY } from './constants';
import { Lesson, DictionaryEntry } from './types';
import VideoPlayer from './components/VideoPlayer';
import TextContent from './components/TextContent';
import SettingsModal from './components/SettingsModal';
import DictionaryDrawer from './components/DictionaryDrawer';
import GlossaryModal from './components/GlossaryModal';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [dictionary, setDictionary] = useState<DictionaryEntry[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<number>(1);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка данных из Supabase при старте
  useEffect(() => {
    const fetchData = async () => {
      // Если клиент не инициализирован (нет ключей), используем мок-данные
      if (!supabase) {
         console.warn('Supabase клиент не найден. Используются локальные данные.');
         setLessons(INITIAL_LESSONS);
         setDictionary(INITIAL_DICTIONARY);
         setActiveLessonId(INITIAL_LESSONS[0].id);
         setIsLoading(false);
         return;
      }

      try {
        setIsLoading(true);
        console.log('Запрос данных из Supabase...');
        
        // Запрос уроков
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .order('id', { ascending: true });

        // Запрос словаря
        const { data: dictData, error: dictError } = await supabase
          .from('dictionary')
          .select('*')
          .order('term', { ascending: true });

        if (lessonsError) throw lessonsError;
        if (dictError) throw dictError;

        // Маппинг данных из БД (snake_case) в формат приложения (camelCase)
        if (lessonsData && lessonsData.length > 0) {
            console.log(`Загружено ${lessonsData.length} уроков из БД.`);
            const mappedLessons = lessonsData.map((l: any) => ({
                id: l.id,
                title: l.title,
                videoUrl: l.video_url || '',
                content: l.content || []
            }));
            setLessons(mappedLessons);
            setActiveLessonId(mappedLessons[0].id);
        } else {
            console.log('Таблица lessons пуста, используются локальные данные.');
            // Если БД пустая, используем дефолтные данные для демонстрации
            setLessons(INITIAL_LESSONS);
            setActiveLessonId(INITIAL_LESSONS[0].id);
        }

        if (dictData && dictData.length > 0) {
            console.log(`Загружено ${dictData.length} слов из БД.`);
            setDictionary(dictData);
        } else {
            console.log('Таблица dictionary пуста, используются локальные данные.');
            setDictionary(INITIAL_DICTIONARY);
        }

      } catch (error) {
        console.error('Ошибка загрузки данных из Supabase:', error);
        // Fallback на статику в случае ошибки подключения
        setLessons(INITIAL_LESSONS);
        setDictionary(INITIAL_DICTIONARY);
        setActiveLessonId(INITIAL_LESSONS[0].id);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const currentLesson = lessons.find(l => l.id === activeLessonId) || lessons[0];

  // --- CRUD Операции с Supabase ---

  const handleUpdateLesson = async (id: number, data: { title: string; videoUrl: string; content: string[] }) => {
    // Оптимистичное обновление UI
    setLessons(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
    
    // Сохранение в БД
    if (supabase) {
        await supabase.from('lessons').update({
            title: data.title,
            video_url: data.videoUrl,
            content: data.content
        }).eq('id', id);
    }
  };

  const handleAddLesson = async () => {
    // Создаем объект для вставки
    const newLessonBase = {
        title: `Новый модуль`,
        video_url: '',
        content: ['Введите описание модуля...']
    };

    if (!supabase) {
         // Fallback logic for demo/offline mode
         const newId = lessons.length > 0 ? Math.max(...lessons.map(l => l.id)) + 1 : 1;
         const newLesson: Lesson = {
            id: newId,
            title: `${newLessonBase.title} ${newId}`,
            videoUrl: '',
            content: newLessonBase.content
         };
         setLessons(prev => [...prev, newLesson]);
         setActiveLessonId(newLesson.id);
         return;
    }

    // Сначала сохраняем в БД, чтобы получить настоящий ID
    const { data, error } = await supabase
        .from('lessons')
        .insert([newLessonBase])
        .select()
        .single();

    if (!error && data) {
        const newLesson: Lesson = {
            id: data.id,
            title: data.title,
            videoUrl: data.video_url || '',
            content: data.content || []
        };
        setLessons(prev => [...prev, newLesson]);
        // Переключаемся на новый урок
        setActiveLessonId(newLesson.id);
    } else {
        console.error("Ошибка при создании урока", error);
        alert("Ошибка при создании урока. Проверьте консоль.");
    }
  };

  const handleRemoveLesson = async (id: number) => {
    if (lessons.length <= 1) {
        alert("Нельзя удалить последний модуль.");
        return;
    }
    
    // UI Update
    setLessons(prev => {
        const newLessons = prev.filter(l => l.id !== id);
        if (id === activeLessonId) {
            setActiveLessonId(newLessons[0].id);
        }
        return newLessons;
    });

    // DB Update
    if (supabase) {
        const { error } = await supabase.from('lessons').delete().eq('id', id);
        if (error) console.error("Ошибка удаления урока", error);
    }
  };

  const handleAddWord = async (entry: DictionaryEntry) => {
    if (!dictionary.some(d => d.term.toLowerCase() === entry.term.toLowerCase())) {
        // UI Update
        setDictionary(prev => [...prev, entry]);

        // DB Update
        if (supabase) {
            const { error } = await supabase.from('dictionary').insert([{
                term: entry.term,
                definition: entry.definition
            }]);
            if (error) console.error("Ошибка добавления слова", error);
        }
    }
  };

  const handleRemoveWord = async (term: string) => {
    // UI Update
    setDictionary(prev => prev.filter(d => d.term !== term));
    
    // DB Update
    if (supabase) {
        const { error } = await supabase.from('dictionary').delete().eq('term', term);
        if (error) console.error("Ошибка удаления слова", error);
    }
  };

  // Функция для сброса БД к начальным значениям
  const handleResetToDefaults = async () => {
    if (!window.confirm('ВНИМАНИЕ: Это действие перезапишет все названия и содержание первых 13 уроков в базе данных на стандартные. Вы уверены?')) {
        return;
    }
    
    setIsLoading(true);
    
    // UI Update immediately
    setLessons(INITIAL_LESSONS);
    
    if (supabase) {
        // Upsert all initial lessons
        const { error } = await supabase.from('lessons').upsert(
            INITIAL_LESSONS.map(l => ({
                id: l.id,
                title: l.title,
                video_url: l.videoUrl,
                content: l.content
            }))
        );
        
        if (error) {
            console.error("Ошибка при сбросе данных:", error);
            alert("Произошла ошибка при сохранении в базу данных.");
        } else {
            console.log("База данных успешно обновлена стандартными уроками.");
        }
    }
    
    setIsLoading(false);
  };

  // --- Рендер ---

  if (isLoading) {
    return (
        <div className="flex flex-col h-screen w-screen bg-neutral-950 items-center justify-center text-white space-y-4">
            <div className="w-20 h-20 mb-4 animate-pulse">
                 <img 
                    src="https://cqpqyhehoiybggjuljzn.supabase.co/storage/v1/object/public/Enot/Group%201.png" 
                    alt="Loading Logo" 
                    className="w-full h-full object-cover rounded-md"
                 />
            </div>
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            <p className="text-neutral-400 text-sm tracking-widest uppercase">Загрузка курса...</p>
        </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-950 overflow-hidden selection:bg-red-900 selection:text-white">
      
      {/* Left Sidebar Panel - Vertical List of Tabs */}
      <aside className="w-80 bg-black text-neutral-400 flex flex-col shadow-2xl z-20 shrink-0 border-r border-neutral-900">
        <div className="p-6 border-b border-neutral-900 flex items-center gap-4">
           <div className="w-14 h-14 shrink-0 overflow-hidden rounded-md">
             <img 
                src="https://cqpqyhehoiybggjuljzn.supabase.co/storage/v1/object/public/Enot/Group%201.png" 
                alt="Shibari School Logo" 
                className="w-full h-full object-cover"
             />
           </div>
           <h1 className="font-bold text-white text-2xl tracking-tight leading-none">Shibari School</h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6">
            <h3 className="px-6 pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-600">Содержание курса</h3>
            <ul className="space-y-1 px-3">
                {lessons.map((lesson, index) => (
                    <li key={lesson.id}>
                        <button
                            onClick={() => {
                                setActiveLessonId(lesson.id);
                                setSelectedTerm(null); // Close drawer on nav
                            }}
                            className={`group w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-4 ${
                                activeLessonId === lesson.id 
                                ? 'bg-neutral-900 text-white shadow-inner shadow-black/50' 
                                : 'hover:bg-neutral-900/50 hover:text-neutral-200'
                            }`}
                        >
                            <span className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-300 border ${
                                activeLessonId === lesson.id 
                                    ? 'bg-red-700 border-red-600 text-white shadow-lg shadow-red-900/40 translate-x-0' 
                                    : 'bg-neutral-900 border-neutral-800 text-neutral-500 group-hover:border-neutral-700 group-hover:text-neutral-300'
                            }`}>
                                {index + 1}
                            </span>
                            <div className="flex flex-col overflow-hidden">
                                <span className={`text-sm font-medium truncate transition-colors ${
                                    activeLessonId === lesson.id ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-200'
                                }`}>
                                    {lesson.title}
                                </span>
                            </div>
                        </button>
                    </li>
                ))}
            </ul>
        </nav>

        <div className="p-4 border-t border-neutral-900 bg-black">
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-neutral-900 hover:bg-neutral-800 hover:border-neutral-700 rounded-lg text-sm font-medium transition-all text-neutral-300 border border-neutral-800 group"
            >
                <Settings className="w-4 h-4 text-neutral-500 group-hover:text-red-500 transition-colors" />
                <span>Общие настройки</span>
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-neutral-950">
        
        {/* Top Right Help Button (Absolute Position) */}
        <div className="absolute top-8 right-8 z-30">
            <button 
                onClick={() => setIsGlossaryOpen(true)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-red-500 hover:border-red-600 hover:bg-neutral-800 transition-all duration-300 shadow-lg group"
                title="Открыть словарь"
            >
                <HelpCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
            {currentLesson ? (
                <div className="max-w-5xl mx-auto p-8 md:p-12 pb-32">
                    
                    {/* Header for content */}
                    <div className="mb-8 flex justify-between items-end">
                        <div className="pr-12"> 
                            <span className="text-red-500 font-bold tracking-wider text-xs uppercase bg-red-950/30 px-2 py-1 rounded border border-red-900/30">
                                Текущий урок
                            </span>
                            <h2 className="text-2xl md:text-4xl font-extrabold text-white mt-3 leading-tight">
                                {currentLesson.title}
                            </h2>
                        </div>
                    </div>

                    {/* Video Player */}
                    <VideoPlayer url={currentLesson.videoUrl} />

                    {/* Text Content */}
                    <TextContent 
                        paragraphs={currentLesson.content} 
                        dictionary={dictionary}
                        onWordClick={(term) => setSelectedTerm(term)}
                    />

                    {/* Info Footer */}
                    <div className="mt-12 pt-8 border-t border-neutral-800 text-center text-neutral-600 text-sm">
                        <p>Shibari School &copy; 2023. Интерактивная образовательная платформа.</p>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-neutral-500">
                    <p>Нет доступных уроков. Добавьте их в настройках.</p>
                </div>
            )}
        </div>

      </main>

      {/* Right Drawer (Contextual Glossary) */}
      <DictionaryDrawer 
        term={selectedTerm} 
        dictionary={dictionary} 
        onClose={() => setSelectedTerm(null)} 
      />

      {/* Full Screen Glossary Modal */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        dictionary={dictionary}
      />

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        lessons={lessons}
        dictionary={dictionary}
        onUpdateLesson={handleUpdateLesson}
        onAddLesson={handleAddLesson}
        onRemoveLesson={handleRemoveLesson}
        onAddWord={handleAddWord}
        onRemoveWord={handleRemoveWord}
        onResetToDefaults={handleResetToDefaults}
      />

    </div>
  );
};

export default App;