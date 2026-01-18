
import { supabase } from '../supabaseClient';
import { MetricRule } from '../types';

// --- Interfaces for Rich Metrics ---

interface BehavioralMetrics {
  total_pageviews: number;
  unique_pages_viewed: Set<string>; // Set is converted to array for JSON
  avg_time_per_page: number; // calculated on sync
  max_scroll_depth: number; // 0-100
  click_count: number;
  site_search_usage: 0 | 1;
  filter_usage: 0 | 1;
}

interface EcommerceMetrics {
  cart_adds_count: number;
  cart_removes_count: number;
  viewed_product_count: number;
  avg_price_viewed: number;
  category_diversity: Set<string>;
  reviews_read: 0 | 1;
  size_guide_viewed: 0 | 1;
}

interface ContextMetrics {
  device_category: 'mobile' | 'desktop' | 'tablet';
  os_type: string;
  browser_language: string;
  is_wifi: boolean | null; // null if unknown
  geo_city_tier: string; // Placeholder, requires IP API
  screen_resolution: string;
}

interface TemporalMetrics {
  hour_of_day: number;
  day_of_week: number; // 0-6
  is_work_hours: boolean; // 9-18
  time_since_last_visit_hours: number;
  session_start_ts: number;
}

interface SourceMetrics {
  traffic_source: string;
  utm: Record<string, string>;
  referrer_domain: string;
}

interface CalculatedMetrics {
  cart_to_detail_ratio: number;
  idle_time_ratio: number;
  scroll_speed: number; // pixels per second (avg)
}

// Master Session Object
export interface AdvancedSessionMetrics {
  sessionId: string;
  userId: string | null;
  
  behavior: BehavioralMetrics;
  ecommerce: EcommerceMetrics;
  context: ContextMetrics;
  temporal: TemporalMetrics;
  source: SourceMetrics;
  calculated: CalculatedMetrics;
  
  // Internal tracking state (not necessarily saved fully, used for calcs)
  _internal: {
    page_history: Array<{ path: string, timeOnPage: number, timestamp: number }>;
    scroll_samples: Array<{ depth: number, speed: number, ts: number }>;
    product_prices: number[];
    last_scroll_y: number;
    last_scroll_ts: number;
    active_seconds: number;
    total_seconds: number;
    goals_reached: string[];
  };
}

class BehaviorTracker {
  private static instance: BehaviorTracker;
  private metrics: AdvancedSessionMetrics;
  
  private isIdle: boolean = false;
  private idleTimer: any = null;
  private syncInterval: any = null;
  private goldCheckInterval: any = null;
  private scrollThrottle: any = null;
  
  // Settings
  private goldThresholdSeconds: number = 300; // Default legacy fallback
  private goldRules: MetricRule[] = []; // New dynamic rules
  private yandexCounterId: number | null = null;
  private minSessionDuration: number = 30; // Minimum seconds before saving to DB

  private constructor() {
    const now = new Date();
    
    // Restore or Init Last Visit
    const lastVisit = localStorage.getItem('bt_last_visit');
    const timeSinceLastVisit = lastVisit 
      ? (now.getTime() - parseInt(lastVisit)) / (1000 * 60 * 60) 
      : 0;
    localStorage.setItem('bt_last_visit', now.getTime().toString());

    // Init Metrics Structure
    this.metrics = {
      sessionId: Math.random().toString(36).substring(2) + Date.now().toString(36),
      userId: null,
      
      behavior: {
        total_pageviews: 0,
        unique_pages_viewed: new Set(),
        avg_time_per_page: 0,
        max_scroll_depth: 0,
        click_count: 0,
        site_search_usage: 0,
        filter_usage: 0
      },
      ecommerce: {
        cart_adds_count: 0,
        cart_removes_count: 0,
        viewed_product_count: 0,
        avg_price_viewed: 0,
        category_diversity: new Set(),
        reviews_read: 0,
        size_guide_viewed: 0
      },
      context: this.detectContext(),
      temporal: {
        hour_of_day: now.getHours(),
        day_of_week: now.getDay(),
        is_work_hours: now.getHours() >= 9 && now.getHours() <= 18,
        time_since_last_visit_hours: parseFloat(timeSinceLastVisit.toFixed(2)),
        session_start_ts: now.getTime()
      },
      source: this.detectSource(),
      calculated: {
        cart_to_detail_ratio: 0,
        idle_time_ratio: 0,
        scroll_speed: 0
      },
      
      _internal: {
        page_history: [],
        scroll_samples: [],
        product_prices: [],
        last_scroll_y: 0,
        last_scroll_ts: now.getTime(),
        active_seconds: 0,
        total_seconds: 0,
        goals_reached: []
      }
    };
  }

