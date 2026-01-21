
export interface DictionaryEntry {
  term: string;
  definition: string;
  term_en?: string;
  definition_en?: string;
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
  title_en?: string;
  url: string; // Ссылка на статью (внешняя или внутренняя)
  description?: string;
  description_en?: string;
  content?: ArticleBlock[]; // JSON контент из конструктора
}

export interface Lesson {
  id: number;
  title: string;
  title_en?: string;
  videoUrl: string;
  videoUrl_en?: string;
  content: string[]; // Array of paragraphs
  content_en?: string[];
  relatedArticles?: number[]; // IDs of related articles (max 4)
}

export enum TabView {
  LESSONS = 'LESSONS',
  SETTINGS = 'SETTINGS'
}

// --- Events / Poster Types ---

export interface AppEvent {
  id: number;
  title: string;
  description?: string;
  date: string; // ISO string or specific date format
  time?: string;
  location: string;
  image_url?: string;
  price?: string; // String to allow "Free", "100$", etc.
  registration_url?: string;
  created_at?: string;
}

// --- History Types ---

export interface HistoryEvent {
  id: number;
  date_display: string; // "1400-1600", "1905", etc.
  title_ru: string;
  title_en: string;
  description_ru: string;
  description_en: string;
  image_url?: string;
  created_at?: string;
}

// --- Marketplace Types ---

export interface ProductFAQ {
  question: string;
  answer: string;
}

export interface Product {
  id: number;
  title: string;
  title_en?: string;
  color: string;
  color_en?: string;
  description_short: string;
  description_short_en?: string;
  description_long: string;
  description_long_en?: string;
  price?: number;
  images: string[]; // URLs array
  video_url?: string;
  faq?: ProductFAQ[];
  created_at?: string;
  is_course?: boolean; // Helper flag to distinguish in cart
}

// --- Courses Types ---

export interface Course {
  id: number;
  title: string;
  title_en?: string;
  author: string;
  description_short: string;
  description_short_en?: string;
  description_long: string;
  description_long_en?: string;
  video_url: string;
  image_url?: string; // Cover image
  price: number;
  modules: string[]; // List of module titles
  faq?: ProductFAQ[];
  created_at?: string;
}

// --- Catalog Types ---

export interface CatalogSubcategory {
  id: string;
  label: string;
}

export interface CatalogCategory {
  id: string;
  label: string;
  subcategories?: CatalogSubcategory[]; // Nested JSON array
  created_at?: string;
}

// New interface for linking a video to a specific category/subcategory pair
export interface VideoCategoryRef {
  categoryId: string;
  subcategoryId?: string;
}

export interface CatalogVideo {
  id: number;
  title: string;
  description: string;
  video_url: string;
  // Legacy fields (kept for compatibility during migration)
  category_id?: string; 
  subcategory_id?: string;
  // New field for multiple categories
  category_refs: VideoCategoryRef[];
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
  
  // New CRM Fields for Courses
  has_ordered_course?: boolean;
  ordered_courses_list?: string[];
  
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

export interface SocialResource {
  id: string;
  label: string;
  url: string;
}

export interface AppSettings {
  id?: number;
  gtm_id?: string;
  yandex_id?: string;
  custom_html_body?: string;
  gold_user_threshold_minutes?: number; // Legacy simple threshold
  gold_config?: MetricRule[]; // New flexible config
  
  // EmailJS Config
  emailjs_service_id?: string;
  emailjs_template_id?: string;
  emailjs_public_key?: string;

  // Resources Config
  social_resources?: SocialResource[];
}

// --- Kinbakushi Types ---

export interface KinbakushiNode {
  id: string;
  label: string;
  type?: 'concept' | 'era_context' | 'work' | 'magazine' | 'group' | 'genre/studio' | 'person' | 'place';
  era?: string;
  dates?: string;
  role?: string;
  date?: string;
  author?: string;
  publication?: string;
  icon?: string;
  category?: string; // 'Fundamental work', 'Book/Film' etc
  notes?: string;
  x: number; // Coordinates for canvas
  y: number;
}

export interface KinbakushiEdge {
  source: string;
  target: string;
  type: 'direct_relationship' | 'important_influence' | 'work_published';
  label?: string; // e.g. "Ichiban Deshi"
}
