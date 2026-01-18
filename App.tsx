
import React, { useState, useEffect, useCallback } from 'react';
import { Settings, HelpCircle, Loader2, Menu, X, Book, FileText, ArrowRight, LogOut, User as UserIcon, ShoppingBag, Lock } from 'lucide-react';
import { INITIAL_LESSONS, INITIAL_DICTIONARY, INITIAL_ARTICLES, INITIAL_PRODUCTS } from './constants';
import { Lesson, DictionaryEntry, Article, UserProfile, Product, CartItem } from './types';
import VideoPlayer from './components/VideoPlayer';
import TextContent from './components/TextContent';
import SettingsModal from './components/SettingsModal';
import DictionaryDrawer from './components/DictionaryDrawer';
import GlossaryModal from './components/GlossaryModal';
import ArticlesModal from './components/ArticlesModal';
import ArticleReader from './components/ArticleReader';
import MarketplaceModal from './components/MarketplaceModal';
import CartDrawer from './components/CartDrawer';
import AuthOverlay from './components/AuthOverlay';
import BehaviorTracker from './utils/BehaviorTracker';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
  // Auth State
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // App Data State - Initialize with constants for instant render
  const [lessons, setLessons] = useState<Lesson[]>(INITIAL_LESSONS);
  const [dictionary, setDictionary] = useState<DictionaryEntry[]>(INITIAL_DICTIONARY);
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  
  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [activeLessonId, setActiveLessonId] = useState<number>(INITIAL_LESSONS[0].id);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isArticlesOpen, setIsArticlesOpen] = useState(false);
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null); 

  // --- Auth Logic ---
  
  const fetchUserProfile = useCallback(async (userId: string) => {
    if (!supabase) return;
    try {
        const { data, error } = await supabase
            .from('user_shibari')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116' || error.code === '42P17') { 
                 const { data: { user } } = await supabase.auth.getUser();
                 
                 if (user) {
                     const meta = user.user_metadata || {};
                     const newProfile: Partial<UserProfile> = {
                         id: user.id,
                         full_name: meta.full_name || 'Пользователь',
                         country: meta.country || 'Не указано',
                         city: meta.city || 'Не указано',
                         email: user.email || '',
                         shibari_role: meta.shibari_role || 'unknown',
                         experience_level: meta.experience_level || 'newbie',
                         system_role: meta.system_role || 'user'
                     };
                     
                     const { data: createdProfile } = await supabase
                        .from('user_shibari')
                        .insert([newProfile])
                        .select()
                        .single();
                        
                     if (createdProfile) {
                         setUserProfile(createdProfile as UserProfile);
                         return createdProfile;
                     }
                 }
            }
        } else {
            setUserProfile(data as UserProfile);
            return data;
        }
    } catch (e) {
        console.error("Silent auth error:", e);
    }
    return null;
  }, []);

  useEffect(() => {
    if (!supabase) {
        setAuthLoading(false);
        return;
    }

    const initAuth = async () => {
        try {
            const { data: { session: realSession } } = await supabase.auth.getSession();
            setSession(realSession);
            
            if (realSession?.user) {
                await fetchUserProfile(realSession.user.id);
            }
        } catch (e) {
            console.error("Silent session init error:", e);
        } finally {
            setAuthLoading(false);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                fetchUserProfile(session.user.id);
            } else {
                setUserProfile(null);
            }
        });
        return () => subscription.unsubscribe();
    };

    initAuth();
  }, [fetchUserProfile]);

  const handleLogout = async () => {
      if (supabase) await supabase.auth.signOut();
      setSession(null);
      setUserProfile(null);
      setIsMobileMenuOpen(false);
      
      // Если пользователь был на платном уроке, перекидываем на бесплатный
      if (activeLessonId > 4) {
          setActiveLessonId(1);
      }
  };

  // --- Data Logic (Silent Fetch) ---

  const fetchData = useCallback(async () => {
    if (!supabase) return;

    try {
      // Fetch everything in parallel, catching errors individually so one failure doesn't stop others
      const [lessonsResult, dictResult, articlesResult, productsResult] = await Promise.allSettled([
          supabase.from('lessons').select('*').order('id', { ascending: true }),
          supabase.from('dictionary').select('*').order('term', { ascending: true }),
          supabase.from('letter_shibari').select('*').order('id', { ascending: true }),
          supabase.from('market_shibari').select('*').order('created_at', { ascending: false })
      ]);

      // 1. Process Articles (needed for lessons)
      let fetchedArticles: Article[] = INITIAL_ARTICLES;
      if (articlesResult.status === 'fulfilled' && articlesResult.value.data && articlesResult.value.data.length > 0) {
          fetchedArticles = articlesResult.value.data.map((a: any) => ({
              id: a.id,
              title: a.title,
              description: a.description,
              url: a.url || '#',
              content: a.content 
          }));
          setArticles(fetchedArticles);
      }

      // 2. Process Lessons
      if (lessonsResult.status === 'fulfilled' && lessonsResult.value.data && lessonsResult.value.data.length > 0) {
          const mappedLessons = lessonsResult.value.data.map((l: any, index: number) => {
              let related = l.related_articles;
              if (!related || related.length === 0) {
                  const startId = (index * 8) + 1;
                  related = [startId, startId + 1, startId + 2, startId + 3];
              }
              return {
                  id: l.id,
                  title: l.title,
                  videoUrl: l.video_url || '',
                  content: l.content || [],
                  relatedArticles: related
              };
          });
          setLessons(mappedLessons);
          // Preserve active lesson if possible
          setActiveLessonId(prev => mappedLessons.find((l: any) => l.id === prev) ? prev : mappedLessons[0].id);
      }

      // 3. Process Dictionary
      if (dictResult.status === 'fulfilled' && dictResult.value.data && dictResult.value.data.length > 0) {
          setDictionary(dictResult.value.data);
      }

      // 4. Process Products
      if (productsResult.status === 'fulfilled' && productsResult.value.data && productsResult.value.data.length > 0) {
          // Force temporary image replacement for DB data
          const tempImage = "https://ae-pic-a1.aliexpress-media.com/kf/S495d509b0d07444e90c460039d83ac94b.jpg";
          const fixedProducts = productsResult.value.data.map((p: any) => ({
              ...p,
              images: p.images && p.images.length > 0 
                  ? p.images.map(() => tempImage) 
                  : [tempImage]
          }));
          setProducts(fixedProducts);
      }

    } catch (error) {
      console.error("Silent fetch error:", error);
      // Fallback is simply keeping the INITIAL_ constants which are already set
    }
  }, []);

  // --- Cart Logic ---

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    // Optional: open cart immediately or show toast
    // setIsCartOpen(true);
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
        if (item.product.id === productId) {
            const newQ = item.quantity + delta;
            return newQ > 0 ? { ...item, quantity: newQ } : item;
        }
        return item;
    }));
  };

  const clearCart = () => setCart([]);

  // --- Analytics & Tracker Logic ---
  useEffect(() => {
    const fetchAndInjectAnalytics = async () => {
        if (!supabase) return;
        try {
            const { data } = await supabase.from('app_settings').select('*').limit(1).maybeSingle();

            // Init Tracker with extended config
            BehaviorTracker.init(session?.user?.id || null, {
                goldThreshold: data?.gold_user_threshold_minutes,
                goldConfig: data?.gold_config, // NEW: Pass the flexible config
                yandexId: data?.yandex_id
            });

            if (!data) return;

            // Injections
            if (data.gtm_id && !document.getElementById('gtm-script')) {
                const script = document.createElement('script');
                script.id = 'gtm-script';
                script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${data.gtm_id}');`;
                document.head.appendChild(script);
            }
            if (data.yandex_id && !document.getElementById('ym-script')) {
                const script = document.createElement('script');
                script.id = 'ym-script';
                script.innerHTML = `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");ym(${data.yandex_id}, "init", {clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});`;
                document.head.appendChild(script);
            }
            if (data.custom_html_body && !document.getElementById('custom-body-html')) {
                const div = document.createElement('div');
                div.id = 'custom-body-html';
                const range = document.createRange();
                const fragment = range.createContextualFragment(data.custom_html_body);
                div.appendChild(fragment);
                document.body.appendChild(div);
            }
        } catch (e) { console.error("Analytics fetch error:", e); }
    };

    fetchData(); // Fetch data always
    if (session) {
        fetchAndInjectAnalytics();
    }
  }, [fetchData, session]);

  // --- Tracking Handlers ---
  
  const handleLessonChange = (id: number) => {
      // Check for lock state
      // Lesson IDs start at 1. Lessons 5 to 12 (IDs 5,6...12) are locked for non-auth users
      if (!session && id > 4) {
          setIsAuthModalOpen(true);
          return;
      }

      setActiveLessonId(id);
      setSelectedTerm(null);
      setIsMobileMenuOpen(false);
      
      const lesson = lessons.find(l => l.id === id);
      if (lesson) {
          // Track as PageView
          BehaviorTracker.trackPageView(`/lesson/${id}/${lesson.title.substring(0,20)}`);
          // Track as Product View (Education)
          BehaviorTracker.trackProductView(id, 0, 'Video Lesson');
      }
  };

  const handleOpenArticle = (article: Article) => {
    setSelectedArticle(article);
    setIsArticlesOpen(false); 
    
    // Track as PageView
    BehaviorTracker.trackPageView(`/article/${article.id}/${article.title.substring(0,20)}`);
    // Track as Product View (Reading)
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

  // --- Data Derived ---
  const currentLesson = lessons.find(l => l.id === activeLessonId) || lessons[0];
  let relatedArticlesData = currentLesson?.relatedArticles
    ? currentLesson.relatedArticles.map(id => articles.find(a => a.id === Number(id))).filter(Boolean) as Article[]
    : [];

  if (relatedArticlesData.length === 0 && articles.length > 0) {
      const defaultArticle = articles.find(a => a.id === 1);
      if (defaultArticle) relatedArticlesData = [defaultArticle];
  }

  // --- Render (Auth/Loading) ---
  if (authLoading) return <div className="flex flex-col h-screen w-screen bg-neutral-950 items-center justify-center text-white"><Loader2 className="w-8 h-8 text-red-600 animate-spin mb-4" /></div>;
  
  // --- Main Layout ---
  const NavContent = () => (
    <>
      <div className="p-6 border-b border-neutral-900 flex items-center gap-4 shrink-0">
         <div className="w-10 h-10 md:w-14 md:h-14 shrink-0 overflow-hidden rounded-md">
           <img src="https://cqpqyhehoiybggjuljzn.supabase.co/storage/v1/object/public/Enot/Group%201.png" alt="Logo" className="w-full h-full object-cover"/>
         </div>
         <div className="flex flex-col">
             <h1 className="font-bold text-white text-xl md:text-2xl tracking-tight leading-none">Shibari School</h1>
             {userProfile ? (
                 <span className="text-[10px] text-neutral-500 mt-1 uppercase tracking-wider flex items-center gap-1">
                     <UserIcon className="w-3 h-3" /> {userProfile.full_name.split(' ')[0]}
                 </span>
             ) : (
                 <button onClick={() => setIsAuthModalOpen(true)} className="text-[10px] text-red-500 mt-1 uppercase tracking-wider hover:text-red-400 text-left">
                     Вход / Регистрация
                 </button>
             )}
         </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-6 scrollbar-hide">
          <h3 className="px-6 pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-600">Содержание курса</h3>
          <ul className="space-y-1 px-3">
              {lessons.map((lesson, index) => {
                  const isLocked = !session && lesson.id > 4;
                  const isActive = activeLessonId === lesson.id;
                  
                  return (
                    <li key={lesson.id}>
                        <button 
                            onClick={() => handleLessonChange(lesson.id)} 
                            className={`group w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-4 ${isActive ? 'bg-neutral-900 text-white shadow-inner shadow-black/50' : 'hover:bg-neutral-900/50 hover:text-neutral-200'}`}
                        >
                            <span className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-300 border ${
                                isActive 
                                    ? 'bg-red-700 border-red-600 text-white shadow-lg shadow-red-900/40 translate-x-0' 
                                    : isLocked 
                                        ? 'bg-neutral-900 border-red-900/30 text-red-800' // Locked Style
                                        : 'bg-neutral-900 border-neutral-800 text-neutral-500 group-hover:border-neutral-700 group-hover:text-neutral-300'
                            }`}>
                                {isLocked ? <Lock className="w-3 h-3" /> : index + 1}
                            </span>
                            <div className="flex flex-col overflow-hidden">
                                <span className={`text-sm font-medium truncate transition-colors ${
                                    isActive 
                                    ? 'text-white' 
                                    : isLocked 
                                        ? 'text-neutral-600 group-hover:text-red-500' // Dimmed text for locked
                                        : 'text-neutral-400 group-hover:text-neutral-200'
                                }`}>
                                    {lesson.title}
                                </span>
                            </div>
                        </button>
                    </li>
                  );
              })}
          </ul>
      </nav>
      <div className="p-4 border-t border-neutral-900 bg-black shrink-0 space-y-2">
          {userProfile?.system_role === 'admin' && (
              <button onClick={() => { setIsSettingsOpen(true); setIsMobileMenuOpen(false); }} className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-neutral-900 hover:bg-neutral-800 hover:border-neutral-700 rounded-lg text-sm font-medium transition-all text-neutral-300 border border-neutral-800 group">
                  <Settings className="w-4 h-4 text-neutral-500 group-hover:text-red-500 transition-colors" /><span>Общие настройки</span>
              </button>
          )}
          {session ? (
              <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-transparent hover:bg-red-900/20 rounded-lg text-sm font-medium transition-all text-neutral-500 hover:text-red-400 border border-transparent hover:border-red-900/30 group">
                  <LogOut className="w-4 h-4" /><span>Выйти</span>
              </button>
          ) : (
              <button onClick={() => setIsAuthModalOpen(true)} className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-900/20 hover:bg-red-900/40 rounded-lg text-sm font-medium transition-all text-red-500 hover:text-white border border-red-900/30 hover:border-red-600 group">
                  <UserIcon className="w-4 h-4" /><span>Войти</span>
              </button>
          )}
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-neutral-950 overflow-hidden selection:bg-red-900 selection:text-white relative">
      <aside className="hidden lg:flex w-80 bg-black text-neutral-400 flex-col shadow-2xl z-20 shrink-0 border-r border-neutral-900"><NavContent /></aside>
      
      {/* Mobile Header */}
      <div className="lg:hidden absolute top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md border-b border-neutral-800 z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-3"><button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-white"><Menu className="w-6 h-6" /></button><span className="font-bold text-white tracking-tight">Shibari School</span></div>
        <button onClick={handleOpenDictionary} className="p-2 text-neutral-400 hover:text-white"><HelpCircle className="w-6 h-6" /></button>
      </div>
      
      {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
              <div className="absolute top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-black shadow-2xl border-r border-neutral-800 flex flex-col animate-in slide-in-from-left duration-300">
                  <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-white"><X className="w-6 h-6" /></button><NavContent />
              </div>
          </div>
      )}

      <main className="flex-1 flex flex-col relative overflow-hidden bg-neutral-950 pt-16 lg:pt-0">
        <div className="hidden lg:block absolute top-8 right-8 z-20"><button onClick={handleOpenDictionary} className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-red-500 hover:border-red-600 hover:bg-neutral-800 transition-all duration-300 shadow-lg group" title="Открыть словарь"><HelpCircle className="w-5 h-5 group-hover:scale-110 transition-transform" /></button></div>
        <div className="flex-1 overflow-y-auto scroll-smooth">
            {currentLesson ? (
                <div className="max-w-5xl mx-auto p-4 md:p-8 lg:p-12 pb-32">
                    {/* Tabs */}
                    <div className="flex items-center gap-2 md:gap-4 mb-8 border-b border-neutral-800 pb-2 overflow-x-auto scrollbar-hide">
                        <button onClick={() => setIsArticlesOpen(true)} className="text-neutral-300 hover:text-white hover:bg-neutral-900 px-4 py-2 rounded-t-md transition-all text-xs md:text-sm font-bold uppercase tracking-widest flex items-center gap-2 border-b-2 border-transparent hover:border-red-600/50"><FileText className="w-4 h-4 md:hidden" />Статьи</button>
                        <button onClick={handleOpenDictionary} className="text-neutral-300 hover:text-white hover:bg-neutral-900 px-4 py-2 rounded-t-md transition-all text-xs md:text-sm font-bold uppercase tracking-widest flex items-center gap-2 border-b-2 border-transparent hover:border-red-600/50"><Book className="w-4 h-4 md:hidden" />Словарь</button>
                        <button className="text-neutral-300 hover:text-white hover:bg-neutral-900 px-4 py-2 rounded-t-md transition-all text-xs md:text-sm font-bold uppercase tracking-widest border-b-2 border-transparent hover:border-red-600/50">Навадзу</button>
                        <button onClick={handleOpenMarketplace} className="text-neutral-300 hover:text-white hover:bg-neutral-900 px-4 py-2 rounded-t-md transition-all text-xs md:text-sm font-bold uppercase tracking-widest flex items-center gap-2 border-b-2 border-transparent hover:border-red-600/50"><ShoppingBag className="w-4 h-4 md:hidden" />Маркет</button>
                    </div>

                    {/* Lesson Header */}
                    <div className="mb-6 md:mb-8 flex justify-between items-end">
                        <div className="pr-0 md:pr-12 w-full"><span className="text-red-500 font-bold tracking-wider text-[10px] md:text-xs uppercase bg-red-950/30 px-2 py-1 rounded border border-red-900/30">Текущий урок</span><h2 className="text-2xl md:text-4xl font-extrabold text-white mt-3 leading-tight">{currentLesson.title}</h2></div>
                    </div>

                    <VideoPlayer url={currentLesson.videoUrl} />

                    {/* Related Articles Cards */}
                    {relatedArticlesData.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                            {relatedArticlesData.map((article) => (
                                <button key={article.id} onClick={() => handleOpenArticle(article)} className="block w-full text-left p-3 bg-neutral-900 rounded-lg border border-neutral-800 hover:border-red-600 transition-all duration-300 group shadow-md">
                                    <div className="flex items-start justify-between gap-2 mb-1"><h4 className="text-xs md:text-sm font-bold text-red-600 group-hover:text-red-500 line-clamp-1 leading-tight">{article.title}</h4><ArrowRight className="w-3 h-3 text-neutral-600 group-hover:text-red-500 transform -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" /></div>
                                    <p className="text-[10px] text-neutral-500 line-clamp-2 leading-relaxed">{article.description || 'Нет описания'}</p>
                                </button>
                            ))}
                        </div>
                    )}
                    
                    <TextContent paragraphs={currentLesson.content} dictionary={dictionary} onWordClick={(term) => setSelectedTerm(term)}/>
                    
                    <div className="mt-12 pt-8 border-t border-neutral-800 text-center text-neutral-600 text-sm"><p>Shibari School &copy; 2023.</p></div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-neutral-500 p-4 text-center"><p>Нет доступных уроков. Добавьте их в настройках.</p></div>
            )}
        </div>
      </main>

      <DictionaryDrawer term={selectedTerm} dictionary={dictionary} onClose={() => setSelectedTerm(null)} />
      <GlossaryModal isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} dictionary={dictionary} />
      <ArticlesModal isOpen={isArticlesOpen} onClose={() => setIsArticlesOpen(false)} articles={articles} lessons={lessons} onSelectArticle={handleOpenArticle} />
      <ArticleReader article={selectedArticle} onClose={() => { setSelectedArticle(null); setIsArticlesOpen(true); }} />
      <MarketplaceModal 
        isOpen={isMarketplaceOpen} 
        onClose={() => setIsMarketplaceOpen(false)} 
        products={products}
        cart={cart}
        addToCart={addToCart}
        openCart={() => setIsCartOpen(true)}
      />
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        userProfile={userProfile}
        onUpdateQuantity={updateCartQuantity}
        onRemove={removeFromCart}
        onClear={clearCart}
      />
      
      {/* Auth Modal Overlay */}
      {isAuthModalOpen && (
          <AuthOverlay 
            onLoginSuccess={() => setIsAuthModalOpen(false)} 
            onClose={() => setIsAuthModalOpen(false)} 
          />
      )}
      
      {userProfile?.system_role === 'admin' && (
          <SettingsModal 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)}
            lessons={lessons}
            dictionary={dictionary}
            articles={articles}
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
