
import React, { useState, useEffect, useCallback } from 'react';
import { Settings, HelpCircle, Loader2, Menu, X, Book, FileText, ArrowRight, LogOut, User as UserIcon, ShoppingBag, Lock, Globe, GraduationCap, FolderOpen, Scroll } from 'lucide-react';
import { INITIAL_LESSONS, INITIAL_DICTIONARY, INITIAL_ARTICLES, INITIAL_PRODUCTS, INITIAL_COURSES, UI_TRANSLATIONS, INITIAL_CATALOG_CATEGORIES, INITIAL_CATALOG_VIDEOS, INITIAL_HISTORY } from './constants';
import { Lesson, DictionaryEntry, Article, UserProfile, Product, CartItem, Course, CatalogCategory, CatalogVideo, HistoryEvent } from './types';
import VideoPlayer from './components/VideoPlayer';
import TextContent from './components/TextContent';
import SettingsModal from './components/SettingsModal';
import DictionaryDrawer from './components/DictionaryDrawer';
import GlossaryModal from './components/GlossaryModal';
import ArticlesModal from './components/ArticlesModal';
import ArticleReader from './components/ArticleReader';
import MarketplaceModal from './components/MarketplaceModal';
import CoursesModal from './components/CoursesModal';
import CatalogModal from './components/CatalogModal';
import HistoryModal from './components/HistoryModal';
import CartDrawer from './components/CartDrawer';
import AuthOverlay from './components/AuthOverlay';
import BehaviorTracker from './utils/BehaviorTracker';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
  // Localization State
  const [lang, setLang] = useState<'ru' | 'en'>('ru');
  const t = UI_TRANSLATIONS[lang];

  // Helper to get localized data with fallback
  const getData = (item: any, field: string) => {
      if (!item) return '';
      if (lang === 'en') {
          return item[`${field}_en`] || item[field];
      }
      return item[field];
  };

  // Auth State
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // App Data State
  const [lessons, setLessons] = useState<Lesson[]>(INITIAL_LESSONS);
  const [dictionary, setDictionary] = useState<DictionaryEntry[]>(INITIAL_DICTIONARY);
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  
  // Catalog Data State
  const [catalogVideos, setCatalogVideos] = useState<CatalogVideo[]>(INITIAL_CATALOG_VIDEOS);
  const [catalogCategories, setCatalogCategories] = useState<CatalogCategory[]>(INITIAL_CATALOG_CATEGORIES);

  // History State
  const [historyEvents, setHistoryEvents] = useState<HistoryEvent[]>(INITIAL_HISTORY);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [activeLessonId, setActiveLessonId] = useState<number>(INITIAL_LESSONS[0].id);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isArticlesOpen, setIsArticlesOpen] = useState(false);
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null); 

  // --- Auth Logic ---
  const fetchUserProfile = useCallback(async (userId: string) => {
    if (!supabase) return;
    try {
        const { data, error } = await supabase.from('user_shibari').select('*').eq('id', userId).single();
        if (error) {
            if (error.code === 'PGRST116' || error.code === '42P17') { 
                 const { data: { user } } = await supabase.auth.getUser();
                 if (user) {
                     const meta = user.user_metadata || {};
                     const newProfile: Partial<UserProfile> = {
                         id: user.id, full_name: meta.full_name || 'User', country: meta.country || '-', city: meta.city || '-', email: user.email || '', shibari_role: meta.shibari_role || 'unknown', experience_level: meta.experience_level || 'newbie', system_role: meta.system_role || 'user'
                     };
                     const { data: createdProfile } = await supabase.from('user_shibari').insert([newProfile]).select().single();
                     if (createdProfile) { setUserProfile(createdProfile as UserProfile); return createdProfile; }
                 }
            }
        } else { setUserProfile(data as UserProfile); return data; }
    } catch (e) { console.error("Silent auth error:", e); }
    return null;
  }, []);

  useEffect(() => {
    if (!supabase) { setAuthLoading(false); return; }
    const initAuth = async () => {
        try {
            const { data: { session: realSession } } = await supabase.auth.getSession();
            setSession(realSession);
            if (realSession?.user) await fetchUserProfile(realSession.user.id);
        } catch (e) { console.error("Silent session init error:", e); } finally { setAuthLoading(false); }
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) fetchUserProfile(session.user.id); else setUserProfile(null);
        });
        return () => subscription.unsubscribe();
    };
    initAuth();
  }, [fetchUserProfile]);

  const handleLogout = async () => {
      if (supabase) await supabase.auth.signOut();
      setSession(null); setUserProfile(null); setIsMobileMenuOpen(false);
      if (activeLessonId > 4) setActiveLessonId(1);
  };

  // --- Data Logic (Silent Fetch) ---
  const fetchData = useCallback(async () => {
    if (!supabase) return;
    try {
      const [lessonsResult, dictResult, articlesResult, productsResult, coursesResult, catVidResult, catCatResult, historyResult] = await Promise.allSettled([
          supabase.from('lessons').select('*').order('id', { ascending: true }),
          supabase.from('dictionary').select('*').order('term', { ascending: true }),
          supabase.from('letter_shibari').select('*').order('id', { ascending: true }),
          supabase.from('market_shibari').select('*').order('created_at', { ascending: false }),
          supabase.from('kurs_market_shibari').select('*').order('created_at', { ascending: false }),
          supabase.from('catalog_videos_shibari').select('*').order('id', { ascending: true }),
          supabase.from('catalog_categories_shibari').select('*').order('id', { ascending: true }),
          supabase.from('history_shibari').select('*').order('id', { ascending: true })
      ]);

      if (articlesResult.status === 'fulfilled' && articlesResult.value.data) {
          setArticles(articlesResult.value.data.map((a: any) => ({ ...a, url: a.url || '#' })));
      }
      
      if (lessonsResult.status === 'fulfilled' && lessonsResult.value.data) {
          const mappedLessons = lessonsResult.value.data.map((l: any, index: number) => ({
              ...l,
              videoUrl: l.video_url || '',
              videoUrl_en: l.video_url_en || '',
              content: l.content || [],
              content_en: l.content_en || [],
              relatedArticles: (l.related_articles?.length) ? l.related_articles : [(index*8)+1, (index*8)+2, (index*8)+3, (index*8)+4]
          }));
          
          if (mappedLessons.length > 0) {
            setLessons(mappedLessons);
            setActiveLessonId(prev => mappedLessons.find((l: any) => l.id === prev) ? prev : mappedLessons[0].id);
          }
      }
      
      if (dictResult.status === 'fulfilled' && dictResult.value.data) {
          setDictionary(dictResult.value.data);
      }
      
      if (productsResult.status === 'fulfilled' && productsResult.value.data) {
          const tempImage = "https://ae-pic-a1.aliexpress-media.com/kf/S495d509b0d07444e90c460039d83ac94b.jpg";
          setProducts(productsResult.value.data.map((p: any) => ({
              ...p, images: p.images?.length ? p.images : [tempImage]
          })));
      }
      
      if (coursesResult.status === 'fulfilled' && coursesResult.value.data) {
        setCourses(coursesResult.value.data);
      }

      if (catVidResult.status === 'fulfilled' && catVidResult.value.data) {
          setCatalogVideos(catVidResult.value.data);
      }
      if (catCatResult.status === 'fulfilled' && catCatResult.value.data) {
          setCatalogCategories(catCatResult.value.data);
      }
      
      if (historyResult.status === 'fulfilled' && historyResult.value.data) {
          setHistoryEvents(historyResult.value.data);
      }

    } catch (error) { console.error("Silent fetch error:", error); }
  }, []);

  // --- Cart Logic ---
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      return existing 
        ? prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) 
        : [...prev, { product, quantity: 1 }];
    });
  };
  const removeFromCart = (pid: number) => setCart(prev => prev.filter(i => i.product.id !== pid));
  const updateCartQuantity = (pid: number, d: number) => setCart(prev => prev.map(i => i.product.id === pid ? { ...i, quantity: Math.max(1, i.quantity + d) } : i));
  const clearCart = () => setCart([]);

  // --- Analytics ---
  useEffect(() => {
    const init = async () => {
        if (!supabase) return;
        const { data } = await supabase.from('app_settings').select('*').limit(1).maybeSingle();
        BehaviorTracker.init(session?.user?.id || null, { goldThreshold: data?.gold_user_threshold_minutes, goldConfig: data?.gold_config, yandexId: data?.yandex_id });
        if(data) { /* Inject Scripts logic here if needed */ }
    };
    fetchData();
    if (session) init();
  }, [fetchData, session]);

  const handleLessonChange = (id: number) => {
      if (!session && id > 4) { setIsAuthModalOpen(true); return; }
      setActiveLessonId(id); setSelectedTerm(null); setIsMobileMenuOpen(false);
      const lesson = lessons.find(l => l.id === id);
      if (lesson) {
          BehaviorTracker.trackPageView(`/lesson/${id}/${lesson.title.substring(0,20)}`);
          BehaviorTracker.trackProductView(id, 0, 'Video Lesson');
      }
  };

  const handleOpenArticle = (article: Article) => {
    setSelectedArticle(article); setIsArticlesOpen(false); 
    BehaviorTracker.trackPageView(`/article/${article.id}/${getData(article, 'title').substring(0,20)}`);
    BehaviorTracker.trackProductView(article.id, 0, 'Article');
  };

  const handleOpenDictionary = () => {
    setIsGlossaryOpen(true);
    BehaviorTracker.trackPageView('/glossary');
  };

  const handleOpenMarketplace = () => {
    setIsMarketplaceOpen(true);
    BehaviorTracker.trackPageView('/marketplace');
  };
  
  const handleOpenCourses = () => {
    setIsCoursesOpen(true);
    BehaviorTracker.trackPageView('/courses');
  };

  const handleOpenCatalog = () => {
    setIsCatalogOpen(true);
    BehaviorTracker.trackPageView('/catalog');
  };

  const handleOpenHistory = () => {
    setIsHistoryOpen(true);
    BehaviorTracker.trackPageView('/history');
  };

  // --- Derived Data ---
  const currentLesson = lessons.find(l => l.id === activeLessonId) || lessons[0];
  let relatedArticlesData = currentLesson?.relatedArticles
    ? currentLesson.relatedArticles.map(id => articles.find(a => a.id === Number(id))).filter(Boolean) as Article[]
    : [];
  if (relatedArticlesData.length === 0 && articles.length > 0) {
      const defaultArticle = articles.find(a => a.id === 1);
      if (defaultArticle) relatedArticlesData = [defaultArticle];
  }

  // --- Localized Content Selectors ---
  const displayLessonTitle = getData(currentLesson, 'title');
  const displayLessonContent = lang === 'en' && currentLesson?.content_en ? currentLesson.content_en : currentLesson?.content;
  const displayVideoUrl = getData(currentLesson, 'videoUrl');

  if (authLoading) return <div className="flex flex-col h-screen w-screen bg-neutral-950 items-center justify-center text-white"><Loader2 className="w-8 h-8 text-red-600 animate-spin mb-4" /></div>;
  
  const renderNavContent = () => (
    <>
      <div className="p-6 border-b border-neutral-900 flex items-center gap-4 shrink-0">
         <div className="w-10 h-10 md:w-14 md:h-14 shrink-0 overflow-hidden rounded-md">
           <img src="https://cqpqyhehoiybggjuljzn.supabase.co/storage/v1/object/public/Enot/Group%201.png" alt="Logo" className="w-full h-full object-cover"/>
         </div>
         <div className="flex flex-col">
             <h1 className="font-bold text-white text-xl md:text-2xl tracking-tight leading-none">Shibari School</h1>
             <div className="flex items-center gap-2 mt-1">
                 {userProfile ? (
                     <span className="text-[10px] text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                         <UserIcon className="w-3 h-3" /> {userProfile.full_name.split(' ')[0]}
                     </span>
                 ) : (
                     <button onClick={() => setIsAuthModalOpen(true)} className="text-[10px] text-red-500 uppercase tracking-wider hover:text-red-400 text-left">
                         {t.login} / {t.register}
                     </button>
                 )}
             </div>
         </div>
      </div>
      
      {/* Language Toggle */}
      <div className="px-6 py-2">
          <button 
             onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
             className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors"
          >
             <Globe className="w-3 h-3" /> {lang === 'ru' ? 'English' : 'Русский'}
          </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <h3 className="px-6 pb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-600">{t.course_content}</h3>
          <ul className="space-y-1 px-2">
              {lessons.map((lesson, index) => {
                  const isLocked = !session && lesson.id > 4;
                  const isActive = activeLessonId === lesson.id;
                  const title = getData(lesson, 'title');
                  const moduleNum = (index + 1).toString().padStart(2, '0');
                  
                  return (
                    <li key={lesson.id}>
                        <button 
                            onClick={() => handleLessonChange(lesson.id)} 
                            className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 border ${
                                isActive 
                                    ? 'bg-red-900/10 border-red-900/30 text-white shadow-[0_0_15px_rgba(220,38,38,0.1)]' 
                                    : 'border-transparent text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
                            }`}
                        >
                            <span className={`text-[10px] font-bold uppercase tracking-widest w-8 shrink-0 ${isActive ? 'text-red-500' : isLocked ? 'text-neutral-700' : 'text-neutral-600'}`}>
                                {isLocked && <Lock className="w-3 h-3 inline mr-1 -mt-0.5" />}
                                {moduleNum}
                            </span>
                            <span className={`text-sm font-medium truncate flex-1 ${isLocked && !isActive ? 'text-neutral-600' : ''}`}>
                                {title}
                            </span>
                        </button>
                    </li>
                  );
              })}
          </ul>
      </nav>
      <div className="p-4 border-t border-neutral-900 bg-black shrink-0 space-y-2">
          {userProfile?.system_role === 'admin' && (
              <button onClick={() => { setIsSettingsOpen(true); setIsMobileMenuOpen(false); }} className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-neutral-900 hover:bg-neutral-800 hover:border-neutral-700 rounded-lg text-sm font-medium transition-all text-neutral-300 border border-neutral-800 group">
                  <Settings className="w-4 h-4 text-neutral-500 group-hover:text-red-500 transition-colors" /><span>{t.settings}</span>
              </button>
          )}
          {session ? (
              <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-transparent hover:bg-red-900/20 rounded-lg text-sm font-medium transition-all text-neutral-500 hover:text-red-400 border border-transparent hover:border-red-900/30 group">
                  <LogOut className="w-4 h-4" /><span>{t.logout}</span>
              </button>
          ) : (
              <button onClick={() => setIsAuthModalOpen(true)} className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-900/20 hover:bg-red-900/40 rounded-lg text-sm font-medium transition-all text-red-500 hover:text-white border border-red-900/30 hover:border-red-600 group">
                  <UserIcon className="w-4 h-4" /><span>{t.login}</span>
              </button>
          )}
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-neutral-950 overflow-hidden selection:bg-red-900 selection:text-white relative">
      <aside className="hidden lg:flex w-80 bg-black text-neutral-400 flex-col shadow-2xl z-20 shrink-0 border-r border-neutral-900">
          {renderNavContent()}
      </aside>
      
      {/* Mobile Header */}
      <div className="lg:hidden absolute top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md border-b border-neutral-800 z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-3"><button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-white"><Menu className="w-6 h-6" /></button><span className="font-bold text-white tracking-tight">Shibari School</span></div>
        <button onClick={() => {}} className="p-2 text-neutral-400 hover:text-white"><HelpCircle className="w-6 h-6" /></button>
      </div>
      
      {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
              <div className="absolute top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-black shadow-2xl border-r border-neutral-800 flex flex-col animate-in slide-in-from-left duration-300">
                  <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-white"><X className="w-6 h-6" /></button>
                  {renderNavContent()}
              </div>
          </div>
      )}

      <main className="flex-1 flex flex-col relative overflow-hidden bg-neutral-950 pt-16 lg:pt-0">
        <div className="hidden lg:block absolute top-8 right-8 z-20"><button onClick={handleOpenDictionary} className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-red-500 hover:border-red-600 hover:bg-neutral-800 transition-all duration-300 shadow-lg group" title={t.dictionary}><HelpCircle className="w-5 h-5 group-hover:scale-110 transition-transform" /></button></div>
        <div className="flex-1 overflow-y-auto scroll-smooth">
            {currentLesson ? (
                <div className="max-w-5xl mx-auto p-4 md:p-8 lg:p-12 pb-32">
                    {/* Tabs */}
                    <div className="flex items-center gap-2 md:gap-4 mb-8 border-b border-neutral-800 pb-2 overflow-x-auto scrollbar-hide">
                        <button onClick={() => setIsArticlesOpen(true)} className="text-neutral-300 hover:text-white hover:bg-neutral-900 px-4 py-2 rounded-t-md transition-all text-xs md:text-sm font-bold uppercase tracking-widest flex items-center gap-2 border-b-2 border-transparent hover:border-red-600/50"><FileText className="w-4 h-4 md:hidden" />{t.articles}</button>
                        <button onClick={handleOpenDictionary} className="text-neutral-300 hover:text-white hover:bg-neutral-900 px-4 py-2 rounded-t-md transition-all text-xs md:text-sm font-bold uppercase tracking-widest flex items-center gap-2 border-b-2 border-transparent hover:border-red-600/50"><Book className="w-4 h-4 md:hidden" />{t.dictionary}</button>
                        <button className="text-neutral-300 hover:text-white hover:bg-neutral-900 px-4 py-2 rounded-t-md transition-all text-xs md:text-sm font-bold uppercase tracking-widest border-b-2 border-transparent hover:border-red-600/50">{t.navazu}</button>
                        <button onClick={handleOpenMarketplace} className="text-neutral-300 hover:text-white hover:bg-neutral-900 px-4 py-2 rounded-t-md transition-all text-xs md:text-sm font-bold uppercase tracking-widest flex items-center gap-2 border-b-2 border-transparent hover:border-red-600/50"><ShoppingBag className="w-4 h-4 md:hidden" />{t.shop}</button>
                        <button onClick={handleOpenCourses} className="text-neutral-300 hover:text-white hover:bg-neutral-900 px-4 py-2 rounded-t-md transition-all text-xs md:text-sm font-bold uppercase tracking-widest flex items-center gap-2 border-b-2 border-transparent hover:border-red-600/50"><GraduationCap className="w-4 h-4 md:hidden" />{t.courses}</button>
                        <button onClick={handleOpenCatalog} className="text-neutral-300 hover:text-white hover:bg-neutral-900 px-4 py-2 rounded-t-md transition-all text-xs md:text-sm font-bold uppercase tracking-widest flex items-center gap-2 border-b-2 border-transparent hover:border-red-600/50"><FolderOpen className="w-4 h-4 md:hidden" />{t.catalog || "Каталог"}</button>
                        <button onClick={handleOpenHistory} className="text-neutral-300 hover:text-white hover:bg-neutral-900 px-4 py-2 rounded-t-md transition-all text-xs md:text-sm font-bold uppercase tracking-widest flex items-center gap-2 border-b-2 border-transparent hover:border-red-600/50"><Scroll className="w-4 h-4 md:hidden" />{t.history || "История"}</button>
                    </div>

                    {/* Lesson Header */}
                    <div className="mb-6 md:mb-8 flex justify-between items-end">
                        <div className="pr-0 md:pr-12 w-full"><span className="text-red-500 font-bold tracking-wider text-[10px] md:text-xs uppercase bg-red-950/30 px-2 py-1 rounded border border-red-900/30">{t.current_lesson}</span><h2 className="text-2xl md:text-4xl font-extrabold text-white mt-3 leading-tight">{displayLessonTitle}</h2></div>
                    </div>

                    <VideoPlayer url={displayVideoUrl} />

                    {/* Related Articles Cards */}
                    {relatedArticlesData.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                            {relatedArticlesData.map((article) => (
                                <button key={article.id} onClick={() => handleOpenArticle(article)} className="block w-full text-left p-3 bg-neutral-900 rounded-lg border border-neutral-800 hover:border-red-600 transition-all duration-300 group shadow-md">
                                    <div className="flex items-start justify-between gap-2 mb-1"><h4 className="text-xs md:text-sm font-bold text-red-600 group-hover:text-red-500 line-clamp-1 leading-tight">{getData(article, 'title')}</h4><ArrowRight className="w-3 h-3 text-neutral-600 group-hover:text-red-500 transform -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" /></div>
                                    <p className="text-[10px] text-neutral-500 line-clamp-2 leading-relaxed">{getData(article, 'description') || '...'}</p>
                                </button>
                            ))}
                        </div>
                    )}
                    
                    <TextContent paragraphs={displayLessonContent || []} dictionary={dictionary} onWordClick={(term) => setSelectedTerm(term)} lang={lang}/>
                    
                    <div className="mt-12 pt-8 border-t border-neutral-800 text-center text-neutral-600 text-sm"><p>{t.copyright}</p></div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-neutral-500 p-4 text-center"><p>No lessons available.</p></div>
            )}
        </div>
      </main>

      <DictionaryDrawer term={selectedTerm} dictionary={dictionary} onClose={() => setSelectedTerm(null)} lang={lang} t={t} />
      <GlossaryModal isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} dictionary={dictionary} lang={lang} t={t} />
      <ArticlesModal isOpen={isArticlesOpen} onClose={() => setIsArticlesOpen(false)} articles={articles} lessons={lessons} onSelectArticle={handleOpenArticle} lang={lang} t={t} getData={getData} />
      <ArticleReader article={selectedArticle} onClose={() => { setSelectedArticle(null); setIsArticlesOpen(true); }} lang={lang} t={t} getData={getData} />
      <MarketplaceModal 
        isOpen={isMarketplaceOpen} 
        onClose={() => setIsMarketplaceOpen(false)} 
        products={products}
        cart={cart}
        addToCart={addToCart}
        openCart={() => setIsCartOpen(true)}
        lang={lang}
        t={t}
        getData={getData}
      />
      <CoursesModal 
        isOpen={isCoursesOpen} 
        onClose={() => setIsCoursesOpen(false)}
        courses={courses}
        addToCart={addToCart}
        openCart={() => setIsCartOpen(true)}
        cart={cart}
        lang={lang}
        t={t}
        getData={getData}
      />
      <CatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        categories={catalogCategories}
        videos={catalogVideos}
        lang={lang}
        t={t}
      />
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        events={historyEvents}
        lang={lang}
        t={t}
      />
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        userProfile={userProfile}
        onUpdateQuantity={updateCartQuantity}
        onRemove={removeFromCart}
        onClear={clearCart}
        t={t}
        getData={getData}
      />
      
      {isAuthModalOpen && (
          <AuthOverlay 
            onLoginSuccess={() => setIsAuthModalOpen(false)} 
            onClose={() => setIsAuthModalOpen(false)} 
            t={t}
          />
      )}
      
      {userProfile?.system_role === 'admin' && (
          <SettingsModal 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)}
            lessons={lessons}
            dictionary={dictionary}
            articles={articles}
            catalogCategories={catalogCategories}
            catalogVideos={catalogVideos}
            historyEvents={historyEvents}
            onUpdateLesson={() => {}}
            onAddLesson={() => {}}
            onRemoveLesson={() => {}}
            onAddWord={() => {}}
            onRemoveWord={() => {}}
            onResetToDefaults={() => {}}
            onArticlesRefresh={fetchData}
          />
      )}
    </div>
  );
};
export default App;
