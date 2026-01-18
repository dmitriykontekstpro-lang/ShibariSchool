
export interface DictionaryEntry {
  term: string;
  definition: string;
}

export type ArticleBlockType = 
  | 'header' 
  | 'lead' 
  | 'text_long' 
  | 'text_short' 
  | 'image_1' 
  | 'image_2' 
  | 'image_3' 
  | 'image_4';

export interface ArticleImage {
  url: string;
  caption?: string;
}

export interface ArticleBlock {
  id: string;
  type: ArticleBlockType;
  title?: string; // Для блоков с заголовками
  content?: string; // Текст
  images?: ArticleImage[]; // Массив картинок
}

export interface Article {
  id: number;
  title: string;
  url: string; // Ссылка на статью (внешняя или внутренняя)
  description?: string;
  content?: ArticleBlock[]; // JSON контент из конструктора
}

export interface Lesson {
  id: number;
  title: string;
  videoUrl: string;
  content: string[]; // Array of paragraphs
  relatedArticles?: number[]; // IDs of related articles (max 4)
}

export enum TabView {
  LESSONS = 'LESSONS',
  SETTINGS = 'SETTINGS'
}

// --- Marketplace Types ---

export interface ProductFAQ {
  question: string;
  answer: string;
}

export interface Product {
  id: number;
  title: string;
  color: string;
  description_short: string;
  description_long: string;
  price?: number;
  images: string[]; // URLs array
  video_url?: string;
  faq?: ProductFAQ[];
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: number;
  title: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  date: string; // ISO string
  total_amount: number;
  status: 'new' | 'processing' | 'completed' | 'cancelled';
  items: OrderItem[];
  customer_details?: {
    name: string;
    email: string;
    contact?: string;
  }
}

// --- Auth Types ---

export type ShibariRole = 'rigger' | 'model' | 'switch' | 'unknown';
export type ExperienceLevel = 'newbie' | 'beginner' | 'experienced' | 'expert';
export type SystemRole = 'admin' | 'user';

export interface UserProfile {
  id: string; // UUID from auth.users
  created_at: string;
  full_name: string;
  country: string;
  city: string;
  email: string; // Stored for convenience, though auth handles it
  shibari_role: ShibariRole;
  experience_level: ExperienceLevel;
  system_role: SystemRole;
  
  // CRM Fields
  is_subscription_active?: boolean;
  rope_purchases_count?: number;
  rope_purchases_total_amount?: number; // USD
  total_time_on_site_minutes?: number;
  total_revenue_usd?: number;
  utm_source?: string;
  utm_campaign?: string;
  subscription_months?: number;
  
  // History
  orders_history?: Order[];
}

// --- Settings Types ---

export type MetricType = 'range' | 'threshold' | 'time' | 'select' | 'boolean';

export interface MetricRule {
  id: string;
  metricPath: string; // e.g. 'behavior.max_scroll_depth'
  label: string;      // Human readable label
  type: MetricType;
  
  // Values based on type
  value?: string | number | boolean; // For threshold, time, select, boolean
  min?: number; // For range
  max?: number; // For range
}

export interface AppSettings {
  id?: number;
  gtm_id?: string;
  yandex_id?: string;
  custom_html_body?: string;
  gold_user_threshold_minutes?: number; // Legacy simple threshold
  gold_config?: MetricRule[]; // New flexible config
}