  public static getInstance(): BehaviorTracker {
    if (!BehaviorTracker.instance) {
      BehaviorTracker.instance = new BehaviorTracker();
    }
    return BehaviorTracker.instance;
  }

  public init(userId: string | null, settings?: { goldThreshold?: number, yandexId?: string, goldConfig?: MetricRule[] }) {
    this.metrics.userId = userId;
    if (settings?.goldThreshold) this.goldThresholdSeconds = settings.goldThreshold * 60;
    if (settings?.yandexId) this.yandexCounterId = parseInt(settings.yandexId);
    if (settings?.goldConfig && Array.isArray(settings.goldConfig)) {
        this.goldRules = settings.goldConfig;
    }

    console.log("🕵️ Advanced Tracker Online. Session:", this.metrics.sessionId);
    this.startTracking();
    this.trackPageView(window.location.pathname); // Track initial page
  }

  // --- Getter for UI Debugging ---
  public getMetrics(): AdvancedSessionMetrics {
      return this.metrics;
  }

  // --- Public Tracking Methods ---

  public identify(userId: string) {
    this.metrics.userId = userId;
    this.syncToSupabase();
  }

  public trackPageView(path: string) {
    // Finish timing previous page
    const history = this.metrics._internal.page_history;
    if (history.length > 0) {
        const lastPage = history[history.length - 1];
        lastPage.timeOnPage = (Date.now() - lastPage.timestamp) / 1000;
    }

    // Add new page
    this.metrics._internal.page_history.push({
        path,
        timestamp: Date.now(),
        timeOnPage: 0
    });

    this.metrics.behavior.total_pageviews++;
    this.metrics.behavior.unique_pages_viewed.add(path);
    
    // Recalculate Avg Time
    const finishedPages = history.filter(p => p.timeOnPage > 0);
    if (finishedPages.length > 0) {
        const totalTime = finishedPages.reduce((acc, p) => acc + p.timeOnPage, 0);
        this.metrics.behavior.avg_time_per_page = totalTime / finishedPages.length;
    }
  }

  public trackProductView(productId: string | number, price: number, category: string) {
    this.metrics.ecommerce.viewed_product_count++;
    this.metrics.ecommerce.category_diversity.add(category);
    this.metrics._internal.product_prices.push(price);
    
    const sum = this.metrics._internal.product_prices.reduce((a, b) => a + b, 0);
    this.metrics.ecommerce.avg_price_viewed = sum / this.metrics._internal.product_prices.length;
  }

  public trackCartAction(action: 'add' | 'remove') {
    if (action === 'add') this.metrics.ecommerce.cart_adds_count++;
    else this.metrics.ecommerce.cart_removes_count++;
    this.recalcRatios();
  }

  public trackSearch(query: string) {
    if (query.trim().length > 0) this.metrics.behavior.site_search_usage = 1;
  }

  public trackFilterUsage() {
    this.metrics.behavior.filter_usage = 1;
  }

  // --- Internal Logic ---

