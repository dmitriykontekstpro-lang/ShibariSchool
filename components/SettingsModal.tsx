import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, Save, FileText, Video, Type, RefreshCw, Link, PenTool, Users, CheckCircle, XCircle, ChevronDown, Loader2, Check, BarChart, Code, Activity, Eye, Monitor, Clock, ShoppingCart, Globe, Filter, List, Database, ShoppingBag, ClipboardList, Package, Calendar, DollarSign, ArrowLeft } from 'lucide-react';
import { DictionaryEntry, Lesson, Article, UserProfile, AppSettings, MetricRule, MetricType, Product } from '../types';
import ArticleConstructor from './ArticleConstructor';
import MarketplaceManager from './MarketplaceManager';
import { supabase } from '../supabaseClient';
import BehaviorTracker, { AdvancedSessionMetrics } from '../utils/BehaviorTracker';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessons: Lesson[];
  dictionary: DictionaryEntry[];
  articles: Article[];
  onUpdateLesson: (id: number, data: Partial<Lesson>) => void;
  onAddLesson: () => void;
  onRemoveLesson: (id: number) => void;
  onAddWord: (entry: DictionaryEntry) => void;
  onRemoveWord: (term: string) => void;
  onResetToDefaults: () => void;
  onArticlesRefresh: () => void; 
}

// --- CRM Constants ---

type ColumnKey = 
  | 'full_name'
  | 'shibari_role'
  | 'orders_history_btn'
  | 'country'
  | 'city'
  | 'is_subscription_active'
  | 'rope_purchases_count'
  | 'rope_purchases_total_amount'
  | 'total_time_on_site_minutes'
  | 'total_revenue_usd'
  | 'utm_source'
  | 'utm_campaign'
  | 'subscription_months';

interface ColumnConfig {
  key: ColumnKey;
  label: string;
  width?: string;
  render: (u: UserProfile) => React.ReactNode;
}

const DEFAULT_COLUMN_KEYS: ColumnKey[] = [
    'full_name', 
    'shibari_role', 
    'orders_history_btn',
    'is_subscription_active', 
    'rope_purchases_total_amount', 
    'total_revenue_usd', 
    'utm_source',
    'subscription_months'
];

interface MetricDefinition {
    key: string;
    label: string;
    type: MetricType;
    path: string;
    category: 'Behavior' | 'Context' | 'Ecommerce' | 'Time' | 'Source';
}