  private detectContext(): ContextMetrics {
    const ua = navigator.userAgent;
    let device: ContextMetrics['device_category'] = 'desktop';
    if (/Mobi|Android/i.test(ua)) device = 'mobile';
    else if (/iPad|Tablet/i.test(ua)) device = 'tablet';

    let os = 'Unknown';
    if (ua.indexOf("Win") !== -1) os = "Windows";
    if (ua.indexOf("Mac") !== -1) os = "macOS";
    if (ua.indexOf("Linux") !== -1) os = "Linux";
    if (ua.indexOf("Android") !== -1) os = "Android";
    if (ua.indexOf("like Mac") !== -1) os = "iOS";

    // Detect Connection (Experimental)
    // @ts-ignore
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const is_wifi = conn ? (conn.type === 'wifi' || conn.effectiveType === '4g') : null; // Approximation

    return {
        device_category: device,
        os_type: os,
        browser_language: navigator.language,
        is_wifi: is_wifi,
        geo_city_tier: 'Unknown', // Needs IP API
        screen_resolution: `${window.screen.width}x${window.screen.height}`
    };
  }

  private detectSource(): SourceMetrics {
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(k => {
        if(params.get(k)) utm[k] = params.get(k)!;
    });

    let source = 'direct';
    if (utm.utm_source) source = utm.utm_source;
    else if (document.referrer) {
        if (document.referrer.includes('google')) source = 'organic_search';
        else if (document.referrer.includes('facebook') || document.referrer.includes('instagram')) source = 'social';
        else source = 'referral';
    }

    return {
        traffic_source: source,
        utm,
        referrer_domain: document.referrer ? new URL(document.referrer).hostname : ''
    };
  }

  private startTracking() {
    // 1. Click Listener
    document.addEventListener('click', () => {
        this.metrics.behavior.click_count++;
        this.resetIdleTimer();
    });

    // 2. Scroll Listener (Depth & Speed)
    document.addEventListener('scroll', () => {
        this.resetIdleTimer();
        
        if (this.scrollThrottle) return;
        this.scrollThrottle = setTimeout(() => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
            
            // Depth
            this.metrics.behavior.max_scroll_depth = Math.max(this.metrics.behavior.max_scroll_depth, scrollPercent);

            // Speed
            const now = Date.now();
            const timeDiff = (now - this.metrics._internal.last_scroll_ts) / 1000;
            if (timeDiff > 0.1) {
                const dist = Math.abs(scrollTop - this.metrics._internal.last_scroll_y);
                const speed = dist / timeDiff; // px per sec
                
                // Rolling average for speed to keep it stable
                const prevSpeed = this.metrics.calculated.scroll_speed;
                this.metrics.calculated.scroll_speed = prevSpeed === 0 ? speed : (prevSpeed * 0.9 + speed * 0.1);

                this.metrics._internal.last_scroll_y = scrollTop;
                this.metrics._internal.last_scroll_ts = now;
            }
            
            this.scrollThrottle = null;
        }, 200);
    });

    // 3. Activity Listeners
    ['mousemove', 'keydown', 'touchstart'].forEach(evt => {
        window.addEventListener(evt, () => this.resetIdleTimer());
    });

    // 4. Timers
    setInterval(() => {
        this.metrics._internal.total_seconds++;
        if (!this.isIdle && document.visibilityState === 'visible') {
            this.metrics._internal.active_seconds++;
        }
        this.recalcRatios();
    }, 1000);

    // 5. Intervals
    this.syncInterval = setInterval(() => this.syncToSupabase(), 30000); // 30 sec sync
    this.goldCheckInterval = setInterval(() => this.checkGoldStatus(), 10000); // 10 sec check

    window.addEventListener('beforeunload', () => this.syncToSupabase());
  }

  private resetIdleTimer() {
    this.isIdle = false;
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
        this.isIdle = true;
    }, 30000);
  }

  private recalcRatios() {
    // Idle Ratio
    if (this.metrics._internal.total_seconds > 0) {
        const idleTime = this.metrics._internal.total_seconds - this.metrics._internal.active_seconds;
        this.metrics.calculated.idle_time_ratio = parseFloat((idleTime / this.metrics._internal.total_seconds).toFixed(2));
    }

    // Cart to Detail Ratio
    if (this.metrics.ecommerce.viewed_product_count > 0) {
        this.metrics.calculated.cart_to_detail_ratio = parseFloat(
            (this.metrics.ecommerce.cart_adds_count / this.metrics.ecommerce.viewed_product_count).toFixed(2)
        );
    }
  }

  private getNestedValue(obj: any, path: string): any {
      return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  private checkGoldStatus() {
    if (this.metrics._internal.goals_reached.includes('Gold_User_Tier_1')) return;
    
    let isGold = false;

    if (this.goldRules.length > 0) {
        // Dynamic Rules Check (AND logic - all must match)
        isGold = this.goldRules.every(rule => {
            const currentVal = this.getNestedValue(this.metrics, rule.metricPath);
            
            // Safety check for undefined
            if (currentVal === undefined || currentVal === null) return false;

            switch (rule.type) {
                case 'range':
                    // e.g. 5 to 10 pageviews
                    const min = rule.min ?? -Infinity;
                    const max = rule.max ?? Infinity;
                    return (currentVal as number) >= min && (currentVal as number) <= max;

                case 'threshold':
                    // e.g. scroll depth >= 50%
                    return (currentVal as number) >= (Number(rule.value) || 0);

                case 'time':
                    // e.g. active seconds >= 60
                    return (currentVal as number) >= (Number(rule.value) || 0);
                
                case 'select':
                    // e.g. device == 'mobile'
                    return String(currentVal) === String(rule.value);
                
                case 'boolean':
                    // e.g. is_wifi == true
                    // Cast 'true'/'false' strings if needed, though config should have proper bool
                    const ruleBool = rule.value === 'true' || rule.value === true;
                    return !!currentVal === ruleBool;
                
                default:
                    return false;
            }
        });

    } else {
        // Fallback to legacy single threshold logic
        isGold = this.metrics._internal.active_seconds >= this.goldThresholdSeconds;
    }

    if (isGold) {
        console.log("🏆 Gold User Threshold Reached! (Rules Matched)");
        this.metrics._internal.goals_reached.push('Gold_User_Tier_1');
        
        // @ts-ignore
        if (typeof window.ym !== 'undefined' && this.yandexCounterId) {
             // @ts-ignore
             window.ym(this.yandexCounterId, 'reachGoal', 'Gold_User_Tier_1');
        }
        this.syncToSupabase();
    }
  }

  private async syncToSupabase() {
    if (!supabase) return;

    // 🛑 THRESHOLD CHECK
    // If user has been on site less than threshold (30s), do not save to DB.
    if (this.metrics._internal.total_seconds < this.minSessionDuration) {
        return;
    }

    // Prepare payload (convert Sets to Arrays)
    const logData = {
        ...this.metrics,
        behavior: {
            ...this.metrics.behavior,
            unique_pages_viewed: Array.from(this.metrics.behavior.unique_pages_viewed)
        },
        ecommerce: {
            ...this.metrics.ecommerce,
            category_diversity: Array.from(this.metrics.ecommerce.category_diversity)
        },
        _internal: {
            // Only save essential internal stats to avoid bloat
            active_seconds: this.metrics._internal.active_seconds,
            goals_reached: this.metrics._internal.goals_reached
        }
    };

    const payload = {
        session_id: this.metrics.sessionId,
        user_id: this.metrics.userId,
        log_data: logData,
        updated_at: new Date().toISOString()
    };

    try {
        await supabase
            .from('user_behavior_logs_shibari')
            .upsert(payload, { onConflict: 'session_id' });
    } catch (e) {
        // Silent fail
    }
  }
}

export default BehaviorTracker.getInstance();