const METRIC_DEFINITIONS: MetricDefinition[] = [
    // Behavior
    { key: 'page_views', label: 'Просмотры страниц', type: 'range', path: 'behavior.total_pageviews', category: 'Behavior' },
    { key: 'clicks', label: 'Количество кликов', type: 'range', path: 'behavior.click_count', category: 'Behavior' },
    { key: 'scroll_depth', label: 'Глубина скролла (%)', type: 'threshold', path: 'behavior.max_scroll_depth', category: 'Behavior' },
    { key: 'avg_time_page', label: 'Ср. время на стр. (сек)', type: 'time', path: 'behavior.avg_time_per_page', category: 'Behavior' },
    { key: 'search_used', label: 'Использовал поиск', type: 'boolean', path: 'behavior.site_search_usage', category: 'Behavior' },
    { key: 'filter_used', label: 'Использовал фильтры', type: 'boolean', path: 'behavior.filter_usage', category: 'Behavior' },

    // Context
    { key: 'device', label: 'Устройство', type: 'select', path: 'context.device_category', category: 'Context' },
    { key: 'os', label: 'ОС', type: 'select', path: 'context.os_type', category: 'Context' },
    { key: 'browser_lang', label: 'Язык браузера', type: 'select', path: 'context.browser_language', category: 'Context' },
    { key: 'is_wifi', label: 'Wi-Fi', type: 'boolean', path: 'context.is_wifi', category: 'Context' },
    { key: 'resolution', label: 'Разрешение экрана', type: 'select', path: 'context.screen_resolution', category: 'Context' },

    // Ecommerce / Engagement
    { key: 'products_viewed', label: 'Просмотрено уроков/товаров', type: 'range', path: 'ecommerce.viewed_product_count', category: 'Ecommerce' },
    { key: 'cart_adds', label: 'Добавлений в корзину', type: 'range', path: 'ecommerce.cart_adds_count', category: 'Ecommerce' },
    { key: 'cart_removes', label: 'Удалений из корзины', type: 'range', path: 'ecommerce.cart_removes_count', category: 'Ecommerce' },
    { key: 'avg_price', label: 'Ср. цена интереса', type: 'range', path: 'ecommerce.avg_price_viewed', category: 'Ecommerce' },
    { key: 'reviews_read', label: 'Читал отзывы', type: 'boolean', path: 'ecommerce.reviews_read', category: 'Ecommerce' },

    // Temporal / Time
    { key: 'active_time', label: 'Активное время (сек)', type: 'time', path: '_internal.active_seconds', category: 'Time' },
    { key: 'total_time', label: 'Общее время сессии (сек)', type: 'time', path: '_internal.total_seconds', category: 'Time' },
    { key: 'hour', label: 'Час суток (0-23)', type: 'range', path: 'temporal.hour_of_day', category: 'Time' },
    { key: 'day_week', label: 'День недели (0=Вс)', type: 'range', path: 'temporal.day_of_week', category: 'Time' },
    { key: 'work_hours', label: 'Рабочее время', type: 'boolean', path: 'temporal.is_work_hours', category: 'Time' },
    { key: 'return_time', label: 'Часов с прошлого визита', type: 'range', path: 'temporal.time_since_last_visit_hours', category: 'Time' },

    // Source
    { key: 'source', label: 'Источник трафика', type: 'select', path: 'source.traffic_source', category: 'Source' },
    { key: 'referrer', label: 'Реферрер (Домен)', type: 'select', path: 'source.referrer_domain', category: 'Source' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, lessons, dictionary, articles, 
  onUpdateLesson, onAddLesson, onRemoveLesson, 
  onAddWord, onRemoveWord, onResetToDefaults, onArticlesRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'dict' | 'constructor' | 'users' | 'analytics' | 'behavior' | 'marketplace'>('video');
  const [newTerm, setNewTerm] = useState('');
  const [newDef, setNewDef] = useState('');

  // CRM State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<ColumnKey[]>(DEFAULT_COLUMN_KEYS);
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);
  const [viewingHistoryUser, setViewingHistoryUser] = useState<UserProfile | null>(null);

  // Analytics & Behavior State
  const [appSettings, setAppSettings] = useState<AppSettings>({ 
      gtm_id: '', 
      yandex_id: '', 
      custom_html_body: '', 
      gold_user_threshold_minutes: 5,
      gold_config: [] 
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [selectOptions, setSelectOptions] = useState<Record<string, string[]>>({});
  
  // Realtime Debugger State
  const [realtimeMetrics, setRealtimeMetrics] = useState<AdvancedSessionMetrics | null>(null);

  // Marketplace State
  const [products, setProducts] = useState<Product[]>([]);

  // Columns Configuration (Moved inside to access state handlers)
  const allColumns: ColumnConfig[] = useMemo(() => [
    { 
        key: 'full_name', 
        label: 'Имя пользователя', 
        width: 'w-48',
        render: (u) => <span className="font-bold text-white truncate block" title={u.full_name}>{u.full_name || 'Аноним'}</span> 
    },
    {
        key: 'orders_history_btn',
        label: 'История',
        width: 'w-24',
        render: (u) => (
            <button
                onClick={() => setViewingHistoryUser(u)}
                className="flex items-center gap-2 text-[10px] font-bold bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-neutral-600 text-white px-2 py-1 rounded transition-colors"
                title="Посмотреть историю заказов"
            >
                <ClipboardList className="w-3 h-3 text-red-500" />
                <span className="min-w-[12px] text-center">{u.orders_history?.length || 0}</span>
            </button>
        )
    },
    { 
        key: 'shibari_role', 
        label: 'Роль', 
        width: 'w-24',
        render: (u) => <span className="text-[10px] uppercase bg-neutral-800 px-2 py-1 rounded border border-neutral-700">{u.shibari_role}</span> 
    },
    { 
        key: 'country', 
        label: 'Страна', 
        width: 'w-24',
        render: (u) => u.country || '-' 
    },
    { 
        key: 'city', 
        label: 'Город', 
        width: 'w-24',
        render: (u) => u.city || '-' 
    },
    { 
      key: 'is_subscription_active', 
      label: 'Активность', 
      width: 'w-24 text-center',
      render: (u) => u.is_subscription_active 
          ? <div className="flex justify-center"><CheckCircle className="w-5 h-5 text-red-600" /></div>
          : <div className="flex justify-center"><CheckCircle className="w-5 h-5 text-neutral-700" /></div>
    },
    { 
        key: 'rope_purchases_count', 
        label: 'Веревки (шт)', 
        width: 'w-28 text-center',
        render: (u) => <span className="text-neutral-300">{u.rope_purchases_count || 0}</span>
    },
    { 
        key: 'rope_purchases_total_amount', 
        label: 'Веревки ($)', 
        width: 'w-28 text-right',
        render: (u) => <span className="font-mono text-neutral-300">${u.rope_purchases_total_amount || 0}</span> 
    },
    { 
        key: 'total_time_on_site_minutes', 
        label: 'Время на сайте', 
        width: 'w-32',
        render: (u) => {
            const mins = u.total_time_on_site_minutes || 0;
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            return <span className="text-xs text-neutral-400">{h}ч {m}м</span>;
        }
    },
    { 
        key: 'total_revenue_usd', 
        label: 'LTV ($)', 
        width: 'w-28 text-right',
        render: (u) => <span className="text-green-500 font-mono font-bold">${u.total_revenue_usd || 0}</span> 
    },
    { 
        key: 'utm_source', 
        label: 'UTM Source', 
        width: 'w-32',
        render: (u) => <span className="text-[10px] text-neutral-500 truncate block" title={u.utm_source}>{u.utm_source || '-'}</span> 
    },
    { 
        key: 'utm_campaign', 
        label: 'UTM Campaign', 
        width: 'w-32',
        render: (u) => <span className="text-[10px] text-neutral-500 truncate block" title={u.utm_campaign}>{u.utm_campaign || '-'}</span> 
    },
    { 
        key: 'subscription_months', 
        label: 'Срок подписки', 
        width: 'w-28 text-center',
        render: (u) => <span className="text-neutral-300">{u.subscription_months || 0} мес.</span> 
    },
  ], []);

  useEffect(() => {
    if (isOpen) {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'analytics' || activeTab === 'behavior') {
            fetchSettings();
            if (activeTab === 'behavior') fetchSelectOptions();
        }
        if (activeTab === 'marketplace') fetchProducts();
    }
  }, [isOpen, activeTab]);

  // Poll metrics for debugging
  useEffect(() => {
    let interval: any;
    if (isOpen && activeTab === 'behavior') {
        const updateMetrics = () => {
            const m = BehaviorTracker.getMetrics();
            setRealtimeMetrics({ ...m }); // Clone to trigger re-render
        };
        updateMetrics(); // Initial
        interval = setInterval(updateMetrics, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, activeTab]);

  const fetchUsers = async () => {
      if (!supabase) return;
      setIsLoadingUsers(true);
      try {
          const { data, error } = await supabase
            .from('user_shibari')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          setUsers(data as UserProfile[]);
      } catch (e) {
          console.error("Error fetching users:", e);
      } finally {
          setIsLoadingUsers(false);
      }
  };

  const fetchSettings = async () => {
      if (!supabase) return;
      try {
          const { data, error } = await supabase
             .from('app_settings')
             .select('*')
             .limit(1)
             .maybeSingle();

          if (!error && data) {
              setAppSettings({
                  ...data,
                  gold_config: Array.isArray(data.gold_config) ? data.gold_config : []
              });
          }
      } catch (e) {
          console.error("Settings fetch error:", e);
      }
  };

  const fetchProducts = async () => {
      if (!supabase) return;
      try {
          const { data, error } = await supabase.from('market_shibari').select('*').order('created_at', { ascending: false });
          if (data) {
             // Force temporary image replacement for admin view as well
             const tempImage = "https://ae-pic-a1.aliexpress-media.com/kf/S495d509b0d07444e90c460039d83ac94b.jpg";
             const fixedProducts = data.map((p: any) => ({
                 ...p,
                 images: p.images && p.images.length > 0 
                     ? p.images.map(() => tempImage) 
                     : [tempImage]
             }));
             setProducts(fixedProducts);
          }
      } catch (e) { console.error(e); }
  };

  const fetchSelectOptions = async () => {
      if (!supabase) return;
      // Fetch some recent logs to populate dropdowns
      try {
          const { data } = await supabase
            .from('user_behavior_logs_shibari')
            .select('log_data')
            .order('updated_at', { ascending: false })
            .limit(50);
          
          if (!data) return;

          const options: Record<string, Set<string>> = {
              'context.device_category': new Set(['mobile', 'desktop', 'tablet']),
              'context.os_type': new Set(['Windows', 'macOS', 'iOS', 'Android', 'Linux']),
              'source.traffic_source': new Set(['direct', 'organic_search', 'social', 'referral']),
          };

          // Parse logs for extra values
          data.forEach((row: any) => {
               try {
                   const ld = row.log_data;
                   if (ld.context?.os_type) options['context.os_type'].add(ld.context.os_type);
                   if (ld.source?.traffic_source) options['source.traffic_source'].add(ld.source.traffic_source);
               } catch (e) {}
          });

          setSelectOptions({
              'context.device_category': Array.from(options['context.device_category']),
              'context.os_type': Array.from(options['context.os_type']),
              'source.traffic_source': Array.from(options['source.traffic_source']),
          });

      } catch (e) { console.error(e); }
  };

  const handleSaveSettings = async () => {
      if (!supabase) return;
      setIsSavingSettings(true);
      try {
          const payload = { ...appSettings };
          if (!payload.id) delete payload.id;
          const upsertPayload = { ...payload, id: 1 };

          const { error } = await supabase
            .from('app_settings')
            .upsert(upsertPayload);

          if (error) throw error;
          
          // Re-init tracker with new settings immediately
          if (appSettings.gold_config) {
              BehaviorTracker.init(null, { goldConfig: appSettings.gold_config });
          }
          
          alert("Настройки сохранены!");

      } catch (e: any) {
          console.error(e);
          // (Error handling omitted for brevity - same as previous)
          alert("Ошибка сохранения: " + e.message);
      } finally {
          setIsSavingSettings(false);
      }
  };

  // --- Rule Management ---

  const addRule = (def: MetricDefinition) => {
      const newRule: MetricRule = {
          id: Math.random().toString(36).substr(2, 9),
          metricPath: def.path,
          label: def.label,
          type: def.type,
          value: def.type === 'boolean' ? 'true' : (def.type === 'time' ? 60 : (def.type === 'select' ? '' : undefined))
      };
      setAppSettings(prev => ({
          ...prev,
          gold_config: [...(prev.gold_config || []), newRule]
      }));
  };

  const removeRule = (id: string) => {
      setAppSettings(prev => ({
          ...prev,
          gold_config: prev.gold_config?.filter(r => r.id !== id) || []
      }));
  };

  const updateRule = (id: string, field: keyof MetricRule, val: any) => {
      setAppSettings(prev => ({
          ...prev,
          gold_config: prev.gold_config?.map(r => r.id === id ? { ...r, [field]: val } : r) || []
      }));
  };

  // --- Render Helpers ---

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTerm && newDef) {
      onAddWord({ term: newTerm.trim(), definition: newDef.trim() });
      setNewTerm('');
      setNewDef('');
    }
  };

  const handleArticleSelect = (lesson: Lesson, slotIndex: number, articleId: string) => {
    const currentArticles = [...(lesson.relatedArticles || [])];
    while (currentArticles.length <= slotIndex) {
        currentArticles.push(0);
    }
    if (articleId === "") {
        currentArticles[slotIndex] = 0;
    } else {
        currentArticles[slotIndex] = parseInt(articleId);
    }
    const cleanArticles = currentArticles.filter(id => id !== 0);
    onUpdateLesson(lesson.id, { relatedArticles: cleanArticles });
  };

  const getArticleValue = (lesson: Lesson, index: number) => {
    return lesson.relatedArticles && lesson.relatedArticles[index] ? lesson.relatedArticles[index] : "";
  };

  const toggleColumn = (key: ColumnKey) => {
      if (selectedColumns.includes(key)) {
          if (selectedColumns.length > 1) {
              setSelectedColumns(prev => prev.filter(k => k !== key));
          }
      } else {
          if (selectedColumns.length < 7) {
              setSelectedColumns(prev => [...prev, key]);
          }
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 w-full h-full md:h-[90vh] md:max-w-7xl md:rounded-2xl flex flex-col shadow-2xl overflow-hidden border-none md:border border-neutral-800">
        {/* Header */}
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-neutral-800 shrink-0 bg-neutral-900">
          <h2 className="text-xl md:text-2xl font-bold text-white">Настройки приложения</h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-full transition-colors">
            <X className="w-6 h-6 text-neutral-400 hover:text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-800 px-4 md:px-6 shrink-0 overflow-x-auto scrollbar-hide">
            <button 
                onClick={() => setActiveTab('video')}
                className={`py-3 md:py-4 px-4 md:px-6 font-medium text-sm transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'video' ? 'border-red-600 text-red-500' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
            >
                <Video className="w-4 h-4" /> Уроки
            </button>
            <button 
                onClick={() => setActiveTab('dict')}
                className={`py-3 md:py-4 px-4 md:px-6 font-medium text-sm transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'dict' ? 'border-red-600 text-red-500' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
            >
                <Type className="w-4 h-4" /> Словарь
            </button>
            <button 
                onClick={() => setActiveTab('constructor')}
                className={`py-3 md:py-4 px-4 md:px-6 font-medium text-sm transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'constructor' ? 'border-red-600 text-red-500' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
            >
                <PenTool className="w-4 h-4" /> Конструктор
            </button>
            <button 
                onClick={() => setActiveTab('marketplace')}
                className={`py-3 md:py-4 px-4 md:px-6 font-medium text-sm transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'marketplace' ? 'border-red-600 text-red-500' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
            >
                <ShoppingBag className="w-4 h-4" /> Магазин
            </button>
            <button 
                onClick={() => setActiveTab('users')}
                className={`py-3 md:py-4 px-4 md:px-6 font-medium text-sm transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'users' ? 'border-red-600 text-red-500' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
            >
                <Users className="w-4 h-4" /> CRM
            </button>
            <button 
                onClick={() => setActiveTab('analytics')}
                className={`py-3 md:py-4 px-4 md:px-6 font-medium text-sm transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'analytics' ? 'border-red-600 text-red-500' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
            >
                <BarChart className="w-4 h-4" /> Аналитика
            </button>
            <button 
                onClick={() => setActiveTab('behavior')}
                className={`py-3 md:py-4 px-4 md:px-6 font-medium text-sm transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'behavior' ? 'border-red-600 text-red-500' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
            >
                <Activity className="w-4 h-4" /> Поведение
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-black/20">
            {activeTab === 'video' && (
                <div className="space-y-8">
                     {/* Lesson management code (omitted for brevity, assume existing) */}
                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <p className="text-neutral-400 text-sm md:text-base">Управляйте списком модулей и их содержанием.</p>
                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <button onClick={onResetToDefaults} className="bg-neutral-900 hover:bg-red-950 text-neutral-400 hover:text-red-400 px-4 py-3 md:py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-neutral-800 w-full md:w-auto">
                                <RefreshCw className="w-4 h-4" /> Сбросить
                            </button>
                            <button onClick={onAddLesson} className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-3 md:py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-neutral-700 w-full md:w-auto">
                                <Plus className="w-4 h-4" /> Добавить
                            </button>
                        </div>
                    </div>
                     {lessons.map(lesson => (
                            <div key={lesson.id} className="bg-neutral-900 p-4 md:p-6 rounded-xl border border-neutral-800 shadow-sm flex flex-col gap-5 hover:border-neutral-700 transition-colors group">
                                <div className="flex items-center justify-between pb-3 border-b border-neutral-800/50">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-6 h-6 rounded bg-red-900/30 text-red-500 text-xs font-bold">
                                            {lesson.id}
                                        </div>
                                        <span className="font-bold text-neutral-300 text-sm uppercase tracking-wide">Модуль</span>
                                    </div>
                                    <button onClick={() => { if(window.confirm('Удалить?')) onRemoveLesson(lesson.id); }} className="p-2 text-neutral-600 hover:text-red-500 hover:bg-red-950/30 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-neutral-500 uppercase">Название</label>
                                    <input type="text" value={lesson.title} onChange={(e) => onUpdateLesson(lesson.id, { title: e.target.value })} className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg outline-none text-white text-sm" />
                                </div>
                                <div className="space-y-3 p-4 bg-neutral-950/50 rounded-lg border border-neutral-800/50">
                                    <label className="text-xs font-bold text-neutral-500 uppercase flex items-center gap-2 mb-2">
                                        <Link className="w-3 h-3" /> Прикрепленные статьи (до 4-х)
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                        {[0, 1, 2, 3].map((slot) => (
                                            <div key={slot} className="space-y-1">
                                                <span className="text-[10px] text-neutral-600 uppercase font-bold pl-1">Слот {slot + 1}</span>
                                                <select
                                                    value={getArticleValue(lesson, slot)}
                                                    onChange={(e) => handleArticleSelect(lesson, slot, e.target.value)}
                                                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-xs text-white focus:ring-1 focus:ring-red-600 outline-none"
                                                >
                                                    <option value="">-- Не выбрано --</option>
                                                    {articles.map((article) => (
                                                        <option key={article.id} value={article.id}>
                                                            {article.title}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                     ))}
                </div>
            )}

            {/* (Omitted tabs: dict, constructor, users, analytics - same as before) */}
            {activeTab === 'dict' && (
                 <div className="space-y-6">
                     <p className="text-neutral-400 mb-4 text-sm md:text-base">Добавьте слова в общий словарь.</p>
                     <form onSubmit={handleAddWord} className="bg-neutral-900 p-4 md:p-6 rounded-xl border border-red-900/30 mb-8 sticky top-0 z-10 shadow-lg flex gap-4">
                        <input value={newTerm} onChange={e => setNewTerm(e.target.value)} placeholder="Слово" className="w-1/3 px-4 py-3 bg-neutral-800 rounded-lg border border-neutral-700 text-white" required />
                        <input value={newDef} onChange={e => setNewDef(e.target.value)} placeholder="Определение" className="flex-1 px-4 py-3 bg-neutral-800 rounded-lg border border-neutral-700 text-white" required />
                        <button type="submit" className="bg-red-700 text-white px-6 py-3 rounded-lg"><Save className="w-4 h-4" /></button>
                     </form>
                     <div className="space-y-2">
                        {dictionary.map((entry, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-neutral-900 p-3 rounded border border-neutral-800">
                                <div><span className="text-white font-bold">{entry.term}</span> <span className="text-neutral-400 text-sm ml-2">{entry.definition}</span></div>
                                <button onClick={() => onRemoveWord(entry.term)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))}
                     </div>
                 </div>
            )}
            
            {activeTab === 'constructor' && <ArticleConstructor articles={articles} onSave={onArticlesRefresh} />}

            {activeTab === 'marketplace' && <MarketplaceManager products={products} onSave={fetchProducts} />}

            {activeTab === 'users' && (
                <div className="space-y-6 h-full flex flex-col">
                    {viewingHistoryUser ? (
                        <div className="flex flex-col h-full space-y-6 animate-in slide-in-from-right duration-300">
                            <div className="flex items-center gap-4 pb-4 border-b border-neutral-800 shrink-0">
                                <button onClick={() => setViewingHistoryUser(null)} className="text-neutral-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
                                    <ArrowLeft className="w-4 h-4" /> Назад к списку
                                </button>
                                <div className="h-6 w-px bg-neutral-800" />
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Users className="w-5 h-5 text-neutral-500" /> 
                                    История заказов: <span className="text-red-500">{viewingHistoryUser.full_name}</span>
                                </h3>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2">
                                {(!viewingHistoryUser.orders_history || viewingHistoryUser.orders_history.length === 0) ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                                        <Package className="w-12 h-12 mb-4 opacity-20" />
                                        <p>Пользователь еще ничего не заказывал.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {viewingHistoryUser.orders_history.map((order, idx) => (
                                            <div key={order.id || idx} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                                                {/* Order Header */}
                                                <div className="bg-neutral-800/50 p-4 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] uppercase font-bold text-neutral-500">Номер заказа</span>
                                                            <span className="text-white font-mono text-sm">{order.id}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] uppercase font-bold text-neutral-500">Дата</span>
                                                            <span className="text-neutral-300 text-sm flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" />
                                                                {new Date(order.date).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${order.status === 'new' ? 'bg-blue-900/20 text-blue-400 border-blue-900/50' : 'bg-green-900/20 text-green-400 border-green-900/50'}`}>
                                                            {order.status === 'new' ? 'Новый' : order.status}
                                                        </span>
                                                        <div className="text-right">
                                                            <span className="text-[10px] uppercase font-bold text-neutral-500 block">Итого</span>
                                                            <span className="text-white font-bold text-lg font-mono flex items-center justify-end gap-1">
                                                                <DollarSign className="w-4 h-4 text-green-500" />{order.total_amount}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Order Items */}
                                                <div className="p-4 space-y-2">
                                                    {order.items.map((item, i) => (
                                                        <div key={i} className="flex justify-between items-center py-2 border-b border-neutral-800/50 last:border-0 last:pb-0">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center text-neutral-500 text-xs font-bold">
                                                                    x{item.quantity}
                                                                </div>
                                                                <span className="text-neutral-300 text-sm font-medium">{item.title}</span>
                                                            </div>
                                                            <span className="text-neutral-400 font-mono text-sm">${item.price * item.quantity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between shrink-0">
                                <h3 className="text-lg font-bold text-white">Список пользователей</h3>
                                <div className="relative z-20">
                                    <button onClick={() => setIsColumnSelectorOpen(!isColumnSelectorOpen)} className="flex items-center gap-2 bg-neutral-800 px-4 py-2 rounded-lg text-sm border border-neutral-700">Столбцы <ChevronDown className="w-4 h-4" /></button>
                                    {isColumnSelectorOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-72 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-4 z-50">
                                            {allColumns.map(col => (
                                                <label key={col.key} className="flex items-center gap-3 p-2 hover:bg-neutral-800 cursor-pointer">
                                                    <input type="checkbox" checked={selectedColumns.includes(col.key)} onChange={() => toggleColumn(col.key)} className="accent-red-600" />
                                                    <span className="text-sm text-neutral-300">{col.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {isLoadingUsers ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-600" /> : (
                                <div className="overflow-x-auto flex-1 bg-neutral-900 rounded-xl border border-neutral-800">
                                    <table className="w-full text-left">
                                        <thead className="bg-neutral-800 text-neutral-400 text-xs font-bold uppercase">
                                            <tr>
                                                {selectedColumns.map(key => <th key={key} className="p-3">{allColumns.find(c => c.key === key)?.label}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-800">
                                            {users.map(user => (
                                                <tr key={user.id} className="hover:bg-neutral-800/50">
                                                    {selectedColumns.map(key => <td key={key} className="p-3 text-sm text-neutral-300 border-r border-neutral-800/30">{allColumns.find(c => c.key === key)?.render(user)}</td>)}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {activeTab === 'analytics' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Code className="w-5 h-5 text-red-500"/> Коды отслеживания</h3>
                        <button onClick={handleSaveSettings} disabled={isSavingSettings} className="bg-red-700 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50">
                            {isSavingSettings ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />} Сохранить
                        </button>
                    </div>
                    <div className="grid gap-6">
                        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl space-y-3">
                            <label className="text-sm font-bold text-neutral-300 uppercase block">Google Tag Manager (GTM ID)</label>
                            <input value={appSettings.gtm_id?.replace('GTM-', '') || ''} onChange={(e) => setAppSettings(prev => ({ ...prev, gtm_id: 'GTM-' + e.target.value.replace('GTM-', '') }))} placeholder="XXXXXX" className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white font-mono outline-none" />
                        </div>
                        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl space-y-3">
                            <label className="text-sm font-bold text-neutral-300 uppercase block">Яндекс Метрика (Counter ID)</label>
                            <input value={appSettings.yandex_id || ''} onChange={(e) => setAppSettings(prev => ({ ...prev, yandex_id: e.target.value }))} placeholder="12345678" className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white font-mono outline-none" />
                        </div>
                        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl space-y-3">
                            <label className="text-sm font-bold text-neutral-300 uppercase block">Произвольный HTML</label>
                            <textarea value={appSettings.custom_html_body || ''} onChange={(e) => setAppSettings(prev => ({ ...prev, custom_html_body: e.target.value }))} placeholder="<script>...</script>" rows={6} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-300 font-mono text-xs outline-none" />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'behavior' && (
                <div className="space-y-6">
                     <div className="flex items-center justify-between mb-4">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Activity className="w-5 h-5 text-yellow-500"/> Поведение (Tracker)</h3>
                            <p className="text-sm text-neutral-400">Настройки и мониторинг активности пользователей.</p>
                        </div>
                        <button onClick={handleSaveSettings} disabled={isSavingSettings} className="bg-red-700 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50">
                            {isSavingSettings ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />} Сохранить
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* RULES BUILDER */}
                        <div className="bg-neutral-900 border border-yellow-900/30 p-6 rounded-xl space-y-6 h-full">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-yellow-900/20 rounded-full border border-yellow-700/30">
                                    <Activity className="w-6 h-6 text-yellow-500" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-white text-lg">Критерии Золотого Пользователя</h4>
                                    <p className="text-neutral-400 text-sm leading-relaxed mt-1">
                                        Статус "Gold" присваивается при совпадении <strong>всех</strong> условий.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {(appSettings.gold_config || []).length === 0 ? (
                                    <div className="p-4 border border-dashed border-neutral-700 rounded-lg text-center text-neutral-500 text-sm">
                                        Правила не заданы.
                                    </div>
                                ) : (
                                    (appSettings.gold_config || []).map((rule, idx) => (
                                        <div key={rule.id} className="flex flex-col items-start gap-2 bg-black/40 p-3 rounded-lg border border-neutral-800">
                                            <div className="flex w-full items-center justify-between">
                                                 <div className="flex items-center gap-2">
                                                    <span className="bg-neutral-800 text-[10px] font-bold text-neutral-400 px-1.5 py-0.5 rounded uppercase">{idx === 0 ? 'ЕСЛИ' : 'И'}</span>
                                                    <span className="text-sm font-medium text-white">{rule.label}</span>
                                                 </div>
                                                 <button onClick={() => removeRule(rule.id)} className="text-neutral-600 hover:text-red-500"><X className="w-4 h-4"/></button>
                                            </div>
                                            
                                            <div className="w-full flex items-center gap-2 pl-8">
                                                {rule.type === 'range' && (
                                                    <>
                                                        <input type="number" placeholder="От" value={rule.min ?? ''} onChange={(e) => updateRule(rule.id, 'min', Number(e.target.value))} className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-white text-xs" />
                                                        <span className="text-neutral-500">-</span>
                                                        <input type="number" placeholder="До" value={rule.max ?? ''} onChange={(e) => updateRule(rule.id, 'max', Number(e.target.value))} className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-white text-xs" />
                                                    </>
                                                )}
                                                {(rule.type === 'threshold' || rule.type === 'time') && (
                                                    <>
                                                        <span className="text-neutral-500">≥</span>
                                                        <input type="number" value={rule.value as number ?? ''} onChange={(e) => updateRule(rule.id, 'value', Number(e.target.value))} className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-white text-xs" />
                                                        <span className="text-neutral-500 text-xs">{rule.type === 'threshold' ? '%' : 'сек'}</span>
                                                    </>
                                                )}
                                                {rule.type === 'select' && (
                                                    <select value={String(rule.value || '')} onChange={(e) => updateRule(rule.id, 'value', e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-white text-xs">
                                                        <option value="">-- Выбрать --</option>
                                                        {(selectOptions[rule.metricPath] || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                    </select>
                                                )}
                                                {rule.type === 'boolean' && (
                                                    <div className="flex gap-2 w-full">
                                                        <label className={`flex-1 text-center cursor-pointer text-xs py-1 rounded border ${rule.value === true || rule.value === 'true' ? 'bg-green-900/30 border-green-600 text-green-400' : 'bg-neutral-800 border-neutral-700 text-neutral-500'}`}><input type="radio" className="hidden" checked={rule.value === true || rule.value === 'true'} onChange={() => updateRule(rule.id, 'value', true)} />Да</label>
                                                        <label className={`flex-1 text-center cursor-pointer text-xs py-1 rounded border ${rule.value === false || rule.value === 'false' ? 'bg-red-900/30 border-red-600 text-red-400' : 'bg-neutral-800 border-neutral-700 text-neutral-500'}`}><input type="radio" className="hidden" checked={rule.value === false || rule.value === 'false'} onChange={() => updateRule(rule.id, 'value', false)} />Нет</label>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="relative pt-2">
                                <button className="flex items-center gap-2 text-sm text-yellow-500 hover:text-yellow-400 font-bold transition-colors peer w-full justify-center p-2 border border-dashed border-yellow-900/50 rounded-lg hover:bg-yellow-900/10">
                                    <Plus className="w-4 h-4" /> Добавить условие
                                </button>
                                <div className="hidden peer-hover:block hover:block absolute bottom-full left-0 z-50 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl w-64 max-h-60 overflow-y-auto mb-2">
                                    {METRIC_DEFINITIONS.map(def => (
                                        <button key={def.key} onClick={() => addRule(def)} className="w-full text-left px-4 py-2 text-xs text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors border-b border-neutral-700/50 last:border-none flex justify-between">
                                            {def.label} <span className="text-[10px] text-neutral-500">{def.category}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* FULL METRICS REFERENCE LIST */}
                        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl overflow-hidden flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-4 shrink-0">
                                <List className="w-5 h-5 text-neutral-500" />
                                <h4 className="font-bold text-white">Справочник характеристик</h4>
                            </div>
                            <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs">
                                {['Behavior', 'Ecommerce', 'Context', 'Time', 'Source'].map(cat => (
                                    <div key={cat}>
                                        <h5 className="text-[10px] uppercase font-bold text-neutral-500 mb-2 border-b border-neutral-800 pb-1">{cat}</h5>
                                        <div className="space-y-1">
                                            {METRIC_DEFINITIONS.filter(m => m.category === cat).map(m => (
                                                <div key={m.key} className="flex justify-between items-center py-1 group">
                                                    <span className="text-neutral-300 group-hover:text-white transition-colors">{m.label}</span>
                                                    <code className="text-[10px] text-neutral-600 font-mono bg-black/30 px-1 rounded">{m.type}</code>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* REALTIME DEBUGGER PANEL */}
                    <div className="bg-black/40 border border-neutral-800 p-4 md:p-6 rounded-xl mt-6">
                        <div className="flex items-center gap-2 mb-4 border-b border-neutral-800 pb-2">
                             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                             <h4 className="font-bold text-white uppercase text-xs tracking-widest">Live Session Debugger (Текущие метрики)</h4>
                        </div>
                        
                        {realtimeMetrics ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
                                {/* 1. CONTEXT */}
                                <div className="bg-neutral-900 p-3 rounded border border-neutral-800 space-y-2">
                                    <h5 className="text-neutral-500 font-bold flex items-center gap-2"><Monitor className="w-3 h-3"/> Context</h5>
                                    <div className="space-y-1 text-neutral-300">
                                        <div className="flex justify-between"><span>Device:</span> <span className="text-white">{realtimeMetrics.context.device_category}</span></div>
                                        <div className="flex justify-between"><span>OS:</span> <span className="text-white">{realtimeMetrics.context.os_type}</span></div>
                                        <div className="flex justify-between"><span>Res:</span> <span className="text-white">{realtimeMetrics.context.screen_resolution}</span></div>
                                        <div className="flex justify-between"><span>Wifi:</span> <span className={realtimeMetrics.context.is_wifi ? "text-green-500" : "text-neutral-600"}>{realtimeMetrics.context.is_wifi ? 'Yes' : '?'}</span></div>
                                    </div>
                                </div>
                                {/* 2. SOURCE & TIME */}
                                <div className="bg-neutral-900 p-3 rounded border border-neutral-800 space-y-2">
                                    <h5 className="text-neutral-500 font-bold flex items-center gap-2"><Globe className="w-3 h-3"/> Source / Time</h5>
                                    <div className="space-y-1 text-neutral-300">
                                        <div className="flex justify-between"><span>Source:</span> <span className="text-white truncate max-w-[80px]">{realtimeMetrics.source.traffic_source}</span></div>
                                        <div className="flex justify-between"><span>Total Time:</span> <span className={realtimeMetrics._internal.total_seconds < 30 ? "text-red-500" : "text-green-500"}>{realtimeMetrics._internal.total_seconds}s</span></div>
                                        <div className="flex justify-between"><span>Active:</span> <span className="text-yellow-500">{realtimeMetrics._internal.active_seconds}s</span></div>
                                        <div className="flex justify-between"><span>Hour:</span> <span className="text-white">{realtimeMetrics.temporal.hour_of_day}:00</span></div>
                                    </div>
                                </div>
                                {/* 3. BEHAVIOR */}
                                <div className="bg-neutral-900 p-3 rounded border border-neutral-800 space-y-2">
                                    <h5 className="text-neutral-500 font-bold flex items-center gap-2"><Eye className="w-3 h-3"/> Behavior</h5>
                                    <div className="space-y-1 text-neutral-300">
                                        <div className="flex justify-between"><span>Pages:</span> <span className="text-white">{realtimeMetrics.behavior.total_pageviews}</span></div>
                                        <div className="flex justify-between"><span>Clicks:</span> <span className="text-white">{realtimeMetrics.behavior.click_count}</span></div>
                                        <div className="flex justify-between"><span>Max Scroll:</span> <span className="text-white">{realtimeMetrics.behavior.max_scroll_depth}%</span></div>
                                        <div className="flex justify-between"><span>Avg Page:</span> <span className="text-white">{realtimeMetrics.behavior.avg_time_per_page.toFixed(0)}s</span></div>
                                    </div>
                                </div>
                                {/* 4. ECOMMERCE & CALC */}
                                <div className="bg-neutral-900 p-3 rounded border border-neutral-800 space-y-2">
                                    <h5 className="text-neutral-500 font-bold flex items-center gap-2"><ShoppingCart className="w-3 h-3"/> E-com / Calc</h5>
                                    <div className="space-y-1 text-neutral-300">
                                        <div className="flex justify-between"><span>Products:</span> <span className="text-white">{realtimeMetrics.ecommerce.viewed_product_count}</span></div>
                                        <div className="flex justify-between"><span>Scroll Speed:</span> <span className="text-white">{realtimeMetrics.calculated.scroll_speed.toFixed(0)}px/s</span></div>
                                        <div className="flex justify-between"><span>Idle Ratio:</span> <span className="text-white">{realtimeMetrics.calculated.idle_time_ratio}</span></div>
                                        <div className="flex justify-between"><span>Saved:</span> <span className={realtimeMetrics._internal.total_seconds >= 30 ? "text-green-500" : "text-red-500"}>{realtimeMetrics._internal.total_seconds >= 30 ? 'YES' : 'NO (<30s)'}</span></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-neutral-500 py-4">Waiting for tracker data...</div>
                        )}
                        
                        {realtimeMetrics && (
                            <div className="mt-4 pt-4 border-t border-neutral-800">
                                <h5 className="text-[10px] uppercase font-bold text-neutral-600 mb-2">History (Last Pages)</h5>
                                <div className="space-y-1 max-h-24 overflow-y-auto scrollbar-hide">
                                    {realtimeMetrics._internal.page_history.slice().reverse().map((p, i) => (
                                        <div key={i} className="flex justify-between text-[10px] text-neutral-400">
                                            <span className="truncate w-2/3">{p.path}</span>
                                            <span className="text-neutral-600">{p.timeOnPage > 0 ? p.timeOnPage.toFixed(1) + 's' : 'Active'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900 flex justify-end shrink-0">
            <button onClick={onClose} className="w-full md:w-auto px-6 py-3 md:py-2 bg-white text-neutral-900 rounded-lg hover:bg-gray-200 transition-colors font-medium shadow-lg">
                Готово
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;